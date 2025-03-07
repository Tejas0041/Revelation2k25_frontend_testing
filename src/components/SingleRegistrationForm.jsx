import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/SingleRegistrationForm.css';
import CollapsibleSection from './CollapsibleSection';

const SingleRegistrationForm = ({ eventId, onClose, onRegistrationComplete, registrationAmount, isTeam }) => {
  const [user, setUser] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentImage, setPaymentImage] = useState(null);
  const [error, setError] = useState('');
  const [isIIESTian, setIsIIESTian] = useState(false);
  const [personalDetailsCompleted, setPersonalDetailsCompleted] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const baseUrl= import.meta.env.VITE_API_URL;

  const validatePersonalDetails = () => {
    return user && phoneNumber.length === 10;
  };

  const validatePayment = () => {
    if (isIIESTian) return true;
    return !!paymentImage;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${baseUrl}/api/auth/status`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(response => {
      const userData = response.data.user;
      setUser(userData);
      setIsIIESTian(userData.email.endsWith('@students.iiests.ac.in'));
    }).catch(error => {
      console.error('Error fetching user data:', error);
      setError('Error loading user data');
    });
  }, []);

  useEffect(() => {
    setPersonalDetailsCompleted(validatePersonalDetails());
  }, [user, phoneNumber]);

  useEffect(() => {
    setPaymentCompleted(validatePayment());
  }, [paymentImage, isIIESTian]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setPaymentImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      let formData = new FormData();
      
      const participantData = {
        userId: user._id,
        phoneNumber,
        team: isTeam
      };

      formData.append('participantData', JSON.stringify(participantData));
      
      if (!isIIESTian && paymentImage) {
        formData.append('paymentProof', paymentImage);
      }

      const response = await axios.post(
        `${baseUrl}/api/events/${eventId}/register`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      onRegistrationComplete(response.data.body);
    } catch (error) {
      setError(error.response?.data?.message || 'Error registering');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <form className="registration-form" onSubmit={handleSubmit}>
      <CollapsibleSection 
        title="Personal Details" 
        isOpen={true}
        isCompleted={personalDetailsCompleted}
      >
        <div className="user-info">
          <img src={user.picture} alt={user.name} className="user-avatar" />
          <div>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            pattern="[0-9]{10}"
            placeholder="Enter 10-digit phone number"
          />
        </div>
      </CollapsibleSection>

      {!isIIESTian && (
        <CollapsibleSection 
          title="Payment Details"
          isOpen={personalDetailsCompleted}
          isCompleted={paymentCompleted}
        >
          <div className="payment-section">
            <h4>Payment Details</h4>
            <p>Registration Amount: ₹{registrationAmount}</p>
            <img 
              src="/path/to/qr-code.png" // Replace with actual QR code image path
              alt="Payment QR Code"
              className="qr-code"
            />
            <div className="form-group">
              <label>Upload Payment Screenshot</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                required
              />
            </div>
          </div>
        </CollapsibleSection>
      )}

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button 
          type="submit"
          disabled={!personalDetailsCompleted || !paymentCompleted}
        >
          Complete Registration
        </button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

export default SingleRegistrationForm;
