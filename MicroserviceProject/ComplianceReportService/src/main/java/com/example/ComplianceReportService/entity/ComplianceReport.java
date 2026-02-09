package com.example.ComplianceReportService.entity;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "compliance_logs")
public class ComplianceReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    @Column(nullable = false)
    private Long portfolioId;

    @Column(nullable = false)
    private String regulationType;

    @Column(columnDefinition = "TEXT")
    private String findings;

    @Column(nullable = false)
    private LocalDate date;

    private String status;

    public ComplianceReport() {}

    public Long getLogId() { return logId; }
    public void setLogId(Long logId) { this.logId = logId; }

    public Long getPortfolioId() { return portfolioId; }
    public void setPortfolioId(Long portfolioId) { this.portfolioId = portfolioId; }

    public String getRegulationType() { return regulationType; }
    public void setRegulationType(String regulationType) { this.regulationType = regulationType; }

    public String getFindings() { return findings; }
    public void setFindings(String findings) { this.findings = findings; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}