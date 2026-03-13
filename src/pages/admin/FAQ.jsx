import React, { useState } from 'react';
import "../../css/LegalPages.css";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click 'Sign Up' in the top right corner. Choose your role (Student, Parent, Teacher), enter your information, and verify your email. For students under 13, a parent must create and manage the account."
        },
        {
          q: "Is there a free trial?",
          a: "Yes! Our Free Tier is permanently free with access to 7 educational games and basic features. Premium ($9.99/month) and Family ($19.99/month) plans offer 14-day free trials with full access—no credit card required."
        },
        {
          q: "What devices are supported?",
          a: "KiVO works on any modern web browser (Chrome, Safari, Firefox, Edge) on desktop, laptop, tablet, or smartphone. Native iOS and Android apps are coming soon!"
        },
        {
          q: "Can multiple children use one account?",
          a: "Students need individual accounts for personalized learning. The Family Plan ($19.99/month) supports up to 4 children under one parent account with easy switching."
        }
      ]
    },
    {
      category: "Subscription & Billing",
      questions: [
        {
          q: "What's included in each plan?",
          a: "<strong>Free Tier:</strong> 7 games, basic assessments, limited AI features<br/><strong>Premium ($9.99/month):</strong> All 12 games, unlimited AI worksheets, predictive learning, 1 student<br/><strong>Family ($19.99/month):</strong> Everything in Premium for up to 4 students, parent dashboard, family sharing"
        },
        {
          q: "How do I cancel my subscription?",
          a: "Go to Settings > Subscription > Cancel Subscription. You'll retain access until the end of your current billing period. No partial refunds, but you can reactivate anytime."
        },
        {
          q: "Do you offer school/district pricing?",
          a: "Yes! Schools get custom pricing starting at $5 per student for 100+ students. Contact us at contact@kobytetechnologies.com for a quote and demo."
        },
        {
          q: "Can I switch from Premium to Family plan?",
          a: "Absolutely! Upgrade anytime in Settings > Subscription. You'll be charged the prorated difference, and all student data carries over seamlessly."
        }
      ]
    },
    {
      category: "Features & Learning",
      questions: [
        {
          q: "What is Predictive AI Learning?",
          a: "Our proprietary AI analyzes student performance patterns to predict learning gaps 2-3 weeks before they occur. You'll get early alerts with specific intervention recommendations."
        },
        {
          q: "How does the AI Worksheet Generator work?",
          a: "Select a topic, grade level, and difficulty. Our GPT-4 powered system instantly generates custom worksheets with unlimited variations. Download as PDF or print directly."
        },
        {
          q: "Are the games actually educational?",
          a: "Yes! Each game is designed by educators and aligns with K-12 curriculum standards. Kids learn math, reading, science, and critical thinking while having fun."
        },
        {
          q: "What subjects are covered?",
          a: "Math (Pre-K to Algebra II), English Language Arts (phonics to essay writing), Science (elementary concepts), Social Studies, and Life Skills. More subjects added regularly!"
        },
        {
          q: "Can my child learn at their own pace?",
          a: "Definitely! KiVO is self-paced by design. The AI adapts difficulty in real-time, so students are always challenged but never overwhelmed."
        }
      ]
    },
    {
      category: "For Parents",
      questions: [
        {
          q: "How do I monitor my child's progress?",
          a: "The Parent Dashboard shows real-time activity, completed lessons, time spent, and performance trends. You'll also receive weekly email summaries."
        },
        {
          q: "What if my child is struggling?",
          a: "The AI sends predictive alerts when it detects potential struggles. You'll get specific recommendations like 'Practice multiplication for 15 minutes' with linked resources."
        },
        {
          q: "Can I set screen time limits?",
          a: "Yes! Set daily/weekly time limits, schedule learning sessions, and block access during certain hours (e.g., bedtime) in Settings > Parental Controls."
        },
        {
          q: "Is my child's data safe?",
          a: "Absolutely. We're COPPA and FERPA compliant. We never sell data, show ads, or share information without consent. All data is encrypted and stored securely."
        }
      ]
    },
    {
      category: "For Teachers",
      questions: [
        {
          q: "How long does grading take?",
          a: "Most assignments are auto-graded instantly. Essay questions use AI scoring that you can review/override. Average time saved: 10+ hours per week."
        },
        {
          q: "Can I create my own assessments?",
          a: "Yes! Use our Assessment Builder or AI Worksheet Generator. Upload your existing materials (PDF/Word) and we'll digitize them with auto-grading."
        },
        {
          q: "How do I differentiate instruction?",
          a: "The AI automatically recommends personalized assignments based on each student's level. You can also manually assign different content to different groups."
        },
        {
          q: "Does KiVO integrate with my LMS?",
          a: "We integrate with Google Classroom, Canvas, Schoology, and Clever. Student rosters sync automatically, and grades can be exported to your grade book."
        }
      ]
    },
    {
      category: "Technical & Support",
      questions: [
        {
          q: "What if I forget my password?",
          a: "Click 'Forgot Password' on the login page. Enter your email, and we'll send a reset link. Check your spam folder if you don't see it within 5 minutes."
        },
        {
          q: "Does KiVO work offline?",
          a: "Premium users can download lessons for offline use. Progress syncs automatically when you reconnect to the internet."
        },
        {
          q: "I found a bug. How do I report it?",
          a: "Click the 'Report Issue' button (bottom right corner) or email contact@kobytetechnologies.com with details. We respond within 24 hours."
        },
        {
          q: "Can I export my data?",
          a: "Yes! Go to Settings > Data & Privacy > Export Data. You'll receive a downloadable file with all your information within 48 hours."
        }
      ]
    },
    {
      category: "Privacy & Safety",
      questions: [
        {
          q: "Is KiVO safe for young children?",
          a: "Absolutely. We're COPPA certified for users under 13. No ads, no social media integrations, no third-party tracking. Moderated multiplayer only in safe, age-appropriate games."
        },
        {
          q: "Can my child chat with other users?",
          a: "No. We don't offer open chat to protect children. Multiplayer games use pre-set messages only (like 'Good game!' or 'Nice move!')."
        },
        {
          q: "Who can see my child's data?",
          a: "Only authorized users (parent, teacher, school admin with permission). We never share data with third parties except anonymized research (opt-in only)."
        }
      ]
    }
  ];

  return (
    <section id="faq" className="section">
      <div className="container">
        <div className="content">
          <div className="text-section">

            <h1 className="section-heading">Frequently Asked Questions</h1>

            <div className="privacy-intro">
              <p>
                Have questions about KiVO Learning International? We've got answers! Browse our most
                common questions below, or contact us at{' '}
                <a href="mailto:contact@kobytetechnologies.com">contact@kobytetechnologies.com</a>.
              </p>
            </div>

            {faqs.map((category, catIndex) => (
              <div key={catIndex} className="privacy-section">
                <h2>{category.category}</h2>
                {category.questions.map((item, qIndex) => {
                  const index = `${catIndex}-${qIndex}`;
                  const isOpen = openIndex === index;

                  return (
                    <div
                      key={qIndex}
                      style={{
                        marginBottom: '1rem',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div
                        onClick={() => toggleFAQ(index)}
                        style={{
                          padding: '1rem 1.5rem',
                          background: isOpen ? '#f0f7ff' : '#f8f9fa',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontWeight: '600',
                          color: '#2c3e50',
                          transition: 'background 0.3s ease'
                        }}
                      >
                        <span>{item.q}</span>
                        <span style={{
                          fontSize: '1.5rem',
                          color: '#1e90ff',
                          transition: 'transform 0.3s ease',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>
                          ▼
                        </span>
                      </div>
                      {isOpen && (
                        <div
                          style={{
                            padding: '1.5rem',
                            background: 'white',
                            color: '#555',
                            lineHeight: '1.8',
                            borderTop: '1px solid #e0e0e0'
                          }}
                          dangerouslySetInnerHTML={{ __html: item.a }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Still Have Questions? */}
            <div style={{
              marginTop: '3rem',
              padding: '2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'white'
            }}>
              <h2 style={{ color: 'white', marginBottom: '1rem' }}>
                Still Have Questions?
              </h2>
              <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'white' }}>
                Our support team is here to help! Get in touch and we'll respond within 24 hours.
              </p>
              <a href="mailto:contact@kobytetechnologies.com" style={{
                display: 'inline-block',
                padding: '12px 30px',
                backgroundColor: 'white',
                color: '#667eea',
                textDecoration: 'none',
                borderRadius: '5px',
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}>
                Contact Support
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
