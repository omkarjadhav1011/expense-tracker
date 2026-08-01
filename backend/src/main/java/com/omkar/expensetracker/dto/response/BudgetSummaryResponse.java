package com.omkar.expensetracker.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetSummaryResponse {

    private BigDecimal budget;          // Monthly cap, 0 when none is set
    private BigDecimal spent;           // Total EXPENSE transactions in the month
    private BigDecimal remaining;       // budget - spent
    private BigDecimal percentageUsed;  // (spent/budget)*100
    private String status;              // OVER_BUDGET or UNDER_BUDGET
}
