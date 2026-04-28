package com.omkar.expensetracker.service;

import com.omkar.expensetracker.dto.request.CategoryBudgetRequest;
import com.omkar.expensetracker.dto.response.CategoryBudgetResponse;

import java.util.List;

public interface CategoryBudgetService {

    CategoryBudgetResponse saveOrUpdate(CategoryBudgetRequest request);

    List<CategoryBudgetResponse> getAll(int month, int year);
}
