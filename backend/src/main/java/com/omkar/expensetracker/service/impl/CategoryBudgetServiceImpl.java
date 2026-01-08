package com.omkar.expensetracker.service.impl;

import com.omkar.expensetracker.dto.request.CategoryBudgetRequest;
import com.omkar.expensetracker.dto.response.CategoryBudgetResponse;
import com.omkar.expensetracker.entity.Category;
import com.omkar.expensetracker.entity.CategoryBudget;
import com.omkar.expensetracker.entity.MonthlyBudget;
import com.omkar.expensetracker.repository.CategoryBudgetRepository;
import com.omkar.expensetracker.repository.CategoryRepository;
import com.omkar.expensetracker.repository.MonthlyBudgetRepository;
import com.omkar.expensetracker.service.AuthService;
import com.omkar.expensetracker.service.CategoryBudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryBudgetServiceImpl implements CategoryBudgetService {

    private final CategoryBudgetRepository categoryBudgetRepository;
    private final MonthlyBudgetRepository monthlyBudgetRepository;
    private final CategoryRepository categoryRepository;
    private final AuthService authService;

    @Override
    public CategoryBudgetResponse saveOrUpdate(CategoryBudgetRequest request) {
        Long userId = authService.getCurrentUserId();

        // Monthly budget
        MonthlyBudget monthlyBudget = monthlyBudgetRepository
                .findByUserIdAndMonthAndYear(userId, request.getMonth(), request.getYear())
                .orElseThrow(() -> new RuntimeException("Create monthly budget first"));

        // Validate category ownership
        Category category = categoryRepository
                .findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized category access");
        }

        // Get existing category budgets for month
        List<CategoryBudget> existingBudgets =
                categoryBudgetRepository.findByUserIdAndMonthAndYear(
                        userId, request.getMonth(), request.getYear()
                );

        BigDecimal totalAllocated = existingBudgets.stream()
                .filter(cb -> !cb.getCategoryId().equals(request.getCategoryId()))
                .map(CategoryBudget::getAllocatedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .add(request.getAllocatedAmount());

        // Enforce sum(category budgets) ≤ monthly budget
        if (totalAllocated.compareTo(monthlyBudget.getAmount()) > 0) {
            throw new RuntimeException("Category budgets exceed monthly budget");
        }

        // Save or update
        CategoryBudget budget = categoryBudgetRepository
                .findByUserIdAndCategoryIdAndMonthAndYear(
                        userId,
                        request.getCategoryId(),
                        request.getMonth(),
                        request.getYear()
                )
                .orElse(new CategoryBudget());

        budget.setUserId(userId);
        budget.setCategoryId(request.getCategoryId());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());
        budget.setAllocatedAmount(request.getAllocatedAmount());

        CategoryBudget saved = categoryBudgetRepository.save(budget);

        return mapToResponse(saved, category.getName());
    }

    @Override
    public List<CategoryBudgetResponse> getAll(int month, int year) {
        Long userId = authService.getCurrentUserId();

        return categoryBudgetRepository
                .findByUserIdAndMonthAndYear(userId, month, year)
                .stream()
                .map(cb -> {
                    String categoryName = categoryRepository
                            .findById(cb.getCategoryId())
                            .map(Category::getName)
                            .orElse("Unknown");
                    return mapToResponse(cb, categoryName);
                })
                .collect(Collectors.toList());
    }

    private CategoryBudgetResponse mapToResponse(CategoryBudget budget, String categoryName) {
        CategoryBudgetResponse response = new CategoryBudgetResponse();
        response.setCategoryId(budget.getCategoryId());
        response.setCategoryName(categoryName);
        response.setAllocatedAmount(budget.getAllocatedAmount());
        return response;
    }
}
