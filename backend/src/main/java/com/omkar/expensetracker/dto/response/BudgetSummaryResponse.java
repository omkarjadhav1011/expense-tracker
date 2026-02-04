package com.omkar.expensetracker.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetSummaryResponse {

    private Double budget;          // Total budget
    private Double spent;           // Total expenses
    private Double remaining;       // budget - spent
    private Double percentageUsed;  // (spent/budget)*100
    private String status;          // OVER_BUDGET or UNDER_BUDGET
}
