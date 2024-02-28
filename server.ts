export {};
const express = require('express')
const dotenv = require('dotenv').config()
const port = process.env.PORT || 5000
const { errorHandler } = require('./Middleware/errorMiddleware')
const app = express()
const connectDB = require ('./config/db')
const cors = require('cors')
import { protect } from './Middleware/authMiddleware';

import postRoutes from './Routes/postRoutes';
import userRoutes from './Routes/userRoutes';
import cropRoutes from './Routes/cropRoutes';

connectDB()
app.use(express.json());
//middleware:
app.use(express.urlencoded({extended:false}));
app.use(cors());

//routes:
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/crops', cropRoutes);

app.use('/api/testingConsoleLog', (req, res) => {
    console.log('Testing Console Log');
    res.status(200).json({ message: 'Testing Console Log' });
}
);


app.listen (port, () => console.log('listening on port ' + port))