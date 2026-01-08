package com.omkar.expensetracker.controller;

import com.omkar.expensetracker.dto.response.CategoryBreakdownResponse;
import com.omkar.expensetracker.dto.response.DashboardSummaryResponse;
import com.omkar.expensetracker.dto.response.MonthlyTrendResponse;
import com.omkar.expensetracker.dto.response.RecentTransactionResponse;
import com.omkar.expensetracker.enums.TransactionType;
import com.omkar.expensetracker.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary() {
        return ResponseEntity.ok(
                dashboardService.getMonthlySummary()
        );
    }

    @GetMapping("/category-breakdown")
    public ResponseEntity<List<CategoryBreakdownResponse>> getCategoryBreakdown(
            @RequestParam TransactionType type
    ) {
        return ResponseEntity.ok(
                dashboardService.getCategoryBreakdown(type)
        );
    }

    @GetMapping("/recent-transactions")
    public ResponseEntity<List<RecentTransactionResponse>> getRecentTransactions(
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(
                dashboardService.getRecentTransactions(limit)
        );
    }


    @GetMapping("/monthly-trend")
    public ResponseEntity<List<MonthlyTrendResponse>> getMonthlyTrend(
            @RequestParam(defaultValue = "6") int months
    ) {
        return ResponseEntity.ok(
                dashboardService.getMonthlyTrend(months)
        );
    }

}
