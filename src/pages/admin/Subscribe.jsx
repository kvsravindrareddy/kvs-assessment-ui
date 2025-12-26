import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/Subscribe.css';
import Select from 'react-select';
import CONFIG from '../../Config';

const Subscribe = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        countryCode: null,
        mobileNumber: '',
        notificationType: '',
        subscriptionType: '',
        updateType: 'DAILY',
        customerIp: ''
    });

    const [subResponse, setSubResponse] = useState({
        firstName: '',
        lastName: '',
        email: '',
        status: '',
        message: ''
    });

    const [countryOptions, setCountryOptions] = useState([]); // State for country code options
    const [formSubmitted, setFormSubmitted] = useState(false); // State for form submission status

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const countryResponse = await axios.get(`${CONFIG.development.ADMIN_SUPPORT_BASE_URL}/country`);
                setCountryOptions(countryResponse.data.map(country => ({ 
                    label: `${country.name} (${country.dialCode})`,
                    value: country.dialCode 
                })));
            } catch (error) {
                console.error("Failed to fetch countries: ", error);
            }
        };
        fetchCountries();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleCountryChange = (selectedOption) => {  
        setFormData({
            ...formData,
            countryCode: selectedOption.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const ipResponse = await axios.get('https://api.ipify.org?format=json');
            const clientIp = ipResponse.data.ip;
            setFormData({
                ...formData,
                customerIp: clientIp
            });
    
            const subRes = await axios.post(`${CONFIG.development.ADMIN_SUPPORT_BASE_URL}/subscribe`, formData);
            setSubResponse({
                firstName: subRes.data.firstName,
                lastName: subRes.data.lastName,
                email: subRes.data.email,
                status: subRes.data.status,
                message: subRes.data.message
            });
            setFormSubmitted(true);
        } catch (error) {
            console.error("Subscription failed: ", error);
            setSubResponse({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                status: 'FAILED',
                message: 'Subscription failed'
            });
        }
    };
    

    const updateTypeOptions = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'];
    const notificationTypeOptions = ['EMAIL'];
    const subscriptionTypeOptions = ['EDUCATIONAL'];

    return (
        <div className="subscribe-page">
            <div className="subscribe-container">
                <div className="subscribe-info">
                    <h2>Subscribe to Updates</h2>
                    <p>
                        Stay informed with the latest news, new features, and updates about KOBS Technologies.
                        By subscribing, you'll receive timely notifications straight to your inbox, keeping you
                        up-to-date with our innovations and developments.
                    </p>
                    <div className="benefits-list">
                        <p>📧 Email notifications</p>
                        <p>🎓 Educational content</p>
                        <p>🔔 Regular updates</p>
                        <p>✨ Exclusive features</p>
                    </div>
                </div>
                <div className="subscribe-form-container">
                    {!formSubmitted ? (
                        <>
                            <h2>Join Our Community</h2>
                            <form onSubmit={handleSubmit} className="subscribe-form">
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name *</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="middleName">Middle Name</label>
                                    <input
                                        type="text"
                                        id="middleName"
                                        name="middleName"
                                        value={formData.middleName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name *</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
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
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="countryCode">Country Code *</label>
                                    <Select
                                        id="countryCode"
                                        options={countryOptions}
                                        onChange={handleCountryChange}
                                        required
                                        className="country-select"
                                        classNamePrefix="select"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="mobileNumber">Mobile Number</label>
                                    <input
                                        type="text"
                                        id="mobileNumber"
                                        name="mobileNumber"
                                        value={formData.mobileNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="notificationType">Notification Type</label>
                                    <select
                                        id="notificationType"
                                        name="notificationType"
                                        value={formData.notificationType}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select notification type</option>
                                        {notificationTypeOptions.map((option, index) => (
                                            <option key={index} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="subscriptionType">Subscription Type</label>
                                    <select
                                        id="subscriptionType"
                                        name="subscriptionType"
                                        value={formData.subscriptionType}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select subscription type</option>
                                        {subscriptionTypeOptions.map((option, index) => (
                                            <option key={index} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="updateType">Update Frequency</label>
                                    <select
                                        id="updateType"
                                        name="updateType"
                                        value={formData.updateType}
                                        onChange={handleChange}
                                    >
                                        {updateTypeOptions.map((option, index) => (
                                            <option key={index} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <button type="submit">Subscribe Now</button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="subscription-success">
                            <h3>🎉 Subscription Successful!</h3>
                            <p className="success-message">
                                Hello {subResponse.firstName} {subResponse.lastName}, you are {subResponse.message} with email {subResponse.email}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Subscribe;
