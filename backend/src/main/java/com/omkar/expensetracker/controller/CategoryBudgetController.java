package com.omkar.expensetracker.controller;

import com.omkar.expensetracker.dto.request.CategoryBudgetRequest;
import com.omkar.expensetracker.dto.response.CategoryBudgetResponse;
import com.omkar.expensetracker.dto.response.CategoryBudgetSummaryResponse;
import com.omkar.expensetracker.service.CategoryBudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets/category")
@RequiredArgsConstructor
public class CategoryBudgetController {

    private final CategoryBudgetService categoryBudgetService;

    // Create or Update Category Budget
    @PostMapping
    public ResponseEntity<CategoryBudgetResponse> saveCategoryBudget(
            @Valid @RequestBody CategoryBudgetRequest request
    ) {
        return ResponseEntity.ok(
                categoryBudgetService.saveOrUpdate(request)
        );
    }

    // Get Category Budgets for Month
    @GetMapping
    public ResponseEntity<List<CategoryBudgetResponse>> getCategoryBudgets(
            @RequestParam int month,
            @RequestParam int year
    ) {
        return ResponseEntity.ok(
                categoryBudgetService.getAll(month, year)
        );
    }

    // Remove a single category cap
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategoryBudget(@PathVariable Long id) {
        categoryBudgetService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Each cap vs actual spend, spend derived from the transaction ledger
    @GetMapping("/summary")
    public ResponseEntity<List<CategoryBudgetSummaryResponse>> getSummary(
            @RequestParam int month,
            @RequestParam int year
    ) {
        return ResponseEntity.ok(
                categoryBudgetService.getSummary(month, year)
        );
    }
}
