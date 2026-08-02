import React, { useState, useEffect, useRef } from 'react';
import './MyRecipes.css';
import { useNavigate } from 'react-router-dom';
import { getMyRecipes, deleteRecipe } from '../../services/recipeService';
import Navbar from '../common/Navbar';
import ThemeToggle from '../common/ThemeToggle';

const MyRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const sortWindowRef = useRef(null);
  const navigate = useNavigate();

  const applyTheme = (darkMode) => {
    document.documentElement.style.setProperty('--bg', darkMode ? 'var(--bg-dark)' : 'var(--bg-light)');
    document.documentElement.style.setProperty('--text-color', darkMode ? 'var(--text-dark)' : 'var(--text-light)');
    document.documentElement.style.setProperty('--shadow-color', darkMode ? 'var(--shadow-dark)' : 'var(--shadow-light)');
    document.documentElement.style.setProperty('--menu-bg', darkMode ? 'var(--menu-bg-dark)' : 'var(--menu-bg-light)');
    document.documentElement.style.setProperty('--menu-hover', darkMode ? 'var(--menu-hover-dark)' : 'var(--menu-hover-light)');
    document.documentElement.style.setProperty('--icon-bg', darkMode ? 'var(--icon-bg-dark)' : 'var(--icon-bg-light)');
    document.documentElement.style.setProperty('--bg-recipe-container', darkMode ? 'var(--bg-recipe-container-dark)' : 'var(--bg-recipe-container-light)');
  };

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.style.setProperty('--on', newDarkMode ? 0 : 1);
    applyTheme(newDarkMode);
    localStorage.setItem('themePreference', newDarkMode ? 'dark' : 'light');
  };

  const normalizeRecipe = (r) => {
    let timeNum = 0;
    let timeStr = '0';
    if (typeof r.preparationTime === 'number') {
      timeNum = r.preparationTime;
      timeStr = `${timeNum}`;
    } else if (typeof r.preparationTime === 'string') {
      if (r.preparationTime.includes(':')) {
        const parts = r.preparationTime.split(':');
        timeNum = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        timeStr = `${timeNum}`;
      } else {
        timeNum = parseInt(r.preparationTime, 10) || 0;
        timeStr = r.preparationTime;
      }
    } else if (r.time !== undefined) {
      timeNum = parseInt(r.time, 10) || 0;
      timeStr = `${r.time}`;
    }

    return {
      ...r,
      id: r._id || r.id || Date.now(),
      _id: r._id || r.id,
      name: r.name || 'Untitled Recipe',
      country: r.countryOfOrigin || r.country || 'Other',
      time: timeNum,
      timeDisplay: timeStr,
      image: r.locationImage || r.image || '/images/showcase/recipe-manager.jpg',
      ingredients: Array.isArray(r.ingredients) ? r.ingredients.join(', ') : (r.ingredients || ''),
      instructions: r.instructions || '',
      description: r.description || ''
    };
  };

  const fetchUserRecipes = async () => {
    try {
      setLoading(true);
      const res = await getMyRecipes();
      const userRecipes = res.data || [];
      const normalized = userRecipes.map(normalizeRecipe);
      setRecipes(normalized);
    } catch (err) {
      console.error('Error fetching user recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRecipes();

    const savedTheme = localStorage.getItem('themePreference');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let darkMode = true;
    if (savedTheme === 'light') darkMode = false;
    else if (!savedTheme && !prefersDark) darkMode = false;
    setIsDarkMode(darkMode);
    document.documentElement.style.setProperty('--on', darkMode ? 0 : 1);
    applyTheme(darkMode);
  }, []);

  const toggleSortWindow = () => {
    if (sortWindowRef.current) {
      sortWindowRef.current.style.display = sortWindowRef.current.style.display === 'block' ? 'none' : 'block';
    }
  };

  const handleClickOutside = (e) => {
    if (sortWindowRef.current && !sortWindowRef.current.contains(e.target) && !e.target.closest('.fridge-circular-button')) {
      sortWindowRef.current.style.display = 'none';
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const sortRecipes = (order) => {
    const sorted = [...recipes];
    sorted.sort((a, b) => order === 'lowToHigh' ? a.time - b.time : b.time - a.time);
    setRecipes(sorted);
    if (sortWindowRef.current) {
      sortWindowRef.current.style.display = 'none';
    }
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (recipe.ingredients && recipe.ingredients.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const showRecipeDetails = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeModal = () => {
    setSelectedRecipe(null);
  };

  const toggleFavorite = (recipe) => {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const isFavorited = favorites.some(fav => fav.name === recipe.name || fav.id === recipe.id);
    if (isFavorited) {
      favorites = favorites.filter(fav => fav.name !== recipe.name && fav.id !== recipe.id);
    } else {
      favorites.push(recipe);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    setRecipes([...recipes]);
  };

  const handleDeleteRecipe = async (recipe, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${recipe.name}"?`)) return;

    try {
      if (recipe._id) {
        await deleteRecipe(recipe._id);
      }
      const updated = recipes.filter(r => r.id !== recipe.id && r._id !== recipe._id);
      setRecipes(updated);

      try {
        let local = JSON.parse(localStorage.getItem('recipes')) || [];
        local = local.filter(r => r.id !== recipe.id && r._id !== recipe._id && r.name !== recipe.name);
        localStorage.setItem('recipes', JSON.stringify(local));
      } catch (storageErr) {
        console.warn('localStorage quota exceeded for recipes cache:', storageErr.message);
      }

      let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      favorites = favorites.filter(fav => fav.id !== recipe.id && fav._id !== recipe._id && fav.name !== recipe.name);
      localStorage.setItem('favorites', JSON.stringify(favorites));

      if (selectedRecipe && (selectedRecipe.id === recipe.id || selectedRecipe._id === recipe._id)) {
        closeModal();
      }
    } catch (err) {
      console.error('Error deleting recipe:', err);
      alert('Failed to delete recipe. Please try again.');
    }
  };

  return (
    <div className="fridge-page">
      <img src="/images/ff.png" alt="Fridge Fusion Logo" className="fridge-logo" />

      <Navbar activePage="/my-recipes" />

      <div className="fridge-container">
        <div className="fridge-title">MY CREATED RECIPES</div>
        <div className="fridge-search-container">
          <input
            type="text"
            className="fridge-search-bar"
            placeholder="Search your personal recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ThemeToggle toggleTheme={toggleTheme} />
        </div>
      </div>

      <div className="fridge-moving-bar">
        <span className="fridge-text">
          Your Personal Culinary Creations 🍳 Custom Recipes Made By You 🍕 Saved Safely In Your Account 🥗
        </span>
      </div>

      <div className="fridge-recipes-container">
        <div className="fridge-recipe-header">
          <div className="fridge-recipe-controls">
            <div className="fridge-add-button" onClick={() => navigate('/recipe')} title="Create New Recipe">
              <span className="fridge-add-icon">+</span>
            </div>
          </div>
          <h2 className="fridge-section-title">My Recipe Collection</h2>
        </div>
        <div className="fridge-cards-grid">
          {loading ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-color)' }}>
              Loading your personal recipes...
            </p>
          ) : filteredRecipes.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-color)' }}>
              You haven't created any recipes yet. Click the + button above to create your first recipe!
            </p>
          ) : (
            filteredRecipes.map((recipe) => {
              const isFavorited = (JSON.parse(localStorage.getItem('favorites')) || []).some(fav => fav.name === recipe.name || fav.id === recipe.id);
              return (
                <div className="fridge-wrapper" key={recipe.id}>
                  <div className="fridge-card" onClick={(e) => e.currentTarget.style.transform = e.currentTarget.style.transform === 'rotateY(180deg)' ? '' : 'rotateY(180deg)'}>
                    <div className="fridge-front-page" style={{ backgroundImage: `url(${recipe.image})` }}>
                      <div className="fridge-card-info">
                        <h2 className="fridge-card-title">{recipe.name}</h2>
                        <p className="fridge-card-subtitle">{`${recipe.country} | ${recipe.timeDisplay || recipe.time} min`}</p>
                      </div>
                    </div>
                    <div className="fridge-back-page">
                      <div className="fridge-card-content">
                        <h3>{recipe.name}</h3>
                        <p className="fridge-card-description">{recipe.description || 'No description provided.'}</p>
                        <div className="fridge-button-container">
                          <button className="fridge-card-button" onClick={(e) => { e.stopPropagation(); showRecipeDetails(recipe); }}>
                            View Recipe
                          </button>
                          <button
                            className={`fridge-favorite-button ${isFavorited ? 'favorited' : ''}`}
                            title="Favorite"
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe); }}
                          >
                            <svg viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                          </button>
                          <button
                            className="fridge-card-button delete-btn"
                            style={{ backgroundColor: '#a93226', marginTop: '5px' }}
                            onClick={(e) => handleDeleteRecipe(recipe, e)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedRecipe && (
        <div className="fridge-modal" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="fridge-modal-content">
            <h2>{selectedRecipe.name}</h2>
            <div className="fridge-modal-details">
              <div className="fridge-modal-image">
                <img src={selectedRecipe.image} alt={selectedRecipe.name} />
              </div>
              <div className="fridge-modal-info">
                <h3>Details</h3>
                <p><strong>Country:</strong> {selectedRecipe.country}</p>
                <p><strong>Preparation Time:</strong> {selectedRecipe.timeDisplay || selectedRecipe.time} minutes</p>
              </div>
            </div>
            <div className="fridge-modal-columns">
              <div className="fridge-modal-column">
                <h3>Ingredients</h3>
                <div className="fridge-modal-text">{selectedRecipe.ingredients}</div>
              </div>
              <div className="fridge-modal-column">
                <h3>Instructions</h3>
                <div className="fridge-modal-text">{selectedRecipe.instructions}</div>
              </div>
            </div>
            <div className="fridge-modal-description">
              <h3>Description</h3>
              <p>{selectedRecipe.description}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button className="fridge-close-modal" onClick={closeModal}>Close</button>
              <button className="fridge-close-modal" style={{ backgroundColor: '#a93226' }} onClick={() => handleDeleteRecipe(selectedRecipe)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRecipes;
