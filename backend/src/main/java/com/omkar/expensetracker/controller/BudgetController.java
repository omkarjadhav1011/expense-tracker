package com.omkar.expensetracker.controller;

import com.omkar.expensetracker.dto.request.BudgetRequest;
import com.omkar.expensetracker.dto.response.BudgetResponse;
import com.omkar.expensetracker.dto.response.BudgetSummaryResponse;
import com.omkar.expensetracker.dto.response.CategoryBudgetSummaryResponse;
import com.omkar.expensetracker.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Every route derives the user from the JWT.
 *
 * This controller previously took userId as a path variable and returned the
 * Budget entity, so any authenticated user could read, overwrite, or delete
 * another user's budgets. It now follows the same DTO + AuthUtil conventions as
 * TransactionController and CategoryController.
 */
@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    public BudgetResponse createOrUpdateBudget(@Valid @RequestBody BudgetRequest request) {
        return budgetService.saveBudget(request);
    }

    @GetMapping
    public List<BudgetResponse> getBudgets(
            @RequestParam(required = false) String month
    ) {
        return month == null
                ? budgetService.getBudgetsForUser()
                : budgetService.getBudgetsForMonth(month);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public BudgetSummaryResponse getSummary(@RequestParam String month) {
        return budgetService.getMonthlySummary(month);
    }

    @GetMapping("/categories-summary")
    public List<CategoryBudgetSummaryResponse> getCategorySummary(@RequestParam String month) {
        return budgetService.getCategoryWiseSummary(month);
    }
}
