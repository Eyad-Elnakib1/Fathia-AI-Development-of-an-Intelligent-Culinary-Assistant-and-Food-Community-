import React, { useState, useEffect } from 'react';
import './Favorite.css';
import { useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';

const FavoriteRecipes = () => {
  const [favorites, setFavorites] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(storedFavorites);
  }, []);

  const showRecipeDetails = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeModal = () => {
    setSelectedRecipe(null);
  };

  const deleteFavorite = (recipe) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== recipe.id && fav._id !== recipe._id && fav.name !== recipe.name);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  return (
    <div className="favorite-page">
      <Navbar activePage="/favorite" />

      <div className="favorite-header-container">
        <h1 className="favorite-page-title">FAVORITE RECIPES</h1>
      </div>

      <div className="favorite-favorites-container">
        <div className="favorite-cards-grid">
          {favorites.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-color)', marginTop: '40px', fontSize: '1.2rem' }}>
              No favorite recipes yet. Add some from the main page!
            </p>
          ) : (
            favorites.map((recipe) => (
              <div className="favorite-wrapper" key={recipe.id || recipe._id || recipe.name}>
                <div className="favorite-card" onClick={(e) => e.currentTarget.style.transform = e.currentTarget.style.transform === 'rotateY(180deg)' ? '' : 'rotateY(180deg)'}>
                  <div className="favorite-front-page" style={{ backgroundImage: `url(${recipe.image || '/images/showcase/recipe-manager.jpg'})` }}>
                    <div className="favorite-card-info">
                      <h2 className="favorite-card-title">{recipe.name}</h2>
                      <p className="favorite-card-subtitle">{`${recipe.country || 'Other'} | ${recipe.timeDisplay || recipe.time || 15} min`}</p>
                    </div>
                  </div>
                  <div className="favorite-back-page">
                    <div className="favorite-card-content">
                      <h3>{recipe.name}</h3>
                      <p className="favorite-card-description">{recipe.description || 'No description provided.'}</p>
                      <div className="favorite-button-container">
                        <button
                          className="favorite-card-button"
                          onClick={(e) => { e.stopPropagation(); showRecipeDetails(recipe); }}
                        >
                          View Recipe
                        </button>
                        <button
                          className="favorite-delete-button"
                          onClick={(e) => { e.stopPropagation(); deleteFavorite(recipe); }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedRecipe && (
        <div className="favorite-modal" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="favorite-modal-content">
            <h2>{selectedRecipe.name}</h2>
            <div className="favorite-modal-details">
              <div className="favorite-modal-image">
                <img src={selectedRecipe.image || '/images/showcase/recipe-manager.jpg'} alt={selectedRecipe.name} />
              </div>
              <div className="favorite-modal-info">
                <h3>Details</h3>
                <p><strong>Country:</strong> {selectedRecipe.country || 'Other'}</p>
                <p><strong>Preparation Time:</strong> {selectedRecipe.timeDisplay || selectedRecipe.time || 15} minutes</p>
              </div>
            </div>
            <div className="favorite-modal-columns">
              <div className="favorite-modal-column">
                <h3>Ingredients</h3>
                <div className="favorite-modal-text">{selectedRecipe.ingredients}</div>
              </div>
              <div className="favorite-modal-column">
                <h3>Instructions</h3>
                <div className="favorite-modal-text">{selectedRecipe.instructions}</div>
              </div>
            </div>
            <div className="favorite-modal-description">
              <h3>Description</h3>
              <p>{selectedRecipe.description || 'No description provided.'}</p>
            </div>
            <button className="favorite-close-modal" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoriteRecipes;
