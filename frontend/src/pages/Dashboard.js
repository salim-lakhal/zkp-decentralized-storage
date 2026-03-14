import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { fetchUserFiles } from '../services/ipfs';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { account } = useWallet();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account) return;

    let cancelled = false;
    setLoading(true);

    fetchUserFiles(account)
      .then((data) => {
        if (!cancelled) setFiles(data.files || []);
      })
      .catch(() => {
        if (!cancelled) setFiles([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [account]);

  const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  }

  function formatDate(ts) {
    if (!ts) return '—';
    return new Date(ts * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <div className="page">
      <div className="container dashboard">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your decentralized storage</p>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Files</div>
            <div className="stat-value accent">{loading ? '—' : files.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Storage Used</div>
            <div className="stat-value">{loading ? '—' : formatBytes(totalSize)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Network</div>
            <div className="stat-value">IPFS</div>
            <div className="stat-detail">Pinned & distributed</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Access NFTs</div>
            <div className="stat-value">{loading ? '—' : files.length}</div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Recent Uploads</h2>
            <Link to="/files" className="btn btn-secondary btn-sm">View All</Link>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="empty-state">
              <p>No files uploaded yet</p>
              <Link to="/upload" className="btn btn-primary btn-sm">Upload Your First File</Link>
            </div>
          ) : (
            <div className="recent-files">
              {files.slice(0, 5).map((file) => (
                <div key={file.cid || file.id} className="recent-file-row">
                  <span className="recent-file-name">{file.name}</span>
                  <div className="recent-file-meta">
                    <span>{formatBytes(file.size)}</span>
                    <span>{formatDate(file.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
