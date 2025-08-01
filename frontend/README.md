# Restaurant Management System - Frontend

A modern, responsive restaurant management system frontend built with HTML, CSS, and JavaScript. This project provides a complete user interface for customers, employees, and administrators to interact with the restaurant's services.

## 🍽️ Features

### Customer Features
- **Browse Menu**: View restaurant menu with categories and filtering
- **Add to Cart**: Add items to cart with quantity management
- **Online Ordering**: Place orders online with cart functionality
- **Table Reservations**: Book tables with date, time, and party size
- **User Registration/Login**: Secure authentication system
- **Responsive Design**: Works perfectly on all devices

### Admin Features
- **Dashboard**: Overview of restaurant statistics
- **Order Management**: Approve/reject pending orders
- **Menu Management**: Add new items and update prices
- **Revenue Tracking**: Monitor sales and revenue
- **Customer Management**: View customer data and orders

### Employee Features
- **Attendance Tracking**: Mark daily attendance
- **Table Management**: Monitor table availability and status
- **Customer Feedback**: Send feedback to admin
- **Order Status Updates**: Update order status in real-time

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd restaurant-management-system/frontend
```

2. Open the project in your preferred code editor

3. Start a local server (recommended):
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

4. Open your browser and navigate to:
```
http://localhost:8000
```

## 📁 Project Structure

```
frontend/
│
├── index.html              # Homepage with hero section and features
├── css/
│   └── style.css          # Complete styling with responsive design
├── js/
│   └── main.js            # JavaScript functionality and API calls
├── pages/
│   ├── login.html         # User authentication page
│   ├── register.html      # User registration page
│   ├── menu.html          # Menu browsing with filtering
│   ├── cart.html          # Shopping cart management
│   ├── reservation.html   # Table booking system
│   └── dashboard.html     # Admin/Employee dashboard
├── assets/
│   ├── images/            # Restaurant images and icons
│   └── icons/            # UI icons and graphics
└── components/            # Reusable HTML components
    ├── navbar.html        # Navigation component
    ├── footer.html        # Footer component
    └── itemCard.html      # Menu item card component
```

## 🎨 Design Features

### Modern UI/UX
- **Clean Design**: Minimalist and professional appearance
- **Responsive Layout**: Adapts to all screen sizes
- **Smooth Animations**: CSS transitions and hover effects
- **Color Scheme**: Professional red and white theme
- **Typography**: Poppins font for modern readability

### Interactive Elements
- **Hover Effects**: Buttons and cards with smooth transitions
- **Form Validation**: Real-time input validation
- **Loading States**: Visual feedback for user actions
- **Success/Error Messages**: Clear communication with users

## 🔧 Technical Implementation

### HTML Structure
- Semantic HTML5 elements
- Accessible markup with ARIA labels
- SEO-optimized structure
- Cross-browser compatibility

### CSS Features
- **Flexbox & Grid**: Modern layout techniques
- **CSS Variables**: Consistent theming
- **Media Queries**: Mobile-first responsive design
- **CSS Animations**: Smooth transitions and effects

### JavaScript Functionality
- **ES6+ Features**: Modern JavaScript syntax
- **Local Storage**: Cart persistence across sessions
- **DOM Manipulation**: Dynamic content updates
- **Form Handling**: Client-side validation
- **API Integration**: Ready for backend connection

## 📱 Responsive Design

The application is fully responsive and optimized for:

- **Desktop**: Full-featured experience (1200px+)
- **Tablet**: Optimized layout (768px - 1199px)
- **Mobile**: Touch-friendly interface (320px - 767px)

### Mobile Features
- Hamburger menu navigation
- Touch-optimized buttons
- Swipe-friendly interfaces
- Optimized form inputs

## 🔐 Authentication System

### User Roles
1. **Customer**: Browse menu, place orders, make reservations
2. **Employee**: Attendance tracking, table management, feedback
3. **Admin**: Full system management and oversight

### Security Features
- Role-based access control
- Form validation and sanitization
- Secure session management
- Input validation and error handling

## 🛒 Shopping Cart System

### Features
- **Add/Remove Items**: Easy cart management
- **Quantity Controls**: Increment/decrement quantities
- **Price Calculation**: Real-time total updates
- **Persistent Storage**: Cart saved in localStorage
- **Order Placement**: Complete checkout process

## 📅 Reservation System

### Booking Features
- **Date Selection**: Calendar-based date picker
- **Time Slots**: Predefined time availability
- **Party Size**: 1-8+ people options
- **Special Requests**: Custom requirements field
- **Confirmation**: Booking confirmation system

## 📊 Dashboard Analytics

### Admin Dashboard
- **Order Statistics**: Total orders and revenue
- **Customer Metrics**: Customer count and trends
- **Pending Orders**: Real-time order management
- **Menu Management**: Item and price updates

### Employee Dashboard
- **Attendance Tracking**: Daily presence management
- **Table Status**: Real-time table availability
- **Feedback System**: Communication with admin
- **Task Management**: Daily responsibilities

## 🎯 Key Features

### Menu Management
- **Category Filtering**: Filter by appetizers, mains, desserts, beverages
- **Dynamic Loading**: Menu items loaded from API
- **Image Optimization**: High-quality food images
- **Price Display**: Clear pricing information

### Order Processing
- **Real-time Updates**: Live order status tracking
- **Order History**: Complete order records
- **Payment Integration**: Ready for payment gateway
- **Email Notifications**: Order confirmation system

## 🔧 Customization

### Theme Customization
The color scheme and styling can be easily customized by modifying CSS variables in `style.css`:

```css
:root {
    --primary-color: #e74c3c;
    --secondary-color: #f39c12;
    --text-color: #333;
    --background-color: #fff;
}
```

### Adding New Features
The modular structure makes it easy to add new features:
1. Create new HTML pages in the `pages/` directory
2. Add corresponding CSS styles
3. Implement JavaScript functionality
4. Update navigation links

## 🚀 Deployment

### Static Hosting
The frontend can be deployed to any static hosting service:

- **Netlify**: Drag and drop deployment
- **Vercel**: Git-based deployment
- **GitHub Pages**: Free hosting for public repos
- **AWS S3**: Scalable cloud hosting

### Production Build
For production deployment:

1. Optimize images and assets
2. Minify CSS and JavaScript
3. Enable compression
4. Set up CDN for faster loading

## 🔗 API Integration

The frontend is designed to work with a Node.js/Express backend and MongoDB database. API endpoints are structured as:

```
/api/login          # User authentication
/api/register       # User registration
/api/menu           # Menu items
/api/orders         # Order management
/api/reservations   # Booking system
/api/admin/*        # Admin functions
```

## 📈 Performance Optimization

### Loading Speed
- Optimized images with WebP format
- Minified CSS and JavaScript
- Lazy loading for images
- Efficient caching strategies

### SEO Optimization
- Semantic HTML structure
- Meta tags and descriptions
- Open Graph tags
- Structured data markup

## 🐛 Browser Support

- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Frontend Developer**: [Your Name]
- **UI/UX Designer**: [Designer Name]
- **Project Manager**: [Manager Name]

## 📞 Support

For support and questions:
- Email: support@gourmethaven.com
- Phone: +1 (555) 123-4567
- Website: www.gourmethaven.com

---

**Built with ❤️ for the restaurant industry** 