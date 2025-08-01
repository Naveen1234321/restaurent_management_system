const express = require('express');
const Order = require('../models/Order');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const { authMiddleware, adminOnly, employeeAndAdmin, customerOnly } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/admin
// @desc    Get admin dashboard stats
// @access  Private (Admin)
router.get('/admin', [authMiddleware, adminOnly], async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
        const totalReservations = await Reservation.countDocuments();
        res.json({ status: 'success', data: {
            totalUsers,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalReservations
        }});
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// @route   GET /api/dashboard/employee
// @desc    Get employee dashboard stats
// @access  Private (Employee/Admin)
router.get('/employee', [authMiddleware, employeeAndAdmin], async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0,0,0,0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const todayReservations = await Reservation.find({ date: { $gte: today, $lt: tomorrow } });
        res.json({ status: 'success', data: { todayReservations } });
    } catch (error) {
        console.error('Employee dashboard error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// @route   GET /api/dashboard/customer
// @desc    Get customer dashboard stats
// @access  Private (Customer)
router.get('/customer', [authMiddleware, customerOnly], async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user.id });
        const reservations = await Reservation.find({ customer: req.user.id });
        const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        res.json({ status: 'success', data: {
            totalOrders: orders.length,
            totalSpent,
            reservations
        }});
    } catch (error) {
        console.error('Customer dashboard error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

module.exports = router; 