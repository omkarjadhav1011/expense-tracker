package com.omkar.expensetracker.service.impl;

import com.omkar.expensetracker.dto.request.BudgetRequest;
import com.omkar.expensetracker.dto.response.BudgetResponse;
import com.omkar.expensetracker.dto.response.BudgetSummaryResponse;
import com.omkar.expensetracker.dto.response.CategoryBudgetSummaryResponse;
import com.omkar.expensetracker.entity.Budget;
import com.omkar.expensetracker.entity.User;
import com.omkar.expensetracker.enums.TransactionType;
import com.omkar.expensetracker.repository.BudgetRepository;
import com.omkar.expensetracker.repository.TransactionRepository;
import com.omkar.expensetracker.service.BudgetService;
import com.omkar.expensetracker.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

/**
 * Spend is derived from the transaction ledger.
 *
 * This used to read from ExpenseRepository, but the `expenses` table has no
 * controller and no write path anywhere in the application, so every summary
 * reported spent = 0 regardless of what the user had recorded. The legacy Expense
 * stack is gone; transactions are the single source of truth for money.
 */
@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final AuthUtil authUtil;

    // ------------------------------------------------------------------------
    // WRITES
    // ------------------------------------------------------------------------

    /**
     * Upserts on (user, month, category). Saving the same month+category twice
     * used to create a second row, after which the Optional finder below threw
     * IncorrectResultSizeDataAccessException on every subsequent read.
     */
    @Override
    @Transactional
    public BudgetResponse saveBudget(BudgetRequest request) {

        Long userId = authUtil.getLoggedInUser().getId();
        String month = normaliseMonth(request.getMonth());
        String category = blankToNull(request.getCategory());

        Budget budget = findExisting(userId, month, category)
                .orElseGet(() -> Budget.builder()
                        .userId(userId)
                        .month(month)
                        .category(category)
                        .build());

        budget.setAmount(request.getAmount());

        return toResponse(budgetRepository.save(budget));
    }

    @Override
    @Transactional
    public void deleteBudget(Long id) {
        Long userId = authUtil.getLoggedInUser().getId();

        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        budgetRepository.delete(budget);
    }

    // ------------------------------------------------------------------------
    // READS
    // ------------------------------------------------------------------------

    @Override
    public List<BudgetResponse> getBudgetsForUser() {
        Long userId = authUtil.getLoggedInUser().getId();
        return budgetRepository.findByUserIdOrderByMonthDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<BudgetResponse> getBudgetsForMonth(String month) {
        Long userId = authUtil.getLoggedInUser().getId();
        return budgetRepository.findByUserIdAndMonth(userId, normaliseMonth(month))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ------------------------------------------------------------------------
    // 1️⃣ MONTHLY SUMMARY (total budget vs total spend)
    // ------------------------------------------------------------------------
    @Override
    public BudgetSummaryResponse getMonthlySummary(String month) {

        Long userId = authUtil.getLoggedInUser().getId();
        String key = normaliseMonth(month);

        double totalBudget = budgetRepository.findByUserIdAndMonth(userId, key)
                .stream()
                .map(Budget::getAmount)
                .filter(a -> a != null)
                .mapToDouble(Double::doubleValue)
                .sum();

        // Sum the same per-category breakdown the category summary uses, so the two
        // endpoints can never disagree about what was spent.
        double totalSpent = spendByCategory(userId, key).values()
                .stream()
                .mapToDouble(Double::doubleValue)
                .sum();

        double percentage = totalBudget == 0 ? 0 : (totalSpent / totalBudget) * 100;

        return BudgetSummaryResponse.builder()
                .budget(totalBudget)
                .spent(totalSpent)
                .remaining(totalBudget - totalSpent)
                .percentageUsed(percentage)
                .status(totalSpent > totalBudget ? "OVER_BUDGET" : "UNDER_BUDGET")
                .build();
    }

    // ------------------------------------------------------------------------
    // 2️⃣ CATEGORY-WISE SUMMARY (budget vs spend per category)
    // ------------------------------------------------------------------------
    @Override
    public List<CategoryBudgetSummaryResponse> getCategoryWiseSummary(String month) {

        Long userId = authUtil.getLoggedInUser().getId();
        String key = normaliseMonth(month);

        // Only per-category caps; the overall cap belongs to getMonthlySummary.
        List<Budget> budgets = budgetRepository.findByUserIdAndMonth(userId, key)
                .stream()
                .filter(b -> b.getCategory() != null)
                .toList();

        Map<String, Double> spentByCategory = spendByCategory(userId, key);

        return budgets.stream()
                .map(budget -> {
                    // Budget.amount is a nullable Double; unboxing it directly threw an
                    // NPE whose null message then broke the exception handler itself.
                    double budgetAmount = budget.getAmount() == null ? 0.0 : budget.getAmount();
                    double spent = spentByCategory.getOrDefault(budget.getCategory(), 0.0);
                    double percentage = budgetAmount == 0 ? 0 : (spent / budgetAmount) * 100;

                    return CategoryBudgetSummaryResponse.builder()
                            .category(budget.getCategory())
                            .budget(budgetAmount)
                            .spent(spent)
                            .remaining(budgetAmount - spent)
                            .percentageUsed(percentage)
                            .status(spent > budgetAmount ? "OVER_BUDGET" : "UNDER_BUDGET")
                            .build();
                })
                .toList();
    }

    // ------------------------------------------------------------------------
    // HELPERS
    // ------------------------------------------------------------------------

    /**
     * Expense totals per category name for the month, keyed case-insensitively.
     *
     * Budgets join to spend by category *name*, and the old code compared
     * case-sensitively here but case-insensitively when refreshing the cached
     * usedAmount — so the two paths could disagree. One comparison rule now.
     */
    private Map<String, Double> spendByCategory(Long userId, String month) {
        YearMonth ym = YearMonth.parse(month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        Map<String, Double> totals = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);

        // Returns rows of [categoryId, categoryName, SUM(amount)].
        for (Object[] row : transactionRepository.getCategoryWiseBreakdown(
                userId, TransactionType.EXPENSE, start, end)) {
            String name = (String) row[1];
            double amount = row[2] == null ? 0.0 : ((Number) row[2]).doubleValue();
            totals.merge(name, amount, Double::sum);
        }

        return totals;
    }

    private Optional<Budget> findExisting(Long userId, String month, String category) {
        return category == null
                ? budgetRepository.findByUserIdAndMonthAndCategoryIsNull(userId, month)
                : budgetRepository.findByUserIdAndMonthAndCategoryIgnoreCase(userId, month, category);
    }

    /**
     * Rejects an unparseable month up front. YearMonth.parse would otherwise throw
     * DateTimeParseException deeper in, surfacing a raw java.time message.
     */
    private String normaliseMonth(String month) {
        if (month == null || month.isBlank()) {
            throw new RuntimeException("Month is required in YYYY-MM format");
        }
        try {
            return YearMonth.parse(month.trim()).toString();
        } catch (DateTimeParseException ex) {
            throw new RuntimeException("Month must be in YYYY-MM format");
        }
    }

    private String blankToNull(String category) {
        return category == null || category.isBlank() ? null : category.trim();
    }

    private BudgetResponse toResponse(Budget budget) {
        return BudgetResponse.builder()
                .id(budget.getId())
                .month(budget.getMonth())
                .category(budget.getCategory())
                .amount(budget.getAmount())
                .build();
    }
}
