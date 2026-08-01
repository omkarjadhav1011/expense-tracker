package com.omkar.expensetracker.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class MonthlyBudgetRequest {

    @Min(1) @Max(12)
    private int month;

    @Min(2020)
    private int year;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal amount;

    @NotBlank
    private String currency;

    // getters & setters


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

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
