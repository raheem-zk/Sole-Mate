require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE)
.then(() => {
    console.log('db connection success');
  })
  .catch((err) => {
    console.log('db connection error');
  });
// ------------------------------------


const express = require('express');
const app = express();

app.set('view engine', 'ejs');

const nocache = require('nocache');

//path
const path=require('path')
app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname,'public/admin-public')));


// for session management
const session = require('express-session')
app.use(session({
    secret: "there is no  secret",
    saveUninitialized: true,
    cookie: { maxAge: 50000000000 },
    resave: false
}));
app.use(nocache());

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// for user route
const user_route = require('./routes/userRoute');
const admin_route = require('./routes/adminRoute');
app.use('/',user_route);
app.use('/admin',admin_route);

app.get('*', function(req, res, next) {
  const err = new Error('Not Found');
  err.statusCode = 404;
  next(err);
});

app.use((err, req, res, next) => {
  // console.error(err); // Log the error to the console
  if (err.statusCode == 404) {
    return res.render('users/404');
  }
  res.statusCode = res.statusCode || 500;
  return res.render('users/500', { statusCode: res.statusCode });
});

const PORT = process.env.PORT;
app.listen(PORT,(error)=> console.log('server is running...'))
