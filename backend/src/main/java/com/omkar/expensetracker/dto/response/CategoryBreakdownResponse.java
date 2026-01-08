package com.omkar.expensetracker.dto.response;

import java.math.BigDecimal;

public record CategoryBreakdownResponse(
        Long categoryId,
        String categoryName,
        BigDecimal totalAmount
) {}
