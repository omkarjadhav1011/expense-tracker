package com.omkar.expensetracker.controller;

import com.omkar.expensetracker.dto.request.UpdateUserRequest;
import com.omkar.expensetracker.dto.response.UserResponse;
import com.omkar.expensetracker.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET LOGGED-IN USER PROFILE
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    // UPDATE NAME & CURRENCY
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(
            @RequestBody UpdateUserRequest request
    ) {
        return ResponseEntity.ok(userService.updateCurrentUser(request));
    }

}
