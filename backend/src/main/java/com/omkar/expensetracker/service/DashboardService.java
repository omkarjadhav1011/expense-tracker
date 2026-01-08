package com.omkar.expensetracker.service;

import com.omkar.expensetracker.dto.response.CategoryBreakdownResponse;
import com.omkar.expensetracker.dto.response.DashboardSummaryResponse;
import com.omkar.expensetracker.dto.response.MonthlyTrendResponse;
import com.omkar.expensetracker.dto.response.RecentTransactionResponse;
import com.omkar.expensetracker.enums.TransactionType;

import java.util.List;

public interface DashboardService {
    DashboardSummaryResponse getMonthlySummary();
    List<CategoryBreakdownResponse> getCategoryBreakdown(TransactionType type);
    List<RecentTransactionResponse> getRecentTransactions(int limit);
    List<MonthlyTrendResponse> getMonthlyTrend(int months);


}
