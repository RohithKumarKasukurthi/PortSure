package com.example.RiskScoreService.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "risk_score")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RiskScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long riskId;

    private Double equityPercentage;
    private Double bondPercentage;
    private Double derivativePercentage;

    private Integer calculatedScore;
    private String riskLevel;
    private LocalDate calculationDate;

    // Instead of @OneToOne Portfolio portfolio
    @Column(nullable = false)
    private Long portfolioId;

    public Long getRiskId() {
        return riskId;
    }

    public void setRiskId(Long riskId) {
        this.riskId = riskId;
    }

    public Double getEquityPercentage() {
        return equityPercentage;
    }

    public void setEquityPercentage(Double equityPercentage) {
        this.equityPercentage = equityPercentage;
    }

    public Double getBondPercentage() {
        return bondPercentage;
    }

    public void setBondPercentage(Double bondPercentage) {
        this.bondPercentage = bondPercentage;
    }

    public Double getDerivativePercentage() {
        return derivativePercentage;
    }

    public void setDerivativePercentage(Double derivativePercentage) {
        this.derivativePercentage = derivativePercentage;
    }

    public Integer getCalculatedScore() {
        return calculatedScore;
    }

    public void setCalculatedScore(Integer calculatedScore) {
        this.calculatedScore = calculatedScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public LocalDate getCalculationDate() {
        return calculationDate;
    }

    public void setCalculationDate(LocalDate calculationDate) {
        this.calculationDate = calculationDate;
    }

    public Long getPortfolioId() {
        return portfolioId;
    }

    public void setPortfolioId(Long portfolioId) {
        this.portfolioId = portfolioId;
    }
}