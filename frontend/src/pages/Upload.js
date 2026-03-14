import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { uploadFile } from '../services/ipfs';
import '../styles/upload.css';

export default function Upload() {
  const { account } = useWallet();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFile = useCallback((selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleUpload = async () => {
    if (!file || !account) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const data = await uploadFile(file, setProgress);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Upload File</h1>
        <p className="page-subtitle">Encrypt and store your file on IPFS</p>

        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-zone-icon">&#128228;</div>
          <h3>{file ? file.name : 'Drop your file here or click to browse'}</h3>
          <p>
            {file
              ? `${formatSize(file.size)} — Click upload to proceed`
              : 'Files are encrypted before upload'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {file && !result && (
          <div style={{ marginBottom: 24 }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload to IPFS'}
            </button>
          </div>
        )}

        {uploading && (
          <div className="upload-progress">
            <div className="progress-header">
              <span className="progress-filename">{file.name}</span>
              <span className="progress-percent">{progress}%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {error && (
          <div className="upload-progress" style={{ borderColor: 'var(--danger)' }}>
            <p style={{ color: 'var(--danger)' }}>{error}</p>
          </div>
        )}

        {result && (
          <div className="upload-result">
            <h4>Upload Complete</h4>
            <div className="result-row">
              <span className="result-label">File Name</span>
              <span className="result-value">{file.name}</span>
            </div>
            <div className="result-row">
              <span className="result-label">Size</span>
              <span className="result-value">{formatSize(file.size)}</span>
            </div>
            {result.cid && (
              <div className="result-row">
                <span className="result-label">IPFS CID</span>
                <span className="result-value">{result.cid}</span>
              </div>
            )}
            {result.fileId && (
              <div className="result-row">
                <span className="result-label">File ID</span>
                <span className="result-value">{result.fileId}</span>
              </div>
            )}
            <div className="upload-actions">
              <button className="btn btn-primary" onClick={() => navigate('/access')}>
                Set Access Controls
              </button>
              <button className="btn btn-secondary" onClick={() => { setFile(null); setResult(null); }}>
                Upload Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
