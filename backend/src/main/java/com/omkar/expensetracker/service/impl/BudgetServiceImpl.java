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

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;

    @Override
    public Budget saveBudget(Budget budget) {
        budget.setUsedAmount(0.0);
        return budgetRepository.save(budget);
    }

    @Override
    public List<Budget> getBudgetsForUser(Long userId) {
        return budgetRepository.findByUserId(userId);
    }

    @Override
    public List<Budget> getBudgetsForMonth(Long userId, String month) {
        return budgetRepository.findByUserIdAndMonth(userId, month);
    }

    @Override
    public void deleteBudget(Long id) {
        budgetRepository.deleteById(id);
    }

    // -------------------------
    //  MONTHLY SUMMARY
    // -------------------------
    @Override
    public BudgetSummaryResponse getMonthlySummary(Long userId, String month) {

        List<Budget> budgets = budgetRepository.findByUserIdAndMonth(userId, month);

        Double totalBudget = budgets.stream()
                .map(Budget::getAmount)
                .filter(a -> a != null)
                .mapToDouble(Double::doubleValue)
                .sum();

        YearMonth ym = YearMonth.parse(month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Expense> expenses =
                expenseRepository.findByUser_IdAndDateBetween(userId, start, end);

        Double totalSpent = expenses.stream()
                .map(e -> e.getAmount().doubleValue())
                .mapToDouble(Double::doubleValue)
                .sum();

        Double remaining = totalBudget - totalSpent;

        double percentage = totalBudget == 0 ? 0 : (totalSpent / totalBudget) * 100;

        String status = totalSpent > totalBudget ? "OVER_BUDGET" : "UNDER_BUDGET";

        return BudgetSummaryResponse.builder()
                .budget(totalBudget)
                .spent(totalSpent)
                .remaining(remaining)
                .percentageUsed(percentage)
                .status(status)
                .build();
    }

    // -------------------------
    // CATEGORY-WISE SUMMARY
    // -------------------------
    @Override
    public List<CategoryBudgetSummaryResponse> getCategoryWiseSummary(Long userId, String month) {

        // 1️⃣ Fetch category budgets for given month
        List<Budget> budgets =
                budgetRepository.findByUserIdAndMonth(userId, month)
                        .stream()
                        .filter(b -> b.getCategory() != null)
                        .toList();

        // 2️⃣ Fetch all expenses of that month
        YearMonth ym = YearMonth.parse(month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Expense> expenses =
                expenseRepository.findByUser_IdAndDateBetween(userId, start, end);

        // Group expenses by category
        Map<String, Double> spentByCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory().getName(),
                        Collectors.summingDouble(e -> e.getAmount().doubleValue())
                ));

        // 3️⃣ Build category-wise summary list
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
}
