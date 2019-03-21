const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Post model
const Post = require("../../models/Post");

//Validation
const validatePostInput = require("../../validation/post");

//@route GET api/posts/test
//@desc Tests post route
//@access Public
router.get("/test", (req, res) => res.json({ msg: "Posts Works" }));

//@route GET api/posts
//@desc Get posts
//@access Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: "No posts found" }));
});

//@route GET api/posts/:id
//@desc Get posts by id
//@access Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ nopostfound: "No post found with that ID" })
    );
});

//@route POST api/posts
//@desc create post
//@access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    //Check Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.user.name,
      avatar: req.user.avatar,
      user: req.user.id
    });
    newPost.save().then(post => res.json(post));
  }
);

//@route POST api/posts
//@desc delete post
//@access Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        if (post.user.toString() !== req.user.id) {
          return res.status(401).json({ notauthorized: "User not authorized" });
        }

        //Delete
        post.remove().then(() => res.json({ success: true }));
      })
      .catch(err => res.status(404).json({ nopostfound: "No post found" }));
  }
);

//@route POST api/post/like/:post_id
//@desc Like a post
//@access Private

router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id).then(post => {
      const updatedLikes = post.likes.filter(like => like.user != req.user.id);
      if (updatedLikes.length === post.likes.length) {
        //was never liked, so like
        post.likes.unshift({ user: req.user.id });
        post
          .save()
          .then(post => res.json(post))
          .catch(err => res.status(400).json({ like: "Unable to like post" }));
        return;
      }
      //was liked, so unlike
      post.likes = updatedLikes;
      post
        .save()
        .then(post => res.json(post))
        .catch(err => res.status(400).json({ like: "Unable to unlike post" }));
    });
  }
);

//@route POST api/posts/comment/:id
//@desc Add Comment to post
//@access Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    //Check Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        //Add to Comments Array
        post.comments.unshift(newComment);

        //Save
        post.save().then(post => res.json(post));
      })

      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  }
);

//@route DELETE api/posts/comment/:id/:comment_id
//@desc Delete comment by Id
//@access Private
router.delete(
  '/:post_id/comment/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post.findById(req.params.post_id)
      .then(post => {
        // Post not found
        if (!post) {
          return res.status(404).json({ postNotFound: 'Post not found' });
        }
        // Get the comment to delete
        const commentToDelete = post.comments.find(
          comment => comment._id == req.params.comment_id
        );
        // Return 404 if not exist
        if (!commentToDelete) {
          return res
            .status(404)
            .json({ commentNotExits: 'Comment does not exist' });
        }
        // Check if the user is the owner of the post or the comment
        if (post.user != req.user.id) {
          if (commentToDelete.user != req.user.id) {
            return res
              .status(401)
              .json({ canNotDeleteComment: "You can't delete this comment" });
          }
        }
        // Update the comments array with MongoDB's $pull operator
        post
          .update({ $pull: { comments: { _id: req.params.comment_id } } })
          .then(() => res.json({ deletedComment: 'Comment deleted' }))
          .catch(err => res.status(400).send(err));
      })
      .catch(err => res.status(400).json(err));
  }
);

module.exports = router;
