package com.omkar.expensetracker.dto.response;

import com.omkar.expensetracker.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RecentTransactionResponse(
        Long id,
        BigDecimal amount,
        TransactionType type,
        String categoryName,
        LocalDate transactionDate,
        String description
) {}
