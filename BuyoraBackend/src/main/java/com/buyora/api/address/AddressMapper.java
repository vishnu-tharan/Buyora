package com.buyora.api.address;

import org.springframework.stereotype.Component;

@Component
public class AddressMapper {
  public AddressResponse toResponse(Address address) {
    if (address == null) return null;
    String fullName = address.getRecipientName();
    if (fullName == null) fullName = "";
    int firstSpace = fullName.indexOf(' ');
    String firstName = firstSpace < 0 ? fullName : fullName.substring(0, firstSpace);
    String lastName = firstSpace < 0 ? "" : fullName.substring(firstSpace + 1);
    return new AddressResponse(
        address.getId(),
        address.getPublicId().toString(),
        address.getLabel(),
        firstName,
        lastName,
        address.getPhone(),
        address.getAddressLine1(),
        address.getAddressLine2(),
        address.getCity(),
        address.getDistrict(),
        address.getStateProvince(),
        address.getPostalCode(),
        address.getCountry(),
        address.getCountryCode(),
        address.isDefaultShipping(),
        address.isDefaultBilling());
  }
}
