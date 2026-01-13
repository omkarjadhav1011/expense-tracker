package com.omkar.expensetracker.service.impl;

import com.omkar.expensetracker.dto.response.BudgetSummaryResponse;
import com.omkar.expensetracker.dto.response.CategoryBudgetSummaryResponse;
import com.omkar.expensetracker.entity.Budget;
import com.omkar.expensetracker.entity.Expense;
import com.omkar.expensetracker.repository.BudgetRepository;
import com.omkar.expensetracker.repository.ExpenseRepository;
import com.omkar.expensetracker.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    // Repositories to interact with the database
    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;

    // Save a new budget
    @Override
    public Budget saveBudget(Budget budget) {
        budget.setUsedAmount(0.0); // initially nothing spent
        return budgetRepository.save(budget);
    }

    // Get all budgets for a user
    @Override
    public List<Budget> getBudgetsForUser(Long userId) {
        return budgetRepository.findByUserId(userId);
    }

    // Get all budgets for a given month
    @Override
    public List<Budget> getBudgetsForMonth(Long userId, String month) {
        return budgetRepository.findByUserIdAndMonth(userId, month);
    }

    // Delete a budget
    @Override
    public void deleteBudget(Long id) {
        budgetRepository.deleteById(id);
    }

    // ------------------------------------------------------------------------
    // 1️⃣ MONTHLY SUMMARY (total budget vs total expense)
    // ------------------------------------------------------------------------
    @Override
    public BudgetSummaryResponse getMonthlySummary(Long userId, String month) {

        // Get all budgets for this month
        List<Budget> budgets = budgetRepository.findByUserIdAndMonth(userId, month);

        // Add all budget amounts
        Double totalBudget = budgets.stream()
                .map(Budget::getAmount)
                .filter(a -> a != null)
                .mapToDouble(Double::doubleValue)
                .sum();

        // Convert "2026-01" into actual date range (1st to last day)
        YearMonth ym = YearMonth.parse(month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        // Find all expenses inside this date range
        List<Expense> expenses =
                expenseRepository.findByUser_IdAndDateBetween(userId, start, end);

        // Add all expenses
        Double totalSpent = expenses.stream()
                .map(e -> e.getAmount().doubleValue())
                .mapToDouble(Double::doubleValue)
                .sum();

        // Calculate remaining amount
        Double remaining = totalBudget - totalSpent;

        // Calculate percentage used
        double percentage = totalBudget == 0 ? 0 : (totalSpent / totalBudget) * 100;

        // Check if user is over budget
        String status = totalSpent > totalBudget ? "OVER_BUDGET" : "UNDER_BUDGET";

        // Return clean summary object
        return BudgetSummaryResponse.builder()
                .budget(totalBudget)
                .spent(totalSpent)
                .remaining(remaining)
                .percentageUsed(percentage)
                .status(status)
                .build();
    }

    // ------------------------------------------------------------------------
    // 2️⃣ CATEGORY-WISE SUMMARY (budget vs expense per category)
    // ------------------------------------------------------------------------
    @Override
    public List<CategoryBudgetSummaryResponse> getCategoryWiseSummary(Long userId, String month) {

        // Get all budgets for the month BUT only with category (ignore monthly)
        List<Budget> budgets =
                budgetRepository.findByUserIdAndMonth(userId, month)
                        .stream()
                        .filter(b -> b.getCategory() != null)
                        .toList();

        // Convert year-month to actual date range
        YearMonth ym = YearMonth.parse(month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        // Get all expenses inside the month
        List<Expense> expenses =
                expenseRepository.findByUser_IdAndDateBetween(userId, start, end);

        // Group expenses by category and sum the values
        Map<String, Double> spentByCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory().getName(),
                        Collectors.summingDouble(e -> e.getAmount().doubleValue())
                ));

        // For each budget, compare with actual spent
        return budgets.stream()
                .map(budget -> {

                    double budgetAmount = budget.getAmount();
                    double spent = spentByCategory.getOrDefault(budget.getCategory(), 0.0);
                    double remaining = budgetAmount - spent;
                    double percentage = budgetAmount == 0 ? 0 : (spent / budgetAmount) * 100;
                    String status = spent > budgetAmount ? "OVER_BUDGET" : "UNDER_BUDGET";

                    return CategoryBudgetSummaryResponse.builder()
                            .category(budget.getCategory())
                            .budget(budgetAmount)
                            .spent(spent)
                            .remaining(remaining)
                            .percentageUsed(percentage)
                            .status(status)
                            .build();
                })
                .toList();
    }

    // ------------------------------------------------------------------------
    // 3️⃣ UPDATE used amount for monthly budget
    // ------------------------------------------------------------------------
    @Override
    public void updateUsedAmount(Long userId, String month) {

        // Convert month to date range
        YearMonth ym = YearMonth.parse(month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        // Get all expenses in this month
        List<Expense> expenses =
                expenseRepository.findByUser_IdAndDateBetween(userId, start, end);

        // Total expenses of month
        double totalSpent = expenses.stream()
                .map(e -> e.getAmount().doubleValue())
                .mapToDouble(Double::doubleValue)
                .sum();

        // Update monthly (overall) budget only where category is null
        budgetRepository.findByUserIdAndMonth(userId, month)
                .stream()
                .filter(b -> b.getCategory() == null)
                .forEach(b -> {
                    b.setUsedAmount(totalSpent);
                    budgetRepository.save(b);
                });
    }

    // ------------------------------------------------------------------------
    // 4️⃣ UPDATE used amount for specific category
    // ------------------------------------------------------------------------
    @Override
    public void updateUsedAmountByCategory(Long userId, String month, String category) {

        // Convert month to date range
        YearMonth ym = YearMonth.parse(month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        // Get only the expenses of this category
        List<Expense> expenses =
                expenseRepository.findByUser_IdAndDateBetween(userId, start, end)
                        .stream()
                        .filter(e -> e.getCategory().getName().equalsIgnoreCase(category))
                        .toList();

        // Total expenses for this category
        double spent = expenses.stream()
                .map(e -> e.getAmount().doubleValue())
                .mapToDouble(Double::doubleValue)
                .sum();

        // Update the corresponding category budget
        budgetRepository.findByUserIdAndMonthAndCategory(userId, month, category)
                .ifPresent(budget -> {
                    budget.setUsedAmount(spent);
                    budgetRepository.save(budget);
                });
    }
}
