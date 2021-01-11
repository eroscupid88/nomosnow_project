const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
const userRoutes = require('./routes/API/users');
const profileRoutes = require('./routes/API/profiles');
const postRoutes = require('./routes/API/posts');

const productRoutes = require('./routes/products');

const productOrders = require('./routes/orders');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

mongoose.connect(
  'mongodb+srv://eroscupid:Martinsmith88!@cluster0-krosk.mongodb.net/nomosnow?retryWrites=true'
);

// mongoose.connect('mongodb://localhost:27017/nomosnow');

// passport middle ware
app.use(passport.initialize());

// passport config
require('./config/passport')(passport);

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
console.log('Having fun');

// app.use((req, res, next) => {
//   res.header('Acess-Control-Allow-Origin', '*');
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept, Authorization'
//   );
//   if (req.method === 'OPTIONS') {
//     res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
//     return res.status(200).json({});
//   }
//   next();
// });
// user
app.use('/user', userRoutes);
app.use('/profile', profileRoutes);
app.use('/post', postRoutes);

// route which should handle requests
app.use('/product', productRoutes);

app.use('/order', productOrders);

app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, nexr) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
