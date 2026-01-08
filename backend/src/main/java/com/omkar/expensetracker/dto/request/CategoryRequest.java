package com.omkar.expensetracker.dto.request;

public class CategoryRequest {

    private String name;
    private String type; // INCOME | EXPENSE

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setType(String type) {
        this.type = type;
    }
}
