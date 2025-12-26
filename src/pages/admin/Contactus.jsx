import React, { useState } from "react";
import axios from "axios";
import "../../css/styles.css";
import "../../css/ContactUs.css";
import CONFIG from "../../Config";

const Contactus = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });

    const [submitMessage, setSubmitMessage] = useState('');
    const [messageCharsLeft, setMessageCharsLeft] = useState(2000);
    const [formValid, setFormValid] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        let updatedValue = value;

        // Check if message length is greater than 2000 characters
        if (name === 'message' && value.length > 2000) {
            updatedValue = value.substring(0, 2000);
        }

        setFormData({
            ...formData,
            [name]: updatedValue
        });
        setMessageCharsLeft(2000 - updatedValue.length);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Check if any required field is empty
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            setFormValid(false);
            setErrorMessage('Please fill out all required fields.');
            return;
        }

        // Form is valid, proceed with submission
        try {
            const response = await axios.post(`${CONFIG.development.ADMIN_SUPPORT_BASE_URL}/contactus`, formData);
            setSubmitMessage(response.data);

            // Clear form data
            setFormData({
                name: "",
                email: "",
                phone: "",
                subject: "",
                message: ""
            });
            setMessageCharsLeft(2000);
            setFormValid(true); // Reset form validity
            setErrorMessage(''); // Reset error message
        }
        catch (error) {
            console.error("Failed to submit contact form: ", error);
            setSubmitMessage('Failed to submit contact us form. Please try again later.');
        }
    };

    return (
        <div className="contact-page">
            <div className="contact-container">
                <div className="contact-info">
                    <h2>Contact Us</h2>
                    <p>
                        You can contact us via email for any inquiries or support you may need.
                    </p>
                    <p>Email: <a href="mailto:contact@kobstechnologies.com">contact@kobstechnologies.com</a></p>
                </div>
                <div className="contact-form-container">
                    <h2>Submit the enquiry Form</h2>
                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-group">
                            <label htmlFor="name">Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                                title="Please enter a valid email address."
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Phone</label>
                            <input
                                type="text"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="subject">Subject *</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="message">Message *</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="5"
                                maxLength="2000"
                                required
                            />
                            <div className="char-count">{messageCharsLeft} characters left</div>
                        </div>
                        <div className="form-group">
                            <button type="submit">Submit</button>
                        </div>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        {submitMessage && <p className="success-message">{submitMessage}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contactus;
