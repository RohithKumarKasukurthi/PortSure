package com.example.PortfolioService.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "portfolio")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long portfolioId;

    private String portfolioName;
    private Double investedAmount;
    private LocalDate requestDate;

    private Double equityPercentage;
    private Double bondPercentage;
    private Double derivativePercentage;

    private String regulationType;
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(nullable = false)
    private Long investorId;

    public enum Status {
        Pending, Approved, Rejected, Allocated
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Long getPortfolioId() {
        return portfolioId;
    }

    public void setPortfolioId(Long portfolioId) {
        this.portfolioId = portfolioId;
    }

    public String getPortfolioName() {
        return portfolioName;
    }

    public void setPortfolioName(String portfolioName) {
        this.portfolioName = portfolioName;
    }

    public Double getInvestedAmount() {
        return investedAmount;
    }

    public void setInvestedAmount(Double investedAmount) {
        this.investedAmount = investedAmount;
    }

    public LocalDate getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDate requestDate) {
        this.requestDate = requestDate;
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

    public String getRegulationType() {
        return regulationType;
    }

    public void setRegulationType(String regulationType) {
        this.regulationType = regulationType;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Long getInvestorId() {
        return investorId;
    }

    public void setInvestorId(Long investorId) {
        this.investorId = investorId;
    }
}