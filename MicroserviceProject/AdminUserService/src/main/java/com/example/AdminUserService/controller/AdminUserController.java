package com.example.AdminUserService.controller;

import com.example.AdminUserService.entity.AdminUser;
import com.example.AdminUserService.repositiory.AdminUserRepositiory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/internal")
@CrossOrigin(origins = "*")
public class AdminUserController {

    @Autowired
    private AdminUserRepositiory adminUserRepositiory;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        Optional<AdminUser> userOpt = adminUserRepositiory.findByEmail(email);

        if (userOpt.isPresent()) {
            AdminUser user = userOpt.get();

            if (!user.getPassword().equals(password)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid email or password.");
            }

            user.setPassword(null);
            return ResponseEntity.ok(user);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Account not found.");
    }


    @GetMapping("/profile/{staffId}")
    public ResponseEntity<?> getProfile(@PathVariable Long staffId) {
        return adminUserRepositiory.findByStaffId(staffId)
                .map(user -> {
                    user.setPassword(null);
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}