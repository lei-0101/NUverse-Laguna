package com.nuverse_laguna.modules.auth.mapper;

import com.nuverse_laguna.modules.auth.domain.User;
import com.nuverse_laguna.modules.auth.dto.UserResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
}
