package com.buyora.api.admin.service;

import com.buyora.api.admin.dto.DashboardStatsResponse;
import com.buyora.api.inventory.repository.InventoryItemRepository;
import com.buyora.api.order.entity.Order;
import com.buyora.api.order.entity.OrderStatus;
import com.buyora.api.order.repository.OrderRepository;
import com.buyora.api.product.repository.ProductRepository;
import com.buyora.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final InventoryItemRepository inventoryItemRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        Instant startOfDay = LocalDate.now().atStartOfDay(ZoneId.of("Asia/Colombo")).toInstant();
        Instant sevenDaysAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        
        List<Order> recentOrdersData = orderRepository.findByCreatedAtAfter(sevenDaysAgo);
        
        BigDecimal todaySales = BigDecimal.ZERO;
        int todayOrders = 0;
        int pendingOrdersCount = Math.toIntExact(orderRepository.countByStatus(OrderStatus.PENDING_PAYMENT));
        
        for (Order o : recentOrdersData) {
            if (o.getCreatedAt().isAfter(startOfDay)) {
                if (o.getPaymentStatus() == com.buyora.api.order.entity.PaymentStatus.PAID) {
                    todaySales = todaySales.add(o.getTotal());
                }
                todayOrders++;
            }
        }
        
        int totalCustomers = (int) userRepository.count();
        int totalProducts = (int) productRepository.count();
        int lowStockCount = (int) inventoryItemRepository.countByStockQuantityLessThan(10); // assuming threshold is 10
        
        List<DashboardStatsResponse.RecentOrder> recentOrders = orderRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(10)
                .map(o -> new DashboardStatsResponse.RecentOrder(
                        o.getOrderNumber(), o.getTotal(), o.getStatus().name(), o.getCreatedAt()
                ))
                .collect(Collectors.toList());

        Map<String, List<Order>> ordersByDate = recentOrdersData.stream()
                .filter(o -> o.getCreatedAt().isAfter(sevenDaysAgo) && o.getStatus() != OrderStatus.CANCELLED)
                .collect(Collectors.groupingBy(o -> LocalDate.ofInstant(o.getCreatedAt(), ZoneId.systemDefault()).format(DateTimeFormatter.ISO_DATE)));

        List<DashboardStatsResponse.SalesOverview> salesOverview = ordersByDate.entrySet().stream()
                .map(entry -> {
                    BigDecimal revenue = entry.getValue().stream().map(Order::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new DashboardStatsResponse.SalesOverview(entry.getKey(), revenue, entry.getValue().size());
                })
                .sorted((a, b) -> a.date().compareTo(b.date()))
                .collect(Collectors.toList());

        return new DashboardStatsResponse(
                todaySales, todayOrders, totalCustomers, totalProducts,
                lowStockCount, pendingOrdersCount, recentOrders, salesOverview
        );
    }
}
