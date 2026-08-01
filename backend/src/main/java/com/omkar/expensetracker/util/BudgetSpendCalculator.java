package com.omkar.expensetracker.util;

import com.omkar.expensetracker.enums.TransactionType;
import com.omkar.expensetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.Map;

/**
 * Single source of truth for "what did this user spend in this month".
 *
 * Budget spend is derived from the transaction ledger, never cached. An earlier
 * revision computed it from a separate `expenses` table that no controller ever
 * wrote to, so every budget summary reported zero. Keeping the query in one place
 * means the monthly summary, the per-category summary, and the dashboard can never
 * disagree about the same month.
 */
@Component
@RequiredArgsConstructor
public class BudgetSpendCalculator {

    private final TransactionRepository transactionRepository;

    /** Expense totals for the month, keyed by category id. */
    public Map<Long, BigDecimal> spendByCategoryId(Long userId, int month, int year) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        Map<Long, BigDecimal> totals = new HashMap<>();

        // Rows of [categoryId, categoryName, SUM(amount)].
        for (Object[] row : transactionRepository.getCategoryWiseBreakdown(
                userId, TransactionType.EXPENSE, start, end)) {
            Long categoryId = ((Number) row[0]).longValue();
            BigDecimal amount = toBigDecimal(row[2]);
            totals.merge(categoryId, amount, BigDecimal::add);
        }

        return totals;
    }

    /** Total expense for the month across every category. */
    public BigDecimal totalSpend(Long userId, int month, int year) {
        return spendByCategoryId(userId, month, year).values()
                .stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /** {@code (spent / budget) * 100}, or 0 when no cap is set. */
    public static BigDecimal percentageUsed(BigDecimal spent, BigDecimal budget) {
        if (budget == null || budget.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return spent.multiply(BigDecimal.valueOf(100))
                .divide(budget, 2, RoundingMode.HALF_UP);
    }

    public static String status(BigDecimal spent, BigDecimal budget) {
        return spent.compareTo(budget) > 0 ? "OVER_BUDGET" : "UNDER_BUDGET";
    }

    private static BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal bd) return bd;
        return BigDecimal.valueOf(((Number) value).doubleValue());
    }
}
