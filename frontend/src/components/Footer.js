import '../styles/footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-text">ZKP Drive — Decentralized storage with zero-knowledge privacy</p>
        <div className="footer-links">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://docs.ethers.org" target="_blank" rel="noopener noreferrer">Docs</a>
        </div>
      </div>
    </footer>
  );
}
