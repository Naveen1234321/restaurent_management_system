// Global variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    setupNavigation();
    setupMobileMenu();
    setupFormHandlers();
    updateCartDisplay();
    loadMenuItems();
    setupDashboard();
}

// Navigation setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage || 
            (currentPage === 'index.html' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Mobile menu functionality
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Form handlers
function setupFormHandlers() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const loginData = {
                email: formData.get('email'),
                password: formData.get('password'),
                role: formData.get('role')
            };
            
            try {
                const response = await simulateApiCall(loginData, '/api/login');
                if (response.success) {
                    // Store user info
                    localStorage.setItem('currentUser', JSON.stringify(response.user));
                    
                    // Redirect based on role
                    if (loginData.role === 'admin') {
                        window.location.href = 'dashboard.html?role=admin';
                    } else if (loginData.role === 'employee') {
                        window.location.href = 'dashboard.html?role=employee';
                    } else {
                        // For customers, redirect to customer dashboard
                        window.location.href = 'customer-dashboard.html';
                    }
                } else {
                    alert('Login failed. Please check your credentials.');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed. Please try again.');
            }
        });
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(registerForm);
            const registerData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                password: formData.get('password'),
                role: formData.get('role')
            };
            
            try {
                const response = await simulateApiCall(registerData, '/api/register');
                if (response.success) {
                    alert('Registration successful! Please login.');
                    window.location.href = 'login.html';
                } else {
                    alert('Registration failed. Please try again.');
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('Registration failed. Please try again.');
            }
        });
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContact);
    }

    // Reservation form
    const reservationForm = document.getElementById('reservationForm');
    if (reservationForm) {
        reservationForm.addEventListener('submit', handleReservation);
    }
}

// Contact form handler
async function handleContact(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };

    try {
        const response = await simulateApiCall(contactData, '/api/contact');
        
        if (response.success) {
            showMessage('Message sent successfully!', 'success');
            e.target.reset();
        } else {
            showMessage('Failed to send message. Please try again.', 'error');
        }
    } catch (error) {
        showMessage('Failed to send message. Please try again.', 'error');
    }
}

// Reservation handler
async function handleReservation(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const reservationData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        date: formData.get('date'),
        time: formData.get('time'),
        partySize: formData.get('partySize'),
        specialRequests: formData.get('specialRequests')
    };

    try {
        const response = await simulateApiCall(reservationData, '/api/reservations');
        
        if (response.success) {
            showMessage('Reservation submitted successfully! We will confirm shortly.', 'success');
            e.target.reset();
        } else {
            showMessage('Failed to submit reservation. Please try again.', 'error');
        }
    } catch (error) {
        showMessage('Failed to submit reservation. Please try again.', 'error');
    }
}

// Load menu items
async function loadMenuItems() {
    const menuGrid = document.querySelector('.menu-grid');
    if (!menuGrid) return;

    try {
        const response = await simulateApiCall({}, '/api/menu');
        
        if (response.success) {
            displayMenuItems(response.menu);
        } else {
            showMessage('Failed to load menu items', 'error');
        }
    } catch (error) {
        showMessage('Failed to load menu items', 'error');
    }
}

// Display menu items
function displayMenuItems(menuItems) {
    const menuGrid = document.querySelector('.menu-grid');
    if (!menuGrid) return;

    menuGrid.innerHTML = '';
    
    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.dataset.category = item.category;
        
        menuItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="menu-item-content">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="menu-item-price">$${item.price.toFixed(2)}</div>
                <button class="add-to-cart" onclick="addToCart('${item.id}')">
                    Add to Cart
                </button>
            </div>
        `;
        
        menuGrid.appendChild(menuItem);
    });
}

// Setup menu filters
function setupMenuFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter menu items
            filterMenuItems(category);
        });
    });
}

// Filter menu items
function filterMenuItems(category) {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Cart functionality
function addToCart(itemId) {
    const existingItem = cart.find(item => item.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Get item details from menu
        const menuItem = document.querySelector(`[data-id="${itemId}"]`);
        if (menuItem) {
            cart.push({
                id: itemId,
                name: menuItem.querySelector('h3').textContent,
                price: parseFloat(menuItem.querySelector('.menu-item-price').textContent.replace('$', '')),
                quantity: 1,
                image: menuItem.querySelector('img').src
            });
        }
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showMessage('Item added to cart!', 'success');
}

// Update cart display
function updateCartDisplay() {
    const cartContainer = document.querySelector('.cart-items');
    if (!cartContainer) return;

    cartContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="text-center">Your cart is empty</p>';
        return;
    }

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
            </div>
            <button class="remove-item" onclick="removeFromCart('${item.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        cartContainer.appendChild(cartItem);
    });

    updateCartTotal();
}

// Update quantity
function updateQuantity(itemId, change) {
    const item = cart.find(item => item.id === itemId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
        }
    }
}

// Remove from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showMessage('Item removed from cart', 'success');
}

// Update cart total
function updateCartTotal() {
    const totalElement = document.querySelector('.cart-total');
    if (!totalElement) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalElement.textContent = `₹${total.toFixed(0)}`;
}

// Place order
async function placeOrder() {
    if (cart.length === 0) {
        showMessage('Your cart is empty', 'error');
        return;
    }

    if (!currentUser) {
        showMessage('Please login to place an order', 'error');
        return;
    }

    try {
        const orderData = {
            userId: currentUser.id,
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };

        const response = await simulateApiCall(orderData, '/api/orders');
        
        if (response.success) {
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
            showMessage('Order placed successfully!', 'success');
        } else {
            showMessage('Failed to place order. Please try again.', 'error');
        }
    } catch (error) {
        showMessage('Failed to place order. Please try again.', 'error');
    }
}

// Dashboard setup
function setupDashboard() {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    
    if (role === 'admin') {
        setupAdminDashboard();
    } else if (role === 'employee') {
        setupEmployeeDashboard();
    }
}

// Admin dashboard
function setupAdminDashboard() {
    loadAdminStats();
    loadPendingOrders();
}

// Employee dashboard
function setupEmployeeDashboard() {
    loadEmployeeStats();
    setupAttendance();
}

// Load admin stats
async function loadAdminStats() {
    try {
        const response = await simulateApiCall({}, '/api/admin/stats');
        
        if (response.success) {
            displayAdminStats(response.stats);
        }
    } catch (error) {
        console.error('Failed to load admin stats:', error);
    }
}

// Display admin stats
function displayAdminStats(stats) {
    const statsContainer = document.querySelector('.dashboard-stats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
        <div class="stat-card">
            <h3>${stats.totalOrders}</h3>
            <p>Total Orders</p>
        </div>
        <div class="stat-card">
            <h3>${stats.pendingOrders}</h3>
            <p>Pending Orders</p>
        </div>
        <div class="stat-card">
            <h3>₹${stats.totalRevenue.toFixed(0)}</h3>
            <p>Total Revenue</p>
        </div>
        <div class="stat-card">
            <h3>${stats.totalCustomers}</h3>
            <p>Total Customers</p>
        </div>
    `;
}

// Load pending orders
async function loadPendingOrders() {
    try {
        const response = await simulateApiCall({}, '/api/admin/orders/pending');
        
        if (response.success) {
            displayPendingOrders(response.orders);
        }
    } catch (error) {
        console.error('Failed to load pending orders:', error);
    }
}

// Display pending orders
function displayPendingOrders(orders) {
    const ordersContainer = document.querySelector('.pending-orders');
    if (!ordersContainer) return;

    ordersContainer.innerHTML = '';
    
    orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        
        orderElement.innerHTML = `
            <div>
                <h4>Order #${order.id}</h4>
                <p>Customer: ${order.customerName}</p>
                <p>Total: ₹${order.total.toFixed(0)}</p>
            </div>
            <div class="order-actions">
                <button class="action-btn approve-btn" onclick="approveOrder('${order.id}')">
                    Approve
                </button>
                <button class="action-btn reject-btn" onclick="rejectOrder('${order.id}')">
                    Reject
                </button>
            </div>
        `;
        
        ordersContainer.appendChild(orderElement);
    });
}

// Approve order
async function approveOrder(orderId) {
    try {
        const response = await simulateApiCall({ orderId }, '/api/admin/orders/approve');
        
        if (response.success) {
            showMessage('Order approved successfully!', 'success');
            loadPendingOrders();
        } else {
            showMessage('Failed to approve order', 'error');
        }
    } catch (error) {
        showMessage('Failed to approve order', 'error');
    }
}

// Reject order
async function rejectOrder(orderId) {
    try {
        const response = await simulateApiCall({ orderId }, '/api/admin/orders/reject');
        
        if (response.success) {
            showMessage('Order rejected successfully!', 'success');
            loadPendingOrders();
        } else {
            showMessage('Failed to reject order', 'error');
        }
    } catch (error) {
        showMessage('Failed to reject order', 'error');
    }
}

// Utility functions
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Simulate API calls (replace with actual API calls)
async function simulateApiCall(data, endpoint) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock responses based on endpoint
    switch (endpoint) {
        case '/api/login':
            return {
                success: true,
                user: {
                    id: '1',
                    name: data.email.split('@')[0],
                    email: data.email,
                    role: data.role
                }
            };
            
        case '/api/register':
            return {
                success: true,
                message: 'Registration successful'
            };
            
        case '/api/menu':
            return {
                success: true,
                menu: [
                    {
                        id: '1',
                        name: 'Grilled Salmon',
                        description: 'Fresh Atlantic salmon with herbs and lemon',
                        price: 24.99,
                        category: 'main',
                        image: 'assets/images/salmon.jpg'
                    },
                    {
                        id: '2',
                        name: 'Beef Burger',
                        description: 'Juicy beef patty with fresh vegetables',
                        price: 16.99,
                        category: 'main',
                        image: 'assets/images/burger.jpg'
                    },
                    {
                        id: '3',
                        name: 'Caesar Salad',
                        description: 'Fresh romaine lettuce with Caesar dressing',
                        price: 12.99,
                        category: 'appetizer',
                        image: 'assets/images/salad.jpg'
                    },
                    {
                        id: '4',
                        name: 'Chocolate Cake',
                        description: 'Rich chocolate cake with vanilla ice cream',
                        price: 8.99,
                        category: 'dessert',
                        image: 'assets/images/cake.jpg'
                    }
                ]
            };
            
        case '/api/orders':
            return {
                success: true,
                message: 'Order placed successfully'
            };
            
        case '/api/admin/stats':
            return {
                success: true,
                stats: {
                    totalOrders: 156,
                    pendingOrders: 12,
                    totalRevenue: 1542050,
                    totalCustomers: 89
                }
            };
            
        case '/api/admin/orders/pending':
            return {
                success: true,
                orders: [
                    {
                        id: '001',
                        customerName: 'John Doe',
                        total: 4599,
                        items: ['Grilled Salmon', 'Caesar Salad']
                    },
                    {
                        id: '002',
                        customerName: 'Jane Smith',
                        total: 3250,
                        items: ['Beef Burger', 'Chocolate Cake']
                    }
                ]
            };
            
        default:
            return {
                success: true,
                message: 'Operation completed successfully'
            };
    }
}

// Initialize menu filters when page loads
document.addEventListener('DOMContentLoaded', function() {
    setupMenuFilters();
}); 