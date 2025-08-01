const express = require('express');
const { body, validationResult } = require('express-validator');
const MenuItem = require('../models/MenuItem');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/menu
// @desc    Get all menu items
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, search, isAvailable, limit = 50, page = 1 } = req.query;

        // Build query
        const query = {};

        if (category && category !== 'all') {
            query.category = category;
        }

        if (isAvailable !== undefined) {
            query.isAvailable = isAvailable === 'true';
        }

        if (search) {
            query.$text = { $search: search };
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        const menuItems = await MenuItem.find(query)
            .sort({ popularity: -1, name: 1 })
            .skip(skip)
            .limit(limitNum);

        const total = await MenuItem.countDocuments(query);

        res.json({
            status: 'success',
            data: {
                menuItems,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limitNum),
                    totalItems: total,
                    itemsPerPage: limitNum
                }
            }
        });
    } catch (error) {
        console.error('Get menu items error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// @route   GET /api/menu/categories
// @desc    Get all menu categories
// @access  Public
router.get('/categories', async (req, res) => {
    try {
        const categories = await MenuItem.distinct('category');
        
        res.json({
            status: 'success',
            data: {
                categories
            }
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// @route   GET /api/menu/:id
// @desc    Get single menu item
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        
        if (!menuItem) {
            return res.status(404).json({
                status: 'error',
                message: 'Menu item not found'
            });
        }

        res.json({
            status: 'success',
            data: {
                menuItem
            }
        });
    } catch (error) {
        console.error('Get menu item error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// @route   POST /api/menu
// @desc    Create new menu item
// @access  Private (Admin only)
router.post('/', [
    authMiddleware,
    adminOnly,
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('category')
        .isIn(['appetizers', 'main-course', 'desserts', 'drinks', 'beverages'])
        .withMessage('Invalid category'),
    body('image')
        .isURL()
        .withMessage('Please provide a valid image URL')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const menuItem = new MenuItem(req.body);
        await menuItem.save();

        res.status(201).json({
            status: 'success',
            message: 'Menu item created successfully',
            data: {
                menuItem
            }
        });
    } catch (error) {
        console.error('Create menu item error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// @route   PUT /api/menu/:id
// @desc    Update menu item
// @access  Private (Admin only)
router.put('/:id', [
    authMiddleware,
    adminOnly,
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters'),
    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('category')
        .optional()
        .isIn(['appetizers', 'main-course', 'desserts', 'drinks', 'beverages'])
        .withMessage('Invalid category'),
    body('image')
        .optional()
        .isURL()
        .withMessage('Please provide a valid image URL')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const menuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!menuItem) {
            return res.status(404).json({
                status: 'error',
                message: 'Menu item not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Menu item updated successfully',
            data: {
                menuItem
            }
        });
    } catch (error) {
        console.error('Update menu item error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// @route   DELETE /api/menu/:id
// @desc    Delete menu item
// @access  Private (Admin only)
router.delete('/:id', [authMiddleware, adminOnly], async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

        if (!menuItem) {
            return res.status(404).json({
                status: 'error',
                message: 'Menu item not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        console.error('Delete menu item error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// @route   PATCH /api/menu/:id/availability
// @desc    Toggle menu item availability
// @access  Private (Admin only)
router.patch('/:id/availability', [authMiddleware, adminOnly], async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return res.status(404).json({
                status: 'error',
                message: 'Menu item not found'
            });
        }

        menuItem.isAvailable = !menuItem.isAvailable;
        await menuItem.save();

        res.json({
            status: 'success',
            message: `Menu item ${menuItem.isAvailable ? 'made available' : 'made unavailable'}`,
            data: {
                menuItem
            }
        });
    } catch (error) {
        console.error('Toggle availability error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

module.exports = router; 