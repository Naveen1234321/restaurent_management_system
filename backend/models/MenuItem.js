const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
        enum: ['appetizers', 'main-course', 'desserts', 'drinks', 'beverages'],
        default: 'main-course'
    },
    image: {
        type: String,
        required: [true, 'Please provide an image URL']
    },
    isVegetarian: {
        type: Boolean,
        default: false
    },
    isVegan: {
        type: Boolean,
        default: false
    },
    isGlutenFree: {
        type: Boolean,
        default: false
    },
    isSpicy: {
        type: Boolean,
        default: false
    },
    allergens: [{
        type: String,
        enum: ['nuts', 'dairy', 'eggs', 'soy', 'wheat', 'fish', 'shellfish']
    }],
    nutritionalInfo: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number,
        fiber: Number
    },
    preparationTime: {
        type: Number, // in minutes
        default: 15
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    popularity: {
        type: Number,
        default: 0,
        min: 0
    },
    tags: [String],
    customizations: [{
        name: String,
        price: Number,
        isRequired: {
            type: Boolean,
            default: false
        }
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ isAvailable: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });

// Virtual for formatted price
menuItemSchema.virtual('formattedPrice').get(function() {
    return `₹${this.price.toFixed(0)}`;
});

// Ensure virtual fields are serialized
menuItemSchema.set('toJSON', { virtuals: true });
menuItemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MenuItem', menuItemSchema); 