# Yuna Parfum - Modern E-commerce Platform

A modern, upgraded e-commerce platform for Yuna Parfum built with React frontend and Node.js backend, featuring a clean separation of concerns and professional architecture.

## 🚀 Features

### Frontend (React + TypeScript)
- **Modern React 18** with TypeScript for type safety
- **Tailwind CSS** for beautiful, responsive styling
- **React Router** for seamless navigation
- **Context API** for state management
- **Custom hooks** for reusable logic
- **Toast notifications** for user feedback
- **Responsive design** optimized for all devices
- **RTL support** for Arabic content
- **Professional animations** and transitions

### Backend (Node.js + Express)
- **Express.js** REST API with modern middleware
- **MongoDB** with Mongoose ODM
- **Security features** (Helmet, CORS, Rate limiting)
- **Input validation** with express-validator
- **Error handling** and logging
- **Environment configuration**
- **Modular route structure**

### Key Improvements Over Original
- ✅ **Separated frontend and backend**
- ✅ **Modern React with TypeScript**
- ✅ **Professional UI/UX with Tailwind CSS**
- ✅ **Secure API with validation and middleware**
- ✅ **Structured codebase with best practices**
- ✅ **Context-based state management**
- ✅ **Responsive design for all devices**
- ✅ **Better error handling and user feedback**
- ✅ **SEO-friendly structure**
- ✅ **Production-ready configuration**

## 📁 Project Structure

```
project/
├── backend/                 # Node.js API server
│   ├── models/             # Database models
│   │   ├── Product.js      # Product schema
│   │   └── Order.js        # Order schema
│   ├── routes/             # API routes
│   │   ├── products.js     # Product endpoints
│   │   ├── orders.js       # Order endpoints
│   │   └── auth.js         # Authentication
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables
│
├── frontend/               # React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ProductCard.tsx
│   │   ├── pages/         # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Cart.tsx
│   │   │   └── Admin.tsx
│   │   ├── context/       # React context
│   │   │   └── CartContext.tsx
│   │   ├── services/      # API services
│   │   │   ├── api.ts
│   │   │   └── index.ts
│   │   ├── types/         # TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx        # Main app component
│   │   └── index.tsx      # Entry point
│   ├── package.json       # Frontend dependencies
│   └── tailwind.config.js # Tailwind configuration
│
└── README.md              # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### 1. Clone and Setup

```bash
# Navigate to your project directory
cd "C:\\Users\\Home\\Desktop\\New folder (9)\\project"

# The project structure is already created
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (already exists, but verify content)
# Make sure .env contains:
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/yunaparfum
JWT_SECRET=yuna_parfum_super_secret_key_2025
ADMIN_CODE=123456

# Start the backend server
npm run dev
# OR
npm start
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will run on `http://localhost:3000`

### 4. Database Setup

Make sure MongoDB is running on your system:

```bash
# For Windows (if MongoDB is installed locally)
mongod

# For macOS with Homebrew
brew services start mongodb-community

# For Ubuntu/Linux
sudo systemctl start mongod
```

## 🔧 Configuration

### Backend Configuration

Edit `backend/.env` to match your environment:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/yunaparfum  # Change to your MongoDB connection
JWT_SECRET=your_super_secret_jwt_key_here
ADMIN_CODE=your_admin_verification_code
```

### Frontend Configuration

The frontend is configured to proxy API requests to the backend. If needed, create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Available Scripts

### Backend Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

### Frontend Scripts
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App (not recommended)
```

## 📱 API Endpoints

### Products
- `GET /api/products` - Get all products with filtering and pagination
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/featured/list` - Get featured products

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Authentication
- `POST /api/auth/verify-admin` - Verify admin access code

## 🎨 Styling & Theming

The project uses Tailwind CSS with a custom configuration:

- **Primary colors**: Purple gradient (`primary-*`)
- **Secondary colors**: Gold gradient (`gold-*`)
- **Typography**: Cairo font for Arabic text
- **RTL support**: Proper right-to-left layout
- **Responsive design**: Mobile-first approach
- **Custom animations**: Smooth transitions and effects

## 🔐 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin request handling
- **Rate limiting**: API request throttling
- **Input validation**: Server-side validation with express-validator
- **Environment variables**: Secure configuration management

## 📱 Mobile Responsive

The application is fully responsive and works perfectly on:
- 📱 Mobile phones (320px and up)
- 📱 Tablets (768px and up)
- 💻 Desktops (1024px and up)
- 🖥️ Large screens (1440px and up)

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Deployment

### Backend Deployment
1. Set environment variables on your hosting platform
2. Ensure MongoDB connection is configured
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Run `npm run build` in the frontend directory
2. Deploy the `build` folder to platforms like Vercel, Netlify, or AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and inquiries:
- **WhatsApp**: +212 713071000
- **Instagram**: [@yona.purfum](https://www.instagram.com/yona.purfum/)
- **Facebook**: [YunaPurfum](https://web.facebook.com/YunaPurfum)

## 📄 License

This project is licensed under the ISC License.

---

**Made with ❤️ for Yuna Parfum**
