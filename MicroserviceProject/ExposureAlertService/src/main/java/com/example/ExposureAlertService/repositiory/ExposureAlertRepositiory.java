package com.example.ExposureAlertService.repositiory;

import com.example.ExposureAlertService.entity.ExposureAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExposureAlertRepositiory extends JpaRepository<ExposureAlert, Long> {

    List<ExposureAlert> findByPortfolioIdOrderByTimestampDesc(Long portfolioId);

    List<ExposureAlert> findByInvestorIdOrderByTimestampDesc(Long investorId);
}