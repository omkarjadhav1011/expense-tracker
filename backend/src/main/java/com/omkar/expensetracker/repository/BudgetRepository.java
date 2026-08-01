package com.omkar.expensetracker.repository;

import com.omkar.expensetracker.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserIdOrderByMonthDesc(Long userId);

    List<Budget> findByUserIdAndMonth(Long userId, String month);

    // IgnoreCase so it matches the case-insensitive category join used when
    // computing spend. With an exact match, a "food" cap alongside a "Food" cap
    // would be two rows that both claim the same spend and double-count the cap.
    Optional<Budget> findByUserIdAndMonthAndCategoryIgnoreCase(
            Long userId, String month, String category);

    // Explicit IS NULL variant for the overall monthly cap. Spring Data does
    // translate a null derived-query argument to IS NULL, but the caller reads
    // better when the two cases are separate methods.
    Optional<Budget> findByUserIdAndMonthAndCategoryIsNull(Long userId, String month);

    // Ownership-checked lookup — the inherited findById/deleteById would let any
    // authenticated user touch another user's budget by guessing an id.
    Optional<Budget> findByIdAndUserId(Long id, Long userId);
}
