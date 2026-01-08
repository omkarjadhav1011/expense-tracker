package com.omkar.expensetracker.controller;

import com.omkar.expensetracker.dto.request.MonthlyBudgetRequest;
import com.omkar.expensetracker.dto.response.MonthlyBudgetResponse;
import com.omkar.expensetracker.service.MonthlyBudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budgets/monthly")
@RequiredArgsConstructor
public class MonthlyBudgetController {

    private final MonthlyBudgetService monthlyBudgetService;

    // Create or Update Monthly Budget
    @PostMapping
    public ResponseEntity<MonthlyBudgetResponse> saveMonthlyBudget(
            @Valid @RequestBody MonthlyBudgetRequest request
    ) {
        return ResponseEntity.ok(
                monthlyBudgetService.saveOrUpdate(request)
        );
    }

    // Get Monthly Budget
    @GetMapping
    public ResponseEntity<MonthlyBudgetResponse> getMonthlyBudget(
            @RequestParam int month,
            @RequestParam int year
    ) {
        return ResponseEntity.ok(
                monthlyBudgetService.get(month, year)
        );
    }
}
