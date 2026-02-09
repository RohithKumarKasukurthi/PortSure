import React from 'react';

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

        <div className="alerts-list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {alerts.length > 0 ? (
            alerts.map((alert, index) => {
             
              const isBreach = alert.alertType === "Compliance Breach";
              const status = alert.status || "UNKNOWN";
              const isCritical = status === 'CRITICAL_BREACH' || status === 'BREACH';

              return (
                <div key={alert.id || alert.alertId || index} 
                     className={`alert-card ${status.toLowerCase()}`}
                     style={{
                       borderLeft: isCritical ? '5px solid #dc2626' : '5px solid #f59e0b',
                       backgroundColor: isCritical ? '#fef2f2' : '#fffbeb',
                       padding: '15px',
                       marginBottom: '10px',
                       borderRadius: '4px',
                       boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                     }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: '#1e293b' }}>
                      {isBreach ? alert.alertType : `${alert.assetType} Exposure Alert`}
                    </strong>
                    <small style={{ color: '#64748b' }}>
                      
                      {new Date(alert.date || alert.timestamp).toLocaleString()}
                    </small>
                  </div>
                  
                  <p style={{ margin: '8px 0', fontSize: '0.9rem' }}>
                    Portfolio: <strong>{alert.portfolioName || alert.portfolio?.portfolioName}</strong> 
                    (PF-{alert.portfolioId || alert.portfolio?.portfolioId})
                  </p>

                 
                  {isBreach ? (
                    <p style={{ margin: '5px 0', fontSize: '0.85rem', color: '#475569', fontStyle: 'italic' }}>
                      <strong>Findings:</strong> {alert.message || alert.findings}
                    </p>
                  ) : (
                    <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem' }}>
                      <span>Actual: <b style={{ color: '#b91c1c' }}>{alert.exposureValue}%</b></span>
                      <span>Limit: <b>{alert.limitValue}%</b></span>
                    </div>
                  )}

                  <div style={{ textAlign: 'right', marginTop: '5px' }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      fontSize: '0.8rem',
                      color: isCritical ? '#dc2626' : '#d97706' 
                    }}>
                      {status}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              No compliance alerts found.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TradeCature;