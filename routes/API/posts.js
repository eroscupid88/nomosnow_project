const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Post = require('../../models/post');
// profile model
const Profile = require('../../models/profile');
// post validation

const validatePostInput = require('../../validation/post');

// get /post
// get post
// public
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostfound: 'No post found ' }));
});

// post/:id
// get post by id
// public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)

    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({
        nopostfound: 'no post found with that ID'
      })
    );
});

// post /post
// create post
// private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      _id: mongoose.Types.ObjectId(),
      text: req.body.text,
      name: req.user[0].name,
      avatar: req.user[0].avatar,
      user: req.user[0].id
    });
    newPost.save().then(post => res.json(post));
  }
);

// delete post/:id
// delete post
// private

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user[0].id }).then(profile =>
      Post.findById(req.params.id)
        .then(post => {
          // check for post owner
          if (post.user.toString() !== req.user[0].id)
            return res.status(401).json({
              notauthorized: 'User not authorized'
            });
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json(err))
    );
  }
);

// / post/like/:id
// like post
// private

router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user[0].id }).then(profile =>
      Post.findById(req.params.id)
        .then(post => {
          // filter to find out if user already like it or not

          // explain tim ra id of like roi turn to be string because req.user[0].id is a string, neu that id chinh la id dcua user va length> 0 like da ton tai> fail
          if (
            post.likes.filter(like => like.user.toString() === req.user[0].id)
              .length === 0
          ) {
            const removeIndex = post.dislikes
              .map(item => item.user.toString())
              .indexOf(req.user[0].id);
            // splice out of array and remove it
            post.dislikes.splice(removeIndex, 1);

            // add user id to likes array
            post.likes.unshift({ user: req.user[0].id });

            post.save().then(post => res.json(post));
          } else if (
            post.likes.filter(like => like.user.toString() === req.user[0].id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: 'User already liked this post' });
          }
        })
        .catch(err => res.status(404).json(err))
    );
  }
);

router.post(
  '/dislike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user[0].id }).then(profile =>
      Post.findById(req.params.id)
        .then(post => {
          // filter to find out if user already dislike it or not

          // explain tim ra id of d9slike roi turn to be string because req.user[0].id is a string, neu that id chinh la id dcua user va length> 0 like da ton tai> fail
          if (
            post.dislikes.filter(
              dislike => dislike.user.toString() === req.user[0].id
            ).length === 0
          ) {
            // remove index
            // tim that ca likes (id) cua post roi chon ra dung id cua that like(string ) . sau do tach no ra khoi array cua like( remove it)

            const removeIndex = post.likes
              .map(item => item.user.toString())
              .indexOf(req.user[0].id);
            // splice out of array
            post.likes.splice(removeIndex, 1);

            post.dislikes.unshift({ user: req.user[0].id });

            post.save().then(post => res.json(post));
          } else if (
            post.dislikes.filter(
              dislike => dislike.user.toString() === req.user[0].id
            ).length > 0
          ) {
            return res
              .status(400)
              .json({ alreadydisliked: 'User already disliked this post' });
          }
        })
        .catch(err => res.status(404).json(err))
    );
  }
);

// / post/dislike/:id
// dislike post
// private

router.post(
  '/dislike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user[0].id }).then(profile =>
      Post.findById(req.params.id)
        .then(post => {
          // filter to find out if user already like it or not
          // tim like id la id cua user. ma nguoi do chua like

          if (
            post.likes.filter(like => like.user.toString() === req.user[0].id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ noliked: 'Use have not yet liked this post' });
          }
          // remove index
          // tim that ca likes (id) cua post roi chon ra dung id cua that like(string ) . sau do tach no ra khoi array cua like( remove it)

          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user[0].id);
          // splice out of array
          post.likes.splice(removeIndex, 1);

          //  save
          post.save().then(post => {
            res.json(post);
          });
        })
        .catch(err => res.status(404).json(err))
    );
  }
);

// / post/comment/:id
//  post
// private
router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id).then(post => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user[0].id
      };
      // add to comments array
      post.comments.unshift(newComment);

      // saves
      post
        .save()
        .then(post => res.json(post))
        .catch(err => res.status(404).json(err));
    });
  }
);

// / delete post/comment/:id/:comment_id
//  post
// private
router.delete(
  '/comment/:id/:comment_id',

  (req, res) => {
    Post.findById(req.params.id).then(post => {
      // check to see if comment exists
      if (
        post.comments.filter(
          comment => comment._id.toString() === req.params.comment_id
        ).length === 0
      ) {
        return res.status(404).json({
          commentnoexists: 'comment does not exist'
        });
      }
      // get remove index
      const removeIndex = post.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id);

      // splice comment out of array
      post.comments.splice(removeIndex, 1);

      post
        .save()
        .then(post => res.json(post))
        .catch(err => res.status(404).json(err));
    });
  }
);

module.exports = router;
