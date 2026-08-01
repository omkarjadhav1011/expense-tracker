package com.omkar.expensetracker.dto.response;

import lombok.*;

import java.math.BigDecimal;

/**
 * A per-category cap alongside what was actually spent against it this month.
 *
 * Carries {@code categoryId} as well as the name, because budgets now key off the
 * category id — the frontend can join to its own category list without string
 * matching, and renaming a category no longer orphans its cap.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryBudgetSummaryResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private BigDecimal budget;
    private BigDecimal spent;
    private BigDecimal remaining;
    private BigDecimal percentageUsed;
    private String status;
}
