package com.omkar.expensetracker.repository;

import com.omkar.expensetracker.entity.Category;
import com.omkar.expensetracker.entity.User;
import com.omkar.expensetracker.enums.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByUserAndType(User user, CategoryType type);

    boolean existsByUserAndNameAndType(User user, String name, CategoryType type);

    Optional<Category> findByIdAndUser(Long id, User user);
}
