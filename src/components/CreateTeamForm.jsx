import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PaymentSection from './PaymentSection';
import CollapsibleSection from './CollapsibleSection';
import '../css/CreateTeamForm.css';

const CreateTeamForm = ({ eventId, onClose, onTeamCreated, maxTeamSize, minTeamSize, registrationAmount }) => {
  const [teamName, setTeamName] = useState('');
  const [teamLeader, setTeamLeader] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [leaderPhone, setLeaderPhone] = useState('');
  const [isIIESTian, setIsIIESTian] = useState(true);
  const [paymentImage, setPaymentImage] = useState(null);
  const [teamSectionCompleted, setTeamSectionCompleted] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    Promise.all([
      axios.get('http://localhost:5000/api/auth/status', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get('http://localhost:5000/api/users/get-all', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]).then(([leaderRes, usersRes]) => {
      const userData = leaderRes.data.user;
      setTeamLeader(userData);
      setIsIIESTian(userData.email.endsWith('@students.iiests.ac.in'));
      setAllUsers(usersRes.data.body);
    }).catch(error => {
      console.error('Error fetching data:', error);
      setError('Error loading user data');
    });
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.trim() === '') {
      setSearchResults([]);
      return;
    }

    const filtered = allUsers.filter(user => 
      (user.name.toLowerCase().includes(value.toLowerCase()) ||
      user.email.toLowerCase().includes(value.toLowerCase())) &&
      user._id !== teamLeader._id &&
      !teamMembers.some(member => member._id === user._id)
    );
    setSearchResults(filtered);
  };

  const addMember = (user) => {
    if (teamMembers.length >= maxTeamSize - 1) {
      setError('Maximum team size reached');
      return;
    }
    setTeamMembers([...teamMembers, user]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const removeMember = (userId) => {
    setTeamMembers(teamMembers.filter(member => member._id !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (teamMembers.length < minTeamSize - 1) {
      setError(`Minimum ${minTeamSize} members required (including leader)`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      const teamData = {
        team: true,
        name: teamName,
        eventRegistered: eventId,
        teamMembers: teamMembers.map(member => member._id),
        teamLeader: teamLeader._id,
        teamSize: teamMembers.length + 1,
        leaderPhone: leaderPhone
      };

      formData.append('teamData', JSON.stringify(teamData));
      
      if (!isIIESTian && paymentImage) {
        formData.append('paymentProof', paymentImage);
      }

      const response = await axios.post(
        `http://localhost:5000/api/events/${eventId}/register`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      onTeamCreated(response.data.body);
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating team');
    }
  };

  const validateTeamSection = () => {
    return teamName && 
           leaderPhone.length === 10 && 
           teamMembers.length >= minTeamSize - 1;
  };

  useEffect(() => {
    setTeamSectionCompleted(validateTeamSection());
  }, [teamName, leaderPhone, teamMembers]);

  const validatePayment = () => {
    if (isIIESTian) return true;
    return !!paymentImage;
  };

  useEffect(() => {
    setPaymentCompleted(validatePayment());
  }, [paymentImage, isIIESTian]);

  return (
    <form className="create-team-form" onSubmit={handleSubmit}>
      <CollapsibleSection 
        title="Team Details" 
        isOpen={true}
        isCompleted={teamSectionCompleted}
      >
        <div className="form-group">
          <label>Team Name</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            placeholder="Enter team name"
          />
        </div>

        <div className="form-group">
          <label>Team Leader</label>
          <div className="team-member-display">
            {teamLeader && (
              <div className="member-item leader">
                <img src={teamLeader.picture} alt={teamLeader.name} />
                <div>
                  <p>{teamLeader.name}</p>
                  <small>{teamLeader.email}</small>
                </div>
              </div>
            )}
            <input
              type="tel"
              value={leaderPhone}
              onChange={(e) => setLeaderPhone(e.target.value)}
              required
              pattern="[0-9]{10}"
              placeholder="Enter leader's phone number"
              className="leader-phone"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Team Members ({teamMembers.length + 1}/{maxTeamSize})</label>
          <div className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search users by name or email"
              disabled={teamMembers.length >= maxTeamSize - 1}
            />
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(user => (
                  <div 
                    key={user._id} 
                    className="search-result-item"
                    onClick={() => addMember(user)}
                  >
                    <img src={user.picture} alt={user.name} />
                    <div>
                      <p>{user.name}</p>
                      <small>{user.email}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="team-members-list">
            {teamMembers.map(member => (
              <div key={member._id} className="member-item">
                <img src={member.picture} alt={member.name} />
                <div>
                  <p>{member.name}</p>
                  <small>{member.email}</small>
                </div>
                <button 
                  type="button" 
                  className="remove-member"
                  onClick={() => removeMember(member._id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <p className="team-size-info">
            Minimum {minTeamSize} members required (including leader)
          </p>
        </div>
      </CollapsibleSection>

      {!isIIESTian && (
        <CollapsibleSection 
          title="Payment Details"
          isOpen={teamSectionCompleted}
          isCompleted={paymentCompleted}
        >
          <PaymentSection 
            amount={registrationAmount}
            onImageUpload={(file) => setPaymentImage(file)}
          />
        </CollapsibleSection>
      )}

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button 
          type="submit"
          disabled={!teamSectionCompleted || (!isIIESTian && !paymentCompleted)}
        >
          Create Team
        </button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

export default CreateTeamForm;
