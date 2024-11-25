require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// إعداد Body Parser
app.use(bodyParser.json());

// الاتصال بقاعدة البيانات MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('تم الاتصال بقاعدة البيانات');
}).catch(err => {
    console.error('خطأ في الاتصال بقاعدة البيانات:', err);
});

// تعريف النماذج (Models)
const Product = require('./models/Product');
const User = require('./models/User');

// المسارات (Routes)
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// بدء الخادم
app.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ ${PORT}`);
});
