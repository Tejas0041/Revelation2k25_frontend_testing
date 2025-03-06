import React from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import '../css/EventCard.css';

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const getOrdinalSuffix = (day) => {
    const j = day % 10;
    const k = day % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  const formatDateTime = (date) => {
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const suffix = getOrdinalSuffix(day);
    const timeStr = format(dateObj, "hh:mm a");
    const restOfDate = format(dateObj, "MMMM, yyyy");
    return `${timeStr}, ${day}${suffix} ${restOfDate}`;
  };

  const handleClick = () => {
    navigate(`/event/${event._id}`);
  };

  const getTeamSizeDisplay = () => {
    if (event.type === 'Single') return null;
    if (event.type === 'Combined') return 'Individual + Team';
    if (event.teamSize.min === event.teamSize.max) {
      return `Team Size: ${event.teamSize.min}`;
    }
    return `Team Size: ${event.teamSize.min}-${event.teamSize.max}`;
  };

  return (
    <div className="event-card" onClick={handleClick}>
      <img 
        src={event.posterImage.url} 
        alt={event.name} 
        className="event-image"
      />
      <div className="event-details">
        <h3>{event.name}</h3>
        <p className="event-type">{event.type}</p>
        <p className="event-description">{event.description}</p>
        <div className="event-info">
          <p><strong>Venue:</strong> {event.venue}</p>
          {getTeamSizeDisplay() && <p><strong>{getTeamSizeDisplay()}</strong></p>}
          <p><strong>Registration Fee:</strong> ₹{event.registrationAmount}</p>
          <p><strong>Start:</strong> {formatDateTime(event.startTime)}</p>
          <p><strong>End:</strong> {formatDateTime(event.endTime)}</p>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
