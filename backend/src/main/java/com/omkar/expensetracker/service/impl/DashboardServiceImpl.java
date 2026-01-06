package com.omkar.expensetracker.service.impl;

import com.omkar.expensetracker.dto.response.DashboardSummaryResponse;
import com.omkar.expensetracker.repository.TransactionRepository;
import com.omkar.expensetracker.service.DashboardService;
import com.omkar.expensetracker.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

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

}

