import React from 'react';
import "../../css/LegalPages.css";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section">
      <div className="container">
        <div className="content">
          <div className="text-section">

            <h1 className="section-heading">How It Works</h1>

            <div className="privacy-intro">
              <p>
                KiVO Learning International makes personalized, AI-powered education simple and accessible
                for students, parents, teachers, and schools. Here's how our platform works step-by-step.
              </p>
            </div>

            {/* For Students */}
            <div className="privacy-section">
              <h2>👨‍🎓 For Students: Your Learning Journey</h2>

              <h3>Step 1: Sign Up & Personalize</h3>
              <ul>
                <li><strong>Create Your Profile:</strong> Tell us your name, grade level, and favorite subjects</li>
                <li><strong>Meet Your AI Study Buddy:</strong> Get introduced to your personal learning companion</li>
                <li><strong>Take the Placement Assessment:</strong> Quick 10-minute test to understand your current level</li>
                <li><strong>Set Your Goals:</strong> What do you want to achieve? Better grades? Master multiplication?</li>
              </ul>

              <h3>Step 2: Start Learning</h3>
              <ul>
                <li><strong>Daily Learning Path:</strong> AI creates a personalized curriculum just for you</li>
                <li><strong>Interactive Lessons:</strong> Video tutorials, practice problems, and games</li>
                <li><strong>Real-time Feedback:</strong> Instant corrections and hints when you're stuck</li>
                <li><strong>Adaptive Difficulty:</strong> Content adjusts based on how you're doing</li>
              </ul>

              <h3>Step 3: Play & Practice</h3>
              <ul>
                <li><strong>Educational Games:</strong> 12 AAA-quality games (7 free, 5 premium)</li>
                <li><strong>Reading Adventures:</strong> 1,200+ interactive stories tailored to your level</li>
                <li><strong>Math Challenges:</strong> Compete with yourself or friends in safe multiplayer</li>
                <li><strong>Creative Projects:</strong> Build, draw, and explore with AI-powered tools</li>
              </ul>

              <h3>Step 4: Track & Celebrate</h3>
              <ul>
                <li><strong>Progress Dashboard:</strong> See your improvements in real-time</li>
                <li><strong>Achievement Badges:</strong> Unlock rewards for milestones and streaks</li>
                <li><strong>Share Success:</strong> Show parents and friends what you've accomplished</li>
                <li><strong>AI Predictions:</strong> Get early alerts if you need extra help in a topic</li>
              </ul>
            </div>

            {/* For Parents */}
            <div className="privacy-section">
              <h2>👨‍👩‍👧‍👦 For Parents: Stay Connected & Informed</h2>

              <h3>Step 1: Set Up Family Account</h3>
              <ul>
                <li><strong>Create Parent Profile:</strong> One account manages up to 4 children (Family Plan)</li>
                <li><strong>Add Child Accounts:</strong> Set up profiles for each child with age-appropriate content</li>
                <li><strong>Choose Subscription:</strong> Free, Premium ($9.99/month), or Family ($19.99/month)</li>
                <li><strong>Set Learning Goals:</strong> Define what you want your child to achieve</li>
              </ul>

              <h3>Step 2: Monitor Progress</h3>
              <ul>
                <li><strong>Parent Dashboard:</strong> Real-time view of each child's activity and performance</li>
                <li><strong>Weekly Reports:</strong> Automatic email summaries of achievements and challenges</li>
                <li><strong>Predictive Alerts:</strong> Get notified 2-3 weeks before learning gaps develop</li>
                <li><strong>Holistic Insights:</strong> Track academic, emotional, social, physical, and creative growth</li>
              </ul>

              <h3>Step 3: Support Learning</h3>
              <ul>
                <li><strong>AI Recommendations:</strong> Get specific suggestions on how to help at home</li>
                <li><strong>Parent Guide:</strong> Access explanations of what your child is learning</li>
                <li><strong>Communication Tools:</strong> Message teachers and view assignments</li>
                <li><strong>Screen Time Controls:</strong> Set daily/weekly usage limits and schedules</li>
              </ul>

              <h3>Step 4: Celebrate & Share</h3>
              <ul>
                <li><strong>Achievement Cards:</strong> Auto-generated social media graphics for milestones</li>
                <li><strong>Parent-Child Challenges:</strong> Fun competitions to engage together</li>
                <li><strong>Monthly Celebrations:</strong> Recognize progress with digital certificates</li>
                <li><strong>Referral Rewards:</strong> Earn discounts by inviting other families</li>
              </ul>
            </div>

            {/* For Teachers */}
            <div className="privacy-section">
              <h2>👩‍🏫 For Teachers: Save Time, Teach Better</h2>

              <h3>Step 1: Classroom Setup</h3>
              <ul>
                <li><strong>Create Teacher Account:</strong> Free for educators with school email</li>
                <li><strong>Build Your Classes:</strong> Add students manually or import from CSV</li>
                <li><strong>Sync with LMS:</strong> Optional integration with Google Classroom, Canvas, etc.</li>
                <li><strong>Customize Settings:</strong> Tailor content and difficulty for your curriculum</li>
              </ul>

              <h3>Step 2: Assign & Manage</h3>
              <ul>
                <li><strong>One-Click Assignments:</strong> Choose from 5,000+ pre-made assessments</li>
                <li><strong>AI Worksheet Generator:</strong> Create unlimited custom worksheets instantly</li>
                <li><strong>Auto-Grading:</strong> 95% of grading done automatically—save 10+ hours/week</li>
                <li><strong>Differentiation Made Easy:</strong> AI suggests personalized assignments per student</li>
              </ul>

              <h3>Step 3: Track & Analyze</h3>
              <ul>
                <li><strong>Class Dashboard:</strong> See every student's progress at a glance</li>
                <li><strong>Analytics Reports:</strong> Identify class-wide trends and individual outliers</li>
                <li><strong>Predictive Warnings:</strong> Get alerts for students at risk 2-3 weeks early</li>
                <li><strong>Standards Alignment:</strong> Track mastery of Common Core/state standards</li>
              </ul>

              <h3>Step 4: Communicate Results</h3>
              <ul>
                <li><strong>Parent Reports:</strong> Auto-generated summaries with one-click sharing</li>
                <li><strong>Progress Conferences:</strong> Data-driven talking points for parent meetings</li>
                <li><strong>Admin Reports:</strong> School-level analytics for leadership</li>
                <li><strong>Intervention Plans:</strong> AI-generated recommendations for struggling students</li>
              </ul>
            </div>

            {/* For Schools */}
            <div className="privacy-section">
              <h2>🏫 For Schools & Districts: Scale with Confidence</h2>

              <h3>Step 1: Enterprise Onboarding</h3>
              <ul>
                <li><strong>Contact Sales:</strong> Custom pricing for 100+ students</li>
                <li><strong>Implementation Team:</strong> Dedicated support for setup and training</li>
                <li><strong>Data Migration:</strong> We import existing student rosters and records</li>
                <li><strong>SSO Integration:</strong> Single sign-on with your school's authentication system</li>
              </ul>

              <h3>Step 2: Teacher Training</h3>
              <ul>
                <li><strong>PD Workshops:</strong> Live or recorded professional development sessions</li>
                <li><strong>Certification Program:</strong> Recognize KiVO-certified educators</li>
                <li><strong>Ongoing Support:</strong> Dedicated account manager and help desk</li>
                <li><strong>Community Forum:</strong> Share best practices with other schools</li>
              </ul>

              <h3>Step 3: District-Wide Analytics</h3>
              <ul>
                <li><strong>Admin Dashboard:</strong> Bird's-eye view of all schools and classrooms</li>
                <li><strong>Usage Reports:</strong> Track adoption rates and engagement</li>
                <li><strong>Outcome Tracking:</strong> Measure impact on test scores and attendance</li>
                <li><strong>Budget Planning:</strong> ROI calculator and cost-per-student analytics</li>
              </ul>

              <h3>Step 4: Continuous Improvement</h3>
              <ul>
                <li><strong>Quarterly Reviews:</strong> Check-ins with implementation team</li>
                <li><strong>Feature Requests:</strong> Influence product roadmap with your needs</li>
                <li><strong>Research Partnerships:</strong> Collaborate on efficacy studies</li>
                <li><strong>Co-Marketing:</strong> Showcase your success as a case study</li>
              </ul>
            </div>

            {/* Technical Details */}
            <div className="privacy-section">
              <h2>⚙️ Behind the Scenes: The Technology</h2>

              <h3>AI Learning Engine</h3>
              <ul>
                <li><strong>Predictive Models:</strong> Machine learning analyzes 50+ data points per student</li>
                <li><strong>Adaptive Algorithms:</strong> Real-time difficulty adjustments based on performance</li>
                <li><strong>Natural Language Processing:</strong> Understands student questions and provides help</li>
                <li><strong>Emotion Recognition:</strong> Detects frustration/boredom and adapts accordingly</li>
              </ul>

              <h3>Content Delivery</h3>
              <ul>
                <li><strong>Multi-Platform:</strong> Works on web, iOS, Android (coming soon)</li>
                <li><strong>Offline Mode:</strong> Download lessons for learning without internet</li>
                <li><strong>Accessibility:</strong> Screen readers, closed captions, dyslexia-friendly fonts</li>
                <li><strong>Multi-Language:</strong> Support for 15+ languages (growing)</li>
              </ul>

              <h3>Data & Privacy</h3>
              <ul>
                <li><strong>Encryption:</strong> Military-grade SSL/TLS for all data transmission</li>
                <li><strong>COPPA Compliant:</strong> Strict children's privacy protections</li>
                <li><strong>FERPA Compliant:</strong> Educational records handled per federal law</li>
                <li><strong>No Ads:</strong> We never sell data or show ads to students</li>
              </ul>
            </div>

            {/* Getting Started */}
            <div style={{
              marginTop: '3rem',
              padding: '2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'white'
            }}>
              <h2 style={{ color: 'white', marginBottom: '1rem' }}>
                🚀 Ready to Get Started?
              </h2>
              <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'white' }}>
                Sign up in 2 minutes. No credit card required for Free Tier.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="/signup" style={{
                  display: 'inline-block',
                  padding: '12px 30px',
                  backgroundColor: 'white',
                  color: '#667eea',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}>
                  Start Learning Free
                </a>
                <a href="/contact" style={{
                  display: 'inline-block',
                  padding: '12px 30px',
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '2px solid white',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}>
                  Talk to Sales
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
