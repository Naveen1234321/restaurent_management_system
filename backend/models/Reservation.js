const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number']
    },
    date: {
        type: Date,
        required: [true, 'Please provide a reservation date']
    },
    time: {
        type: String,
        required: [true, 'Please provide a reservation time'],
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time format (HH:MM)']
    },
    partySize: {
        type: Number,
        required: [true, 'Please provide party size'],
        min: [1, 'Party size must be at least 1'],
        max: [20, 'Party size cannot exceed 20']
    },
    tableNumber: {
        type: Number,
        min: 1
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    specialRequests: {
        type: String,
        maxlength: [500, 'Special requests cannot exceed 500 characters']
    },
    occasion: {
        type: String,
        enum: ['birthday', 'anniversary', 'business', 'casual', 'other'],
        default: 'casual'
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    confirmationCode: {
        type: String,
        unique: true
    },
    assignedEmployee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: String,
    reminderSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for better query performance
reservationSchema.index({ date: 1, time: 1 });
reservationSchema.index({ customer: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ confirmationCode: 1 });

// Generate confirmation code before saving
reservationSchema.pre('save', async function(next) {
    if (this.isNew && !this.confirmationCode) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.confirmationCode = result;
    }
    next();
});

// Virtual for formatted date
reservationSchema.virtual('formattedDate').get(function() {
    return this.date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Virtual for status color
reservationSchema.virtual('statusColor').get(function() {
    const statusColors = {
        pending: '#f39c12',
        confirmed: '#27ae60',
        cancelled: '#e74c3c',
        completed: '#3498db'
    };
    return statusColors[this.status] || '#95a5a6';
});

// Ensure virtual fields are serialized
reservationSchema.set('toJSON', { virtuals: true });
reservationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Reservation', reservationSchema); 