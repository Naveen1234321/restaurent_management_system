const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { authMiddleware, customerOnly, employeeAndAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private (Customer)
router.post('/', [
    authMiddleware,
    customerOnly,
    body('items')
        .isArray({ min: 1 })
        .withMessage('At least one item is required'),
    body('items.*.menuItem')
        .isMongoId()
        .withMessage('Invalid menu item ID'),
    body('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1'),
    body('orderType')
        .isIn(['dine_in', 'takeaway', 'delivery'])
        .withMessage('Invalid order type'),
    body('paymentMethod')
        .isIn(['cash', 'card', 'upi', 'online'])
        .withMessage('Invalid payment method')
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

        const { items, orderType, paymentMethod, deliveryAddress, specialInstructions } = req.body;

        // Calculate totals and validate items
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const menuItem = await MenuItem.findById(item.menuItem);
            
            if (!menuItem) {
                return res.status(400).json({
                    status: 'error',
                    message: `Menu item with ID ${item.menuItem} not found`
                });
            }

            if (!menuItem.isAvailable) {
                return res.status(400).json({
                    status: 'error',
                    message: `${menuItem.name} is currently unavailable`
                });
            }

            const itemTotal = menuItem.price * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                menuItem: menuItem._id,
                quantity: item.quantity,
                price: menuItem.price,
                customizations: item.customizations || [],
                specialInstructions: item.specialInstructions
            });
        }

        // Calculate tax and delivery fee
        const tax = subtotal * 0.05; // 5% tax
        const deliveryFee = orderType === 'delivery' ? 50 : 0;
        const totalAmount = subtotal + tax + deliveryFee;

        // Create order
        const order = new Order({
            customer: req.user.id,
            items: orderItems,
            totalAmount,
            subtotal,
            tax,
            deliveryFee,
            orderType,
            paymentMethod,
            deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
            specialInstructions
        });

        await order.save();

        // Populate menu item details for response
        await order.populate('items.menuItem', 'name price image');

        res.status(201).json({
            status: 'success',
            message: 'Order created successfully',
            data: {
                order
            }
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { status, limit = 10, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = { customer: req.user.id };
        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('items.menuItem', 'name price image')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(query);

        res.json({
            status: 'success',
            data: {
                orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email phone')
            .populate('items.menuItem', 'name price image description')
            .populate('assignedEmployee', 'name');

        if (!order) {
            return res.status(404).json({
                status: 'error',
                message: 'Order not found'
            });
        }

        // Check if user is authorized to view this order
        if (req.user.role === 'customer' && order.customer.toString() !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to view this order'
            });
        }

        res.json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status (Admin/Employee only)
// @access  Private (Admin/Employee)
router.patch('/:id/status', [
    authMiddleware,
    employeeAndAdmin,
    body('status')
        .isIn(['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'])
        .withMessage('Invalid status')
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

        const { status } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                status: 'error',
                message: 'Order not found'
            });
        }

        order.status = status;
        
        // Update delivery time if order is delivered
        if (status === 'delivered') {
            order.actualDeliveryTime = new Date();
        }

        // Assign employee if not already assigned
        if (!order.assignedEmployee) {
            order.assignedEmployee = req.user.id;
        }

        await order.save();

        await order.populate('customer', 'name email phone');
        await order.populate('items.menuItem', 'name price image');

        res.json({
            status: 'success',
            message: 'Order status updated successfully',
            data: {
                order
            }
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// @route   POST /api/orders/:id/rate
// @desc    Rate an order (Customer only)
// @access  Private (Customer)
router.post('/:id/rate', [
    authMiddleware,
    customerOnly,
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('review')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Review cannot exceed 500 characters')
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

        const { rating, review } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                status: 'error',
                message: 'Order not found'
            });
        }

        // Check if user owns this order
        if (order.customer.toString() !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to rate this order'
            });
        }

        // Check if order is delivered
        if (order.status !== 'delivered') {
            return res.status(400).json({
                status: 'error',
                message: 'Can only rate delivered orders'
            });
        }

        // Check if already rated
        if (order.rating) {
            return res.status(400).json({
                status: 'error',
                message: 'Order has already been rated'
            });
        }

        order.rating = rating;
        order.review = review;
        await order.save();

        res.json({
            status: 'success',
            message: 'Order rated successfully',
            data: {
                order
            }
        });
    } catch (error) {
        console.error('Rate order error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// @route   GET /api/orders/admin/all
// @desc    Get all orders (Admin only)
// @access  Private (Admin)
router.get('/admin/all', [authMiddleware, employeeAndAdmin], async (req, res) => {
    try {
        const { status, limit = 20, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('customer', 'name email phone')
            .populate('items.menuItem', 'name price')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(query);

        res.json({
            status: 'success',
            data: {
                orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

module.exports = router; 