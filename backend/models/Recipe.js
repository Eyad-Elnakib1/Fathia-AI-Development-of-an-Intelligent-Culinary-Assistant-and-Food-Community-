const mongoose = require('mongoose');

// Helper function to format minutes as H:MM
const formatTime = (minutes) => {
    if (typeof minutes !== 'number' || minutes < 0) return '0:00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
};

const recipeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    description: {
        type: String,
        trim: true,
        default: '',
    },
    type: {
        type: String,
        required: [true, 'Recipe type is required'],
        set: v => v ? v.toLowerCase() : v,
        enum: {
            values: ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'salty', 'sweet', 'appetizer', 'beverage', 'spicy', 'soup'],
            message: 'Invalid recipe type. Must be one of: breakfast, lunch, dinner, dessert, snack, salty, sweet, appetizer, beverage, spicy, soup',
        },
        trim: true,
    },
    name: {
        type: String,
        required: [true, 'Recipe name is required'],
        trim: true,
        minlength: [2, 'Recipe name must be at least 2 characters long'],
    },
    countryOfOrigin: {
        type: String,
        required: [true, 'Country of origin is required'],
        trim: true,
        minlength: [2, 'Country of origin must be at least 2 characters long'],
    },
    preparationTime: {
        type: Number,
        required: [true, 'Preparation time is required'],
        min: [3, 'Preparation time must be at least 3 minutes'],
        get: formatTime,
    },
    ingredients: {
        type: [String],
        required: [true, 'Ingredients are required'],
        validate: {
            validator: function (array) {
                return array && array.length > 0 && array.every(item => typeof item === 'string' && item.trim().length > 0);
            },
            message: 'Ingredients must be a non-empty array of non-empty strings',
        },
    },
    instructions: {
        type: String,
        required: [true, 'Instructions are required'],
        trim: true,
        minlength: [10, 'Instructions must be at least 10 characters long'],
    },
    locationImage: {
        type: String,
        trim: true,
        default: '/images/showcase/recipe-manager.jpg',
        validate: {
            validator: function (v) {
                if (!v) return true;
                return /^(https?:\/\/|data:image\/|\/uploads\/|\/images\/|.\/images\/|\/|\.\/)/i.test(v);
            },
            message: 'Location image must be a valid URL or path',
        },
    },
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
});

// Pre-save middleware to validate userId exists
recipeSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('userId')) {
        try {
            const user = await mongoose.model('User').findById(this.userId);
            if (!user) {
                return next(new Error('Invalid User ID: User not found'));
            }
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

// Index for faster queries
recipeSchema.index({ name: 1, countryOfOrigin: 1, type: 1, userId: 1 });

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
module.exports.Recipe = Recipe;