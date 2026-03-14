import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import '../styles/landing.css';

export default function Landing() {
  const { connect, connecting, connected } = useWallet();
  const navigate = useNavigate();

  const handleConnect = async () => {
    if (connected) {
      navigate('/dashboard');
      return;
    }
    await connect();
    navigate('/dashboard');
  };

  return (
    <div className="landing">
      <div className="landing-hero">
        <span className="landing-badge">Built on Ethereum + IPFS</span>
        <h1 className="landing-title">
          Private file storage with{' '}
          <span className="landing-title-accent">zero-knowledge proofs</span>
        </h1>
        <p className="landing-description">
          ZKP Drive encrypts your files client-side, stores them on IPFS,
          and manages access through NFTs verified by zero-knowledge proofs.
          Your data stays yours.
        </p>
        <div className="landing-actions">
          <button className="btn btn-primary btn-lg" onClick={handleConnect} disabled={connecting}>
            {connecting ? 'Connecting...' : connected ? 'Go to Dashboard' : 'Connect Wallet'}
          </button>
          <a
            href="https://github.com"
            className="btn btn-secondary btn-lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Source
          </a>
        </div>
      </div>

      <div className="landing-features">
        <div className="feature-card">
          <div className="feature-icon">&#128274;</div>
          <h3>End-to-End Encryption</h3>
          <p>
            Files are encrypted on your device before being uploaded. Only you and
            authorized parties can decrypt them.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">&#127760;</div>
          <h3>Decentralized Storage</h3>
          <p>
            Files are distributed across IPFS with content-addressed hashes stored
            on-chain for immutable reference.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">&#128737;</div>
          <h3>ZKP Access Control</h3>
          <p>
            Grant and verify file access using zero-knowledge proofs. Prove
            authorization without revealing sensitive data.
          </p>
        </div>
      </div>
    </div>
  );
}
