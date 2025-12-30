import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import contactRoutes from './routes/contact.js';
import bookRoutes from './routes/book.js';
import purchaseRoutes from './routes/purchase.js';
import myBooksRoutes from './routes/myBooks.js';
import wishlistRoutes from './routes/wishlist.js';
import cartRoutes from './routes/cart.js';
import bookmarkRoutes from './routes/bookmark.js';
import highlightRoutes from './routes/highlight.js';
import emailRoutes from './routes/email.js';
import reviewRoutes from './routes/review.js';
import summarizeRoutes from './routes/summarize.js';

dotenv.config();

// Debug: Log Google OAuth configuration status (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log('🔐 Google OAuth Configuration:');
  console.log('   GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? ' Set' : ' Not set');
  console.log('   GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? ' Set' : 'Not set');
  console.log('   GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI || ' Not set');
}

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies to be sent
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'Node backend is running 🚀',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/my-books', myBooksRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/highlights', highlightRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/summarize', summarizeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      path: req.path,
    },
  });
});

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📦 Environment: ${NODE_ENV}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});
