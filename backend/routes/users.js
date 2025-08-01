const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin)
// @access  Private (Admin)
router.get('/', [authMiddleware, adminOnly], async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({ status: 'success', data: { users } });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// @route   PATCH /api/users/:id/role
// @desc    Update user role (admin)
// @access  Private (Admin)
router.patch('/:id/role', [authMiddleware, adminOnly, body('role').isIn(['customer','employee','admin'])], async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
        user.role = role;
        await user.save();
        res.json({ status: 'success', message: 'User role updated', data: { user } });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// @route   PATCH /api/users/:id/activate
// @desc    Activate/deactivate user (admin)
// @access  Private (Admin)
router.patch('/:id/activate', [authMiddleware, adminOnly, body('isActive').isBoolean()], async (req, res) => {
    try {
        const { isActive } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
        user.isActive = isActive;
        await user.save();
        res.json({ status: 'success', message: `User ${isActive ? 'activated' : 'deactivated'}`, data: { user } });
    } catch (error) {
        console.error('Activate user error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// @route   PATCH /api/users/me
// @desc    Update own profile
// @access  Private
router.patch('/me', authMiddleware, [
    body('name').optional().isLength({ min: 2, max: 50 }),
    body('phone').optional().isString(),
    body('address').optional().isObject()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 'error', errors: errors.array() });
        }
        const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true, runValidators: true }).select('-password');
        res.json({ status: 'success', message: 'Profile updated', data: { user } });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

module.exports = router; 