import React, { useState } from "react";
import axios from "axios";
import "../../css/styles.css";

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
            const response = await axios.post('http://69.127.132.13:9003/contactus', formData);
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
        <div>
            <table className="contact-container">
                <tbody>
                    <tr>
                        <td className="contact-info">
                            <h2>Contact Us</h2>
                            <p>
                                You can contact us via email for any inquiries or support you may need.
                            </p>
                            <p>Email: <a href="mailto:contact@kobstechnologies.com">contact@kobstechnologies.com</a></p>
                        </td>
                        <td className="contact-form-container">
                            <h2>Submit the enquiry Form</h2>
                            <form onSubmit={handleSubmit} className="contact-form">
                                <tbody>
                                    <tr>
                                        <td>
                                            <label>Name</label>
                                        </td>
                                        <td>
                                            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label>Email</label>
                                        </td>
                                        <td>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} required pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" title="Please enter a valid email address." />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label>Phone</label>
                                        </td>
                                        <td>
                                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label>Subject</label>
                                        </td>
                                        <td>
                                            <input type="text" name="subject" value={formData.subject} onChange={handleChange} required />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label>Message</label>
                                        </td>
                                        <td>
                                            <textarea name="message" value={formData.message} onChange={handleChange} rows="5" maxLength="2000" required />
                                            <div>{messageCharsLeft} characters left</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2">
                                            <button type="submit" onClick={handleSubmit}>Submit</button>
                                        </td>
                                    </tr>
                                </tbody>
                                {errorMessage && <p style={{ color: 'red' }}><b>{errorMessage}</b></p>}
                                {submitMessage && <p style={{ color: 'green' }}><b>{submitMessage}</b></p>}
                            </form>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Contactus;
