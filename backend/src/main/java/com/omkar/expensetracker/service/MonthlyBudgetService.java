package com.omkar.expensetracker.service;

import com.omkar.expensetracker.dto.request.MonthlyBudgetRequest;
import com.omkar.expensetracker.dto.response.BudgetSummaryResponse;
import com.omkar.expensetracker.dto.response.MonthlyBudgetResponse;

public interface MonthlyBudgetService {

    MonthlyBudgetResponse saveOrUpdate(MonthlyBudgetRequest request);

    /** Null when no cap is set — "unset" is a normal state for a UI, not an error. */
    MonthlyBudgetResponse get(int month, int year);

    void delete(int month, int year);

    /** The month's cap against actual spend from the transaction ledger. */
    BudgetSummaryResponse getSummary(int month, int year);
}
