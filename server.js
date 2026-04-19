/*
CSC3916 HW4
File: Server.js
Description: Web API scaffolding for Movie API
 */

require('dotenv').config();
const mongoose = require('mongoose');

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
connectDB();

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

// Movie routes from Assignment 3 
router.route('/movies')
  .get(authJwtController.isAuthenticated, async (req, res) => {
    try {
      const movies = await Movie.find();
      res.status(200).json({ success: true, movies });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error retrieving movies.' });
    }
  })
  .post(authJwtController.isAuthenticated, async (req, res) => {
    const { title, releaseDate, genre, actors } = req.body;
    if (!title || !releaseDate || !genre || !actors || actors.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Movie must include title, releaseDate, genre, and at least three actors.',
      });
    }
    try {
      const movie = new Movie({ title, releaseDate, genre, actors });
      await movie.save();
      res.status(201).json({ success: true, msg: 'Movie created successfully.', movie });
    } catch (err) {
      console.error(err);
      if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: err.message });
      }
      res.status(500).json({ success: false, message: 'Error saving movie.' });
    }
  })
  .put(authJwtController.isAuthenticated, (req, res) => {
    res.status(405).json({ success: false, message: 'PUT not supported on /movies. Use /movies/:title.' });
  })
  .delete(authJwtController.isAuthenticated, (req, res) => {
    res.status(405).json({ success: false, message: 'DELETE not supported on /movies. Use /movies/:title.' });
  });

router.route('/movies/:title')
  .get(authJwtController.isAuthenticated, async (req, res) => {
    try {
    //modified added code 
    if (req.query.reviews === 'true') {
        const movieWithReviews = await Movie.aggregate ([
            { $match: {title : req.params.title}},
            {
                $lookup: {
                    from: 'reviews', 
                    localField: '_id', 
                    foreignField: 'movieId', 
                    as: 'reviews'
                }
            }
        ]); 
        if (!movieWithReviews.length){
            return res.status(404).json({ success: false, message: 'Movie not found.'});
        }
        return res.status(200).json({success: true, movie: movieWithReviews[0]});
    }

    //Assignment 3 normal code
      const movie = await Movie.findOne({ title: req.params.title });
      if (!movie) {
        return res.status(404).json({ success: false, message: 'Movie not found.' });
      }
      res.status(200).json({ success: true, movie });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error retrieving movie.' });
    }
  })

  .post(authJwtController.isAuthenticated, (req, res) => {
    res.status(405).json({ success: false, message: 'POST not supported on /movies/:title. Use /movies.' });
  })

  .put(authJwtController.isAuthenticated, async (req, res) => {
    try {
      const updatedMovie = await Movie.findOneAndUpdate(
        { title: req.params.title },
        req.body,
        { new: true, runValidators: true }
      );
 
      if (!updatedMovie) {
        return res.status(404).json({ success: false, message: 'Movie not found.' });
      }
 
      res.status(200).json({ success: true, msg: 'Movie updated successfully.', movie: updatedMovie });
    } catch (err) {
      console.error(err);
      if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: err.message });
      }
      res.status(500).json({ success: false, message: 'Error updating movie.' });
    }
  })

  .delete(authJwtController.isAuthenticated, async (req, res) => {
    try {
      const deletedMovie = await Movie.findOneAndDelete({ title: req.params.title });
 
      if (!deletedMovie) {
        return res.status(404).json({ success: false, message: 'Movie not found.' });
      }
 
      res.status(200).json({ success: true, msg: 'Movie deleted successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error deleting movie.' });
    }
  });

//REVIEW ROUTES 
router.route ('/reviews')
  .get(authJwtController.isAuthenticated, async(req, res)=>{
    try{
        const reviews = await Review.find(); 
        res.status(200).json({success: true, reviews});
    } catch (err) {
        console.error(err); 
        res.status(500).json({success: false, message: 'Error retrieving reviews.'})
    }
  })
  .post(authJwtController.isAuthenticated, async(req, res) => {
    try{
        const movie = await Movie.findById(req.body.movieId); 
        if (!movie) {
            return res.status(404).json({success: false, message: 'Movie not found.'})
        }

        const review = new Review({
            movieId: req.body.movieId,
            username: req.user.username,
            review: req.body.review, 
            rating: req.body.rating,
        });

        await review.save(); 
        res.status(201).json({message: 'Review created.'}); 
    } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message }); 
    }
});




app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


