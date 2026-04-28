package com.omkar.expensetracker.dto.response;

import java.math.BigDecimal;

public class MonthlyBudgetResponse {

    private int month;
    private int year;
    private BigDecimal amount;
    private String currency;

    // getters & setters

    public int getMonth() {
        return month;
    }

    public int getYear() {
        return year;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
