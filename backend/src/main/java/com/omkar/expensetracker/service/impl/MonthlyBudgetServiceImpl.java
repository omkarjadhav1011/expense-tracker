package com.omkar.expensetracker.service.impl;

import com.omkar.expensetracker.dto.request.MonthlyBudgetRequest;
import com.omkar.expensetracker.dto.response.MonthlyBudgetResponse;
import com.omkar.expensetracker.entity.MonthlyBudget;
import com.omkar.expensetracker.repository.MonthlyBudgetRepository;
import com.omkar.expensetracker.service.MonthlyBudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.omkar.expensetracker.service.AuthService;


@Service
@RequiredArgsConstructor
public class MonthlyBudgetServiceImpl implements MonthlyBudgetService {

    private final MonthlyBudgetRepository monthlyBudgetRepository;
    private final AuthService authService;

    @Override
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

    @Override
    public MonthlyBudgetResponse get(int month, int year) {
        Long userId = authService.getCurrentUserId();

        MonthlyBudget budget = monthlyBudgetRepository
                .findByUserIdAndMonthAndYear(userId, month, year)
                .orElseThrow(() -> new RuntimeException("Monthly budget not found"));

        return mapToResponse(budget);
    }

    private MonthlyBudgetResponse mapToResponse(MonthlyBudget budget) {
        MonthlyBudgetResponse response = new MonthlyBudgetResponse();
        response.setMonth(budget.getMonth());
        response.setYear(budget.getYear());
        response.setAmount(budget.getAmount());
        response.setCurrency(budget.getCurrency());
        return response;
    }
}
