package com.omkar.expensetracker.controller;

import com.omkar.expensetracker.dto.response.CategoryBreakdownResponse;
import com.omkar.expensetracker.dto.response.DashboardSummaryResponse;
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

}
