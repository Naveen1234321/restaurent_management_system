const express = require('express');
const { body, validationResult } = require('express-validator');
const Reservation = require('../models/Reservation');
const { authMiddleware, customerOnly, employeeAndAdmin, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/reservations
// @desc    Create a new reservation (customer)
// @access  Private (Customer)
router.post('/', [
    authMiddleware,
    customerOnly,
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('partySize').isInt({ min: 1, max: 20 }).withMessage('Party size must be between 1 and 20')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 'error', errors: errors.array() });
        }
        const { name, email, phone, date, time, partySize, specialRequests, occasion } = req.body;
        const reservation = new Reservation({
            customer: req.user.id,
            name,
            email,
            phone,
            date,
            time,
            partySize,
            specialRequests,
            occasion
        });
        await reservation.save();
        res.status(201).json({ status: 'success', message: 'Reservation created', data: { reservation } });
    } catch (error) {
        console.error('Create reservation error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// @route   GET /api/reservations
// @desc    Get all reservations for current user (customer)
// @access  Private (Customer)
router.get('/', [authMiddleware, customerOnly], async (req, res) => {
    try {
        const reservations = await Reservation.find({ customer: req.user.id }).sort({ date: -1, time: -1 });
        res.json({ status: 'success', data: { reservations } });
    } catch (error) {
        console.error('Get reservations error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// @route   GET /api/reservations/all
// @desc    Get all reservations (admin/employee)
// @access  Private (Admin/Employee)
router.get('/all', [authMiddleware, employeeAndAdmin], async (req, res) => {
    try {
        const { date } = req.query;
        const query = date ? { date: new Date(date) } : {};
        const reservations = await Reservation.find(query).populate('customer', 'name email phone').sort({ date: -1, time: -1 });
        res.json({ status: 'success', data: { reservations } });
    } catch (error) {
        console.error('Get all reservations error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// @route   PATCH /api/reservations/:id/status
// @desc    Update reservation status (admin/employee)
// @access  Private (Admin/Employee)
router.patch('/:id/status', [authMiddleware, employeeAndAdmin, body('status').isIn(['pending','confirmed','cancelled','completed'])], async (req, res) => {
    try {
        const { status } = req.body;
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) return res.status(404).json({ status: 'error', message: 'Reservation not found' });
        reservation.status = status;
        await reservation.save();
        res.json({ status: 'success', message: 'Reservation status updated', data: { reservation } });
    } catch (error) {
        console.error('Update reservation status error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// @route   DELETE /api/reservations/:id
// @desc    Cancel reservation (customer or admin)
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) return res.status(404).json({ status: 'error', message: 'Reservation not found' });
        if (req.user.role === 'customer' && reservation.customer.toString() !== req.user.id) {
            return res.status(403).json({ status: 'error', message: 'Not authorized' });
        }
        await reservation.remove();
        res.json({ status: 'success', message: 'Reservation cancelled' });
    } catch (error) {
        console.error('Cancel reservation error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

module.exports = router; 