import './css/footer.css';

function Footer({onNavigate}) {
  return (
    <footer className="neo-footer">
      <div className="footer-glow"></div>

      <div className="footer-content">
        {/* Minimal Brand Section */}
        <div className="footer-brand">
          <div className="brand-pulse">
            <span className="brand-symbol">◈</span>
          </div>
          <div className="brand-text">
            <div className="brand-name">Kobyte</div>
            <div className="brand-tagline">Shaping Tomorrow's Learning</div>
          </div>
        </div>

        {/* Organized Navigation Grid */}
        <nav className="footer-nav-grid">
          {/* Column 1: Company */}
          <div className="footer-nav-column">
            <h4 className="footer-nav-title">Company</h4>
            <button type="button" onClick={() => onNavigate('About Us')} className="nav-link">
              <span className="link-icon">▸</span>About
            </button>
            <button type="button" onClick={() => onNavigate('Our Innovation')} className="nav-link">
              <span className="link-icon">▸</span>Innovation
            </button>
            <button type="button" onClick={() => onNavigate('Contact')} className="nav-link">
              <span className="link-icon">▸</span>Contact
            </button>
          </div>

          {/* Column 2: Resources */}
          <div className="footer-nav-column">
            <h4 className="footer-nav-title">Resources</h4>
            <button type="button" onClick={() => onNavigate('How It Works')} className="nav-link">
              <span className="link-icon">▸</span>How It Works
            </button>
            <button type="button" onClick={() => onNavigate('FAQ')} className="nav-link">
              <span className="link-icon">▸</span>FAQ
            </button>
            <button type="button" onClick={() => onNavigate('Success Stories')} className="nav-link">
              <span className="link-icon">▸</span>Success
            </button>
            <button type="button" onClick={() => onNavigate('Platform Stats')} className="nav-link">
              <span className="link-icon">▸</span>Platform Stats
            </button>
            <button type="button" onClick={() => onNavigate('System Health')} className="nav-link">
              <span className="link-icon">▸</span>Health
            </button>
          </div>

          {/* Column 3: Platform */}
          <div className="footer-nav-column">
            <h4 className="footer-nav-title">Platform</h4>
            <button type="button" onClick={() => onNavigate('Home')} className="nav-link">
              <span className="link-icon">▸</span>Home
            </button>
            <button type="button" onClick={() => onNavigate('Pricing')} className="nav-link">
              <span className="link-icon">▸</span>Pricing
            </button>
            <button type="button" onClick={() => onNavigate('Leaderboard')} className="nav-link">
              <span className="link-icon">▸</span>Leaderboard
            </button>
            <button type="button" onClick={() => onNavigate('Rewards')} className="nav-link">
              <span className="link-icon">▸</span>Rewards
            </button>
          </div>

          {/* Column 4: Community */}
          <div className="footer-nav-column">
            <h4 className="footer-nav-title">Community</h4>
            <button type="button" onClick={() => onNavigate('Idea Hub')} className="nav-link">
              <span className="link-icon">▸</span>Idea Hub
            </button>
            <button type="button" onClick={() => onNavigate('Report Bug')} className="nav-link">
              <span className="link-icon">▸</span>Report Bug
            </button>
          </div>
        </nav>

        {/* Futuristic Social Links */}
        <div className="footer-connect">
          <div className="connect-label">Connect</div>
          <div className="social-orbs">
            <a href="https://www.youtube.com/@kobstechnologies/videos" target="_blank" rel="noopener noreferrer" className="orb orb-yt" title="YouTube">
              <span className="orb-icon">▶</span>
            </a>
            <a href="https://www.linkedin.com/in/kobs-technologies-9965572a6/" target="_blank" rel="noopener noreferrer" className="orb orb-li" title="LinkedIn">
              <span className="orb-icon">in</span>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61554761378472" target="_blank" rel="noopener noreferrer" className="orb orb-fb" title="Facebook">
              <span className="orb-icon">f</span>
            </a>
          </div>
        </div>

        {/* Minimalist Legal */}
        <div className="footer-legal">
          <button type="button" onClick={() => onNavigate('Privacy')} className="nav-link">Privacy</button>
          <span className="legal-dot">•</span>
          <button type="button" onClick={() => onNavigate('Terms')} className="nav-link">Terms</button>
          <span className="legal-dot">•</span>
          <span className="copyright">© 2026 KiVO Learning International</span>
        </div>
      </div>

      {/* Animated Bottom Border */}
      <div className="footer-border">
        <div className="border-shimmer"></div>
      </div>
    </footer>
  );
}

export default Footer;
