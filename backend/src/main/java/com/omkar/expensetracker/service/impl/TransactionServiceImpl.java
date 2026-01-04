package com.omkar.expensetracker.service.impl;

import com.omkar.expensetracker.dto.request.TransactionRequest;
import com.omkar.expensetracker.dto.response.TransactionResponse;
import com.omkar.expensetracker.entity.Category;
import com.omkar.expensetracker.entity.Transaction;
import com.omkar.expensetracker.entity.User;
import com.omkar.expensetracker.repository.CategoryRepository;
import com.omkar.expensetracker.repository.TransactionRepository;
import com.omkar.expensetracker.service.TransactionService;
import com.omkar.expensetracker.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import com.omkar.expensetracker.enums.TransactionType;
import com.omkar.expensetracker.repository.specification.TransactionSpecification;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.math.BigDecimal;


@Service
@RequiredArgsConstructor
@Transactional
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final AuthUtil authUtil;

    @Override
    public TransactionResponse addTransaction(TransactionRequest request) {

        User user = authUtil.getLoggedInUser();

        Category category = categoryRepository
                .findByIdAndUser(request.getCategoryId(), user)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Transaction transaction = new Transaction();
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setDescription(request.getDescription());
        transaction.setUser(user);
        transaction.setCategory(category);

        Transaction saved = transactionRepository.save(transaction);

        return mapToResponse(saved);
    }

    @Override
    public TransactionResponse updateTransaction(Long transactionId, TransactionRequest request) {

        User user = authUtil.getLoggedInUser();

        Transaction transaction = transactionRepository
                .findByIdAndUser(transactionId, user)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        Category category = categoryRepository
                .findByIdAndUser(request.getCategoryId(), user)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setDescription(request.getDescription());
        transaction.setCategory(category);

        Transaction updated = transactionRepository.save(transaction);

        return mapToResponse(updated);
    }

    @Override
    public void deleteTransaction(Long transactionId) {

        User user = authUtil.getLoggedInUser();

        Transaction transaction = transactionRepository
                .findByIdAndUser(transactionId, user)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        transactionRepository.delete(transaction);
    }

//    @Override
//    public List<TransactionResponse> getAllTransactions() {
//
//        User user = authUtil.getLoggedInUser();
//
//        return transactionRepository.findByUserOrderByTransactionDateDesc(user)
//                .stream()
//                .map(this::mapToResponse)
//                .collect(Collectors.toList());
//    }

//    @Override
//    public List<TransactionResponse> getTransactions(
//            TransactionType type,
//            LocalDate startDate,
//            LocalDate endDate
//    ) {
//
//        User user = authUtil.getLoggedInUser();
//
//        Specification<Transaction> spec =
//                Specification
//                        .where(TransactionSpecification.belongsToUser(user.getId()))
//                        .and(TransactionSpecification.hasType(type))
//                        .and(TransactionSpecification.hasDateBetween(startDate, endDate));
//
//        return transactionRepository.findAll(spec)
//                .stream()
//                .map(this::mapToResponse)
//                .toList();
//    }

    @Override
    public List<TransactionResponse> getTransactions(
            TransactionType type,
            LocalDate startDate,
            LocalDate endDate,
            Long categoryId
    ) {

        User user = authUtil.getLoggedInUser();

        Specification<Transaction> spec =
                Specification
                        .where(TransactionSpecification.belongsToUser(user.getId()))
                        .and(TransactionSpecification.hasType(type))
                        .and(TransactionSpecification.hasDateBetween(startDate, endDate))
                        .and(TransactionSpecification.hasCategory(categoryId));

        return transactionRepository.findAll(spec)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }



    @Override
    public TransactionResponse getTransactionById(Long transactionId) {

        User user = authUtil.getLoggedInUser();

        Transaction transaction = transactionRepository
                .findByIdAndUser(transactionId, user)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        return mapToResponse(transaction);
    }

    // MAPPER

    private TransactionResponse mapToResponse(Transaction transaction) {

        return new TransactionResponse(
                transaction.getId(),
                transaction.getAmount(),
                transaction.getType(),
                transaction.getCategory().getName(),
                transaction.getCategory().getId(),
                transaction.getTransactionDate(),
                transaction.getDescription()
        );
    }

    @Override
    public List<TransactionResponse> getTransactions(
            TransactionType type,
            LocalDate startDate,
            LocalDate endDate,
            Long categoryId,
            BigDecimal minAmount,
            BigDecimal maxAmount
    ) {

        User user = authUtil.getLoggedInUser();

        Specification<Transaction> spec =
                Specification
                        .where(TransactionSpecification.belongsToUser(user.getId()))
                        .and(TransactionSpecification.hasType(type))
                        .and(TransactionSpecification.hasDateBetween(startDate, endDate))
                        .and(TransactionSpecification.hasCategory(categoryId))
                        .and(TransactionSpecification.hasAmountBetween(minAmount, maxAmount));

        return transactionRepository.findAll(spec)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

}
