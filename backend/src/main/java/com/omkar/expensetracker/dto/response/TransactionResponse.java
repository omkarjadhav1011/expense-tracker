package com.omkar.expensetracker.dto.response;

import com.omkar.expensetracker.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionResponse {

    private Long id;
    private BigDecimal amount;
    private TransactionType type;
    private String categoryName;
    private LocalDate transactionDate;
    private String description;

    public TransactionResponse() {
    }

    public TransactionResponse(
            Long id,
            BigDecimal amount,
            TransactionType type,
            String categoryName,
            LocalDate transactionDate,
            String description
    ) {
        this.id = id;
        this.amount = amount;
        this.type = type;
        this.categoryName = categoryName;
        this.transactionDate = transactionDate;
        this.description = description;
    }

    // Getters & Setters

    public Long getId() {
        return id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public TransactionType getType() {
        return type;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public LocalDate getTransactionDate() {
        return transactionDate;
    }

    public String getDescription() {
        return description;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public void setTransactionDate(LocalDate transactionDate) {
        this.transactionDate = transactionDate;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
