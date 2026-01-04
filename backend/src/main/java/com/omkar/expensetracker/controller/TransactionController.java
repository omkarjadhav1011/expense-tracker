package com.omkar.expensetracker.controller;

import com.omkar.expensetracker.dto.request.TransactionRequest;
import com.omkar.expensetracker.dto.response.TransactionResponse;
import com.omkar.expensetracker.enums.TransactionType;
import com.omkar.expensetracker.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    // Add Income / Expense
    @PostMapping
    public ResponseEntity<TransactionResponse> addTransaction(
            @Valid @RequestBody TransactionRequest request
    ) {
        return ResponseEntity.ok(
                transactionService.addTransaction(request)
        );
    }

    //Update Transaction
    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request
    ) {
        return ResponseEntity.ok(
                transactionService.updateTransaction(id, request)
        );
    }

    // Delete Transaction
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    // List Transactions (Filters + Pagination + Sorting)
    @GetMapping
    public ResponseEntity<?> getTransactions(
            @RequestParam(required = false) TransactionType type,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate,

            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,

            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,

            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        return ResponseEntity.ok(
                transactionService.getTransactionsPaged(
                        type,
                        startDate,
                        endDate,
                        categoryId,
                        minAmount,
                        maxAmount,
                        page,
                        size,
                        sortBy,
                        direction
                )
        );
    }

    // Get Transaction by ID
    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransactionById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                transactionService.getTransactionById(id)
        );
    }
}
