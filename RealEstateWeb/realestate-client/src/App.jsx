
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
  useNavigate,
} from "react-router-dom";

import "./styles/nav.css";
import "./styles/auth.css";

import Map from "./pages/Map";
import Home from "./pages/Home";
import Login from "./pages/login";
import Register from "./pages/Register";
import EstateForm from "./pages/EstateForm";
import EstateDetails from "./pages/EstateDetails";
import EstateEdit from "./pages/EstateEdit";


function NavBar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    if (!localStorage.getItem("token")) {
      alert("Giriş yapmadınız.");
      return;
    }
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    alert("Çıkış yapıldı.");
    navigate("/");
  };
  return (
    <header className="site-nav">
      <div className="bar">
        <div className="left">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/map">Map</NavLink>
        </div>
        <div className="right">
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/register">Register</NavLink>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <Router>
      <NavBar />
      <main className="content-wrap">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Map />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/estates/new" element={<EstateForm />} />
          <Route path="/estates/:id" element={<EstateDetails />} />
          <Route path="/estates/:id/edit" element={<EstateEdit />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Router>
  );
}
