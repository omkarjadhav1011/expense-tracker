package com.omkar.expensetracker.service.impl;

import com.omkar.expensetracker.dto.request.ExpenseRequest;
import com.omkar.expensetracker.dto.response.ExpenseResponse;
import com.omkar.expensetracker.entity.Expense;
import com.omkar.expensetracker.entity.Category;
import com.omkar.expensetracker.entity.User;
import com.omkar.expensetracker.repository.ExpenseRepository;
import com.omkar.expensetracker.repository.CategoryRepository;
import com.omkar.expensetracker.repository.UserRepository;
import com.omkar.expensetracker.service.BudgetService;
import com.omkar.expensetracker.service.ExpenseService;
import com.omkar.expensetracker.util.MapperUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final BudgetService budgetService;

    public ExpenseServiceImpl(
            ExpenseRepository expenseRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            BudgetService budgetService
    ) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.budgetService = budgetService;
    }

    @Override
    public ExpenseResponse createExpense(ExpenseRequest request, String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Expense expense = new Expense();
        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setCategory(category);
        expense.setDate(request.getDate());
        expense.setUser(user);

        Expense saved = expenseRepository.save(expense);

        // ⬇️ UPDATE BUDGET USAGE AFTER SAVING EXPENSE
        String month = saved.getDate().toString().substring(0, 7);
        budgetService.updateUsedAmount(saved.getUser().getId(), month);
        budgetService.updateUsedAmountByCategory(saved.getUser().getId(), month, saved.getCategory().getName());

        return MapperUtil.mapToExpenseResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getAllExpenses(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return expenseRepository.findByUser(user).stream()
                .map(MapperUtil::mapToExpenseResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Expense expense = expenseRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        return MapperUtil.mapToExpenseResponse(expense);
    }

    @Override
    public ExpenseResponse updateExpense(Long id, ExpenseRequest request, String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Expense expense = expenseRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setCategory(category);
        expense.setDate(request.getDate());

        Expense saved = expenseRepository.save(expense);

        // Update budget usage again
        String month = saved.getDate().toString().substring(0, 7);
        budgetService.updateUsedAmount(saved.getUser().getId(), month);
        budgetService.updateUsedAmountByCategory(saved.getUser().getId(), month, saved.getCategory().getName());

        return MapperUtil.mapToExpenseResponse(saved);
    }

    @Override
    public void deleteExpense(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Expense expense = expenseRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        expenseRepository.delete(expense);
    }
}
