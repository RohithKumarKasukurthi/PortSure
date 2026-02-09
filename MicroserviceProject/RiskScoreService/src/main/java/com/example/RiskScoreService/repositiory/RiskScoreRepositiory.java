package com.example.RiskScoreService.repositiory;

import com.example.RiskScoreService.entity.RiskScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RiskScoreRepositiory extends JpaRepository<RiskScore, Long> {
    Optional<RiskScore> findByPortfolioId(Long portfolioId);
}