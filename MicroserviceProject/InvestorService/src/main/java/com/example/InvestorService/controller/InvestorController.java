package com.example.InvestorService.controller;

import com.example.InvestorService.entity.Investor;
import com.example.InvestorService.service.InvestorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@CrossOrigin(
        origins = "http://localhost:5173",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.OPTIONS},
        allowCredentials = "true"
)
@RestController
@RequestMapping("/api/investors")
public class InvestorController {

    @Autowired
    private InvestorService service;

    @GetMapping("/getAllInvestors")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Investor investor) {
        try {
            return ResponseEntity.ok(service.register(investor));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Investor loginData) {
        Optional<Investor> userOpt = service.login(loginData.getEmail(), loginData.getPassword());

        if (userOpt.isPresent()) {
            Investor user = userOpt.get();
            user.setPassword(null); // Security
            return ResponseEntity.ok(user);
        } else {
            // This is where your error was happening; now it's a direct return
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Investor data) {
        try {
            Investor updated = service.updateProfile(id, data);
            updated.setPassword(null);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PutMapping("/update-password/{id}")
    public ResponseEntity<?> updatePassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        boolean success = service.changePassword(id, body.get("password"), body.get("fullName"));
        if (success) return ResponseEntity.ok("Password changed");
        return ResponseEntity.status(401).body("Verification failed");
    }
}