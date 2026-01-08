package com.omkar.expensetracker.service;

import com.omkar.expensetracker.dto.request.MonthlyBudgetRequest;
import com.omkar.expensetracker.dto.response.MonthlyBudgetResponse;

public interface MonthlyBudgetService {

    MonthlyBudgetResponse saveOrUpdate(MonthlyBudgetRequest request);

    MonthlyBudgetResponse get(int month, int year);
}
