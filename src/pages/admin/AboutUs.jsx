import React, { useEffect, useState } from 'react';
import "../../css/AboutUs.css";
import aboutuseduimg from "../../images/aboutusedu.jpeg";
import CONFIG from '../../Config';

const AboutUs = () => {
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetch(`${CONFIG.development.ADMIN_SUPPORT_BASE_URL}/v1/aboutus/info`)
      .then(res => res.json())
      .then(data => {
        setContent(data.aboutUs);
      })
      .catch(err => {
        console.error("Error fetching About Us content:", err);
      });
  }, []);

  const renderHTML = (htmlString) => (
    <div dangerouslySetInnerHTML={{ __html: htmlString }} />
  );

  return (
    <section id="about-us" className="section">
      <div className="container">
        <div className="content">
          <div className="text-section">

            {/* About KOBS Technologies */}
            {content?.["About KOBS Technologies"] && (
              <div className="about-kobs">
                <h2 className="section-heading">About KOBS Technologies</h2>
                {renderHTML(content["About KOBS Technologies"])}
              </div>
            )}

            {/* Our Mission */}
            {content?.["Our Mission"] && (
              <div className="our-mission">
                <h3 className="subsection-heading">Our Mission</h3>
                {renderHTML(content["Our Mission"])}
              </div>
            )}

            {/* What We Offer */}
            {content?.["What We Offer"] && (
              <div className="what-we-offer">
                <div className="what-we-offer-content">
                  <h3 className="subsection-heading">What We Offer</h3>
                  {renderHTML(content["What We Offer"])}
                </div>
                <div className="what-we-offer-img">
                  <img
                    src={aboutuseduimg}
                    alt="About Us"
                    className="about-us-image float-right"
                  />
                </div>
              </div>
            )}

            {/* Get in Touch */}
            {content?.["Get in Touch"] && (
              <div className="get-in-touch">
                <h3 className="subsection-heading">Get in Touch</h3>
                {renderHTML(content["Get in Touch"])}
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
