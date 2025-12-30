package com.omkar.expensetracker.service;

import com.omkar.expensetracker.dto.request.ExpenseRequest;
import com.omkar.expensetracker.dto.response.ExpenseResponse;
import java.util.List;

public interface ExpenseService {

    ExpenseResponse createExpense(ExpenseRequest request, String userEmail);
    List<ExpenseResponse> getAllExpenses(String userEmail);
    ExpenseResponse getExpenseById(Long id, String userEmail);
    ExpenseResponse updateExpense(Long id, ExpenseRequest request, String userEmail);
    void deleteExpense(Long id, String userEmail);
}