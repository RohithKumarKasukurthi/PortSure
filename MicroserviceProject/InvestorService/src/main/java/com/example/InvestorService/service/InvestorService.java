package com.example.InvestorService.service;

import com.example.InvestorService.entity.Investor;
import com.example.InvestorService.repositiory.InvestorRepositiory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InvestorService {

    @Autowired
    private InvestorRepositiory repository;

    public List<Investor> findAll() {
        List<Investor> list = repository.findAll();
        list.forEach(i -> i.setPassword(null));
        return list;
    }

    public Optional<Investor> findById(Long id) {
        return repository.findById(id).map(i -> {
            i.setPassword(null);
            return i;
        });
    }

    public Investor register(Investor investor) throws Exception {
        if (repository.findByEmail(investor.getEmail()).isPresent()) {
            throw new Exception("Email already in use!");
        }
        return repository.save(investor);
    }

    public Optional<Investor> login(String email, String password) {
        return repository.findByEmail(email)
                .filter(user -> user.getPassword().equals(password));
    }

    public Investor updateProfile(Long id, Investor data) throws Exception {
        Investor existing = repository.findById(id)
                .orElseThrow(() -> new Exception("Investor not found"));

        if (data.getFullName() != null) existing.setFullName(data.getFullName());
        if (data.getPhoneNumber() != null) existing.setPhoneNumber(data.getPhoneNumber());

        if (data.getEmail() != null && !data.getEmail().equalsIgnoreCase(existing.getEmail())) {
            if (repository.findByEmail(data.getEmail()).isPresent()) {
                throw new Exception("Email already taken");
            }
            existing.setEmail(data.getEmail());
        }

        if (data.getPassword() != null && !data.getPassword().isEmpty()) {
            existing.setPassword(data.getPassword());
        }

        return repository.save(existing);
    }

    public boolean changePassword(Long id, String oldPass, String newPass) {
        return repository.findById(id).map(user -> {
            if (user.getPassword().equals(oldPass)) {
                user.setPassword(newPass);
                repository.save(user);
                return true;
            }
            return false;
        }).orElse(false);
    }
}