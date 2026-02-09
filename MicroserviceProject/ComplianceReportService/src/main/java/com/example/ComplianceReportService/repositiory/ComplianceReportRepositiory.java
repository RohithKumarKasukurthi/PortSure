package com.example.ComplianceReportService.repositiory;

import com.example.ComplianceReportService.entity.ComplianceReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplianceReportRepositiory extends JpaRepository<ComplianceReport, Long> {
    List<ComplianceReport> findByPortfolioId(Long portfolioId);
}