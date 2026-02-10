import React from 'react';
import '../../CSSDesgin2/TradeCature.css';

const TradeCature = ({ alerts, onClose }) => {
  return (
    <section className="inner-view-section">
      <div className="module-card1">
        <div className="module-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>🔔</span>
            <h3>Compliance Notifications</h3>
          </div>
          <button className="close-view-btn" onClick={onClose}>Close</button>
        </div>

        <div className="alerts-list">
          {alerts.length > 0 ? (
            alerts.map((alert, index) => {
              const isBreach = alert.alertType === "Compliance Breach";
              const status = alert.status || "UNKNOWN";
              const isCritical = status === 'CRITICAL_BREACH' || status === 'BREACH';

              return (
                <div key={alert.id || alert.alertId || index}
                  className={`alert-card ${isCritical ? 'critical' : 'warning'}`}>

                  <div className="alert-header">
                    <strong className="alert-title">
                      {isBreach ? alert.alertType : `${alert.assetType} Exposure Alert`}
                    </strong>
                    <small className="alert-date">
                      {new Date(alert.date || alert.timestamp).toLocaleString()}
                    </small>
                  </div>

                  <div className="alert-body">
                    Portfolio: <strong>{alert.portfolioName || alert.portfolio?.portfolioName}</strong>
                    (PF-{alert.portfolioId || alert.portfolio?.portfolioId})
                  </div>

                  {isBreach ? (
                    <div className="alert-findings">
                      <strong>Findings:</strong> {alert.message || alert.findings}
                    </div>
                  ) : (
                    <div className="alert-details">
                      <span>Actual: <b className="val-danger">{alert.exposureValue}%</b></span>
                      <span>Limit: <b>{alert.limitValue}%</b></span>
                    </div>
                  )}

                  <div className="alert-status">
                    <span className={`status-text ${isCritical ? 'critical' : 'warning'}`}>
                      {status}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-alerts">
              No compliance alerts found.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TradeCature;