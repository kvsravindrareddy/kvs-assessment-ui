import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/styles.css';
import Select from 'react-select';

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
        updateType: '',
        customerIp: ''
    });

    const [subResponse, setSubResponse] = useState({
        firstName: '',
        lastName: '',
        email: '',
        status: '',
        message: ''
    });

    const [countryOptions, setCountryOptions] = useState([]); // State for country code optios
    const [formSubmitted, setFormSubmitted] = useState(false); // State for form submission status

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const countryResponse = await axios.get('http://69.127.132.13:9003/country');
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
            [event.target.name]: event.target.value
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
    
            const subRes = await axios.post('http://69.127.132.13:9003/subscribe', formData);
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
    

    const updateTypeOptions = ['Daily', 'Weekly', 'Monthly'];

    return (
        <div>
            {!formSubmitted ? (
                <div>
            <h2>Subscribe</h2>
            <form onSubmit={handleSubmit} className="subscribe-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>
                            First Name: 
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Middle Name: 
                            <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} />
                        </label>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>
                            Last Name: 
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Email: 
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </label>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>
                            Country Code: 
                            <Select options={countryOptions} onChange={handleCountryChange} required />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Mobile Number: 
                            <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} />
                        </label>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>
                            Notification Type: 
                            <input type="text" name="notificationType" value={formData.notificationType} onChange={handleChange} />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Subscription Type: 
                            <input type="text" name="subscriptionType" value={formData.subscriptionType} onChange={handleChange} />
                        </label>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>
                            Update Type: 
                            <select name="updateType" value={formData.updateType} onChange={handleChange}>
                                {updateTypeOptions.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div className="form-group">
                        <button type="submit">Subscribe</button>
                    </div>
                </div>
            </form>
            </div>
            ) : (
                <div>
            {subResponse.status && (
                <div>
                    <h3>Subscription Status</h3>
                    <p>First Name: {subResponse.firstName}</p>
                    <p>Last Name: {subResponse.lastName}</p>
                    <p>Email: {subResponse.email}</p>
                    <p>Status: {subResponse.status}</p>
                    <p>Message: {subResponse.message}</p>
                </div>
            )}
            </div>
            )}
        </div>
    );
};

export default Subscribe;