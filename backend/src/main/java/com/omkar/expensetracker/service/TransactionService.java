package com.omkar.expensetracker.service;

import com.omkar.expensetracker.dto.request.TransactionRequest;
import com.omkar.expensetracker.dto.response.TransactionResponse;
import com.omkar.expensetracker.enums.TransactionType;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransactionService {

    TransactionResponse addTransaction(TransactionRequest request);

    TransactionResponse updateTransaction(Long transactionId, TransactionRequest request);

    void deleteTransaction(Long transactionId);

    // Filtered list
    List<TransactionResponse> getTransactions(
            TransactionType type,
            LocalDate startDate,
            LocalDate endDate
    );

    List<TransactionResponse> getTransactions(
            TransactionType type,
            LocalDate startDate,
            LocalDate endDate,
            Long categoryId
    );


    List<TransactionResponse> getTransactions(
            TransactionType type,
            LocalDate startDate,
            LocalDate endDate,
            Long categoryId,
            BigDecimal minAmount,
            BigDecimal maxAmount
    );

    Page<TransactionResponse> getTransactionsPaged(
            TransactionType type,
            LocalDate startDate,
            LocalDate endDate,
            Long categoryId,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            int page,
            int size,
            String sortBy,
            String direction
    );




    TransactionResponse getTransactionById(Long transactionId);
}
