package com.omkar.expensetracker.util;

import com.omkar.expensetracker.dto.response.UserResponse;
import com.omkar.expensetracker.entity.User;

public class MapperUtil {

    public static UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCurrency()
        );
    }

}
