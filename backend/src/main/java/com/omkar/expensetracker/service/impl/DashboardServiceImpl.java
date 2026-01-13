package com.omkar.expensetracker.service.impl;

import com.omkar.expensetracker.dto.response.CategoryBreakdownResponse;
import com.omkar.expensetracker.dto.response.DashboardSummaryResponse;
import com.omkar.expensetracker.dto.response.MonthlyTrendResponse;
import com.omkar.expensetracker.dto.response.RecentTransactionResponse;
import com.omkar.expensetracker.enums.TransactionType;
import com.omkar.expensetracker.repository.TransactionRepository;
import com.omkar.expensetracker.service.DashboardService;
import com.omkar.expensetracker.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final TransactionRepository transactionRepository;
    private final AuthUtil authUtil; // your existing JWT user extractor

    @Override
    public DashboardSummaryResponse getMonthlySummary() {

        Long userId = authUtil.getLoggedInUser().getId();

        LocalDate startDate = LocalDate.now().withDayOfMonth(1);
        LocalDate endDate = LocalDate.now().withDayOfMonth(
                LocalDate.now().lengthOfMonth()
        );

        Object result =
                transactionRepository.getMonthlyIncomeAndExpense(
                        userId, startDate, endDate
                );

        Object[] row = (Object[]) result;

        BigDecimal income = (BigDecimal) row[0];
        BigDecimal expense = (BigDecimal) row[1];

        return new DashboardSummaryResponse(
                income,
                expense,
                income.subtract(expense)
        );
    }

    @Override
    public List<CategoryBreakdownResponse> getCategoryBreakdown(
            TransactionType type
    ) {

        Long userId = authUtil.getLoggedInUser().getId();

        LocalDate startDate = LocalDate.now().withDayOfMonth(1);
        LocalDate endDate = LocalDate.now().withDayOfMonth(
                LocalDate.now().lengthOfMonth()
        );

        List<Object[]> results =
                transactionRepository.getCategoryWiseBreakdown(
                        userId, type, startDate, endDate
                );

        return results.stream()
                .map(row -> new CategoryBreakdownResponse(
                        (Long) row[0],
                        (String) row[1],
                        (BigDecimal) row[2]
                ))
                .toList();
    }

    @Override
    public List<RecentTransactionResponse> getRecentTransactions(int limit) {

        Long userId = authUtil.getLoggedInUser().getId();

        Pageable pageable = PageRequest.of(0, limit);

        return transactionRepository
                .findRecentTransactions(userId, pageable)
                .stream()
                .map(t -> new RecentTransactionResponse(
                        t.getId(),
                        t.getAmount(),
                        t.getType(),
                        t.getCategory().getName(),
                        t.getTransactionDate(),
                        t.getDescription()
                ))
                .toList();
    }

    @Override
    public List<MonthlyTrendResponse> getMonthlyTrend(int months) {

        Long userId = authUtil.getLoggedInUser().getId();

        LocalDate startDate = LocalDate.now()
                .minusMonths(months - 1)
                .withDayOfMonth(1);

        List<Object[]> results =
                transactionRepository.getMonthlyTrend(userId, startDate);

        return results.stream()
                .map(row -> new MonthlyTrendResponse(
                        (String) row[0],
                        (BigDecimal) row[1],
                        (BigDecimal) row[2]
                ))
                .toList();
    }


}

