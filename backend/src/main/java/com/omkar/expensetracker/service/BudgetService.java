package com.omkar.expensetracker.service;

import com.omkar.expensetracker.dto.request.BudgetRequest;
import com.omkar.expensetracker.dto.response.BudgetResponse;
import com.omkar.expensetracker.dto.response.BudgetSummaryResponse;
import com.omkar.expensetracker.dto.response.CategoryBudgetSummaryResponse;

import java.util.List;

public interface BudgetService {

    BudgetResponse saveBudget(BudgetRequest request);

    List<BudgetResponse> getBudgetsForUser();

    List<BudgetResponse> getBudgetsForMonth(String month);

    void deleteBudget(Long id);

    BudgetSummaryResponse getMonthlySummary(String month);

    List<CategoryBudgetSummaryResponse> getCategoryWiseSummary(String month);
}
