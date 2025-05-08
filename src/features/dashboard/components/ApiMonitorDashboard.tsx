import React, { useState, useEffect } from 'react';
import {
  getApiUsageStats,
  resetApiUsageStats,
  generateRecommendation,
  buildRecommendationRequest
} from '../../../lib/recommendationService';

// CSS styles for native HTML implementation
const styles = {
  container: {
    padding: '1rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: 0,
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '0.25rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'medium',
  },
  primaryButton: {
    backgroundColor: '#3182ce',
    color: 'white',
  },
  dangerButton: {
    backgroundColor: 'white',
    border: '1px solid #e53e3e',
    color: '#e53e3e',
  },
  successButton: {
    backgroundColor: '#38a169',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#2d3748',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  card: {
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    margin: 0,
  },
  cardBody: {
    padding: '1rem',
  },
  stat: {
    textAlign: 'center' as const,
  },
  statNumber: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    lineHeight: 1.2,
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#718096',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 'medium',
    textTransform: 'capitalize' as const,
  },
  badgeGreen: {
    backgroundColor: '#c6f6d5',
    color: '#22543d',
  },
  badgeYellow: {
    backgroundColor: '#fefcbf',
    color: '#744210',
  },
  badgeRed: {
    backgroundColor: '#fed7d7',
    color: '#822727',
  },
  badgeBlue: {
    backgroundColor: '#bee3f8',
    color: '#2c5282',
  },
  badgePurple: {
    backgroundColor: '#e9d8fd',
    color: '#553c9a',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    marginTop: '0.5rem',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableRow: {
    borderBottom: '1px solid #e2e8f0',
  },
  tableCell: {
    padding: '0.5rem 0',
  },
  flexRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scrollBox: {
    height: '200px',
    overflowY: 'auto' as const,
    border: '1px solid #e2e8f0',
    borderRadius: '0.25rem',
    padding: '0.5rem',
  },
  emptyText: {
    color: '#a0aec0',
    textAlign: 'center' as const,
    padding: '2rem 0',
  },
  divider: {
    borderTop: '1px solid #e2e8f0',
    margin: '1rem 0',
  },
  costText: {
    fontSize: '0.875rem',
  },
  textSemibold: {
    fontWeight: '600',
  },
  textBold: {
    fontWeight: 'bold',
  },
  modal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative' as const,
  },
  modalHeader: {
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: 0,
  },
  modalBody: {
    padding: '1rem',
  },
  modalFooter: {
    padding: '1rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  formLabel: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
  },
  textarea: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    border: '1px solid #cbd5e0',
    minHeight: '100px',
  },
  alert: {
    padding: '0.75rem 1rem',
    borderRadius: '0.25rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
  },
  alertInfo: {
    backgroundColor: '#ebf8ff',
    borderLeft: '4px solid #4299e1',
  },
  alertError: {
    backgroundColor: '#fff5f5',
    borderLeft: '4px solid #f56565',
  },
  resultBox: {
    border: '1px solid #e2e8f0',
    borderRadius: '0.25rem',
    padding: '1rem',
    marginBottom: '1rem',
    maxHeight: '300px',
    overflowY: 'auto' as const,
  },
};

// API Usage Dashboard Component
const ApiMonitorDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalCalls: 0,
    successRate: 0,
    avgLatency: 0,
    totalTokens: 0,
    callsByDay: {} as Record<string, number>,
    errorRate: 0,
    remainingQuota: 50
  });
  
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testPrompt, setTestPrompt] = useState('');
  const [testIsLoading, setTestIsLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    // Load stats on component mount
    loadStats();
    
    // Set up auto-refresh (every 30 seconds)
    const interval = window.setInterval(() => {
      setRefreshCounter(prev => prev + 1);
    }, 30000);
    
    setRefreshInterval(interval);
    
    // Cleanup on component unmount
    return () => {
      if (refreshInterval) {
        window.clearInterval(refreshInterval);
      }
    };
  }, []);
  
  useEffect(() => {
    // Reload stats when refresh counter changes
    loadStats();
  }, [refreshCounter]);
  
  const loadStats = () => {
    const apiStats = getApiUsageStats();
    setStats(apiStats);
  };
  
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all API usage statistics? This is primarily for testing.')) {
      resetApiUsageStats();
      loadStats();
    }
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };
  
  const handleTestAPI = async () => {
    setTestIsLoading(true);
    setTestError(null);
    setTestResult(null);
    
    try {
      // Build a base request
      const baseRequest = await buildRecommendationRequest('admin-test-user');
      
      // Add custom prompt content if provided
      const request = {
        ...baseRequest,
        customPrompt: testPrompt || undefined
      };
      
      // Generate a recommendation
      const recommendation = await generateRecommendation(request);
      setTestResult(recommendation);
      
      // Refresh stats after test
      loadStats();
    } catch (error) {
      setTestError(error instanceof Error ? error.message : String(error));
    } finally {
      setTestIsLoading(false);
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.heading}>API Monitor Dashboard</h2>
        <div style={styles.buttonGroup}>
          <button
            style={{...styles.button, ...styles.primaryButton}}
            onClick={loadStats}
          >
            Refresh
          </button>
          <button
            style={{...styles.button, ...styles.dangerButton}}
            onClick={handleReset}
          >
            Reset Stats
          </button>
          <button
            style={{...styles.button, ...styles.successButton}}
            onClick={() => setIsModalOpen(true)}
          >
            Test API
          </button>
        </div>
      </div>
      
      <div style={styles.statGrid}>
        {/* API Calls */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>API Calls</h3>
          </div>
          <div style={styles.cardBody}>
            <div style={styles.stat}>
              <div style={styles.statNumber}>{stats.totalCalls}</div>
              <div style={styles.statLabel}>Total API Requests</div>
            </div>
          </div>
        </div>
        
        {/* Success Rate */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Success Rate</h3>
          </div>
          <div style={styles.cardBody}>
            <div style={styles.stat}>
              <div style={styles.statNumber}>{stats.successRate.toFixed(1)}%</div>
              <div style={styles.statLabel}>
                <span style={{
                  ...styles.badge,
                  ...(stats.successRate > 95 ? styles.badgeGreen :
                     stats.successRate > 85 ? styles.badgeYellow :
                     styles.badgeRed)
                }}>
                  {stats.successRate > 95 ? 'Excellent' :
                   stats.successRate > 85 ? 'Good' :
                   'Needs Attention'}
                </span>
              </div>
            </div>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${stats.successRate}%`,
                  backgroundColor: stats.successRate > 95 ? '#48bb78' :
                                   stats.successRate > 85 ? '#ecc94b' :
                                   '#f56565'
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Rate Limiting */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Rate Limiting</h3>
          </div>
          <div style={styles.cardBody}>
            <div style={styles.stat}>
              <div style={styles.statNumber}>{stats.remainingQuota}</div>
              <div style={styles.statLabel}>Remaining Hourly Quota</div>
            </div>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${(stats.remainingQuota / 50) * 100}%`,
                  backgroundColor: '#4299e1'
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Token Usage */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Token Usage</h3>
          </div>
          <div style={styles.cardBody}>
            <div style={styles.stat}>
              <div style={styles.statNumber}>{stats.totalTokens.toLocaleString()}</div>
              <div style={styles.statLabel}>Total Tokens Used</div>
            </div>
          </div>
        </div>
      </div>
      
      <div style={styles.statGrid}>
        {/* Daily API Calls */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Daily API Calls</h3>
          </div>
          <div style={styles.cardBody}>
            <div style={styles.scrollBox}>
              {Object.keys(stats.callsByDay).length > 0 ? (
                Object.entries(stats.callsByDay)
                  .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                  .map(([date, count]) => (
                    <div key={date} style={styles.flexRow}>
                      <div>{formatDate(date)}</div>
                      <div style={styles.textBold}>{count} calls</div>
                    </div>
                  ))
              ) : (
                <div style={styles.emptyText}>No API calls recorded</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Performance Metrics */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Performance Metrics</h3>
          </div>
          <div style={styles.cardBody}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <div style={{flex: 1, padding: '0 0.5rem'}}>
                <div style={styles.statLabel}>Average Latency</div>
                <div style={styles.statNumber}>{stats.avgLatency.toFixed(0)} ms</div>
                <div>
                  <span style={{
                    ...styles.badge,
                    ...(stats.avgLatency < 1000 ? styles.badgeGreen :
                       stats.avgLatency < 2000 ? styles.badgeYellow :
                       styles.badgeRed)
                  }}>
                    {stats.avgLatency < 1000 ? 'Fast' :
                     stats.avgLatency < 2000 ? 'Normal' :
                     'Slow'}
                  </span>
                </div>
              </div>
              
              <div style={{flex: 1, padding: '0 0.5rem'}}>
                <div style={styles.statLabel}>Error Rate</div>
                <div style={styles.statNumber}>{stats.errorRate.toFixed(1)}%</div>
                <div>
                  <span style={{
                    ...styles.badge,
                    ...(stats.errorRate < 5 ? styles.badgeGreen :
                       stats.errorRate < 15 ? styles.badgeYellow :
                       styles.badgeRed)
                  }}>
                    {stats.errorRate < 5 ? 'Minimal' :
                     stats.errorRate < 15 ? 'Moderate' :
                     'High'}
                  </span>
                </div>
              </div>
            </div>
            
            <div style={styles.divider} />
            
            <div>
              <div style={styles.textSemibold}>Cost Estimation</div>
              <div style={styles.costText}>
                Estimated cost: ${((stats.totalTokens / 1000) * 0.002).toFixed(4)}
                <span style={{color: '#718096', marginLeft: '0.25rem'}}>
                  (at $0.002 per 1K tokens)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Test API Modal */}
      {isModalOpen && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Test OpenAI API Integration</h3>
              <button
                style={styles.closeButton}
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Custom Prompt (Optional)</label>
                <textarea
                  style={styles.textarea}
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Enter a custom prompt addition here..."
                />
              </div>
              
              {testIsLoading && (
                <div style={{...styles.alert, ...styles.alertInfo}}>
                  Generating recommendation... This may take a few seconds.
                </div>
              )}
              
              {testError && (
                <div style={{...styles.alert, ...styles.alertError}}>
                  {testError}
                </div>
              )}
              
              {testResult && (
                <div style={styles.resultBox}>
                  <h4 style={{fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>{testResult.title}</h4>
                  <p style={{marginBottom: '0.75rem'}}>{testResult.description}</p>
                  
                  {testResult.suggestedActions && testResult.suggestedActions.length > 0 && (
                    <>
                      <div style={{fontWeight: 'bold', marginBottom: '0.25rem'}}>Suggested Actions:</div>
                      {testResult.suggestedActions.map((action: any, index: number) => (
                        <div key={index} style={{paddingLeft: '1rem', marginBottom: '0.5rem'}}>
                          <div style={{fontWeight: '600'}}>{action.title}</div>
                          <div style={{fontSize: '0.875rem'}}>{action.description}</div>
                        </div>
                      ))}
                    </>
                  )}
                  
                  <div style={{marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                    <span style={{...styles.badge, ...styles.badgeBlue}}>{testResult.category}</span>
                    <span style={{
                      ...styles.badge,
                      ...(testResult.priority === 'high' ? styles.badgeRed :
                         testResult.priority === 'medium' ? styles.badgeYellow :
                         styles.badgeGreen)
                    }}>
                      {testResult.priority} priority
                    </span>
                    {testResult.aiConfidenceScore && (
                      <span style={{...styles.badge, ...styles.badgePurple}}>
                        {testResult.aiConfidenceScore}% confidence
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button
                style={{
                  ...styles.button,
                  ...styles.successButton,
                  opacity: testIsLoading ? 0.7 : 1,
                  cursor: testIsLoading ? 'not-allowed' : 'pointer'
                }}
                onClick={handleTestAPI}
                disabled={testIsLoading}
              >
                {testIsLoading ? 'Generating...' : 'Generate Recommendation'}
              </button>
              <button
                style={{...styles.button, ...styles.secondaryButton}}
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiMonitorDashboard;