import React, { useState } from 'react';
import SingleRegistrationForm from './SingleRegistrationForm';
import CreateTeamForm from './CreateTeamForm';
import '../css/RegistrationForm.css';

const RegistrationForm = ({ event, onClose, onRegistrationComplete }) => {
  // Set 'single' as default for Combined events, otherwise use event type
  const [registrationType, setRegistrationType] = useState(
    event.type === 'Combined' ? 'single' : event.type.toLowerCase()
  );

  // Directly return CreateTeamForm for Team events
  if (event.type === 'Team') {
    return (
      <div className="registration-modal">
        <div className="registration-content">
          <h2>Team Registration</h2>
          <CreateTeamForm 
            eventId={event._id}
            maxTeamSize={event.teamSize.max}
            minTeamSize={event.teamSize.min}
            registrationAmount={event.registrationAmount}
            onClose={onClose}
            onTeamCreated={onRegistrationComplete}
          />
        </div>
      </div>
    );
  }

  // Rest of the code for Single and Combined events
  return (
    <div className="registration-modal">
      <div className="registration-content">
        <h2>Event Registration</h2>
        
        {event.type === 'Combined' && (
          <div className="registration-type-selector">
            <button
              className={registrationType === 'single' ? 'active' : ''}
              onClick={() => setRegistrationType('single')}
            >
              Individual Registration
            </button>
            <button
              className={registrationType === 'team' ? 'active' : ''}
              onClick={() => setRegistrationType('team')}
            >
              Team Registration
            </button>
          </div>
        )}

        <div className="registration-sections">
          {registrationType === 'single' ? (
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
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
