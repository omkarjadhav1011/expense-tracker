package com.omkar.expensetracker.repository;

import com.omkar.expensetracker.entity.CategoryBudget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryBudgetRepository extends JpaRepository<CategoryBudget, Long> {

    List<CategoryBudget> findByUserIdAndMonthAndYear(
            Long userId,
            int month,
            int year
    );

    Optional<CategoryBudget> findByUserIdAndCategoryIdAndMonthAndYear(
            Long userId,
            Long categoryId,
            int month,
            int year
    );
}
