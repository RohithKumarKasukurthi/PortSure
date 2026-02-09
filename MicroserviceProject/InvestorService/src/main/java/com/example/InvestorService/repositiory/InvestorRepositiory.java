package com.example.InvestorService.repositiory;

import com.example.InvestorService.entity.Investor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvestorRepositiory extends JpaRepository<Investor, Long> {

    // Custom query to find investor by email for login logic
    Optional<Investor> findByEmail(String email);

    // Check if email already exists during registration
    boolean existsByEmail(String email);

}