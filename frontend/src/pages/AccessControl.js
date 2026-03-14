import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { generateProof, verifyProof } from '../services/zkp';
import '../styles/access.css';

export default function AccessControl() {
  const { account } = useWallet();
  const [fileId, setFileId] = useState('');
  const [grantAddress, setGrantAddress] = useState('');
  const [accessList, setAccessList] = useState([]);
  const [proofStatus, setProofStatus] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    if (!grantAddress || !fileId) return;

    setAccessList((prev) => [
      ...prev,
      { address: grantAddress, status: 'pending', fileId },
    ]);
    setGrantAddress('');
  };

  const handleRevokeAccess = (address) => {
    setAccessList((prev) => prev.filter((item) => item.address !== address));
  };

  const handleGenerateProof = async () => {
    if (!fileId || !account) return;

    setGenerating(true);
    setProofStatus(null);

    try {
      const result = await generateProof(fileId, account);
      const verification = await verifyProof(result.proof, result.publicSignals);
      setProofStatus({
        status: verification.valid ? 'success' : 'error',
        message: verification.valid ? 'Proof verified successfully' : 'Proof verification failed',
      });
    } catch (err) {
      setProofStatus({
        status: 'error',
        message: err.message || 'Proof generation failed',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Access Control</h1>
        <p className="page-subtitle">Manage file permissions and generate ZKP proofs</p>

        <div className="access-layout">
          <div className="access-panel">
            <h3>Grant Access</h3>
            <form className="access-form" onSubmit={handleGrantAccess}>
              <div className="form-group">
                <label htmlFor="fileId">File ID</label>
                <input
                  id="fileId"
                  type="text"
                  placeholder="Enter file ID"
                  value={fileId}
                  onChange={(e) => setFileId(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Ethereum Address</label>
                <input
                  id="address"
                  type="text"
                  placeholder="0x..."
                  value={grantAddress}
                  onChange={(e) => setGrantAddress(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={!fileId || !grantAddress}>
                Grant Access
              </button>
            </form>
          </div>

          <div className="access-panel">
            <h3>Authorized Addresses</h3>
            {accessList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No access grants yet. Use the form to authorize addresses.
              </p>
            ) : (
              <div className="access-list">
                {accessList.map((item, i) => (
                  <div key={i} className="access-list-item">
                    <span className="access-address">
                      {item.address.slice(0, 6)}...{item.address.slice(-4)}
                    </span>
                    <div className="access-meta">
                      <span className={`access-status ${item.status}`}>
                        {item.status}
                      </span>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRevokeAccess(item.address)}
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="zkp-section">
          <h3>Zero-Knowledge Proof</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
            Generate a ZKP to prove file access authorization without revealing sensitive data.
          </p>
          <button
            className="btn btn-primary"
            onClick={handleGenerateProof}
            disabled={!fileId || generating}
          >
            {generating ? 'Generating Proof...' : 'Generate Proof'}
          </button>

          {proofStatus && (
            <div className="zkp-status">
              <span className={`zkp-status-dot ${proofStatus.status}`} />
              <span className="zkp-status-text">{proofStatus.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
