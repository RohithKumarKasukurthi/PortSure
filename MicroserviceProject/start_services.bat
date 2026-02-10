@echo off
setlocal
set ROOT_DIR=c:\PortSure\MicroserviceProject

start "EurekaServer" /D "%ROOT_DIR%\EurekaServer" cmd /c "mvnw.cmd spring-boot:run"
start "InvestorService" /D "%ROOT_DIR%\InvestorService" cmd /c "mvnw.cmd spring-boot:run"
start "PortfolioService" /D "%ROOT_DIR%\PortfolioService" cmd /c "mvnw.cmd spring-boot:run"
start "RiskScoreService" /D "%ROOT_DIR%\RiskScoreService" cmd /c "mvnw.cmd spring-boot:run"
start "ExposureAlertService" /D "%ROOT_DIR%\ExposureAlertService" cmd /c "mvnw.cmd spring-boot:run"
start "ComplianceReportService" /D "%ROOT_DIR%\ComplianceReportService" cmd /c "mvnw.cmd spring-boot:run"
start "AdminUserService" /D "%ROOT_DIR%\AdminUserService" cmd /c "mvnw.cmd spring-boot:run"
start "APIGateway" /D "%ROOT_DIR%\APIGateway" cmd /c "mvnw.cmd spring-boot:run"
