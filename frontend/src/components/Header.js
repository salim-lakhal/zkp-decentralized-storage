import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import '../styles/header.css';

function truncateAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function Header() {
  const { account, connected, disconnect } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-brand">
          <span>ZKP</span> Drive
        </Link>

        {connected && (
          <>
            <button
              className="mobile-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? '\u2715' : '\u2630'}
            </button>

            <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
              <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>
                Dashboard
              </NavLink>
              <NavLink to="/upload" onClick={() => setMenuOpen(false)}>
                Upload
              </NavLink>
              <NavLink to="/files" onClick={() => setMenuOpen(false)}>
                My Files
              </NavLink>
              <NavLink to="/access" onClick={() => setMenuOpen(false)}>
                Access Control
              </NavLink>
            </nav>

            <div className="header-right">
              <span className="header-address">{truncateAddress(account)}</span>
              <button className="header-disconnect" onClick={disconnect}>
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
