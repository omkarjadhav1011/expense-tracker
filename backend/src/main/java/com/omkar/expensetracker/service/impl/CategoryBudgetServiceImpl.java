package com.omkar.expensetracker.service.impl;

import com.omkar.expensetracker.dto.request.CategoryBudgetRequest;
import com.omkar.expensetracker.dto.response.CategoryBudgetResponse;
import com.omkar.expensetracker.dto.response.CategoryBudgetSummaryResponse;
import com.omkar.expensetracker.entity.Category;
import com.omkar.expensetracker.entity.CategoryBudget;
import com.omkar.expensetracker.entity.MonthlyBudget;
import com.omkar.expensetracker.repository.CategoryBudgetRepository;
import com.omkar.expensetracker.repository.CategoryRepository;
import com.omkar.expensetracker.repository.MonthlyBudgetRepository;
import com.omkar.expensetracker.service.AuthService;
import com.omkar.expensetracker.service.CategoryBudgetService;
import com.omkar.expensetracker.util.BudgetSpendCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryBudgetServiceImpl implements CategoryBudgetService {

    private final CategoryBudgetRepository categoryBudgetRepository;
    private final MonthlyBudgetRepository monthlyBudgetRepository;
    private final CategoryRepository categoryRepository;
    private final AuthService authService;
    private final BudgetSpendCalculator spendCalculator;

    @Override
    @Transactional
    public CategoryBudgetResponse saveOrUpdate(CategoryBudgetRequest request) {
        Long userId = authService.getCurrentUserId();

        // Monthly budget
        MonthlyBudget monthlyBudget = monthlyBudgetRepository
                .findByUserIdAndMonthAndYear(userId, request.getMonth(), request.getYear())
                .orElseThrow(() -> new RuntimeException("Set a monthly budget for this month first"));

        // Validate category ownership
        Category category = categoryRepository
                .findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getUser().getId().equals(userId)) {
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
            throw new RuntimeException(
                    "Category budgets would total " + totalAllocated
                            + ", which exceeds the monthly budget of " + monthlyBudget.getAmount());
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

        List<CategoryBudget> budgets =
                categoryBudgetRepository.findByUserIdAndMonthAndYear(userId, month, year);

        Map<Long, String> names = categoryNames(budgets);

        return budgets.stream()
                .map(cb -> mapToResponse(cb, names.getOrDefault(cb.getCategoryId(), "Unknown")))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Long userId = authService.getCurrentUserId();

        // Ownership-checked: the inherited deleteById would let any authenticated
        // user remove another user's cap by guessing an id.
        CategoryBudget budget = categoryBudgetRepository.findById(id)
                .filter(cb -> cb.getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Category budget not found"));

        categoryBudgetRepository.delete(budget);
    }

    @Override
    public List<CategoryBudgetSummaryResponse> getSummary(int month, int year) {
        Long userId = authService.getCurrentUserId();

        List<CategoryBudget> budgets =
                categoryBudgetRepository.findByUserIdAndMonthAndYear(userId, month, year);

        Map<Long, String> names = categoryNames(budgets);
        Map<Long, BigDecimal> spendByCategory =
                spendCalculator.spendByCategoryId(userId, month, year);

        return budgets.stream()
                .map(cb -> {
                    BigDecimal cap = cb.getAllocatedAmount();
                    BigDecimal spent =
                            spendByCategory.getOrDefault(cb.getCategoryId(), BigDecimal.ZERO);

                    return CategoryBudgetSummaryResponse.builder()
                            .id(cb.getId())
                            .categoryId(cb.getCategoryId())
                            .categoryName(names.getOrDefault(cb.getCategoryId(), "Unknown"))
                            .budget(cap)
                            .spent(spent)
                            .remaining(cap.subtract(spent))
                            .percentageUsed(BudgetSpendCalculator.percentageUsed(spent, cap))
                            .status(BudgetSpendCalculator.status(spent, cap))
                            .build();
                })
                .collect(Collectors.toList());
    }

    /** One query for all the names, instead of a findById per row. */
    private Map<Long, String> categoryNames(List<CategoryBudget> budgets) {
        List<Long> ids = budgets.stream().map(CategoryBudget::getCategoryId).distinct().toList();
        if (ids.isEmpty()) return Map.of();

        return categoryRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Category::getId, Category::getName));
    }

    private CategoryBudgetResponse mapToResponse(CategoryBudget budget, String categoryName) {
        CategoryBudgetResponse response = new CategoryBudgetResponse();
        response.setId(budget.getId());
        response.setCategoryId(budget.getCategoryId());
        response.setCategoryName(categoryName);
        response.setAllocatedAmount(budget.getAllocatedAmount());
        return response;
    }
}
