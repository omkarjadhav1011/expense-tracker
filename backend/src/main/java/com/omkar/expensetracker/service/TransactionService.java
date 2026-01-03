package com.omkar.expensetracker.service;

import com.omkar.expensetracker.dto.request.TransactionRequest;
import com.omkar.expensetracker.dto.response.TransactionResponse;

import java.util.List;

public interface TransactionService {

    TransactionResponse addTransaction(TransactionRequest request);

    TransactionResponse updateTransaction(Long transactionId, TransactionRequest request);

    void deleteTransaction(Long transactionId);

    List<TransactionResponse> getAllTransactions();
}
