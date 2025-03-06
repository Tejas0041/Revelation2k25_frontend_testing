import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./css/Layout.css";
import "./css/Profile.css";
import { API_URL } from './config/config';

const Profile = ({ setToken }) => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const userResponse = await axios.get(`${API_URL}/api/auth/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setUserData(userResponse.data.user);
        console.log(userResponse.data.user);
        setEditForm({
          name: userResponse.data.user.name,
          phoneNumber: userResponse.data.user.phoneNumber || ''
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    try {
      const response = await axios.put(
        `${API_URL}/api/users/update-profile`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUserData(response.data.user);
      setIsEditing(false);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  const renderRegisteredEvents = () => (
    <div className="registered-events">
      <h3>My Registrations</h3>
      <div className="events-list">
        {userData.eventsRegistered.map(reg => (
          console.log(reg),
          <div key={reg.id._id} className="registered-event-card" onClick={() => navigate(`/event/${reg.id._id}`)}>
            <div className="event-info">
              <h4>{reg.id.name}</h4>
              <p className="registration-type">
                {reg.team === true ? (
                  <>
                    <span className="team-label">Team:</span> {reg.teamId.name}
                  </>
                ) : (
                  <span className="individual-label">Individual Registration</span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return <div>Loading...</div>;
  if (!userData) return <div>Error loading profile</div>;

  return (
    <div>
      <header className="header">
        <h2>Revelation 2k25</h2>
        <nav className="nav-links">
          <Link to="/home">Home</Link>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </nav>
      </header>

      <div className="profile-page">
        <div className="profile-info">
          <div className="profile-header">
            {userData.picture && (
              <img 
                src={userData.picture} 
                alt="Profile" 
                className="profile-picture"
              />
            )}
            <h1 className="profile-name">{userData.name}</h1>
            <span className={`institute-badge ${userData.email.endsWith('@students.iiests.ac.in') ? 'iiestian' : 'non-iiestian'}`}>
              {userData.email.endsWith('@students.iiests.ac.in') ? 'IIESTian' : 'Non-IIESTian'}
            </span>
          </div>

          {!isEditing ? (
            <>
              <div className="profile-details">
                <div className="profile-field">
                  <strong>Email:</strong>
                  <span>{userData.email}</span>
                </div>
                <div className="profile-field">
                  <strong>Phone:</strong>
                  <span>{userData.phoneNumber || 'Not set'}</span>
                </div>
              </div>
              <button 
                className="edit-profile-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </>
          ) : (
            <form onSubmit={handleEditSubmit} className="edit-profile-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    phoneNumber: e.target.value
                  }))}
                  pattern="[0-9]{10}"
                  placeholder="Enter 10-digit phone number"
                />
              </div>
              {error && <p className="error">{error}</p>}
              <div className="form-actions">
                <button type="submit" className="save-btn">Save Changes</button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setIsEditing(false);
                    setError('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {userData.eventsRegistered.length > 0 && renderRegisteredEvents()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
