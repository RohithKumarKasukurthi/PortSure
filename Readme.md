# PortSure - Portfolio Risk Analysis & Investment Compliance System

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Module Overview](#module-overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Security & Compliance](#security--compliance)
- [Performance Metrics](#performance-metrics)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**PortSure** is an enterprise-grade portfolio risk analysis and investment compliance system designed for investment firms and asset managers. It provides a comprehensive platform to manage portfolio risk by integrating asset allocation, risk scoring, and compliance monitoring into a unified solution.

### Purpose
- Evaluate portfolio exposure across multiple asset classes
- Simulate market scenarios for risk assessment
- Ensure adherence to regulatory guidelines (SEBI, MiFID II, GDPR)
- Provide real-time risk alerts and compliance monitoring
- Generate performance analytics and audit reports

### Target Users
- Investment Firms
- Asset Managers
- Portfolio Analysts
- Compliance Officers
- Institutional Investors

---

## ✨ Key Features

### 1. **Investor Management**
- Digital KYC registration
- Risk profile assessment
- Multi-portfolio support per investor

### 2. **Asset Allocation & Trading**
- Support for equities, bonds, and derivatives
- Real-time trade capture and settlement tracking
- Portfolio diversification analysis

### 3. **Risk Analysis**
- Market volatility-based risk scoring
- Exposure limit monitoring
- Automated breach alerts
- Scenario simulation capabilities

### 4. **Compliance Monitoring**
- SEBI and MiFID II compliance tracking
- Automated audit log generation
- Regulatory reporting
- Investment guideline adherence

### 5. **Performance Analytics**
- Return rate calculations
- Risk-adjusted performance metrics
- Interactive dashboards
- Exportable reports (PDF, Excel)

---

## 🏗️ System Architecture

### Architecture Pattern
**Microservices Architecture** with API Gateway and Service Discovery

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend Layer                        │
│            (React + Vite Application – Port: 5173)          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                            │
│                 (Spring Cloud Gateway)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Eureka Service Discovery                 │
│                        (Port: 8761)                         │
└─────────────────────────────────────────────────────────────┘
                              │
     ┌────────────────────────┼───────────────────────────┐
     ▼                        ▼                           ▼

     ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
     │ Investor Service │      │ Portfolio Service│      │ Risk Score Svc   │
     │  ┌────────────┐  │      │  ┌────────────┐  │      │  ┌────────────┐  │
     │  │ Instance 1 │  │      │  │ Instance 1 │  │      │  │ Instance 1 │  │
     │  ├────────────┤  │      │  ├────────────┤  │      │  ├────────────┤  │
     │  │ Instance 2 │  │      │  │ Instance 2 │  │      │  │ Instance 2 │  │
     │  ├────────────┤  │      │  ├────────────┤  │      │  ├────────────┤  │
     │  │ Instance 3 │  │      │  │ Instance 3 │  │      │  │ Instance 3 │  │
     │  └────────────┘  │      │  └────────────┘  │      │  └────────────┘  │
     └──────────────────┘      └──────────────────┘      └──────────────────┘

     ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
     │ Compliance Svc   │      │ Exposure Alerts  │      │ Admin User Svc   │
     │  ┌────────────┐  │      │  ┌────────────┐  │      │  ┌────────────┐  │
     │  │ Instance 1 │  │      │  │ Instance 1 │  │      │  │ Instance 1 │  │
     │  ├────────────┤  │      │  ├────────────┤  │      │  ├────────────┤  │
     │  │ Instance 2 │  │      │  │ Instance 2 │  │      │  │ Instance 2 │  │
     │  ├────────────┤  │      │  ├────────────┤  │      │  ├────────────┤  │
     │  │ Instance 3 │  │      │  │ Instance 3 │  │      │  │ Instance 3 │  │
     │  └────────────┘  │      │  └────────────┘  │      │  └────────────┘  │
     └──────────────────┘      └──────────────────┘      └──────────────────┘

                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Database Layer                        │
│                           (MySQL)                           │
└─────────────────────────────────────────────────────────────┘

```

### Design Principles
- **Separation of Concerns**: Each microservice handles specific business domain
- **Scalability**: Independent service scaling based on load
- **Resilience**: Service isolation prevents cascading failures
- **Maintainability**: Modular architecture for easy updates

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.5
- **UI Library**: Material-UI (MUI) 7.3.6
- **Routing**: React Router DOM 7.11.0
- **Charts**: Chart.js 4.5.1, Recharts 3.6.0
- **Icons**: Lucide React, MUI Icons
- **Export**: jsPDF, xlsx

### Backend
- **Framework**: Spring Boot 3.5.10
- **Language**: Java 17
- **Cloud**: Spring Cloud 2025.0.1
- **Service Discovery**: Netflix Eureka
- **API Gateway**: Spring Cloud Gateway
- **Inter-Service Communication**: OpenFeign
- **ORM**: Spring Data JPA
- **Build Tool**: Maven

### Database
- **Primary**: MySQL
- **Alternative**: SQL Server
- **Connection**: MySQL Connector/J

### DevOps & Tools
- **Version Control**: Git
- **Dependency Management**: Maven (Backend), npm (Frontend)
- **Development**: Spring Boot DevTools, Hot Reload

---

## 📦 Module Overview

### 1. Investor Registration & Portfolio Setup Module
**Purpose**: Manage investor profiles and portfolio configurations

**Entities**:
- Investor (InvestorID, Name, ContactInfo, RiskProfile, PortfolioID)

**Features**:
- Investor registration with digital KYC
- Risk profile assessment
- Portfolio creation and configuration
- Multi-portfolio support

---

### 2. Asset Allocation & Trade Capture Module
**Purpose**: Handle asset allocation and trade execution

**Entities**:
- Trade (TradeID, PortfolioID, AssetType, Quantity, Price, Status)

**Features**:
- Multi-asset class support (Equities, Bonds, Derivatives)
- Real-time trade capture
- Settlement status tracking
- Portfolio diversification metrics

---

### 3. Risk Scoring & Exposure Analysis Module
**Purpose**: Calculate and monitor portfolio risk

**Entities**:
- RiskScore (RiskID, PortfolioID, ScoreValue, EvaluationDate)

**Features**:
- Volatility-based risk scoring
- Exposure limit monitoring
- Automated breach alerts
- Historical risk tracking

---

### 4. Compliance Monitoring & Audit Module
**Purpose**: Ensure regulatory compliance

**Entities**:
- ComplianceLog (LogID, PortfolioID, RegulationType, Findings, Date)

**Features**:
- SEBI/MiFID II compliance tracking
- Automated audit logging
- Regulatory report generation
- Investment guideline validation

---

### 5. Portfolio Performance & Reporting Module
**Purpose**: Generate performance analytics and reports

**Entities**:
- PortfolioReport (ReportID, Metrics, GeneratedDate)

**Features**:
- Return rate calculations
- Risk-adjusted performance metrics
- Interactive dashboards
- Export capabilities (PDF, Excel)

---

## 📁 Project Structure

```
PortSure/
│
├── Final Project/                    # Frontend Application
│   ├── src/
│   │   ├── component/               # React components
│   │   ├── Navbar/                  # Navigation components
│   │   ├── CSSDesgin1-5/            # Styling modules
│   │   ├── logo/                    # Brand assets
│   │   ├── App.jsx                  # Main application
│   │   └── main.jsx                 # Entry point
│   ├── public/                      # Static assets
│   ├── package.json                 # Dependencies
│   └── vite.config.js               # Build configuration
│
├── MicroserviceProject/             # Backend Microservices
│   ├── EurekaServer/                # Service Discovery (Port: 8761)
│   ├── APIGateway/                  # API Gateway
│   ├── InvestorService/             # Investor management
│   ├── PortfolioService/            # Portfolio operations
│   ├── RiskScoreService/            # Risk calculations
│   ├── ExposureAlertService/        # Alert management
│   ├── ComplianceReportService/     # Compliance tracking
│   └── AdminUserService/            # Admin operations
│
└── README.md                        # This file
```

---

## 📋 Prerequisites

### Software Requirements
- **Java**: JDK 17 or higher
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Maven**: 3.8.x or higher
- **MySQL**: 8.0 or higher
- **Git**: Latest version

### System Requirements
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: 10GB free space
- **OS**: Windows 10/11, macOS, or Linux

---

## 🚀 Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd PortSure
```

### 2. Database Setup
```sql
-- Create database
CREATE DATABASE portsure_db;

-- Create user (optional)
CREATE USER 'portsure_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON portsure_db.* TO 'portsure_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Backend Setup

#### Start Eureka Server (Service Discovery)
```bash
cd MicroserviceProject/EurekaServer
mvn clean install
mvn spring-boot:run
```
Access at: http://localhost:8761

#### Start API Gateway
```bash
cd MicroserviceProject/APIGateway
mvn clean install
mvn spring-boot:run
```

#### Start Microservices
Run each service in separate terminals:

```bash
# Investor Service
cd MicroserviceProject/InvestorService
mvn spring-boot:run

# Portfolio Service
cd MicroserviceProject/PortfolioService
mvn spring-boot:run

# Risk Score Service
cd MicroserviceProject/RiskScoreService
mvn spring-boot:run

# Exposure Alert Service
cd MicroserviceProject/ExposureAlertService
mvn spring-boot:run

# Compliance Report Service
cd MicroserviceProject/ComplianceReportService
mvn spring-boot:run

# Admin User Service
cd MicroserviceProject/AdminUserService
mvn spring-boot:run
```

### 4. Frontend Setup
```bash
cd "Final Project"
npm install
npm run dev
```
Access at: http://localhost:5173

---

## ⚙️ Configuration

### Backend Configuration
Each microservice has `application.properties` in `src/main/resources/`:

```properties
# Example configuration
spring.application.name=investor-service
server.port=8081

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/portsure_db
spring.datasource.username=portsure_user
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update

# Eureka Client
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
eureka.instance.prefer-ip-address=true
```

### Frontend Configuration
Update API endpoints in frontend configuration files as needed.

---

## 📡 API Documentation

### Base URL
```
http://localhost:<gateway-port>/api
```

### Key Endpoints

#### Investor Service
- `POST /investors` - Register new investor
- `GET /investors/{id}` - Get investor details
- `PUT /investors/{id}` - Update investor profile
- `GET /investors/{id}/portfolios` - Get investor portfolios

#### Portfolio Service
- `POST /portfolios` - Create portfolio
- `GET /portfolios/{id}` - Get portfolio details
- `PUT /portfolios/{id}` - Update portfolio
- `GET /portfolios/{id}/trades` - Get portfolio trades

#### Risk Score Service
- `POST /risk-scores/calculate` - Calculate risk score
- `GET /risk-scores/portfolio/{id}` - Get portfolio risk scores
- `GET /risk-scores/alerts` - Get risk alerts

#### Compliance Service
- `POST /compliance/audit` - Create audit log
- `GET /compliance/reports` - Get compliance reports
- `GET /compliance/portfolio/{id}` - Get portfolio compliance status

---

## 🗄️ Database Schema

### Core Tables

#### Investor
```sql
CREATE TABLE investor (
    investor_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    contact_info VARCHAR(500),
    risk_profile VARCHAR(50),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Portfolio
```sql
CREATE TABLE portfolio (
    portfolio_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    investor_id BIGINT,
    portfolio_name VARCHAR(255),
    total_value DECIMAL(15,2),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (investor_id) REFERENCES investor(investor_id)
);
```

#### Trade
```sql
CREATE TABLE trade (
    trade_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    portfolio_id BIGINT,
    asset_type VARCHAR(50),
    quantity INT,
    price DECIMAL(15,2),
    status VARCHAR(20),
    trade_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolio(portfolio_id)
);
```

#### RiskScore
```sql
CREATE TABLE risk_score (
    risk_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    portfolio_id BIGINT,
    score_value DECIMAL(5,2),
    evaluation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolio(portfolio_id)
);
```

#### ComplianceLog
```sql
CREATE TABLE compliance_log (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    portfolio_id BIGINT,
    regulation_type VARCHAR(50),
    findings TEXT,
    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolio(portfolio_id)
);
```

---

## 🚢 Deployment

### Local Development
- Use provided setup instructions above
- All services run on localhost with different ports

### Production Deployment

#### Cloud Platforms
- **AWS**: ECS/EKS for containers, RDS for database
- **Azure**: App Service, Azure SQL Database
- **GCP**: Cloud Run, Cloud SQL

#### Docker Deployment
```bash
# Build Docker images for each service
docker build -t portsure-eureka ./MicroserviceProject/EurekaServer
docker build -t portsure-gateway ./MicroserviceProject/APIGateway
# ... repeat for other services

# Run with Docker Compose
docker-compose up -d
```

#### Environment Variables
```bash
DB_HOST=<database-host>
DB_PORT=3306
DB_NAME=portsure_db
DB_USER=<username>
DB_PASSWORD=<password>
EUREKA_URL=http://eureka-server:8761/eureka
```

---

## 🔒 Security & Compliance

### Security Features
- **Data Encryption**: All sensitive data encrypted at rest and in transit
- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control (RBAC)
- **API Security**: Rate limiting, CORS configuration
- **Audit Logging**: Complete audit trail for all operations

### Compliance Standards
- **SEBI**: Securities and Exchange Board of India regulations
- **MiFID II**: Markets in Financial Instruments Directive
- **GDPR**: General Data Protection Regulation
- **Data Privacy**: PII protection and data anonymization

### Best Practices
- Regular security audits
- Dependency vulnerability scanning
- Secure credential management
- Regular backup and disaster recovery

---

## 📊 Performance Metrics

### Capacity
- **Trade Processing**: 1,000,000 records per day
- **Concurrent Users**: 10,000+ simultaneous users
- **Response Time**: < 200ms for 95% of requests
- **Uptime**: 99.9% availability SLA

### Scalability
- Horizontal scaling of microservices
- Database read replicas for query optimization
- Caching layer for frequently accessed data
- Load balancing across service instances

---

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Standards
- Follow Java coding conventions
- Use ESLint for JavaScript/React code
- Write unit tests for new features
- Update documentation for API changes

### Testing
```bash
# Backend tests
mvn test

# Frontend tests
npm test
```

---

## 📞 Support & Contact

### Documentation
- API Documentation: `/api/docs`
- User Guide: `/docs/user-guide.pdf`
- Admin Manual: `/docs/admin-manual.pdf`

### Issues
Report bugs and feature requests via GitHub Issues

---

## 📄 License

This project is proprietary software developed for investment firms and asset managers.


## 🙏 Acknowledgments

- Spring Boot and Spring Cloud communities
- React and Vite development teams
- Open-source contributors

---

**Version**: 1.0.0  
**Last Updated**: 2025  
**Maintained By**: PortSure Development Team

---

For more information, visit our documentation or contact the development team.
