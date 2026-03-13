import React from 'react';
import "../../css/LegalPages.css";

const SuccessStories = () => {
  const stories = [
    {
      name: "Emma, 3rd Grader",
      role: "Student",
      quote: "I used to hate math but now I play Math Ninjas every day! My teacher says I went from a C to an A in 3 months. The AI helps me when I'm stuck and the games make learning feel like playing!",
      impact: "Grade improvement: C → A (3 months)",
      emoji: "🎓"
    },
    {
      name: "Michael Chen",
      role: "Parent of 2",
      quote: "As a working parent, KiVO gives me peace of mind. I get alerts when my kids struggle BEFORE it becomes a problem. The Family Plan for both kids is cheaper than one tutoring session. Best education investment we've made.",
      impact: "Saved $200/month on tutoring",
      emoji: "👨‍👩‍👧‍👦"
    },
    {
      name: "Mrs. Rodriguez",
      role: "4th Grade Teacher",
      quote: "KiVO saves me 12 hours per week on grading. I finally have time to actually TEACH instead of paperwork. The predictive AI warned me about 3 students who were falling behind—I intervened early and all 3 caught up.",
      impact: "12 hours/week saved, 3 students rescued",
      emoji: "👩‍🏫"
    },
    {
      name: "Liam, 7th Grader",
      role: "Student",
      quote: "I have dyslexia and reading was always hard. KiVO's audio features and dyslexia-friendly fonts changed everything. I read 50 stories last month! My reading level jumped 2 grades in one year.",
      impact: "Reading level: +2 grades (1 year)",
      emoji: "📚"
    },
    {
      name: "Sarah Johnson",
      role: "Single Mother",
      quote: "KiVO is like having a personal tutor that costs $10/month instead of $50/hour. My daughter logs in every day on her own because she actually enjoys it. Her confidence in school has skyrocketed.",
      impact: "Daily engagement, confidence boost",
      emoji: "💪"
    },
    {
      name: "Dr. Patel",
      role: "Principal, Lincoln Elementary",
      quote: "We implemented KiVO district-wide last year. Standardized test scores increased 18% on average. Teachers love the time savings. Parents love the transparency. This is the future of education.",
      impact: "18% test score improvement (district-wide)",
      emoji: "🏫"
    },
    {
      name: "Olivia, 5th Grader",
      role: "Student",
      quote: "The AI Study Buddy is like having a friend who's always there to help. It remembers what I struggle with and gives me extra practice. I got 100% on my last science test!",
      impact: "Perfect score on last test",
      emoji: "🌟"
    },
    {
      name: "James & Lisa Martinez",
      role: "Parents of 4",
      quote: "With 4 kids, homework time was chaos. Now each child has their own personalized path. The predictive alerts let us help before frustration sets in. Family Plan is a lifesaver!",
      impact: "Reduced homework stress for family of 6",
      emoji: "🎉"
    },
    {
      name: "Mr. Thompson",
      role: "High School Math Teacher",
      quote: "I was skeptical about AI in education. KiVO proved me wrong. The adaptive difficulty keeps advanced students challenged while supporting struggling ones. My pass rate went from 82% to 96%.",
      impact: "Pass rate: 82% → 96%",
      emoji: "📊"
    },
    {
      name: "Sophia, 2nd Grader",
      role: "Student",
      quote: "I love the games! Memory Match is my favorite. My mom says I'm getting better at paying attention. I also like the stories—I read 3 yesterday!",
      impact: "Improved focus and reading engagement",
      emoji: "🎮"
    },
    {
      name: "Rachel Kim",
      role: "Homeschool Parent",
      quote: "KiVO is my co-teacher. The AI handles assessment and grading while I focus on teaching. The curriculum guidance ensures I'm not missing any standards. It's like having a teaching assistant 24/7.",
      impact: "Structured homeschool curriculum",
      emoji: "🏡"
    },
    {
      name: "Ethan, 6th Grader",
      role: "Student",
      quote: "I was always behind in reading. The AI noticed I liked sports, so it gave me sports stories to read. Now reading is actually fun! I finished 30 books this year!",
      impact: "30 books read (personalized interest)",
      emoji: "⚽"
    }
  ];

  const stats = [
    { number: "89%", label: "of students report increased confidence" },
    { number: "23%", label: "average test score improvement" },
    { number: "10+ hours", label: "saved per teacher per week" },
    { number: "4.8/5", label: "average parent rating" },
    { number: "67%", label: "reduction in learning gaps" },
    { number: "93%", label: "teacher satisfaction rate" }
  ];

  return (
    <section id="success-stories" className="section">
      <div className="container">
        <div className="content">
          <div className="text-section">

            <h1 className="section-heading">Success Stories</h1>

            <div className="privacy-intro">
              <p>
                Real families, real teachers, real results. See how KiVO Learning International is
                transforming education for thousands of students across the country.
              </p>
            </div>

            {/* Impact Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              margin: '2rem 0 3rem 0'
            }}>
              {stats.map((stat, index) => (
                <div key={index} style={{
                  background: 'linear-gradient(135deg, #1e90ff 0%, #4169e1 100%)',
                  color: 'white',
                  padding: '2rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(30, 144, 255, 0.3)'
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    marginBottom: '0.5rem'
                  }}>
                    {stat.number}
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    opacity: 0.9
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Student Stories */}
            <div className="privacy-section">
              <h2>👨‍🎓 Student Success</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginTop: '1.5rem'
              }}>
                {stories.filter(s => s.role === 'Student').map((story, index) => (
                  <div key={index} style={{
                    background: '#f8f9fa',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    borderLeft: '4px solid #1e90ff',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{story.emoji}</div>
                    <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: '#555' }}>
                      "{story.quote}"
                    </p>
                    <div style={{ fontWeight: '600', color: '#1e90ff', marginBottom: '0.5rem' }}>
                      — {story.name}
                    </div>
                    <div style={{
                      background: '#e3f2fd',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      color: '#1976d2',
                      fontWeight: '600'
                    }}>
                      📈 {story.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parent Stories */}
            <div className="privacy-section">
              <h2>👨‍👩‍👧‍👦 Parent Testimonials</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginTop: '1.5rem'
              }}>
                {stories.filter(s => s.role.includes('Parent')).map((story, index) => (
                  <div key={index} style={{
                    background: '#f8f9fa',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    borderLeft: '4px solid #ff8c00',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{story.emoji}</div>
                    <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: '#555' }}>
                      "{story.quote}"
                    </p>
                    <div style={{ fontWeight: '600', color: '#ff8c00', marginBottom: '0.5rem' }}>
                      — {story.name}
                    </div>
                    <div style={{
                      background: '#fff3e0',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      color: '#e65100',
                      fontWeight: '600'
                    }}>
                      📈 {story.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher & School Stories */}
            <div className="privacy-section">
              <h2>👩‍🏫 Educator Impact</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginTop: '1.5rem'
              }}>
                {stories.filter(s => s.role.includes('Teacher') || s.role.includes('Principal')).map((story, index) => (
                  <div key={index} style={{
                    background: '#f8f9fa',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    borderLeft: '4px solid #4caf50',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{story.emoji}</div>
                    <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: '#555' }}>
                      "{story.quote}"
                    </p>
                    <div style={{ fontWeight: '600', color: '#4caf50', marginBottom: '0.5rem' }}>
                      — {story.name}, {story.role}
                    </div>
                    <div style={{
                      background: '#e8f5e9',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      color: '#2e7d32',
                      fontWeight: '600'
                    }}>
                      📈 {story.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Testimonials (Placeholder) */}
            <div className="privacy-section">
              <h2>🎥 Video Testimonials (Coming Soon!)</h2>
              <p>
                We're collecting video testimonials from families and educators. Check back soon
                to see real people share their KiVO experiences!
              </p>
            </div>

            {/* Join the Success */}
            <div style={{
              marginTop: '3rem',
              padding: '2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'white'
            }}>
              <h2 style={{ color: 'white', marginBottom: '1rem' }}>
                🌟 Be the Next Success Story
              </h2>
              <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'white' }}>
                Join thousands of families transforming education with AI-powered learning.
              </p>
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
                Start Your Journey Free
              </a>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'white', opacity: 0.9 }}>
                Have a success story to share?{' '}
                <a href="mailto:contact@kobytetechnologies.com" style={{ color: 'white', textDecoration: 'underline' }}>
                  Tell us about it!
                </a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
