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

        {/* Ultra-Minimal Navigation */}
        <nav className="footer-nav">
          <a href="#" onClick={() => onNavigate('Home')} className="nav-link">
            <span className="link-icon">▸</span>Home
          </a>
          <a href="#" onClick={() => onNavigate('Reading')} className="nav-link">
            <span className="link-icon">▸</span>Reading
          </a>
          <a href="#" onClick={() => onNavigate('AI')} className="nav-link">
            <span className="link-icon">▸</span>AI Hub
          </a>
          <a href="#" onClick={() => onNavigate('About Us')} className="nav-link">
            <span className="link-icon">▸</span>About
          </a>
          <a href="#" onClick={() => onNavigate('Contact')} className="nav-link">
            <span className="link-icon">▸</span>Contact
          </a>
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
          <a href="#" onClick={(e) => { e.preventDefault(); alert('Privacy Policy'); }}>Privacy</a>
          <span className="legal-dot">•</span>
          <a href="#" onClick={(e) => { e.preventDefault(); alert('Terms'); }}>Terms</a>
          <span className="legal-dot">•</span>
          <span className="copyright">© 2025 Kobyte</span>
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
