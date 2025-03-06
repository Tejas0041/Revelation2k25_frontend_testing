import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import EventCard from "./components/EventCard";
import "./css/Home.css";
import "./css/Index.css";
import "./css/Layout.css";
import "./css/EventCard.css";
import { API_URL } from './config/config';

const Home = ({ setToken }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Check authentication
    axios.get(`${API_URL}/api/auth/status`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setIsAuthenticated(true);
        // Fetch events after authentication
        fetchEvents();
      })
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
        navigate("/login");
      });
  }, [navigate, setToken]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/events/get-all`);
      setEvents(response.data.body);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  return (
    <div>
      <header className="header">
        <h2>Revelation 2k25</h2>
        <nav className="nav-links">
          <Link to="/profile">Profile</Link>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </nav>
      </header>

      <main className="content">
        <h2>Welcome to Revelation 2k25</h2>
        <div className="events-container">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
