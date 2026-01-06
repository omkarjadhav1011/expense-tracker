package com.omkar.expensetracker.repository;

import com.omkar.expensetracker.entity.Transaction;
import com.omkar.expensetracker.entity.User;
import com.omkar.expensetracker.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByIdAndUser(Long id, User user);

    List<Transaction> findByUserOrderByTransactionDateDesc(User user);

    List<Transaction> findByUserAndType(User user, TransactionType type);

    List<Transaction> findByUserAndTransactionDateBetween(
            User user,
            LocalDate startDate,
            LocalDate endDate
    );

    @Query("""
        SELECT 
            COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount END), 0),
            COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount END), 0)
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.transactionDate BETWEEN :startDate AND :endDate
    """)
    Object getMonthlyIncomeAndExpense(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
