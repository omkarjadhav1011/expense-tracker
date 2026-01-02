package com.omkar.expensetracker.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserRequest {
    private String name;
    private String currency;

    public String getName() {
        return name;
    }
}
