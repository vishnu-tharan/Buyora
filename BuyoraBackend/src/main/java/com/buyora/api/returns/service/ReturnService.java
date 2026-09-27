package com.buyora.api.returns.service;

import com.buyora.api.common.exception.BusinessException;
import com.buyora.api.common.exception.ResourceNotFoundException;
import com.buyora.api.order.entity.Order;
import com.buyora.api.order.entity.OrderStatus;
import com.buyora.api.order.repository.OrderRepository;
import com.buyora.api.returns.dto.CreateReturnRequest;
import com.buyora.api.returns.dto.ReturnResponse;
import com.buyora.api.returns.entity.Return;
import com.buyora.api.returns.repository.ReturnRepository;
import com.buyora.api.user.entity.User;
import com.buyora.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReturnService {

    private final com.buyora.api.common.config.BuyoraProperties properties;
    private final ReturnRepository returnRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReturnResponse createReturn(String orderNumber, Long userId, CreateReturnRequest request) {
        Order order = orderRepository.findForUpdate(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (order.getUserId() == null || !order.getUserId().equals(user.getId())) {
            throw new BusinessException("INVALID_USER", "Order does not belong to user");
        }
        
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new BusinessException("INVALID_STATUS", "Only delivered orders can be returned");
        }

        var deliveredAt = order.getHistory().stream()
                .filter(entry -> entry.getStatus() == OrderStatus.DELIVERED)
                .map(entry -> entry.getCreatedAt()).filter(java.util.Objects::nonNull)
                .max(java.time.Instant::compareTo)
                .orElseThrow(() -> new BusinessException("DELIVERY_DATE_MISSING", "Contact the store to confirm the delivery date"));
        if (deliveredAt.plus(properties.getReturns().getWindowDays(), java.time.temporal.ChronoUnit.DAYS).isBefore(java.time.Instant.now()))
            throw new BusinessException("RETURN_WINDOW_CLOSED", "The return request period has ended");
        if (returnRepository.existsByOrderId(order.getId())) throw new BusinessException("RETURN_EXISTS", "A return has already been requested for this order");

        var requested = new java.util.HashSet<>(request.getItemIds());
        var allItems = order.getItems().stream().map(i -> i.getId()).collect(java.util.stream.Collectors.toSet());
        if (!requested.equals(allItems)) throw new BusinessException("FULL_ORDER_REQUIRED", "This store currently accepts whole-order returns only");
        Return ret = Return.builder()
                .order(order)
                .user(user)
                .reason(request.getReason() + (request.getNotes() == null ? "" : "\n" + request.getNotes()))
                .refundAmount(order.getTotal())
                .build();
                
        ret = returnRepository.save(ret);

        return mapToResponse(ret);
    }

    @Transactional(readOnly = true)
    public Page<ReturnResponse> getAllReturns(Pageable pageable) {
        return returnRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Transactional
    public ReturnResponse updateReturnStatus(Long id, String status) {
        Return ret = returnRepository.findForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Return not found"));
        boolean allowed = switch (ret.getStatus()) {
            case "PENDING" -> "APPROVED".equals(status) || "REJECTED".equals(status);
            case "APPROVED" -> "RECEIVED".equals(status);
            default -> false;
        };
        if (!allowed) throw new BusinessException("INVALID_STATUS", "Invalid return transition; refunds require confirmed payment-provider processing");
        ret.setStatus(status);
        ret = returnRepository.save(ret);
        return mapToResponse(ret);
    }
    
    private ReturnResponse mapToResponse(Return ret) {
        return ReturnResponse.builder()
                .id(ret.getPublicId())
                .orderId(ret.getOrder().getPublicId())
                .status(ret.getStatus())
                .reason(ret.getReason())
                .refundAmount(ret.getRefundAmount())
                .createdAt(ret.getCreatedAt())
                .build();
    }
}
