package com.omkar.expensetracker.repository;

import com.omkar.expensetracker.entity.Expense;
import com.omkar.expensetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUser(User user);

    Optional<Expense> findByIdAndUser(Long id, User user);
}