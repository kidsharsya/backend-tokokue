import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import roleRoute from './routes/roleRoutes.js';
import userRoute from './routes/userRoutes.js';
import customerRoute from './routes/customerRoutes.js';
import categoryRoute from './routes/categoryRoutes.js';
import productRoute from './routes/productRoutes.js';
import orderRoute from './routes/orderRoutes.js';
import paymentRoute from './routes/paymentRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

//routes
app.use('/api/roles', roleRoute);
app.use('/api/users', userRoute);
app.use('/api/customers', customerRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.use('/api/payments', paymentRoute);

app.listen(process.env.APP_PORT, () => {
  console.log('Server up and running...');
});
