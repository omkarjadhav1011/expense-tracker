package com.omkar.expensetracker.service;

import com.omkar.expensetracker.entity.Budget;

import java.util.List;

public interface BudgetService {

    Budget saveBudget(Budget budget);

    List<Budget> getBudgetsForUser(Long userId);

    List<Budget> getBudgetsForMonth(Long userId, String month);

    void deleteBudget(Long id);
}
