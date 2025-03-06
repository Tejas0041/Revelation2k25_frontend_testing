import React, { useState } from 'react';
import SingleRegistrationForm from './SingleRegistrationForm';
import CreateTeamForm from './CreateTeamForm';
import '../css/RegistrationModal.css';

const RegistrationModal = ({ event, onClose, onRegistrationComplete }) => {
  const [isTeamRegistration, setIsTeamRegistration] = useState(false);

  return (
    <div className="registration-modal">
      <div className="registration-content">
        <div className="modal-header">
          <h3>Event Registration</h3>
          <button className="back-btn" onClick={onClose}>×</button>
        </div>

        {event.type === 'Combined' && (
          <div className="registration-type-selector">
            <button
              className={!isTeamRegistration ? 'active' : ''}
              onClick={() => setIsTeamRegistration(false)}
            >
              Individual
            </button>
            <button
              className={isTeamRegistration ? 'active' : ''}
              onClick={() => setIsTeamRegistration(true)}
            >
              Team
            </button>
          </div>
        )}

        {(!isTeamRegistration && (event.type === 'Single' || event.type === 'Combined')) ? (
          <SingleRegistrationForm
            eventId={event._id}
            registrationAmount={event.registrationAmount}
            onClose={onClose}
            onRegistrationComplete={onRegistrationComplete}
            isTeam={false}
          />
        ) : (
          <CreateTeamForm
            eventId={event._id}
            maxTeamSize={event.teamSize.max}
            minTeamSize={event.teamSize.min}
            registrationAmount={event.registrationAmount}
            onClose={onClose}
            onTeamCreated={onRegistrationComplete}
            isTeam={true}
          />
        )}
      </div>
    </div>
  );
};

export default RegistrationModal;
