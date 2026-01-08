package com.omkar.expensetracker.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class CategoryBudgetSummaryResponse {
    private String category;
    private Double budget;
    private Double spent;
    private Double remaining;
    private Double percentageUsed;
    private String status;
}
