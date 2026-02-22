import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [email, setEmail] = useState('');

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: '🎯',
      title: 'AI-Powered Assessments',
      description: 'Personalized questions adapted to each student\'s level. Auto-graded with instant feedback.',
      keywords: 'online assessment tool, AI assessment, formative assessment'
    },
    {
      icon: '📚',
      title: 'Reading Comprehension',
      description: 'Engaging stories with interactive questions. Build reading skills for all grade levels.',
      keywords: 'reading comprehension practice, online reading, literacy skills'
    },
    {
      icon: '🎮',
      title: 'Educational Games',
      description: 'Learn through play! Math games, Sudoku, memory games, and more to make learning fun.',
      keywords: 'educational games for kids, learning games, math games'
    },
    {
      icon: '🤖',
      title: 'AI Tutor 24/7',
      description: 'Get homework help anytime. Ask questions and receive instant, accurate explanations.',
      keywords: 'AI tutor, online tutoring, homework help'
    },
    {
      icon: '👨‍🏫',
      title: 'Teacher Dashboard',
      description: 'Create classes, assign work, track progress, and communicate with parents effortlessly.',
      keywords: 'teacher grading software, classroom management, teacher dashboard'
    },
    {
      icon: '👨‍👩‍👧‍👦',
      title: 'Parent Portal',
      description: 'Monitor your child\'s learning journey. Get weekly reports and communicate with teachers.',
      keywords: 'parent portal for schools, student progress tracking, parent dashboard'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Elementary School Teacher',
      school: 'Lincoln Elementary, California',
      avatar: null,
      rating: 5,
      text: 'GoStudyLab has transformed my classroom! The AI-powered assessments save me hours of grading time, and my students love the interactive games. Highly recommended for any teacher looking to modernize their teaching.'
    },
    {
      name: 'Michael Chen',
      role: 'School Principal',
      school: 'Riverside Academy, New York',
      avatar: null,
      rating: 5,
      text: 'We\'ve seen a 40% improvement in student engagement since implementing GoStudyLab. The parent portal keeps families informed, and our teachers have more time to focus on actual teaching instead of administrative work.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Homeschool Parent',
      school: 'San Diego, California',
      avatar: null,
      rating: 5,
      text: 'As a homeschooling mom of three, GoStudyLab is a lifesaver! The personalized learning paths keep each of my kids engaged at their own level. The AI tutor helps when I\'m juggling multiple subjects.'
    },
    {
      name: 'David Kumar',
      role: 'District Administrator',
      school: 'Austin ISD, Texas',
      avatar: null,
      rating: 5,
      text: 'We rolled out GoStudyLab across 45 schools in our district. The bulk registration feature made onboarding seamless, and the analytics dashboard gives us incredible insights into student performance district-wide.'
    }
  ];

  const pricingPlans = [
    {
      id: 'individual',
      name: 'Student Individual',
      icon: '💎',
      price: 9.99,
      period: 'month',
      popular: false,
      features: [
        'Unlimited assessments',
        'All reading materials',
        'AI tutor (100 questions/month)',
        'Progress reports',
        'Certificates',
        'Mobile app access'
      ]
    },
    {
      id: 'family',
      name: 'Family Plan',
      icon: '👨‍👩‍👧‍👦',
      price: 19.99,
      period: 'month',
      popular: true,
      features: [
        'Up to 4 students',
        'Everything in Individual',
        'AI tutor (300 questions/month)',
        'Family dashboard',
        'Priority support',
        'Offline worksheets'
      ]
    },
    {
      id: 'school',
      name: 'School Standard',
      icon: '🏫',
      price: 499,
      period: 'year',
      popular: false,
      features: [
        'Up to 500 students',
        'Unlimited teachers',
        'Bulk registration',
        'Custom branding',
        'Analytics dashboard',
        'Dedicated support'
      ]
    }
  ];

  const faqs = [
    {
      question: 'What grade levels does GoStudyLab support?',
      answer: 'GoStudyLab supports students from Kindergarten through Grade 12 (K-12). Our content is carefully curated and aligned with common curriculum standards including Common Core, CBSE, ICSE, and more.'
    },
    {
      question: 'Can I try GoStudyLab before subscribing?',
      answer: 'Yes! We offer a free guest mode that allows you to try 3 assessments, 2 reading stories, and 1 game. No credit card required. You can also sign up for a free student account with daily limits.'
    },
    {
      question: 'How does the AI tutor work?',
      answer: 'Our AI tutor uses advanced natural language processing to understand student questions and provide accurate, age-appropriate explanations. It\'s available 24/7 and can help with homework, concepts, and problem-solving across all subjects.'
    },
    {
      question: 'Is GoStudyLab suitable for homeschooling?',
      answer: 'Absolutely! Many homeschool families use GoStudyLab as their primary curriculum tool. The personalized learning paths, progress tracking, and comprehensive resources make it perfect for homeschool education.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and PayPal. School and district subscriptions can also be paid via purchase order or invoice.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. There are no long-term commitments or cancellation fees. Your access will continue until the end of your current billing period.'
    },
    {
      question: 'Do you offer discounts for schools?',
      answer: 'Yes! We offer significant discounts for schools and districts. Contact our sales team for a custom quote based on your student count. We also offer free trials for schools to test the platform.'
    },
    {
      question: 'Is my child\'s data secure?',
      answer: 'Absolutely. We take data privacy seriously and comply with FERPA, COPPA, and GDPR regulations. Student data is encrypted, never sold to third parties, and we have strict access controls in place.'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Schools Worldwide' },
    { value: '500,000+', label: 'Active Students' },
    { value: '2M+', label: 'Assessments Completed' },
    { value: '98%', label: 'Parent Satisfaction' }
  ];

  const handleGetStarted = () => {
    navigate('/');
    // Scroll to signup or trigger signup modal
  };

  const handleNewsletterSignup = (e) => {
    e.preventDefault();
    // TODO: Implement newsletter signup
    alert('Thank you for subscribing! Check your email for a welcome message.');
    setEmail('');
  };

  return (
    <div className="landing-page">
      {/* SEO Meta Tags - Add to index.html or use React Helmet */}

      {/* Navigation Header */}
      <header className="landing-header">
        <div className="header-container">
          <div className="logo-section">
            <span className="logo-icon">📚</span>
            <span className="logo-text">GoStudyLab</span>
          </div>

          <nav className="header-nav">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="header-actions">
            <button className="btn-login" onClick={() => navigate('/')}>
              Login
            </button>
            <button className="btn-signup" onClick={handleGetStarted}>
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              AI-Powered Learning Platform for Students, Teachers & Schools
            </h1>
            <p className="hero-description">
              Personalized assessments, interactive games, reading comprehension, and AI tutoring.
              Trusted by 10,000+ schools worldwide. Start your free trial today!
            </p>

            <div className="hero-actions">
              <button className="btn-hero-primary" onClick={handleGetStarted}>
                <span>Start Free Trial</span>
                <span className="btn-arrow">→</span>
              </button>
              <button className="btn-hero-secondary" onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}>
                <span className="play-icon">▶</span>
                <span>Watch Demo</span>
              </button>
            </div>

            <div className="hero-badges">
              <div className="badge">✅ No Credit Card Required</div>
              <div className="badge">✅ Free Forever Plan</div>
              <div className="badge">✅ FERPA & COPPA Compliant</div>
            </div>
          </div>

          <div className="hero-image">
            <div className="hero-mockup">
              <div className="mockup-screen">
                <div className="mockup-content">
                  <div className="mockup-header">
                    <div className="mockup-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                  <div className="mockup-body">
                    <div className="mockup-card animate-float">
                      <div className="card-icon">🎯</div>
                      <div className="card-text">
                        <div className="card-title">Math Assessment</div>
                        <div className="card-score">Score: 95%</div>
                      </div>
                    </div>
                    <div className="mockup-card animate-float" style={{ animationDelay: '0.5s' }}>
                      <div className="card-icon">📚</div>
                      <div className="card-text">
                        <div className="card-title">Reading Progress</div>
                        <div className="card-score">15 Stories</div>
                      </div>
                    </div>
                    <div className="mockup-card animate-float" style={{ animationDelay: '1s' }}>
                      <div className="card-icon">🤖</div>
                      <div className="card-text">
                        <div className="card-title">AI Tutor Active</div>
                        <div className="card-score">Available 24/7</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating background elements */}
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Everything You Need for Modern Learning</h2>
            <p className="section-description">
              Comprehensive tools for students, teachers, parents, and school administrators
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-keywords" aria-label={`Keywords: ${feature.keywords}`}>
                  {/* Hidden keywords for SEO */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo-video" className="demo-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">See GoStudyLab in Action</h2>
            <p className="section-description">
              Watch how teachers, students, and parents use our platform every day
            </p>
          </div>

          <div className="video-container">
            <div className="video-placeholder">
              <div className="video-play-button">▶</div>
              <p className="video-text">Demo video coming soon!</p>
              <p className="video-subtext">
                See how GoStudyLab transforms learning for thousands of schools worldwide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Simple, Transparent Pricing</h2>
            <p className="section-description">
              Choose the plan that fits your needs. Cancel anytime, no questions asked.
            </p>
          </div>

          <div className="pricing-grid">
            {pricingPlans.map((plan) => (
              <div key={plan.id} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="popular-badge">Most Popular</div>}

                <div className="plan-icon">{plan.icon}</div>
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="price-currency">$</span>
                  <span className="price-value">{plan.price}</span>
                  <span className="price-period">/{plan.period}</span>
                </div>

                <ul className="plan-features">
                  {plan.features.map((feature, index) => (
                    <li key={index}>
                      <span className="feature-check">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`plan-button ${plan.popular ? 'primary' : 'secondary'}`}
                  onClick={handleGetStarted}
                >
                  {plan.id === 'school' ? 'Contact Sales' : 'Start Free Trial'}
                </button>
              </div>
            ))}
          </div>

          <div className="pricing-note">
            <p>💡 All plans include 14-day free trial. No credit card required.</p>
            <p>🏫 Schools & Districts: <a href="mailto:sales@gostudylab.com">Contact us</a> for custom enterprise pricing</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Loved by Teachers, Parents & Students</h2>
            <p className="section-description">
              Don't just take our word for it. Here's what our users have to say.
            </p>
          </div>

          <div className="testimonials-carousel">
            <div className="testimonial-active">
              <div className="testimonial-content">
                <div className="testimonial-stars">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <span key={i} className="star">⭐</span>
                  ))}
                </div>
                <p className="testimonial-text">"{testimonials[activeTestimonial].text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonials[activeTestimonial].name[0]}
                  </div>
                  <div className="author-info">
                    <div className="author-name">{testimonials[activeTestimonial].name}</div>
                    <div className="author-role">{testimonials[activeTestimonial].role}</div>
                    <div className="author-school">{testimonials[activeTestimonial].school}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="testimonial-dots">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === activeTestimonial ? 'active' : ''}`}
                  onClick={() => setActiveTestimonial(index)}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-description">
              Everything you need to know about GoStudyLab
            </p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-item ${activeFAQ === index ? 'active' : ''}`}>
                <button
                  className="faq-question"
                  onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
                >
                  <span>{faq.question}</span>
                  <span className="faq-icon">{activeFAQ === index ? '−' : '+'}</span>
                </button>
                {activeFAQ === index && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Transform Your Learning Experience?</h2>
          <p className="cta-description">
            Join 10,000+ schools and 500,000+ students already using GoStudyLab
          </p>
          <button className="btn-cta" onClick={handleGetStarted}>
            Start Your Free Trial Today
          </button>
          <p className="cta-note">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-column">
              <div className="footer-logo">
                <span className="logo-icon">📚</span>
                <span className="logo-text">GoStudyLab</span>
              </div>
              <p className="footer-description">
                AI-powered learning platform for students, teachers, and schools worldwide.
              </p>
              <div className="social-links">
                <a href="https://facebook.com" aria-label="Facebook">📘</a>
                <a href="https://twitter.com" aria-label="Twitter">🐦</a>
                <a href="https://linkedin.com" aria-label="LinkedIn">💼</a>
                <a href="https://instagram.com" aria-label="Instagram">📷</a>
              </div>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Product</h4>
              <ul className="footer-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="/worksheets">Free Worksheets</a></li>
                <li><a href="/games">Educational Games</a></li>
                <li><a href="/ai-tutor">AI Tutor</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">For Schools</h4>
              <ul className="footer-links">
                <li><a href="/schools">School Plans</a></li>
                <li><a href="/districts">District Solutions</a></li>
                <li><a href="/case-studies">Case Studies</a></li>
                <li><a href="/training">Teacher Training</a></li>
                <li><a href="/contact">Contact Sales</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Resources</h4>
              <ul className="footer-links">
                <li><a href="/blog">Blog</a></li>
                <li><a href="/help">Help Center</a></li>
                <li><a href="/tutorials">Video Tutorials</a></li>
                <li><a href="/research">Research</a></li>
                <li><a href="/webinars">Webinars</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Company</h4>
              <ul className="footer-links">
                <li><a href="/about">About Us</a></li>
                <li><a href="/careers">Careers</a></li>
                <li><a href="/press">Press Kit</a></li>
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/terms">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-newsletter">
            <h4 className="newsletter-heading">Stay Updated</h4>
            <p className="newsletter-description">Get the latest education tips, product updates, and special offers.</p>
            <form className="newsletter-form" onSubmit={handleNewsletterSignup}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>

          <div className="footer-bottom">
            <p className="copyright">© 2026 GoStudyLab. All rights reserved.</p>
            <div className="footer-badges">
              <span className="security-badge">🔒 FERPA Compliant</span>
              <span className="security-badge">🛡️ COPPA Certified</span>
              <span className="security-badge">🌍 GDPR Ready</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
