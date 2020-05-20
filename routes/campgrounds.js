const express = require('express');
var router = express.Router();
var middleware = require('../middleware/index');
var Campground = require('../models/campgrounds');
var Comment = require('../models/comment');

router.get('/campgrounds', function(req, res) {
    Campground.find({}, function(err, campgrounds) {
        if (err) {
            console.log('hello');
        } else {
			if (req.user){
				req.flash("success","Welcome back " + req.user.username);
				res.render('campgrounds/index', { campgrounds: campgrounds, currentUser: req.user });
			}
			else{
				res.render('campgrounds/index', { campgrounds: campgrounds, currentUser: req.user });

			}
			
        }
    });
});

router.post('/campgrounds', isLoggedIn, function(req, res) {
    // get data from form and to campgrounds array

    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var price = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    };

    var newCampground = {
        name: name,
        image: image,
		price: price,
        description: description,
        author: author
    };

    Campground.create(newCampground,isLoggedIn, function(err, newlyCreated) {
        if (err) {
            console.log(err);
            req.flash('error', 'Something went wrong');
            res.redirect('back');
        } else {
            req.flash('success', 'Added a new campground');
            res.redirect('/campgrounds');
        }
    });
});

router.get('/campgrounds/new',isLoggedIn, function(req, res) {
    res.render('campgrounds/new');
});

router.get('/campgrounds/:id', function(req, res) {
    Campground.findById(req.params.id)
        .populate('comments')
        .exec(function(err, foundCampground) {
            if (err) {
                req.flash('error', 'Could not find campground');
                res.redirect('back');
            } else {
                res.render('campgrounds/show', { campground: foundCampground });
            }
        });
});

router.get('/campgrounds/:id/edit', middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        if (err) {
            console.log(err);
            req.flash('error', 'Something went wrong');
            res.redirect('back');
        } else {
            res.render('campgrounds/edit', { campground: foundCampground });
        }
    });
});

router.put('/campgrounds/:id', middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(
        err,
        updatedCampground
    ) {
        if (err) {
            req.flash('error', 'Something went wrong');
            res.redirect('back');
        } else {
            req.flash('success', 'Campground updated');
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

router.delete('/campgrounds/:id', middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(err, updatedCampground) {
        if (err) {
            req.flash('error', 'Something went wrong');
            res.redirect('back');
        } else {
            req.flash('success', 'Campground deleted');

            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});



function  isLoggedIn(req, res, next){
	    if (req.isAuthenticated()) {
        return next();
    }
	
	req.flash("error", "Please login first");

    res.redirect('/login');
}


module.exports = router;