package com.example.AdminUserService.controller;

import com.example.AdminUserService.entity.AdminUser;
import com.example.AdminUserService.repositiory.AdminUserRepositiory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${admin.registration.secret}")
    private String registrationSecret;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> regRequest) {
        String secretKey = regRequest.get("secretKey");
        String email = regRequest.get("email");
        String password = regRequest.get("password");
        String fullName = regRequest.get("fullName");
        String role = regRequest.get("role");

        if (registrationSecret == null || !registrationSecret.equals(secretKey)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid secret key.");
        }

        if (role == null || (!role.equals("COMPLIANCE_OFFICER") && !role.equals("ASSET_MANAGER"))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid role. Only COMPLIANCE_OFFICER and ASSET_MANAGER are allowed.");
        }

        if (adminUserRepositiory.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already exists.");
        }

        AdminUser newUser = new AdminUser();
        newUser.setEmail(email);
        newUser.setPassword(password);
        newUser.setFullName(fullName);
        newUser.setRole(role);

        adminUserRepositiory.save(newUser);
        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully.");
    }

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