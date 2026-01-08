package com.omkar.expensetracker.util;

import com.omkar.expensetracker.dto.response.ExpenseResponse;
import com.omkar.expensetracker.dto.response.UserResponse;
import com.omkar.expensetracker.entity.Expense;
import com.omkar.expensetracker.entity.User;

public class MapperUtil {

    public static UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCurrency()
        );
    }

    public static ExpenseResponse mapToExpenseResponse(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getAmount(),
                expense.getDescription(),
                expense.getCategory().getName(),
                expense.getDate()
        );
    }
}
