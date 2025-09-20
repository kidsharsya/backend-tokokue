import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import roleRoute from './routes/roleRoutes.js';
import userRoute from './routes/userRoutes.js';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

//routes
app.use('/api/roles', roleRoute);
app.use('/api/users', userRoute);

app.listen(process.env.APP_PORT, () => {
  console.log('Server up and running...');
});
