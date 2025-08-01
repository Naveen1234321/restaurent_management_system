const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    price: {
        type: Number,
        required: true
    },
    customizations: [{
        name: String,
        price: Number
    }],
    specialInstructions: String
});

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative']
    },
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true,
        default: 0
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    orderType: {
        type: String,
        enum: ['dine_in', 'takeaway', 'delivery'],
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'online'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    deliveryAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        phone: String
    },
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    specialInstructions: String,
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    review: String,
    assignedEmployee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    orderNumber: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

// Generate order number before saving
orderSchema.pre('save', async function(next) {
    if (this.isNew && !this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        // Get count of orders for today
        const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        
        const orderCount = await this.constructor.countDocuments({
            createdAt: { $gte: todayStart, $lt: todayEnd }
        });
        
        this.orderNumber = `ORD${year}${month}${day}${String(orderCount + 1).padStart(3, '0')}`;
    }
    next();
});

// Virtual for formatted total
orderSchema.virtual('formattedTotal').get(function() {
    return `₹${this.totalAmount.toFixed(0)}`;
});

// Virtual for order status color
orderSchema.virtual('statusColor').get(function() {
    const statusColors = {
        pending: '#f39c12',
        confirmed: '#3498db',
        preparing: '#9b59b6',
        ready: '#27ae60',
        out_for_delivery: '#e67e22',
        delivered: '#27ae60',
        cancelled: '#e74c3c'
    };
    return statusColors[this.status] || '#95a5a6';
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema); 