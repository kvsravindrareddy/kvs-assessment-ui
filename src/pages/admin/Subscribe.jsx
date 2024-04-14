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

    const [countryOptions, setCountryOptions] = useState([]); // State for country code options
    const [formSubmitted, setFormSubmitted] = useState(false); // State for form submission status

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const countryResponse = await axios.get(`${CONFIG.development.ADMIN_BASE_URL}/country`);
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
    
            const subRes = await axios.post(`${CONFIG.development.ADMIN_BASE_URL}/subscribe`, formData);
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
            <div className="subscribe-header">
                <h2>Subscribe to KOBS Technologies News and Updates</h2>
            </div>
            <p>Stay informed with the latest news, new features, and updates about KOBS Technologies. By subscribing, you'll receive timely notifications straight to your inbox, keeping you up-to-date with our innovations and developments.</p>
            {!formSubmitted ? (
                <div>
                    <form onSubmit={handleSubmit} className="subscribe-form">
                        <table>
                            <tbody>
                                <tr>
                                    <td><label>First Name</label></td>
                                    <td><input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required /></td>
                                </tr>
                                <tr>
                                    <td><label>Middle Name</label></td>
                                    <td><input type="text" name="middleName" value={formData.middleName} onChange={handleChange} /></td>
                                </tr>
                                <tr>
                                    <td><label>Last Name</label></td>
                                    <td><input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required /></td>
                                </tr>
                                <tr>
                                    <td><label>Email</label></td>
                                    <td><input type="email" name="email" value={formData.email} onChange={handleChange} required /></td>
                                </tr>
                                <tr>
                                    <td><label>Country Code</label></td>
                                    <td><Select options={countryOptions} onChange={handleCountryChange} required /></td>
                                </tr>
                                <tr>
                                    <td><label>Mobile Number</label></td>
                                    <td><input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} /></td>
                                </tr>
                                <tr>
                                    <td><label>Notification Type</label></td>
                                    <td><input type="text" name="notificationType" value={formData.notificationType} onChange={handleChange} /></td>
                                </tr>
                                <tr>
                                    <td><label>Subscription Type</label></td>
                                    <td><input type="text" name="subscriptionType" value={formData.subscriptionType} onChange={handleChange} /></td>
                                </tr>
                                <tr>
                                    <td><label>Update Type</label></td>
                                    <td>
                                        <select name="updateType" value={formData.updateType} onChange={handleChange}>
                                            {updateTypeOptions.map((option, index) => (
                                                <option key={index} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td><button type="submit">Subscribe</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </form>
                </div>
            ) : (
                <div>
                    {subResponse.status && (
                        <div>
                            <h3>Subscription Status</h3>
                            <p>First Name {subResponse.firstName}</p>
                            <p>Last Name {subResponse.lastName}</p>
                            <p>Email {subResponse.email}</p>
                            <p>Status {subResponse.status}</p>
                            <p>Message {subResponse.message}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Subscribe;
