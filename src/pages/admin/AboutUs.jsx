import React from 'react';
import "../../css/AboutUs.css";
import aboutuseduimg from "../../images/aboutusedu.jpeg";

const AboutUs = () => {
  return (
    <section id="about-us" className="section">
      <div className="container">
        <div className="content">
          <div className='text-section'>
            <div className='about-kobs'>
                <h2 className="section-heading">About KOBS Technologies</h2>
                <p>Welcome to Kob's Technologies, your one-stop destination for innovative educational resources tailored for young learners. At Kob's Technologies, we believe in harnessing the power of technology to revolutionize the way children learn, grow, and succeed academically.</p>
            </div>
            <div className='our-mission'>
                <h3 className="subsection-heading">Our Mission</h3>
                <p>Our mission at Kob's Technologies is to empower educators, parents, and students alike with dynamic tools and resources that enhance the learning experience. We strive to foster a love for learning by providing engaging, interactive content that inspires curiosity and critical thinking skills.</p>
            </div>
            <div className='what-we-offer'>
                <div className='what-we-offer-content'>
                <h3 className="subsection-heading">What We Offer</h3>
                    <p>Worksheet Downloads: Explore our extensive collection of downloadable worksheets designed to supplement classroom learning and reinforce key concepts across various subjects and grade levels.</p>
                    <p>Online Assessments: Assess student progress and comprehension with our interactive online assessments, offering instant feedback to both students and educators.</p>
                    <p>Material Downloads: Access a wealth of educational materials curated by experts to support teaching and learning objectives, including lesson plans, study guides, and more.</p>
                    <p>Create Your Own Q&A: Unleash creativity and customization with our innovative tool that allows educators and parents to create personalized questions and answers tailored to individual learning needs.</p>
                </div>
                <div className='what-we-offer-img'>
                    <img src={aboutuseduimg} alt="About Us" className="about-us-image float-right" />
                </div>
            </div>
            <div className='get-in-touch'>
                <h3 className="subsection-heading">Get in Touch</h3>
                <p>Join us in our mission to revolutionize education through technology. Explore the possibilities with KOBS Technologies today.</p>
                <p>Contact us at <a href="mailto:contact@kobstechnologies.com" className="contact-link">contact@kobstechnologies.com</a> for inquiries, feedback, or partnership opportunities.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
