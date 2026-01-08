package com.omkar.expensetracker.controller;

import com.omkar.expensetracker.dto.response.BudgetSummaryResponse;
import com.omkar.expensetracker.entity.Budget;
import com.omkar.expensetracker.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    public Budget createOrUpdateBudget(@RequestBody Budget budget) {
        return budgetService.saveBudget(budget);
    }

    @GetMapping("/user/{userId}")
    public List<Budget> getAllBudgets(@PathVariable Long userId) {
        return budgetService.getBudgetsForUser(userId);
    }

    @GetMapping("/user/{userId}/{month}")
    public List<Budget> getBudgetsByMonth(
            @PathVariable Long userId,
            @PathVariable String month
    ) {
        return budgetService.getBudgetsForMonth(userId, month);
    }

    @DeleteMapping("/{id}")
    public void deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
    }

    @GetMapping("/user/{userId}/{month}/summary")
    public BudgetSummaryResponse getSummary(
            @PathVariable Long userId,
            @PathVariable String month
    ) {
        return budgetService.getMonthlySummary(userId, month);
    }

}
