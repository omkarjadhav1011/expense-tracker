package com.omkar.expensetracker.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BudgetResponse {

    private Long id;
    private String month;
    private String category; // null = overall monthly cap
    private Double amount;
}
