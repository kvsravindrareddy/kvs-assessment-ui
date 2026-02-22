import './css/footer.css';

function Footer({onNavigate}) {
  return (
    <footer>
      <div className="footer-content">
        {/* Learning Resources */}
        <div className="footer-section resources">
          <h3>📚 Learning Resources</h3>
          <a href="#" onClick={() => onNavigate('Home')}>Practice Worksheets</a>
          <a href="#" onClick={() => onNavigate('Reading')}>Reading Materials</a>
          <a href="#" onClick={() => onNavigate('AI')}>AI Learning Assistant</a>
          <a href="#" onClick={() => onNavigate('Random Assessment')}>Math Practice</a>
        </div>

        {/* Subjects & Grades */}
        <div className="footer-section subjects">
          <h3>🎓 Subjects & Grades</h3>
          <a href="#" onClick={() => onNavigate('Home')}>Pre-K to Grade 5</a>
          <a href="#" onClick={() => onNavigate('Alphabets')}>Alphabet Learning</a>
          <a href="#" onClick={() => onNavigate('Numbers')}>Number Practice</a>
          <a href="#" onClick={() => onNavigate('Kindergarten')}>Kindergarten</a>
        </div>

        {/* About & Help */}
        <div className="footer-section about">
          <h3>ℹ️ About & Help</h3>
          <a href="#" onClick={() => onNavigate('About Us')}>About Us</a>
          <a href="#" onClick={() => onNavigate('Contact')}>Contact Support</a>
          <a href="#" onClick={() => onNavigate('Subscribe')}>Subscribe for Updates</a>
          <a href="#" onClick={() => window.open('/help', '_blank')}>Help Center</a>
        </div>

        {/* Follow Us & Connect */}
        <div className="footer-section follow-us">
          <h3>🌟 Follow Us</h3>
          <div className="social-icons">
            <a href="https://www.youtube.com/@kobstechnologies/videos" target="_blank" rel="noopener noreferrer" title="YouTube">
              <img className="icon" src={require('./images/youtube-logo.png')} alt="YouTube" />
            </a>
            <a href="https://www.linkedin.com/in/kobs-technologies-9965572a6/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
              <img className="icon" src={require('./images/linkedin-logo.png')} alt="LinkedIn" />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61554761378472" target="_blank" rel="noopener noreferrer" title="Facebook">
              <img className="icon" src={require('./images/facebook-logo.png')} alt="Facebook" />
            </a>
            <a href="https://www.threads.net/@kobstechnologies" target="_blank" rel="noopener noreferrer" title="Instagram">
              <img className="icon" src={require('./images/instagram-logo.png')} alt="Instagram" />
            </a>
            <a href="https://twitter.com/technologi32955" target="_blank" rel="noopener noreferrer" title="Twitter">
              <img className="icon" src={require('./images/twitter-logo.png')} alt="Twitter" />
            </a>
          </div>
          <p className="tagline">✨ Learn, Practice, Excel! ✨</p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>© 2025 Kobyte Technologies (OPC) Private Limited. Making learning fun for students worldwide! 🚀</p>
        <div className="footer-links">
          <a href="#" onClick={(e) => { e.preventDefault(); alert('Privacy Policy'); }}>Privacy Policy</a>
          <span>•</span>
          <a href="#" onClick={(e) => { e.preventDefault(); alert('Terms of Service'); }}>Terms of Service</a>
          <span>•</span>
          <a href="#" onClick={(e) => { e.preventDefault(); alert('Cookie Policy'); }}>Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
