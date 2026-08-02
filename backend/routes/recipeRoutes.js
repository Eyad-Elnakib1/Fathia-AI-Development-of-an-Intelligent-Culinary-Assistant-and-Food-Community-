const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');

// Valid recipe types
const VALID_RECIPE_TYPES = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'salty', 'sweet', 'appetizer', 'beverage', 'spicy', 'soup'];

// Helper function to parse time input (H:MM or minutes)
const parseTimeInput = (input) => {
    if (!input) return null;

    // Handle H:MM format (e.g., "1:10")
    if (typeof input === 'string' && input.includes(':')) {
        const parts = input.split(':');
        if (parts.length === 2) {
            const hours = parseInt(parts[0], 10);
            const mins = parseInt(parts[1], 10);
            if (!isNaN(hours) && !isNaN(mins) && hours >= 0 && mins >= 0 && mins < 60) {
                return hours * 60 + mins;
            }
        }
        return false;
    }

    // Handle number or numeric string (e.g., 70 or "70")
    const num = Number(input);
    return !isNaN(num) && num >= 0 ? num : false;
};

// Helper function to remove vowels for missing vowel search
const removeVowels = (str) => str.replace(/[aeiouAEIOU]/g, '');

// Helper function to create a regex for case sensitivity
const createRegex = (value, caseSensitive = false) => {
    return new RegExp(value, caseSensitive ? '' : 'i');
};

// @route   GET /api/recipe/my-recipes
// @desc    Get all recipes created by current logged-in user
// @access  Private
router.get('/my-recipes', protect, async (req, res) => {
    try {
        const recipes = await Recipe.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: recipes,
            count: recipes.length
        });
    } catch (error) {
        console.error('Error fetching user recipes:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user recipes',
            error: error.message
        });
    }
});

// Route to search and retrieve recipes
router.get('/', async (req, res) => {
    try {
        const { name, ingredients, countryOfOrigin, preparationTime, prepTimeMin, prepTimeMax, type, userId, description, caseSensitive, sort } = req.query;
        let query = {};

        // Flag for case sensitivity (default: false, i.e., case-insensitive)
        const isCaseSensitive = caseSensitive === 'true';

        // UserID search
        if (userId) {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: 'Invalid User ID format' });
            }
            query.userId = userId;
        }

        // Name search with missing vowels
        if (name) {
            if (name.length < 2) {
                return res.status(400).json({ message: 'Name must be at least 2 characters long' });
            }
            const noVowelsName = removeVowels(name);
            if (noVowelsName.length > 0) {
                query.$or = query.$or || [];
                query.$or.push({ name: createRegex(name, isCaseSensitive) });
                query.$or.push({ name: createRegex(noVowelsName, isCaseSensitive) });
            } else {
                query.name = createRegex(name, isCaseSensitive);
            }
        }

        // Ingredients search
        if (ingredients) {
            const ingredientList = ingredients.split(',').map(item => item.trim());
            if (ingredientList.some(item => item.length < 2)) {
                return res.status(400).json({ message: 'Each ingredient must be at least 2 characters long' });
            }
            query.ingredients = { $all: ingredientList.map(item => createRegex(item, isCaseSensitive)) };
        }

        // Country of origin search
        if (countryOfOrigin) {
            if (countryOfOrigin.length < 2) {
                return res.status(400).json({ message: 'Country of origin must be at least 2 characters long' });
            }
            query.countryOfOrigin = createRegex(countryOfOrigin, isCaseSensitive);
        }

        // Description search (keyword search)
        if (description) {
            if (description.length < 2) {
                return res.status(400).json({ message: 'Description search term must be at least 2 characters long' });
            }
            query.description = createRegex(description, isCaseSensitive);
        }

        // Type search
        if (type) {
            if (!VALID_RECIPE_TYPES.includes(type.trim().toLowerCase())) {
                return res.status(400).json({ 
                    message: `Invalid recipe type. Must be one of: ${VALID_RECIPE_TYPES.join(', ')}` 
                });
            }
            query.type = type.trim().toLowerCase();
        }

        // Preparation time handling (exact match or range)
        if (preparationTime) {
            const minutes = parseTimeInput(preparationTime);
            if (minutes === false) {
                return res.status(400).json({ message: 'Preparation time must be a valid number or H:MM format' });
            }
            if (minutes < 3) {
                return res.status(400).json({ message: 'Preparation time must be at least 3 minutes' });
            }
            query.preparationTime = minutes;
        } else if (prepTimeMin || prepTimeMax) {
            query.preparationTime = {};
            if (prepTimeMin) {
                const min = parseTimeInput(prepTimeMin);
                if (min === false || min < 3) {
                    return res.status(400).json({ message: 'Minimum preparation time must be at least 3 minutes' });
                }
                query.preparationTime.$gte = min;
            }
            if (prepTimeMax) {
                const max = parseTimeInput(prepTimeMax);
                if (max === false || max < 3) {
                    return res.status(400).json({ message: 'Maximum preparation time must be at least 3 minutes' });
                }
                query.preparationTime.$lte = max;
            }
            if (prepTimeMin && prepTimeMax && query.preparationTime.$gte > query.preparationTime.$lte) {
                return res.status(400).json({ message: 'Maximum preparation time must be greater than or equal to minimum' });
            }
        }

        let sortOption = {};
        if (sort === 'desc' || sort === 'asc') {
            sortOption.preparationTime = sort === 'desc' ? -1 : 1;
        } else {
            sortOption.createdAt = -1; // Default newest first
        }

        const recipes = await Recipe.find(query).sort(sortOption);
        res.status(200).json({
            success: true,
            data: recipes,
            count: recipes.length
        });
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching recipes',
            error: error.message
        });
    }
});

// Create recipe card
router.post('/', protect, async (req, res) => {
    try {
        const { name, ingredients, preparationTime, instructions, countryOfOrigin, type, userId, description, locationImage, locatioImage } = req.body;

        if (userId !== undefined) {
            return res.status(400).json({ message: 'User ID is taken from authenticated user and cannot be provided' });
        }

        if (!name || !ingredients || !preparationTime || !instructions || !countryOfOrigin || !type) {
            return res.status(400).json({ 
                message: 'All fields (name, ingredients, preparationTime, instructions, countryOfOrigin, type) are required' 
            });
        }

        if (typeof name !== 'string' || name.trim().length < 2) {
            return res.status(400).json({ message: 'Name must be a string with at least 2 characters' });
        }

        if (!Array.isArray(ingredients) || ingredients.length === 0 || !ingredients.every(item => typeof item === 'string' && item.trim().length > 0)) {
            return res.status(400).json({ message: 'Ingredients must be a non-empty array of non-empty strings' });
        }

        const parsedPrepTime = parseTimeInput(preparationTime);
        if (parsedPrepTime === false || parsedPrepTime < 3) {
            return res.status(400).json({ message: 'Preparation time must be at least 3 minutes' });
        }

        if (typeof instructions !== 'string' || instructions.trim().length < 10) {
            return res.status(400).json({ message: 'Instructions must be a string with at least 10 characters' });
        }

        if (typeof countryOfOrigin !== 'string' || countryOfOrigin.trim().length < 2) {
            return res.status(400).json({ message: 'Country of origin must be a string with at least 2 characters' });
        }

        if (typeof type !== 'string' || !VALID_RECIPE_TYPES.includes(type.trim().toLowerCase())) {
            return res.status(400).json({ 
                message: `Invalid recipe type. Must be one of: ${VALID_RECIPE_TYPES.join(', ')}` 
            });
        }

        const imgUrl = locationImage || locatioImage || '/images/showcase/recipe-manager.jpg';

        const recipe = new Recipe({
            name: name.trim(),
            ingredients: ingredients.map(item => item.trim()),
            preparationTime: parsedPrepTime,
            instructions: instructions.trim(),
            countryOfOrigin: countryOfOrigin.trim(),
            type: type.trim().toLowerCase(),
            userId: req.user._id,
            description: description ? description.trim() : '',
            locationImage: imgUrl,
        });

        const savedRecipe = await recipe.save();
        res.status(201).json({ success: true, data: savedRecipe });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Update recipe card
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, ingredients, preparationTime, instructions, countryOfOrigin, type, userId, description, locationImage, locatioImage } = req.body;
        const recipeId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(recipeId)) {
            return res.status(400).json({ message: 'Invalid recipe ID format' });
        }

        if (userId !== undefined) {
            return res.status(400).json({ message: 'User ID cannot be updated' });
        }

        const recipe = await Recipe.findOne({ _id: recipeId, userId: req.user._id });
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found or you are not authorized to update it' });
        }

        const update = {};

        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim().length < 2) {
                return res.status(400).json({ message: 'Name must be a string with at least 2 characters' });
            }
            update.name = name.trim();
        }

        if (ingredients !== undefined) {
            if (!Array.isArray(ingredients) || ingredients.length === 0 || !ingredients.every(item => typeof item === 'string' && item.trim().length > 0)) {
                return res.status(400).json({ message: 'Ingredients must be a non-empty array of non-empty strings' });
            }
            update.ingredients = ingredients.map(item => item.trim());
        }

        if (preparationTime !== undefined) {
            const parsedPrepTime = parseTimeInput(preparationTime);
            if (parsedPrepTime === false || parsedPrepTime < 3) {
                return res.status(400).json({ message: 'Preparation time must be at least 3 minutes' });
            }
            update.preparationTime = parsedPrepTime;
        }

        if (instructions !== undefined) {
            if (typeof instructions !== 'string' || instructions.trim().length < 10) {
                return res.status(400).json({ message: 'Instructions must be a string with at least 10 characters' });
            }
            update.instructions = instructions.trim();
        }

        if (countryOfOrigin !== undefined) {
            if (typeof countryOfOrigin !== 'string' || countryOfOrigin.trim().length < 2) {
                return res.status(400).json({ message: 'Country of origin must be a string with at least 2 characters' });
            }
            update.countryOfOrigin = countryOfOrigin.trim();
        }

        if (type !== undefined) {
            if (typeof type !== 'string' || !VALID_RECIPE_TYPES.includes(type.trim().toLowerCase())) {
                return res.status(400).json({ 
                    message: `Invalid recipe type. Must be one of: ${VALID_RECIPE_TYPES.join(', ')}` 
                });
            }
            update.type = type.trim().toLowerCase();
        }

        if (description !== undefined) {
            update.description = description ? description.trim() : '';
        }

        if (locationImage !== undefined || locatioImage !== undefined) {
            update.locationImage = locationImage || locatioImage || '/images/showcase/recipe-manager.jpg';
        }

        const updatedRecipe = await Recipe.findOneAndUpdate(
            { _id: recipeId, userId: req.user._id },
            { $set: update },
            { new: true, runValidators: true }
        );

        res.json({ success: true, data: updatedRecipe });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// DELETE route to delete a recipe
router.delete('/:id', protect, async (req, res) => {
    try {
        const recipeId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(recipeId)) {
            return res.status(400).json({ message: 'Invalid recipe ID format' });
        }

        const deletedRecipe = await Recipe.findOneAndDelete({ _id: recipeId, userId: req.user._id });

        if (!deletedRecipe) {
            return res.status(404).json({ message: 'Recipe not found or you are not authorized to delete it' });
        }

        res.json({ success: true, message: 'Recipe deleted successfully', data: deletedRecipe });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

module.exports = router;
