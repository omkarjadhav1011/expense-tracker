package com.omkar.expensetracker.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseResponse {

    private Long id;
    private BigDecimal amount;
    private String description;
    private String categoryName;
    private LocalDate date;

    // Constructors
    public ExpenseResponse() {}

    public ExpenseResponse(Long id, BigDecimal amount, String description, String categoryName, LocalDate date) {
        this.id = id;
        this.amount = amount;
        this.description = description;
        this.categoryName = categoryName;
        this.date = date;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}