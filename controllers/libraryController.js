var Library = require('../models/library');
var async = require('async');
var BookInstance = require('../models/bookinstance');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Authors.
exports.library_list = function(req, res, next) {

    Library.find()
      .sort([['name', 'ascending']])
      .exec(function (err, list_libraries) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('library_list', { title: 'Library List', library_list: list_libraries });
      });
  
  };

// Display detail page for a specific Author.
exports.library_detail = function(req, res, next) {

    async.parallel({
        library: function(callback) {
            Library.findById(req.params.id)
              .exec(callback)
        }/*,
        library_books: function(callback) {
          Book.find({ 'author': req.params.id },'title summary')
          .exec(callback)
        },*/
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.library==null) { // No results.
            var err = new Error('LIbrary not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('library_detail', { title: 'Library Detail', library: results.library/*, author_books: results.authors_books */} );
    });

};

// Display book create form on GET.
exports.library_create_get = function(req, res, next) { 
    // Get all authors and genres, which we can use for adding to our book.
    async.parallel({
        books: function(callback) {
            //buscamos todos los libros y decimos que nos de todos los datos de los libros
            BookInstance.find().populate('book').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('library_form', { title: 'Create Library', books: results.books });
    });
    
};

// Handle book create on POST.
exports.library_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if(!(req.library.book instanceof Array)){
            if(typeof req.library.book==='undefined')
            req.library.book=[];
            else
            req.library.book=new Array(req.library.book);
        }
        next();
    },



    // Process request after validation and sanitization.
    (req, res, next) => {
        
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Library object with escaped and trimmed data.
        var library = new Library(
          { name: req.library.name,
            book: req.library.book,
            city: req.library.city
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                books: function(callback) {
                    BookInstance.find(callback);
                },
                cities: function(callback) {
                    City.find(callback);
                }
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.books.length; i++) {
                    if (library.book.indexOf(results.books[i]._id) > -1) {
                        results.books[i].checked='true';
                    }
                }
                res.render('library_form', { title: 'Create Library',books:results.books, library: library,cities: results.cities,  errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save book.
            book.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to new book record.
                   res.redirect(book.url);
                });
        }
    }
];

// Display Author delete form on GET.
exports.library_delete_get = function(req, res, next) {

    async.parallel({
        library: function(callback) {
            Library.findById(req.params.id).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.library==null) { // No results.
            res.redirect('/catalog/libraries');
        }
        // Successful, so render.
        res.render('library_delete', { title: 'Delete Library', library: results.library} );
    });

};

// Handle Author delete on POST.
exports.library_delete_post = function(req, res, next) {

    async.parallel({
        library: function(callback) {
          Library.findById(req.body.libraryid).exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        // Author has no books. Delete object and redirect to the list of authors.
        Library.findByIdAndRemove(req.body.libraryid, function deleteLibrary(err) {
            if (err) { return next(err); }
            // Success - go to author list
            res.redirect('/catalog/libraries')
        })
    });
};

// Display Author update form on GET.
exports.library_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Library update GET');
};

// Handle Author update on POST.
exports.library_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Library update POST');
};