package com.omkar.expensetracker.dto.response;

public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String currency;

    public UserResponse(Long id, String name, String email, String currency) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.currency = currency;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getCurrency() { return currency; }
}
