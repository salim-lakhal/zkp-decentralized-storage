import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { fetchUserFiles, downloadFile, deleteFile } from '../services/ipfs';
import '../styles/files.css';

export default function MyFiles() {
  const { account } = useWallet();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('table');

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

  const filtered = files.filter((f) =>
    f.name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatBytes = (bytes) => {
    if (!bytes) return '—';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  };

  const truncateCid = (cid) => {
    if (!cid) return '—';
    return `${cid.slice(0, 8)}...${cid.slice(-6)}`;
  };

  const handleDownload = async (file) => {
    try {
      const blob = await downloadFile(file.cid);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name || 'download';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Delete "${file.name}"? This action cannot be undone.`)) return;
    try {
      await deleteFile(file.cid);
      setFiles((prev) => prev.filter((f) => f.cid !== file.cid));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">My Files</h1>
        <p className="page-subtitle">All files stored on IPFS under your ownership</p>

        <div className="files-header">
          <div className="files-search">
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="files-view-toggle">
            <button
              className={`view-btn ${view === 'table' ? 'active' : ''}`}
              onClick={() => setView('table')}
            >
              Table
            </button>
            <button
              className={`view-btn ${view === 'grid' ? 'active' : ''}`}
              onClick={() => setView('grid')}
            >
              Grid
            </button>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading files...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>{search ? 'No files match your search' : 'No files uploaded yet'}</p>
          </div>
        ) : view === 'table' ? (
          <table className="files-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>CID</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((file) => (
                <tr key={file.cid || file.id}>
                  <td className="file-name-cell">{file.name}</td>
                  <td><span className="file-cid">{truncateCid(file.cid)}</span></td>
                  <td>{formatBytes(file.size)}</td>
                  <td>
                    <div className="file-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDownload(file)}>
                        Download
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(file)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="files-grid">
            {filtered.map((file) => (
              <div key={file.cid || file.id} className="file-grid-card">
                <h4>{file.name}</h4>
                <span className="file-cid">{truncateCid(file.cid)}</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {formatBytes(file.size)}
                </p>
                <div className="file-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => handleDownload(file)}>
                    Download
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(file)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
