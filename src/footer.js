import './css/footer.css';

function Footer({onNavigate}) {
return (<footer>
        <hr className="footer-line" />
        <div className="footer-content">
          <div className="footer-section resources">
            <h3>Resources</h3>
          </div>
          <div className="footer-section about">
            <h3>About</h3>
            <a href="#" onClick={() => onNavigate('About Us')}>About Us</a><br />
            <a href="#" onClick={() => onNavigate('Subscribe')}>Subscribe</a><br />
            <a href="#" onClick={() => onNavigate('Contact')}>Contact</a>
          </div>
          <div className="footer-section other">
            <h3>Other</h3>
          </div>
          <div className="footer-section follow-us">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="https://www.youtube.com/@kobstechnologies/videos" target="_blank" rel="noopener noreferrer">
                <img className="icon" src={require('./images/youtube-logo.png')} alt="YouTube" />
              </a>
              <a href="https://www.linkedin.com/in/kobs-technologies-9965572a6/" target="_blank" rel="noopener noreferrer">
                <img className="icon" src={require('./images/linkedin-logo.png')} alt="LinkedIn" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61554761378472" target="_blank" rel="noopener noreferrer">
                <img className="icon" src={require('./images/facebook-logo.png')} alt="Facebook" />
              </a>
              <a href="https://www.threads.net/@kobstechnologies" target="_blank" rel="noopener noreferrer">
                <img className="icon" src={require('./images/instagram-logo.png')} alt="Instagram" />
              </a>
              <a href="https://twitter.com/technologi32955" target="_blank" rel="noopener noreferrer">
                <img className="icon" src={require('./images/twitter-logo.png')} alt="Twitter" />
              </a>
            </div>
          </div>
        </div>
      </footer>)
}

export default Footer;