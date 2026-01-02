package com.omkar.expensetracker.controller;

import com.omkar.expensetracker.dto.request.CategoryRequest;
import com.omkar.expensetracker.dto.response.CategoryResponse;
import com.omkar.expensetracker.enums.CategoryType;
import com.omkar.expensetracker.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController() {
        categoryService = null;
    }

    // CREATE CATEGORY
    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @RequestBody CategoryRequest request
    ) {
        CategoryResponse response = categoryService.createCategory(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // GET CATEGORIES BY TYPE (INCOME | EXPENSE)
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategoriesByType(
            @RequestParam CategoryType type
    ) {
        List<CategoryResponse> categories = categoryService.getCategoriesByType(type);
        return ResponseEntity.ok(categories);
    }

    // DELETE CATEGORY
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long id
    ) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
