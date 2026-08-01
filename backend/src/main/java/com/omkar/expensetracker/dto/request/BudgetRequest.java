package com.omkar.expensetracker.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

/**
 * Deliberately carries no {@code id} and no {@code userId}. The controller used to
 * bind the Budget entity directly, which let a client set either field and
 * overwrite another user's row; identity now comes from the JWT and from an
 * upsert on (user, month, category).
 */
@Getter
@Setter
public class BudgetRequest {

    @NotBlank(message = "Month is required")
    @Pattern(regexp = "\\d{4}-\\d{2}", message = "Month must be in YYYY-MM format")
    private String month;

    // null = the overall monthly cap; otherwise a category name.
    private String category;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    private Double amount;
}
