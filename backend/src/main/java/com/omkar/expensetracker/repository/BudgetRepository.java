package com.omkar.expensetracker.repository;

import com.omkar.expensetracker.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserId(Long userId);

    List<Budget> findByUserIdAndMonth(Long userId, String month);

    Optional<Budget> findByUserIdAndMonthAndCategory(Long userId, String month, String category);
}
