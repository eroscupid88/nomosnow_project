const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const passport = require('passport');

// load Input Validation
const validateRegisterInput = require('../../validation/register');
const validateLogInInput = require('../../validation/login');

// user model

const Users = require('../../models/user');

// api/user/register
// register user

router.post('/register', (req, res, next) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  // check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  Users.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        errors.email = 'Email exist';
        return res.status(409).json(errors);
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            var defaultAvatar =
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqlaxdI3EIEf2voJ56Ut0G_M9pXJhUYgQXQaKLMzL5yJ81cbUt';

            const newUser = new Users({
              _id: mongoose.Types.ObjectId(),
              email: req.body.email,
              name: req.body.name,
              date: req.body.date,
              avatar: defaultAvatar,

              password: hash
            });
            newUser
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: 'user created',
                  request: {
                    type: 'POST',
                    info: result
                  }
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    })
    .catch(err => res.json(err));
});

// user log in

router.post('/login', (req, res, next) => {
  const { errors, isValid } = validateLogInInput(req.body);
  // check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  Users.find({ email: req.body.email })

    .then(user => {
      if (user.length < 1) {
        errors.email = ' User not found';
        return res.status(401).json(errors);
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(500).json({
            message: ' Auth fail'
          });
        }
        if (result) {
          const payload = {
            email: user[0].email,
            userId: user[0]._id,
            name: user[0].name,
            avatar: user[0].avatar
          };
          const token = jwt.sign(payload, process.env.JWT_KEY, {
            expiresIn: 3600
          });
          return res.status(200).json({
            message: 'auth successfully',
            token: 'Bearer ' + token
          }); //jsonwebtoken used
        } else {
          errors.password = 'password is incorrect';
          return res.status(400).json(errors);
        }
      });
      console.log(user);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// get api/user/current
// return current user
// private
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      id: req.user[0]._id,
      name: req.user[0].name,
      avatar: req.user[0].avatar
    });
  }
);

router.delete('/:userId', (req, res, next) => {
  Users.remove({ _id: req.params.userId })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: 'user had been deleted'
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
