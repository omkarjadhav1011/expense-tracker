package com.omkar.expensetracker.repository.specification;

import com.omkar.expensetracker.entity.Transaction;
import com.omkar.expensetracker.enums.TransactionType;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionSpecification {

    // User filter
    public static Specification<Transaction> belongsToUser(Long userId) {
        return (root, query, cb) ->
                cb.equal(root.get("user").get("id"), userId);
    }

    // Type filter
    public static Specification<Transaction> hasType(TransactionType type) {
        return (root, query, cb) -> {
            if (type == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("type"), type);
        };
    }

    // Date range filter
    public static Specification<Transaction> hasDateBetween(
            LocalDate startDate,
            LocalDate endDate
    ) {
        return (root, query, cb) -> {

            if (startDate == null && endDate == null) {
                return cb.conjunction();
            }

            if (startDate != null && endDate != null) {
                return cb.between(
                        root.get("transactionDate"),
                        startDate,
                        endDate
                );
            }

            if (startDate != null) {
                return cb.greaterThanOrEqualTo(
                        root.get("transactionDate"),
                        startDate
                );
            }

            return cb.lessThanOrEqualTo(
                    root.get("transactionDate"),
                    endDate
            );
        };
    }

    // Category filter
    public static Specification<Transaction> hasCategory(Long categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) {
                return cb.conjunction();
            }
            return cb.equal(
                    root.get("category").get("id"),
                    categoryId
            );
        };
    }

    // Amount filter
    public static Specification<Transaction> hasAmountBetween(
            BigDecimal minAmount,
            BigDecimal maxAmount
    ) {
        return (root, query, cb) -> {

            if (minAmount == null && maxAmount == null) {
                return cb.conjunction();
            }

            if (minAmount != null && maxAmount != null) {
                return cb.between(
                        root.get("amount"),
                        minAmount,
                        maxAmount
                );
            }

            if (minAmount != null) {
                return cb.greaterThanOrEqualTo(
                        root.get("amount"),
                        minAmount
                );
            }

            return cb.lessThanOrEqualTo(
                    root.get("amount"),
                    maxAmount
            );
        };
    }
}
