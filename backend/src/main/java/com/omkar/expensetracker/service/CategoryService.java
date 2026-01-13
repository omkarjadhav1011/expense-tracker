package com.omkar.expensetracker.service;

import com.omkar.expensetracker.dto.request.CategoryRequest;
import com.omkar.expensetracker.dto.response.CategoryResponse;
import com.omkar.expensetracker.entity.User;
import com.omkar.expensetracker.enums.CategoryType;

import java.util.List;

public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest request);

    List<CategoryResponse> getCategoriesByType(CategoryType type);

    void deleteCategory(Long categoryId);

    void createDefaultCategoriesForUser(User user);
}
