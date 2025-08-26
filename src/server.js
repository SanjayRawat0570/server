import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import { protect } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use((req,res,next)=>{
  console.log(req.method, req.path);
  next();
})

// --- API Routes ---
app.get('/', (req, res) => res.send('Lead Management API is running...'));
app.use('/api/auth', authRoutes);
app.use('/api/leads', protect, leadRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
});