import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RegistrationForm from '../components/RegistrationForm';
import BackButton from '../components/BackButton';
import Loader from '../components/Loader';
import '../css/EventDetails.css';
import { API_URL } from '../config/config';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState({ teams: [], individuals: [] });
  const [showRegistration, setShowRegistration] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTeamMembers, setShowTeamMembers] = useState(null);
  const [userRegistration, setUserRegistration] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const [eventRes, participantsRes, userStatusRes, userRes] = await Promise.all([
          axios.get(`${API_URL}/api/events/${id}`),
          axios.get(`${API_URL}/api/events/${id}/participants`),
          axios.get(`${API_URL}/api/events/${id}/registration-status`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/auth/status`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setEvent(eventRes.data.body);
        setParticipants(participantsRes.data.body);
        setUserRegistration(userStatusRes.data.body);
        setCurrentUser(userRes.data.user);
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [id]);

  const handleRegistrationComplete = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/events/${id}/participants`);
      setParticipants(response.data.body);
      setShowRegistration(false);
      // Add window reload after successful registration
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const isUserRegistered = () => {
    console.log('Current User:', currentUser);
    console.log('Current Event ID:', id);
    
    if (!currentUser?.eventsRegistered) return false;
    
    // Check if user has registered for this event by looking at the nested id field
    const hasRegistered = currentUser.eventsRegistered.some(reg => reg.id._id === id);
    console.log('Has Registered:', hasRegistered);
    
    return hasRegistered;
  };

  const renderRegistrationButton = () => {
    const registered = isUserRegistered();
    console.log('Registration Status:', registered);
    
    return (
      <button 
        className={`register-btn ${registered ? 'already-registered' : ''}`}
        onClick={() => !registered && setShowRegistration(true)}
        disabled={registered}
      >
        {registered ? 'Already Registered' : 'Register Now'}
      </button>
    );
  };

  const isUserInTeam = (team) => {
    if (!currentUser?.eventsRegistered) return false;
    const registration = currentUser.eventsRegistered.find(reg => reg.id._id === id);
    
    if (!registration) return false;

    // Check if user is team leader or member
    return registration.teamId === team._id ||
           team.teamLeader._id === currentUser._id ||
           team.teamMembers.some(member => member._id === currentUser._id);
  };

  const renderTeamsList = () => {
    return (
      <div className="teams-section">
        <h4>Registered Teams</h4>
        <div className="teams-list">
          {participants.teams
            .sort((a, b) => {
              const aIsUserTeam = isUserInTeam(a);
              const bIsUserTeam = isUserInTeam(b);
              if (aIsUserTeam && !bIsUserTeam) return -1;
              if (!aIsUserTeam && bIsUserTeam) return 1;
              return 0;
            })
            .map(team => {
              const isUserTeam = isUserInTeam(team);
              const isLeader = team.teamLeader._id === currentUser?._id;

              return (
                <div key={team._id} className={`team-item ${isUserTeam ? 'user-team' : ''}`}>
                  <div className="team-header">
                    <div className="team-header-info">
                      <h4>{team.name}</h4>
                      {team.teamMembers.every(member => member.isIIESTian) && 
                        team.teamLeader.isIIESTian && 
                        <span className="iiestian-badge">IIEST Team</span>
                      }
                      {isUserTeam && <span className="your-team-badge">Your Team</span>}
                    </div>
                    <button 
                      className="view-members-btn"
                      onClick={() => setShowTeamMembers(showTeamMembers === team._id ? null : team._id)}
                    >
                      {showTeamMembers === team._id ? 'Hide Members' : 'View Members'}
                    </button>
                  </div>
                  {showTeamMembers === team._id && (
                    <div className="team-members">
                      <div className={`member leader ${isLeader ? 'current-user' : ''}`}>
                        <img src={team.teamLeader.picture} alt={team.teamLeader.name} />
                        <div className="member-info">
                          <p>{team.teamLeader.name}</p>
                          <small>{team.teamLeader.email}</small>
                          {isLeader ? (
                            <div className="badge-container">
                              <span className="leader-badge">Leader</span>
                              <span className="you-badge">You</span>
                            </div>
                          ) : (
                            <span className="leader-badge">Leader</span>
                          )}
                        </div>
                      </div>
                      {team.teamMembers.map(member => {
                        const isMemberCurrentUser = member._id === currentUser?._id;
                        return (
                          <div key={member._id} className={`member ${isMemberCurrentUser ? 'current-user' : ''}`}>
                            <img src={member.picture} alt={member.name} />
                            <div className="member-info">
                              <p>{member.name}</p>
                              <small>{member.email}</small>
                              {isMemberCurrentUser && <span className="you-badge">You</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  const renderParticipantsList = () => (
    <div className="participants-section">
      <h4>Individual Participants</h4>
      <div className="participants-grid">
        {participants.individuals
          .sort((a, b) => {
            // Put current user first
            const aIsCurrentUser = a.email === currentUser?.email;
            const bIsCurrentUser = b.email === currentUser?.email;
            if (aIsCurrentUser && !bIsCurrentUser) return -1;
            if (!aIsCurrentUser && bIsCurrentUser) return 1;
            return 0;
          })
          .map(participant => {
            const isCurrentUser = participant.email === currentUser?.email;
            
            return (
              <div key={participant._id} className={`participant-item ${isCurrentUser ? 'current-user' : ''}`}>
                <img src={participant.picture} alt={participant.name} />
                <div className="participant-info">
                  <div className="participant-details">
                    <div>
                      <p>{participant.name}</p>
                      <small>{participant.email}</small>
                    </div>
                  </div>
                  <div className="participant-badges">
                    <span className={participant.isIIESTian ? "iiestian-badge" : "non-iiestian-badge"}>
                      {participant.isIIESTian ? "IIESTian" : "Non-IIESTian"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );

  const getTeamSizeDisplay = () => {
    if (!event) return null;
    if (event.type === 'Single') return null;
    if (event.type === 'Combined') return 'Individual + Team';
    if (event.teamSize.min === event.teamSize.max) {
      return `Team Size: ${event.teamSize.min}`;
    }
    return `Team Size: ${event.teamSize.min}-${event.teamSize.max}`;
  };

  if (loading) return <Loader />;
  if (!event) return <Loader />;

  return (
    <div className="event-details-container">
      <BackButton />
      
      <div className="event-details-left">
        <img src={event.posterImage.url} alt={event.name} className="event-full-image" />
        <h2>{event.name}</h2>
        <div className="event-info-section">
          <h3>Description</h3>
          <p>{event.description}</p>
          <h3>Rules</h3>
          <p>{event.rules}</p>
          <h3>Event Details</h3>
          <p><strong>Type:</strong> {event.type}</p>
          {getTeamSizeDisplay() && <p><strong>{getTeamSizeDisplay()}</strong></p>}
          <p><strong>Venue:</strong> {event.venue}</p>
          <p><strong>Registration Fee:</strong> ₹{event.registrationAmount}</p>
        </div>
      </div>

      <div className="event-details-right">
        <div className="registration-header">
          <h3>Registered {event.type === 'Single' ? 'Participants' : 'Teams/Participants'}</h3>
          {renderRegistrationButton()}
        </div>

        <div className="registrations-container">
          {event?.type === 'Combined' ? (
            <>
              {renderTeamsList()}
              {renderParticipantsList()}
            </>
          ) : event?.type === 'Team' ? (
            renderTeamsList()
          ) : (
            renderParticipantsList()
          )}
        </div>
        
        {showRegistration && (
          <RegistrationForm 
            event={event}
            onClose={() => setShowRegistration(false)}
            onRegistrationComplete={handleRegistrationComplete}
          />
        )}
      </div>
    </div>
  );
};

export default EventDetails;
