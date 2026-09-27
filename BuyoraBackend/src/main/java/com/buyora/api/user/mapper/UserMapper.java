package com.buyora.api.user.mapper;

import com.buyora.api.user.dto.UserProfileResponse;
import com.buyora.api.user.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserProfileResponse toProfileResponse(User user);
}
