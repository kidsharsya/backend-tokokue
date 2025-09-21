import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import roleRoute from './routes/roleRoutes.js';
import userRoute from './routes/userRoutes.js';
import customerRoute from './routes/customerRoutes.js';
import categoryRoute from './routes/categoryRoutes.js';
import productRoute from './routes/productRoutes.js';
import productImageRoute from './routes/productImageRoutes.js';
import orderRoute from './routes/orderRoutes.js';
import paymentRoute from './routes/paymentRoutes.js';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

//routes
app.use('/api/roles', roleRoute);
app.use('/api/users', userRoute);
app.use('/api/customers', customerRoute);
app.use('/api/category', categoryRoute);
app.use('/api/products', productRoute);
app.use('/api/product-images', productImageRoute);
app.use('/api/orders', orderRoute);
app.use('/api/payments', paymentRoute);

app.listen(process.env.APP_PORT, () => {
  console.log('Server up and running...');
});
