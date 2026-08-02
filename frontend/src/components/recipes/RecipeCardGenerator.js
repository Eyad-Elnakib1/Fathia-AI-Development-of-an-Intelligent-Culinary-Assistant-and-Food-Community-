import React, { useState, useEffect } from 'react';
import './RecipeCardGenerator.css';
import { useNavigate } from 'react-router-dom';
import { createRecipe, deleteRecipe } from '../../services/recipeService';
import Navbar from '../common/Navbar';

const RecipeCardGenerator = () => {
  const [recipes, setRecipes] = useState([]);
  const [recipeName, setRecipeName] = useState('');
  const [country, setCountry] = useState('other');
  const [prepTime, setPrepTime] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [description, setDescription] = useState('');
  const [recipeType, setRecipeType] = useState('dinner');
  const [image, setImage] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const countries = [
    'other', 'Afghan', 'African', 'Algerian', 'American', 'Amish', 'Argentine', 'Armenian', 'Asian', 'Assyrian',
    'Australian', 'Austrian', 'Azerbaijani', 'Bahamian', 'Bangladeshi', 'Barbadian', 'Basque', 'Belgian', 'Belizean',
    'Beninese', 'Bhutanese', 'Bihari', 'Brazilian', 'British', 'Bulgarian', 'Burmese', 'Cajun', 'Cambodian', 'Cameroonian',
    'Canadian', 'Caribbean', 'Catalan', 'Central African', 'Central Asian', 'Chadian', 'Chilean', 'Chinese', 'Colombian',
    'Congolese', 'Corsican', 'Costa Rican', 'Croatian', 'Cuban', 'Cypriot', 'Czech', 'Danish', 'Dominican', 'Dutch',
    'Ecuadorian', 'Egyptian', 'Emirati', 'English', 'Ethiopian', 'European', 'Fijian', 'Filipino', 'Finnish', 'French',
    'Galician', 'Gambian', 'Georgian', 'German', 'Ghanaian', 'Greek', 'Guatemalan', 'Gujarati', 'Haitian', 'Hawaiian',
    'Honduran', 'Hungarian', 'Icelandic', 'Indian', 'Indonesian', 'Iranian', 'Iraqi', 'Irish', 'Israeli', 'Italian',
    'Ivorian', 'Jamaican', 'Japanese', 'Jordanian', 'Kazakh', 'Kenyan', 'Korean', 'Kosovan', 'Kuwaiti', 'Laotian',
    'Latin American', 'Latvian', 'Lebanese', 'Liberian', 'Libyan', 'Lithuanian', 'Luxembourgish', 'Macanese', 'Macedonian',
    'Malagasy', 'Malaysian', 'Maldivian', 'Maltese', 'Mauritian', 'Mexican', 'Moldovan', 'Mongolian', 'Moroccan',
    'Mozambican', 'Namibian', 'Nepalese', 'New Zealand', 'Nicaraguan', 'Nigerian', 'Norwegian', 'Omani', 'Pakistani',
    'Palestinian', 'Panamanian', 'Peruvian', 'Philippine', 'Polish', 'Portuguese', 'Punjabi', 'Qatari', 'Romanian',
    'Russian', 'Rwandan', 'Salvadoran', 'Samoan', 'Saudi', 'Scandinavian', 'Scottish', 'Senegalese', 'Serbian',
    'Seychellois', 'Sierra Leonean', 'Singaporean', 'Slovak', 'Slovenian', 'Somali', 'South African', 'Spanish',
    'Sri Lankan', 'Sudanese', 'Surinamese', 'Swazi', 'Swedish', 'Swiss', 'Syrian', 'Taiwanese', 'Tajik', 'Tanzanian',
    'Thai', 'Tibetan', 'Togolese', 'Trinidadian', 'Tunisian', 'Turkish', 'Turkmen', 'Ugandan', 'Ukrainian', 'United States',
    'Uruguayan', 'Uzbek', 'Venezuelan', 'Vietnamese', 'Welsh', 'West African', 'Yemeni', 'Zambian', 'Zimbabwean'
  ];

  useEffect(() => {
    const storedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
    setRecipes(storedRecipes);
  }, []);

  const updateCharCount = (value, maxLength) => value.length + '/' + maxLength;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^[A-Za-z ]+$/.test(recipeName)) {
      alert('Recipe name can only contain letters and spaces');
      return;
    }

    if (!image) {
      alert('Please select an image for your recipe');
      return;
    }

    if (instructions.trim().length < 10) {
      alert('Instructions must be at least 10 characters long');
      return;
    }

    const timeVal = parseInt(prepTime, 10);
    if (isNaN(timeVal) || timeVal < 3) {
      alert('Preparation time must be at least 3 minutes');
      return;
    }

    try {
      setIsSubmitting(true);
      const reader = new FileReader();

      reader.onload = async (event) => {
        const imgDataUrl = event.target.result;
        const ingredientsList = ingredients.split(/[,\n]/).map(s => s.trim()).filter(Boolean);

        const backendPayload = {
          name: recipeName.trim(),
          countryOfOrigin: country,
          preparationTime: timeVal,
          ingredients: ingredientsList.length > 0 ? ingredientsList : [ingredients.trim() || 'Ingredients'],
          instructions: instructions.trim(),
          description: description.trim() || '',
          type: recipeType || 'dinner',
          locationImage: imgDataUrl
        };

        let savedRecipeObj;
        try {
          const res = await createRecipe(backendPayload);
          const r = res.data;
          savedRecipeObj = {
            id: r._id || r.id || Date.now(),
            _id: r._id || r.id,
            name: r.name,
            country: r.countryOfOrigin || r.country,
            time: r.preparationTime || timeVal,
            timeDisplay: `${r.preparationTime || timeVal}`,
            ingredients: Array.isArray(r.ingredients) ? r.ingredients.join(', ') : r.ingredients,
            instructions: r.instructions,
            description: r.description,
            image: r.locationImage || imgDataUrl
          };
        } catch (err) {
          const serverErrMsg = err.response?.data?.message || err.message;
          alert(`Failed to save recipe: ${serverErrMsg}`);
          setIsSubmitting(false);
          return;
        }

        const updatedRecipes = [...recipes, savedRecipeObj];
        setRecipes(updatedRecipes);
        try {
          localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
        } catch (storageErr) {
          console.warn('localStorage quota exceeded for recipes cache:', storageErr.message);
        }
        resetForm();
        setIsSubmitting(false);
        navigate('/my-recipes');
      };

      reader.onerror = () => {
        alert('Error reading the image file. Please try another image.');
        setIsSubmitting(false);
      };

      reader.readAsDataURL(image);
    } catch (error) {
      console.error('Error creating recipe card:', error);
      alert('Error creating recipe card. Please try again.');
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRecipeName('');
    setCountry('other');
    setPrepTime('');
    setIngredients('');
    setInstructions('');
    setDescription('');
    setImage(null);
    const imgInput = document.getElementById('recipeImageInput');
    if (imgInput) imgInput.value = '';
  };

  const handleDeleteRecipe = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    const target = recipes.find(r => r.id === id || r._id === id);
    if (target && target._id) {
      try {
        await deleteRecipe(target._id);
      } catch (err) {
        console.error('Failed to delete from server:', err);
      }
    }
    const updatedRecipes = recipes.filter((r) => r.id !== id && r._id !== id);
    setRecipes(updatedRecipes);
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
  };

  const showRecipeDetails = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeModal = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className="recipe-page">
      <Navbar activePage="/home" />

      <h1>Create Your Recipe Card</h1>
      <form className="recipe-form" onSubmit={handleSubmit}>
        <div className="recipe-form-row">
          <div className="recipe-form-group">
            <label htmlFor="recipeNameInput">Recipe Name (max 20 characters):</label>
            <input
              type="text"
              id="recipeNameInput"
              maxLength="20"
              pattern="[A-Za-z ]+"
              title="Only letters and spaces allowed"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <div className="recipe-char-count">{updateCharCount(recipeName, 20)}</div>
          </div>
          <div className="recipe-form-group">
            <label htmlFor="countrySelect">Country of Origin:</label>
            <select id="countrySelect" value={country} onChange={(e) => setCountry(e.target.value)} required disabled={isSubmitting}>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="recipe-form-group">
            <label htmlFor="prepTimeInput">Preparation Time (min 3 minutes):</label>
            <input
              type="number"
              id="prepTimeInput"
              min="3"
              max="1440"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className="recipe-form-row">
          <div className="recipe-form-group">
            <label htmlFor="ingredientsTextarea">Ingredients (max 200 characters):</label>
            <textarea
              id="ingredientsTextarea"
              maxLength="200"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <div className="recipe-char-count">{updateCharCount(ingredients, 200)}</div>
          </div>
          <div className="recipe-form-group">
            <label htmlFor="instructionsTextarea">Instructions (min 10, max 200 characters):</label>
            <textarea
              id="instructionsTextarea"
              maxLength="200"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <div className="recipe-char-count">{updateCharCount(instructions, 200)}</div>
          </div>
          <div className="recipe-form-group">
            <label htmlFor="descriptionTextarea">Description (max 200 characters):</label>
            <textarea
              id="descriptionTextarea"
              maxLength="200"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <div className="recipe-char-count">{updateCharCount(description, 200)}</div>
          </div>
        </div>
        <div className="recipe-form-row">
          <div className="recipe-form-group" style={{ flex: 1 }}>
            <label htmlFor="recipeImageInput">Upload Recipe Image:</label>
            <input
              type="file"
              id="recipeImageInput"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
        <button type="submit" className="recipe-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Saving to Server...' : 'Generate Recipe Card'}
        </button>
      </form>
    </div>
  );
};

export default RecipeCardGenerator;
