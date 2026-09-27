package com.buyora.api.address.mapper;

import com.buyora.api.address.dto.AddressResponse;
import com.buyora.api.address.entity.Address;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    @org.mapstruct.Mapping(target = "firstName", source = "recipientName", qualifiedByName = "splitFirstName")
    @org.mapstruct.Mapping(target = "lastName", source = "recipientName", qualifiedByName = "splitLastName")
    @org.mapstruct.Mapping(target = "publicId", expression = "java(address.getPublicId().toString())")
    @org.mapstruct.Mapping(target = "isDefaultShipping", expression = "java(address.isDefaultShipping())")
    @org.mapstruct.Mapping(target = "isDefaultBilling", expression = "java(address.isDefaultBilling())")
    AddressResponse toResponse(Address address);

    @org.mapstruct.Named("splitFirstName")
    default String splitFirstName(String fullName) {
        if (fullName == null) return "";
        int idx = fullName.indexOf(' ');
        return idx == -1 ? fullName : fullName.substring(0, idx);
    }
    
    @org.mapstruct.Named("splitLastName")
    default String splitLastName(String fullName) {
        if (fullName == null) return "";
        int idx = fullName.indexOf(' ');
        return idx == -1 ? "" : fullName.substring(idx + 1);
    }
}
