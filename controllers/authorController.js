var Author = require('../models/author')
var Book = require('../models/book')
var async = require('async');
const { body, validationResult } = require('express-validator');

// Display list of all Authors.
exports.author_list = function(req, res, next) {
    Author.find({})
        .sort('first_name')
        .exec(function(err, author_list){
            if (err) { next(err) }
            res.render('author_list', { title: 'Book Instance List', author_list: author_list })
        })
};

// Display detail page for a specific Author.
exports.author_detail = function(req, res) {
    // res.send('NOT IMPLEMENTED: Author detail: ' + req.params.id);
    async.parallel({
        author: function(cb){
            Author.findById(req.params.id)
                .exec(cb)
        },
        authors_books: function(cb){
            Book.find({'author': req.params.id}, 'title summary')
                .exec(cb)
        }
    }, function(err, results){
        if (err) { return next(err); } // Error in API usage.
        if (results.author==null) { // No results.
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        console.log(results.author)
        res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books } );
    })
};

// Display Author create form on GET.
exports.author_create_get = function(req, res) {
    res.render('author_form', { title: 'Author Form'})
};

// Handle Author create on POST.
exports.author_create_post = [
    body('first_name').trim().isLength({min : 1}).escape().withMessage("First Name Must be Sprcified")
                              .isAlphanumeric().withMessage('Invalid Characters'),
    body('family_name').trim().isLength({min: 1}).escape().withMessage('Family Name must be Specified')
                              .isAlphanumeric().withMessage('Invalid Characters'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()){
            res.render('author_form', {title: 'Author Form', errors: errors.array()})
        }
        var author = new Author(
            {
             first_name : req.body.first_name,
             family_name: req.body.family_name,
             date_of_birth: req.body.date_of_birth,
             date_of_death: req.body.date_of_death 
        })
        
        author.save(function(err){
            if (err) { return next(err) }
            res.redirect(author.url)
        })
    }
]

// Display Author delete form on GET.
exports.author_delete_get = function(req, res, next) {

    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id).exec(callback)
        },
        authors_books: function(callback) {
            Book.find({ 'author': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.author==null) { // No results.
            res.redirect('/catalog/authors');
        }
        // Successful, so render.
        res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
    });

};

// Handle Author delete on POST.
exports.author_delete_post = function(req, res, next) {

    async.parallel({
        author: function(callback) {
          Author.findById(req.body.authorid).exec(callback)
        },
        authors_books: function(callback) {
          Book.find({ 'author': req.body.authorid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.authors_books.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
            return;
        }
        else {
            // Author has no books. Delete object and redirect to the list of authors.
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/catalog/authors')
            })
        }
    });
};


// Display Author update form on GET.
exports.author_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST.
exports.author_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update POST');
};