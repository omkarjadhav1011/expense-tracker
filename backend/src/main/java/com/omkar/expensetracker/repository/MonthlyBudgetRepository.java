package com.omkar.expensetracker.repository;

import com.omkar.expensetracker.entity.MonthlyBudget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MonthlyBudgetRepository extends JpaRepository<MonthlyBudget, Long> {

    Optional<MonthlyBudget> findByUserIdAndMonthAndYear(
            Long userId,
            int month,
            int year
    );
}
