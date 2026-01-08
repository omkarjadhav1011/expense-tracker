package com.omkar.expensetracker.dto.response;

import java.math.BigDecimal;

public record MonthlyTrendResponse(
        String month,
        BigDecimal totalIncome,
        BigDecimal totalExpense
) {}
