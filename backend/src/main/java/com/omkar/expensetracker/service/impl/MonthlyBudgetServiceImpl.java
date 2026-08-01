package com.omkar.expensetracker.service.impl;

import com.omkar.expensetracker.dto.request.MonthlyBudgetRequest;
import com.omkar.expensetracker.dto.response.BudgetSummaryResponse;
import com.omkar.expensetracker.dto.response.MonthlyBudgetResponse;
import com.omkar.expensetracker.entity.MonthlyBudget;
import com.omkar.expensetracker.repository.MonthlyBudgetRepository;
import com.omkar.expensetracker.service.MonthlyBudgetService;
import com.omkar.expensetracker.util.BudgetSpendCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.omkar.expensetracker.service.AuthService;

import java.math.BigDecimal;


@Service
@RequiredArgsConstructor
public class MonthlyBudgetServiceImpl implements MonthlyBudgetService {

    private final MonthlyBudgetRepository monthlyBudgetRepository;
    private final AuthService authService;
    private final BudgetSpendCalculator spendCalculator;

    @Override
    @Transactional
    public MonthlyBudgetResponse saveOrUpdate(MonthlyBudgetRequest request) {
        Long userId = authService.getCurrentUserId();

        MonthlyBudget budget = monthlyBudgetRepository
                .findByUserIdAndMonthAndYear(userId, request.getMonth(), request.getYear())
                .orElse(new MonthlyBudget());

        budget.setUserId(userId);
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());
        budget.setAmount(request.getAmount());
        budget.setCurrency(request.getCurrency());

        MonthlyBudget saved = monthlyBudgetRepository.save(budget);

        return mapToResponse(saved);
    }

    /**
     * Returns null rather than throwing when nothing is set. "No cap for this month"
     * is the normal state on a fresh account, and the previous not-found exception
     * became a 400 that the Budgets and Profile screens had to swallow.
     */
    @Override
    public MonthlyBudgetResponse get(int month, int year) {
        Long userId = authService.getCurrentUserId();

        return monthlyBudgetRepository
                .findByUserIdAndMonthAndYear(userId, month, year)
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Override
    @Transactional
    public void delete(int month, int year) {
        Long userId = authService.getCurrentUserId();

        MonthlyBudget budget = monthlyBudgetRepository
                .findByUserIdAndMonthAndYear(userId, month, year)
                .orElseThrow(() -> new RuntimeException("Monthly budget not found"));

        monthlyBudgetRepository.delete(budget);
    }

    @Override
    public BudgetSummaryResponse getSummary(int month, int year) {
        Long userId = authService.getCurrentUserId();

        BigDecimal budget = monthlyBudgetRepository
                .findByUserIdAndMonthAndYear(userId, month, year)
                .map(MonthlyBudget::getAmount)
                .orElse(BigDecimal.ZERO);

        BigDecimal spent = spendCalculator.totalSpend(userId, month, year);

        return BudgetSummaryResponse.builder()
                .budget(budget)
                .spent(spent)
                .remaining(budget.subtract(spent))
                .percentageUsed(BudgetSpendCalculator.percentageUsed(spent, budget))
                .status(BudgetSpendCalculator.status(spent, budget))
                .build();
    }

    private MonthlyBudgetResponse mapToResponse(MonthlyBudget budget) {
        MonthlyBudgetResponse response = new MonthlyBudgetResponse();
        response.setId(budget.getId());
        response.setMonth(budget.getMonth());
        response.setYear(budget.getYear());
        response.setAmount(budget.getAmount());
        response.setCurrency(budget.getCurrency());
        return response;
    }
}
