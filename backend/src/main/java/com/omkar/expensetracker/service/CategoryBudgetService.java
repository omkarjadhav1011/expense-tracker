package com.omkar.expensetracker.service;

import com.omkar.expensetracker.dto.request.CategoryBudgetRequest;
import com.omkar.expensetracker.dto.response.CategoryBudgetResponse;
import com.omkar.expensetracker.dto.response.CategoryBudgetSummaryResponse;

import java.util.List;

public interface CategoryBudgetService {

    CategoryBudgetResponse saveOrUpdate(CategoryBudgetRequest request);

    List<CategoryBudgetResponse> getAll(int month, int year);

    void delete(Long id);

    /** Each per-category cap against actual spend from the transaction ledger. */
    List<CategoryBudgetSummaryResponse> getSummary(int month, int year);
}
