import React, { useState, useEffect, useRef } from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import { getRecipes } from '../../services/recipeService';
import Navbar from '../common/Navbar';
import ThemeToggle from '../common/ThemeToggle';

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Filter state variables
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [maxPrepTime, setMaxPrepTime] = useState('all');
  const [selectedIngredient, setSelectedIngredient] = useState('all');

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

  const fetchAndSyncRecipes = async () => {
    try {
      setLoading(true);
      const res = await getRecipes();
      const backendRecipes = res.data || [];
      const normalized = backendRecipes.map(normalizeRecipe);
      setRecipes(normalized);
      try {
        localStorage.setItem('recipes', JSON.stringify(normalized));
      } catch (storageErr) {
        console.warn('localStorage quota exceeded for recipes cache:', storageErr.message);
      }
    } catch (err) {
      console.error('Error loading recipes from server, falling back to local cache:', err);
      const stored = JSON.parse(localStorage.getItem('recipes')) || [];
      setRecipes(stored.map(normalizeRecipe));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSyncRecipes();

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
    if (sortWindowRef.current && !sortWindowRef.current.contains(e.target) && !e.target.closest('.fridge-circular-button:not(.filter-btn)')) {
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

  const resetAllFilters = () => {
    setSelectedCountry('all');
    setMaxPrepTime('all');
    setSelectedIngredient('all');
    setSearchQuery('');
  };

  const filteredRecipes = recipes.filter(recipe => {
    // 1. Text Search (name or ingredients)
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (recipe.ingredients && recipe.ingredients.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    // 2. Country Filter
    if (selectedCountry !== 'all' && recipe.country.toLowerCase() !== selectedCountry.toLowerCase()) {
      return false;
    }

    // 3. Preparation Time Filter
    if (maxPrepTime !== 'all') {
      if (maxPrepTime === 'more60') {
        if (recipe.time <= 60) return false;
      } else {
        const maxT = parseInt(maxPrepTime, 10);
        if (recipe.time > maxT) return false;
      }
    }

    // 4. Main Ingredient / Category Filter
    if (selectedIngredient !== 'all') {
      const ingStr = `${recipe.name} ${recipe.ingredients} ${recipe.description}`.toLowerCase();
      if (selectedIngredient === 'chicken' && !ingStr.includes('chicken') && !ingStr.includes('poultry')) return false;
      if (selectedIngredient === 'meat' && !ingStr.includes('meat') && !ingStr.includes('beef') && !ingStr.includes('steak') && !ingStr.includes('lamb') && !ingStr.includes('pork')) return false;
      if (selectedIngredient === 'fish' && !ingStr.includes('fish') && !ingStr.includes('salmon') && !ingStr.includes('shrimp') && !ingStr.includes('tuna') && !ingStr.includes('seafood')) return false;
      if (selectedIngredient === 'vegetables' && !ingStr.includes('veg') && !ingStr.includes('salad') && !ingStr.includes('spinach') && !ingStr.includes('tomato') && !ingStr.includes('plant')) return false;
      if (selectedIngredient === 'pasta' && !ingStr.includes('pasta') && !ingStr.includes('spaghetti') && !ingStr.includes('noodle') && !ingStr.includes('rice') && !ingStr.includes('alfredo')) return false;
      if (selectedIngredient === 'dessert' && !ingStr.includes('cake') && !ingStr.includes('sweet') && !ingStr.includes('dessert') && !ingStr.includes('chocolate') && !ingStr.includes('cookie') && !ingStr.includes('pie')) return false;
      if (selectedIngredient === 'soup' && !ingStr.includes('soup') && !ingStr.includes('stew') && !ingStr.includes('broth')) return false;
    }

    return true;
  });

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

  const hasActiveFilters = selectedCountry !== 'all' || maxPrepTime !== 'all' || selectedIngredient !== 'all';

  return (
    <div className="fridge-page">
      <img src="/images/ff.png" alt="Fridge Fusion Logo" className="fridge-logo" />

      <Navbar activePage="/home" />

      <div className="fridge-container">
        <div className="fridge-title">RECIPES</div>
        <div className="fridge-search-container">
          <input
            type="text"
            className="fridge-search-bar"
            placeholder="Search by recipe name or ingredient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ThemeToggle toggleTheme={toggleTheme} />
        </div>
      </div>

      <div className="fridge-moving-bar">
        <span className="fridge-text">
          Food is the ingredient that binds us together🍻   The only thing I like better than talking about food is eating🍔   Cooking is like love; it should be entered into with abandon or not at all🍕
        </span>
      </div>

      <div className="fridge-recipes-container">
        <div className="fridge-recipe-header">
          <div className="fridge-recipe-controls">
            <button className="fridge-filter-pill-button" onClick={() => setIsFilterOpen(true)} title="Filter Recipes">
              <i className="fas fa-filter"></i>
              <span>Filter Recipes</span>
              {hasActiveFilters && <span className="fridge-filter-badge-dot">•</span>}
            </button>
          </div>
          <h2 className="fridge-section-title">All World Recipes In One Place</h2>
        </div>
        <div className="fridge-cards-grid">
          {loading ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-color)' }}>
              Loading recipes from server...
            </p>
          ) : filteredRecipes.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-color)' }}>
              No recipes match your filter criteria. Try resetting your filters!
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

      {/* Filter Modal Popup Window */}
      {isFilterOpen && (
        <div className="fridge-modal" onClick={(e) => e.target === e.currentTarget && setIsFilterOpen(false)}>
          <div className="fridge-filter-modal-content">
            <div className="fridge-filter-header">
              <h2>Filter World Recipes</h2>
              <button className="fridge-modal-close-x" onClick={() => setIsFilterOpen(false)}>×</button>
            </div>

            <div className="fridge-filter-grid">
              <div className="fridge-filter-group">
                <label>Country of Origin:</label>
                <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
                  <option value="all">All Countries</option>
                  <option value="American">American</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Egyptian">Egyptian</option>
                  <option value="French">French</option>
                  <option value="Greek">Greek</option>
                  <option value="Indian">Indian</option>
                  <option value="Italian">Italian</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Mexican">Mexican</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Thai">Thai</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="fridge-filter-group">
                <label>Preparation Time:</label>
                <select value={maxPrepTime} onChange={(e) => setMaxPrepTime(e.target.value)}>
                  <option value="all">All Preparation Times</option>
                  <option value="15">≤ 15 Minutes</option>
                  <option value="30">≤ 30 Minutes</option>
                  <option value="45">≤ 45 Minutes</option>
                  <option value="60">≤ 60 Minutes</option>
                  <option value="more60">&gt; 60 Minutes</option>
                </select>
              </div>

              <div className="fridge-filter-group" style={{ gridColumn: '1 / -1' }}>
                <label>Main Ingredient / Dish:</label>
                <select value={selectedIngredient} onChange={(e) => setSelectedIngredient(e.target.value)}>
                  <option value="all">All Ingredients</option>
                  <option value="chicken">Chicken 🍗</option>
                  <option value="meat">Meat / Beef 🥩</option>
                  <option value="fish">Fish / Seafood 🐟</option>
                  <option value="vegetables">Vegetables 🥦</option>
                  <option value="pasta">Pasta & Rice 🍝</option>
                  <option value="soup">Soup & Stew 🥣</option>
                  <option value="dessert">Dessert 🍰</option>
                </select>
              </div>
            </div>

            <div className="fridge-filter-actions">
              {hasActiveFilters && (
                <button className="fridge-reset-btn" onClick={resetAllFilters}>
                  Reset Filters
                </button>
              )}
              <button className="fridge-apply-btn" onClick={() => setIsFilterOpen(false)}>
                Apply & View Recipes ({filteredRecipes.length})
              </button>
            </div>
          </div>
        </div>
      )}

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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
