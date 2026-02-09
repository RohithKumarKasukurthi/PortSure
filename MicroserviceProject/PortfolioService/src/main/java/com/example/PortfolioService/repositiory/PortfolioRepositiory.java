package com.example.PortfolioService.repositiory;

import com.example.PortfolioService.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortfolioRepositiory extends JpaRepository<Portfolio, Long> {

    // Old (monolith / JPA relation): findByInvestorInvestorId(Long investorId);
    // New (microservices / FK field):
    List<Portfolio> findByInvestorId(Long investorId);

    List<Portfolio> findByPortfolioNameContainingIgnoreCase(String name);
}