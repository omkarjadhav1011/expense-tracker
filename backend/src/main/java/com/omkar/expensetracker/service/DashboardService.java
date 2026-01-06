package com.omkar.expensetracker.service;

import com.omkar.expensetracker.dto.response.DashboardSummaryResponse;

public interface DashboardService {
    DashboardSummaryResponse getMonthlySummary();

}
