import React from 'react';
import "../../css/LegalPages.css";
import kivoLogo from "../../assets/kivo.png";
import kobsLogo from "../../images/kobstechnologies-color.png";
import aboutImage from "../../images/aboutusedu.jpeg";

const AboutUs = () => {
  return (
    <section id="about-us" className="section">
      <div className="container">
        <div className="content">
          <div className="text-section">

            {/* About KiVO Learning International */}
            <div className="about-kivo" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <img
                src={kivoLogo}
                alt="KiVO Learning International"
                style={{ maxWidth: '300px', marginBottom: '1rem' }}
              />
              <h1 className="section-heading">About KiVO Learning International</h1>
              <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
                Revolutionary AI-Powered K-12 Education Platform
              </p>
            </div>

            {/* Our Mission */}
            <div className="our-mission">
              <h2 className="subsection-heading">🎯 Our Mission</h2>
              <p>
                KiVO Learning International is dedicated to revolutionizing K-12 education through
                cutting-edge artificial intelligence technology. We believe every student deserves
                personalized, adaptive learning that predicts challenges before they arise and
                celebrates achievements as they happen.
              </p>
              <p>
                Our mission is to create a global educational ecosystem where students learn at their
                own pace, teachers save time with intelligent tools, and parents stay connected to
                their children's complete learning journey.
              </p>
            </div>

            {/* What Makes Us Different */}
            <div className="what-we-offer">
              <h2 className="subsection-heading">⭐ What Makes Us Different</h2>

              <h3>🔮 Predictive AI Learning</h3>
              <p>
                Our proprietary AI identifies learning gaps <strong>2-3 weeks before they happen</strong>,
                enabling proactive intervention rather than reactive fixes. This breakthrough technology
                is the first of its kind in education.
              </p>

              <h3>❤️ Emotional Intelligence AI</h3>
              <p>
                Real-time emotion detection adapts the learning experience based on frustration, boredom,
                or excitement—like a caring teacher who truly understands the student.
              </p>

              <h3>🤖 Lifetime AI Study Buddy</h3>
              <p>
                Every student gets a personal AI companion that remembers their entire K-12 learning
                journey and grows with them over the years.
              </p>

              <h3>🎮 AAA-Quality Educational Games</h3>
              <p>
                12 professionally designed games (7 free + 5 premium) that kids choose to play over
                Fortnite and Roblox—learning disguised as entertainment.
              </p>

              <h3>📝 Unlimited AI Worksheets</h3>
              <p>
                GPT-4 powered worksheet generation with client-side PDF creation enables infinite
                scalability at zero marginal cost. 20+ categories covering all K-12 subjects.
              </p>

              <h3>📱 Parent Moment Sharing</h3>
              <p>
                Auto-generates shareable achievement moments for Facebook, Instagram, and Twitter—
                turning proud parents into viral marketing ambassadors.
              </p>

              <h3>🌟 Holistic Development Tracking</h3>
              <p>
                Beyond test scores: track academic, emotional, social, physical, and creative
                development for the whole child approach.
              </p>

              <h3>⏱️ Auto-Grading System</h3>
              <p>
                Saves teachers 10+ hours per week with instant feedback for students and zero
                infrastructure requirements.
              </p>
            </div>

            {/* Our Platform */}
            <div className="our-platform">
              <h2 className="subsection-heading">🚀 Our Platform</h2>

              <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                  <ul style={{ lineHeight: '1.8' }}>
                    <li><strong>5,000+ Assessment Questions</strong> across all K-12 subjects and grade levels</li>
                    <li><strong>1,200+ Interactive Stories</strong> for reading comprehension and engagement</li>
                    <li><strong>12 Educational Games</strong> with professional-grade graphics and gameplay</li>
                    <li><strong>AI-Powered Worksheet Generator</strong> with unlimited templates</li>
                    <li><strong>Real-time Progress Tracking</strong> with predictive analytics</li>
                    <li><strong>Multi-platform Support</strong> - Web, iOS, and Android (coming soon)</li>
                    <li><strong>Subscription Tiers</strong> - Free, Premium ($9.99/month), Family ($19.99/month)</li>
                  </ul>
                </div>
                <div style={{ flex: '0 0 350px', minWidth: '300px' }}>
                  <img
                    src={aboutImage}
                    alt="Education Technology"
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Our Impact */}
            <div className="our-impact">
              <h2 className="subsection-heading">🌍 Our Global Impact</h2>
              <p>
                KiVO Learning International serves students, parents, teachers, and schools worldwide.
                With support for multiple languages and cultural contexts, we're building the future
                of global education.
              </p>
              <p><strong>Target Markets:</strong></p>
              <ul style={{ lineHeight: '1.8' }}>
                <li>🎓 <strong>50M+ K-12 Students</strong> in the United States</li>
                <li>👨‍👩‍👧‍👦 <strong>25M+ Households</strong> seeking quality educational supplements</li>
                <li>👩‍🏫 <strong>3.5M+ Teachers</strong> looking for time-saving tools</li>
                <li>🏫 <strong>13,000+ School Districts</strong> needing comprehensive platforms</li>
                <li>🌎 <strong>1.5B+ Global K-12 Market</strong> with 20% annual growth</li>
              </ul>
            </div>

            {/* Developed By */}
            <div className="developed-by" style={{
              marginTop: '3rem',
              padding: '2rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <h2 className="subsection-heading">💼 Owned & Developed By</h2>
              <img
                src={kobsLogo}
                alt="KOBS Technologies"
                style={{ maxWidth: '250px', margin: '1rem auto', display: 'block' }}
              />
              <h3 style={{ color: '#1e90ff', marginTop: '1rem' }}>
                <a
                  href="https://www.kobytetechnologies.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#1e90ff', textDecoration: 'none' }}
                >
                  www.kobytetechnologies.com
                </a>
              </h3>
              <p style={{ fontSize: '1.1rem', marginTop: '1rem' }}>
                <strong>Email:</strong>{' '}
                <a href="mailto:contact@kobytetechnologies.com" style={{ color: '#1e90ff' }}>
                  contact@kobytetechnologies.com
                </a>
              </p>
              <p style={{ marginTop: '1rem', color: '#666' }}>
                KOBS Technologies is a leading educational technology company specializing in
                AI-powered learning solutions, innovative software development, and digital transformation
                for educational institutions worldwide.
              </p>
            </div>

            {/* Get in Touch */}
            <div className="get-in-touch" style={{ marginTop: '2rem', textAlign: 'center' }}>
              <h2 className="subsection-heading">📧 Get in Touch</h2>
              <p>
                Have questions? Want to learn more about KiVO Learning International?<br/>
                We'd love to hear from you!
              </p>
              <div style={{ marginTop: '1rem' }}>
                <a
                  href="mailto:contact@kobytetechnologies.com"
                  style={{
                    display: 'inline-block',
                    padding: '12px 30px',
                    backgroundColor: '#1e90ff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    fontSize: '1.1rem',
                    marginRight: '1rem'
                  }}
                >
                  Contact Us
                </a>
                <a
                  href="https://www.kobytetechnologies.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '12px 30px',
                    backgroundColor: '#ff8c00',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    fontSize: '1.1rem'
                  }}
                >
                  Visit KOBS Technologies
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
