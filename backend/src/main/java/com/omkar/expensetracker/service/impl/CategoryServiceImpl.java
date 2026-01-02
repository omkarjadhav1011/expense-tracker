package com.omkar.expensetracker.service.impl;

import com.omkar.expensetracker.dto.request.CategoryRequest;
import com.omkar.expensetracker.dto.response.CategoryResponse;
import com.omkar.expensetracker.entity.Category;
import com.omkar.expensetracker.entity.User;
import com.omkar.expensetracker.enums.CategoryType;
import com.omkar.expensetracker.repository.CategoryRepository;
import com.omkar.expensetracker.service.CategoryService;
import com.omkar.expensetracker.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Map;
import com.omkar.expensetracker.util.DefaultCategoryProvider;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final AuthUtil authUtil;

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {

        User user = authUtil.getLoggedInUser();

        //Convert String → Enum (MANDATORY)
        CategoryType categoryType;
        try {
            categoryType = CategoryType.valueOf(request.getType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid category type: " + request.getType());
        }

        //Check duplicate category per user + type
        boolean exists = categoryRepository
                .existsByUserAndNameAndType(user, request.getName(), categoryType);

        if (exists) {
            throw new RuntimeException("Category already exists");
        }

        Category category = Category.builder()
                .name(request.getName())
                .type(categoryType)
                .user(user)
                .isDefault(false)
                .build();

        Category savedCategory = categoryRepository.save(category);

        return mapToResponse(savedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesByType(CategoryType type) {

        User user = authUtil.getLoggedInUser();

        return categoryRepository.findByUserAndType(user, type)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCategory(Long categoryId) {

        User user = authUtil.getLoggedInUser();

        Category category = categoryRepository.findByIdAndUser(categoryId, user)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (category.isDefault()) {
            throw new RuntimeException("Default categories cannot be deleted");
        }

        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .build();
    }

    public void createDefaultCategoriesForUser(User user) {

        Map<CategoryType, List<String>> defaults =
                DefaultCategoryProvider.getDefaultCategories();

        defaults.forEach((type, names) -> {
            names.forEach(name -> {

                boolean exists = categoryRepository
                        .existsByUserAndNameAndType(user, name, type);

                if (!exists) {
                    Category category = Category.builder()
                            .name(name)
                            .type(type)
                            .user(user)
                            .isDefault(true)
                            .build();

                    categoryRepository.save(category);
                }
            });
        });
    }

}
