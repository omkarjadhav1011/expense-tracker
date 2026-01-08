package com.omkar.expensetracker.repository;

import com.omkar.expensetracker.entity.Transaction;
import com.omkar.expensetracker.entity.User;
import com.omkar.expensetracker.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByIdAndUser(Long id, User user);

    // List all transactions of logged-in user
    List<Transaction> findByUserOrderByTransactionDateDesc(User user);

    // Filters
    List<Transaction> findByUserAndType(User user, TransactionType type);

    List<Transaction> findByUserAndTransactionDateBetween(
            User user,
            LocalDate startDate,
            LocalDate endDate
    );
}
