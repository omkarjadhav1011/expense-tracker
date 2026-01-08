package com.omkar.expensetracker.util;

import com.omkar.expensetracker.enums.CategoryType;

import java.util.List;
import java.util.Map;

public class DefaultCategoryProvider {

    public static Map<CategoryType, List<String>> getDefaultCategories() {
        return Map.of(
                CategoryType.EXPENSE, List.of(
                        "Food",
                        "Transport",
                        "Rent",
                        "Entertainment"
                ),
                CategoryType.INCOME, List.of(
                        "Salary",
                        "Freelance",
                        "Business"
                )
        );
    }
}
