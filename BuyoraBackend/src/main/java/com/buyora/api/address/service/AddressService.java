package com.buyora.api.address.service;

import com.buyora.api.address.dto.AddressRequest;
import com.buyora.api.address.dto.AddressResponse;
import com.buyora.api.address.entity.Address;
import com.buyora.api.address.mapper.AddressMapper;
import com.buyora.api.address.repository.AddressRepository;
import com.buyora.api.common.exception.ResourceNotFoundException;
import com.buyora.api.user.entity.User;
import com.buyora.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final AddressMapper addressMapper;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AddressResponse> getAddresses(Long userId) {
        return addressRepository.findAllByUserId(userId).stream()
                .map(addressMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse createAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId).orElseThrow();
        
        if (request.isDefaultShipping()) {
            addressRepository.clearDefaultShipping(userId);
        }
        if (request.isDefaultBilling()) {
            addressRepository.clearDefaultBilling(userId);
        }

        Address address = Address.builder()
                .user(user)
                .label(request.label())
                .recipientName(request.firstName() + " " + request.lastName())
                .phone(request.phone())
                .addressLine1(request.addressLine1())
                .addressLine2(request.addressLine2())
                .city(request.city())
                .district(request.district())
                .stateProvince(request.stateProvince())
                .postalCode(request.postalCode())
                .country(request.country())
                .countryCode(request.countryCode())
                .isDefaultShipping(request.isDefaultShipping())
                .isDefaultBilling(request.isDefaultBilling())
                .build();

        return addressMapper.toResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse updateAddress(Long userId, UUID addressPublicId, AddressRequest request) {
        Address address = addressRepository.findByPublicIdAndUserId(addressPublicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (request.isDefaultShipping() && !address.isDefaultShipping()) {
            addressRepository.clearDefaultShipping(userId);
        }
        if (request.isDefaultBilling() && !address.isDefaultBilling()) {
            addressRepository.clearDefaultBilling(userId);
        }

        address.setLabel(request.label());
        address.setRecipientName(request.firstName() + " " + request.lastName());
        address.setPhone(request.phone());
        address.setAddressLine1(request.addressLine1());
        address.setAddressLine2(request.addressLine2());
        address.setCity(request.city());
        address.setDistrict(request.district());
        address.setStateProvince(request.stateProvince());
        address.setPostalCode(request.postalCode());
        address.setCountry(request.country());
        address.setCountryCode(request.countryCode());
        address.setDefaultShipping(request.isDefaultShipping());
        address.setDefaultBilling(request.isDefaultBilling());

        return addressMapper.toResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Long userId, UUID addressPublicId) {
        Address address = addressRepository.findByPublicIdAndUserId(addressPublicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        addressRepository.delete(address);
    }

    @Transactional
    public AddressResponse setDefaultShipping(Long userId, UUID addressPublicId) {
        Address address = addressRepository.findByPublicIdAndUserId(addressPublicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        
        addressRepository.clearDefaultShipping(userId);
        address.setDefaultShipping(true);
        return addressMapper.toResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse setDefaultBilling(Long userId, UUID addressPublicId) {
        Address address = addressRepository.findByPublicIdAndUserId(addressPublicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        
        addressRepository.clearDefaultBilling(userId);
        address.setDefaultBilling(true);
        return addressMapper.toResponse(addressRepository.save(address));
    }
}
