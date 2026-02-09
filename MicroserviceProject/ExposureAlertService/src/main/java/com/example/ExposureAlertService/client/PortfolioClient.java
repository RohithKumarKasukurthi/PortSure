package com.example.ExposureAlertService.client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "portfolio-service")
public interface PortfolioClient {

    @GetMapping("/api/portfolios/{id}")
    PortfolioDto getPortfolioById(@PathVariable("id") Long id);

    class PortfolioDto {
        private Long portfolioId;
        private Long investorId;
        private Double investedAmount;
        private Double equityPercentage;
        private Double bondPercentage;
        private Double derivativePercentage;
        private Integer quantity;
        private Double price;
        private String status;

        public Long getPortfolioId() { return portfolioId; }
        public void setPortfolioId(Long portfolioId) { this.portfolioId = portfolioId; }

        public Long getInvestorId() { return investorId; }
        public void setInvestorId(Long investorId) { this.investorId = investorId; }

        public Double getInvestedAmount() { return investedAmount; }
        public void setInvestedAmount(Double investedAmount) { this.investedAmount = investedAmount; }

        public Double getEquityPercentage() { return equityPercentage; }
        public void setEquityPercentage(Double equityPercentage) { this.equityPercentage = equityPercentage; }

        public Double getBondPercentage() { return bondPercentage; }
        public void setBondPercentage(Double bondPercentage) { this.bondPercentage = bondPercentage; }

        public Double getDerivativePercentage() { return derivativePercentage; }
        public void setDerivativePercentage(Double derivativePercentage) { this.derivativePercentage = derivativePercentage; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}