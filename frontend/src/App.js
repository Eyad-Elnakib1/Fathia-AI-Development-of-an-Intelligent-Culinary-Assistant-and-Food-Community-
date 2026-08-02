import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeroPage from './components/landing/HeroPage';
import InfoPage from './components/landing/InfoPage';
import Login from './components/auth/Login';
import RecipeCardGenerator from './components/recipes/RecipeCardGenerator';
import Home from './components/recipes/Home';
import MyRecipes from './components/recipes/MyRecipes';
import Favorite from './components/recipes/Favorite';
import AI from './components/tools/AI';
import Profile from './components/profile/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import CaloriesCalculator from './components/tools/CaloriesCalculator';
import '@fontsource/press-start-2p';
import './App.css';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HeroPage />} />
          <Route path="/info" element={<ProtectedRoute><InfoPage /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/recipe" element={<ProtectedRoute><RecipeCardGenerator /></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/my-recipes" element={<ProtectedRoute><MyRecipes /></ProtectedRoute>} />
          <Route path="/favorite" element={<ProtectedRoute><Favorite /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute><AI /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/calculator" element={<ProtectedRoute><CaloriesCalculator /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;