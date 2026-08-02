import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../utils/auth';
import './Navbar.css';

const Navbar = ({ activePage }) => {
  const navigate = useNavigate();

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="fridge-menu-buttons">
      <a
        href="#calculator"
        className={`fridge-menu-button ${activePage === '/calculator' ? 'active' : ''}`}
        title="Calories Calculator"
        onClick={(e) => { e.preventDefault(); handleMenuClick('/calculator'); }}
      >
        <i className="fas fa-calculator"></i>
      </a>
      <a
        href="#ai"
        className={`fridge-menu-button ${activePage === '/ai' ? 'active' : ''}`}
        title="AI Assistant"
        onClick={(e) => { e.preventDefault(); handleMenuClick('/ai'); }}
      >
        <i className="fas fa-robot"></i>
      </a>
      <a
        href="#home"
        className={`fridge-menu-button ${activePage === '/home' ? 'active' : ''}`}
        title="Home"
        onClick={(e) => { e.preventDefault(); handleMenuClick('/home'); }}
      >
        <i className="fas fa-home"></i>
      </a>
      <a
        href="#my-recipes"
        className={`fridge-menu-button ${activePage === '/my-recipes' ? 'active' : ''}`}
        title="My Recipes"
        onClick={(e) => { e.preventDefault(); handleMenuClick('/my-recipes'); }}
      >
        <i className="fas fa-book-open"></i>
      </a>
      <a
        href="#favorite"
        className={`fridge-menu-button ${activePage === '/favorite' ? 'active' : ''}`}
        title="Favorite"
        onClick={(e) => { e.preventDefault(); handleMenuClick('/favorite'); }}
      >
        <i className="fas fa-heart"></i>
      </a>
      <a
        href="#profile"
        className={`fridge-menu-button ${activePage === '/profile' ? 'active' : ''}`}
        title="Profile"
        onClick={(e) => { e.preventDefault(); handleMenuClick('/profile'); }}
      >
        <i className="fas fa-user"></i>
      </a>
      <a
        href="#logout"
        className="fridge-menu-button"
        title="Logout"
        onClick={(e) => { e.preventDefault(); handleLogout(); }}
      >
        <i className="fas fa-sign-out-alt"></i>
      </a>
    </div>
  );
};

export default Navbar;
