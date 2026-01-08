package com.omkar.expensetracker.service.impl;

import com.omkar.expensetracker.entity.Budget;
import com.omkar.expensetracker.repository.BudgetRepository;
import com.omkar.expensetracker.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;

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
}
