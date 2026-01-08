package com.omkar.expensetracker.service.impl;

import com.omkar.expensetracker.entity.Budget;
import com.omkar.expensetracker.entity.Expense;
import com.omkar.expensetracker.dto.response.BudgetSummaryResponse;
import com.omkar.expensetracker.repository.BudgetRepository;
import com.omkar.expensetracker.repository.ExpenseRepository;
import com.omkar.expensetracker.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

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

    @Override
    public BudgetSummaryResponse getMonthlySummary(Long userId, String month) {

        List<Budget> monthlyBudgets =
                budgetRepository.findByUserIdAndMonth(userId, month);

        Double totalBudget = monthlyBudgets.stream()
                .map(Budget::getAmount)
                .mapToDouble(Double::doubleValue)
                .sum();

        YearMonth ym = YearMonth.parse(month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Expense> monthlyExpenses =
                expenseRepository.findByUser_IdAndDateBetween(userId, start, end);

        Double totalSpent = monthlyExpenses.stream()
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
}
