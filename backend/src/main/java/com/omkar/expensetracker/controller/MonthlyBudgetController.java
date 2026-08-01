package com.omkar.expensetracker.controller;

import com.omkar.expensetracker.dto.request.MonthlyBudgetRequest;
import com.omkar.expensetracker.dto.response.BudgetSummaryResponse;
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

    // Get Monthly Budget. 200 with an empty body when no cap is set for the month.
    @GetMapping
    public ResponseEntity<MonthlyBudgetResponse> getMonthlyBudget(
            @RequestParam int month,
            @RequestParam int year
    ) {
        return ResponseEntity.ok(
                monthlyBudgetService.get(month, year)
        );
    }

    // Remove the month's cap
    @DeleteMapping
    public ResponseEntity<Void> deleteMonthlyBudget(
            @RequestParam int month,
            @RequestParam int year
    ) {
        monthlyBudgetService.delete(month, year);
        return ResponseEntity.noContent().build();
    }

    // Cap vs actual spend, spend derived from the transaction ledger
    @GetMapping("/summary")
    public ResponseEntity<BudgetSummaryResponse> getSummary(
            @RequestParam int month,
            @RequestParam int year
    ) {
        return ResponseEntity.ok(
                monthlyBudgetService.getSummary(month, year)
        );
    }
}
