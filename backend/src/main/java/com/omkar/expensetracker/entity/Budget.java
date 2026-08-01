package com.omkar.expensetracker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * A spending cap for one "YYYY-MM" month.
 *
 * {@code category} is a category *name*, not an FK — null means the overall
 * monthly cap, non-null a per-category cap. {@code userId} is a raw Long rather
 * than a @ManyToOne User, unlike every other entity here.
 *
 * The unique constraint does not cover overall caps: PostgreSQL treats NULLs as
 * distinct, so two rows with a null category never collide. BudgetServiceImpl
 * upserts instead, which is the real guard against duplicates.
 */
@Entity
@Table(name = "budgets", uniqueConstraints = @UniqueConstraint(
        name = "uk_budget_user_month_category",
        columnNames = {"user_id", "month", "category"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 7)
    private String month;  // Format: 2026-01

    private String category; // null = monthly budget

    @Column(nullable = false)
    private Double amount;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
