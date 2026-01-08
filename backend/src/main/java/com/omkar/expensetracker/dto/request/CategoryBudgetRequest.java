package com.omkar.expensetracker.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class CategoryBudgetRequest {

    @NotNull
    private Long categoryId;

    @Min(1) @Max(12)
    private int month;

    @Min(2020)
    private int year;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal allocatedAmount;

    // getters & setters


    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public BigDecimal getAllocatedAmount() {
        return allocatedAmount;
    }

    public void setAllocatedAmount(BigDecimal allocatedAmount) {
        this.allocatedAmount = allocatedAmount;
    }
}
