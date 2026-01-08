package com.omkar.expensetracker.dto.response;

import com.omkar.expensetracker.enums.CategoryType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private CategoryType type;
}
