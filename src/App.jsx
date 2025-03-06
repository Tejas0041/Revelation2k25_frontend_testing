import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "./css/Index.css";
import Login from "./Login.jsx";
import Home from "./Home.jsx";
import Profile from "./Profile.jsx";
import EventDetails from "./pages/EventDetails.jsx";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            token ? (
              <Navigate to="/home" replace={true} />
            ) : (
              <Login setToken={setToken} />
            )
          } 
        />
        <Route path="/home" element={token ? <Home setToken={setToken} /> : <Navigate to="/login" />} />
        <Route path="/profile" element={token ? <Profile setToken={setToken} /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={token ? "/home" : "/login"} />} />
        <Route 
          path="/event/:id" 
          element={token ? <EventDetails /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
};

export default App;