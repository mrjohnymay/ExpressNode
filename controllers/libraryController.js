var Library = require('../models/library');
var async = require('async');
var BookInstance = require('../models/bookinstance');
var City = require('../models/city');
var Book = require('../models/book');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Authors.
exports.library_list = function (req, res, next) {
    var sort = new Array();
    if (typeof req.query.libraryname !== 'undefined' && req.query.libraryname !== 'name') {
        //si firstname no es undefined y tampoco es el valor por defecto añadimos la opcion al array
        sort.push(['name', req.query.libraryname]);
    }

    Library.find()
        .sort(sort.length > 0 ? sort : null)
        .exec(function (err, list_libraries) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('library_list', { title: 'Library List', library_list: list_libraries });
        });

};

// Display detail page for a specific Author.
exports.library_detail = function (req, res, next) {

    async.parallel({
        library: function (callback) {
            /*Hacemos populate de los Bookinstances para luego hacer otro populate nesteado del libro de ese bookinstance
            tambien hacemos populate de city para poder desglosarlo en la vista*/
            Library.findById(req.params.id).populate([{
                path: 'books',
                model: 'BookInstance',
                populate: {
                    path: 'book',
                    model: 'Book'
                }
            }, {
                path: 'city',
                model: 'City'
            }
            ]).exec(callback)
        }
    }, function (err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.library == null) { // No results.
            var err = new Error('Library not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('library_detail', { title: 'Library Detail', library: results.library/*, author_books: results.authors_books */ });
    });

};

// Display book create form on GET.
exports.library_create_get = function (req, res, next) {
    // Get all authors and books, which we can use for adding to our book.
    async.parallel({
        cities: function (callback) {
            //buscamos todos los libros y decimos que nos de todos los datos de los libros
            City.find().populate('city').exec(callback);
        },
        books: function (callback) {
            //buscamos todos los libros y decimos que nos de todos los datos de los libros
            BookInstance.find().populate('book').exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        res.render('library_form', { title: 'Create Library', books: results.books, cities: results.cities });
    });

};

// Handle book create on POST.
exports.library_create_post = [
    // Convert the genre to an array.

    (req, res, next) => {
        
        if (!(req.body.book instanceof Array)) {
            if (typeof req.body.book === 'undefined')
                req.body.book = [];
            else
                req.body.book = new Array(req.body.book);
                
        }
        next();
    },

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);


        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and books for form.
            async.parallel({
                books: function (callback) {
                    BookInstance.find(callback);
                },
                cities: function (callback) {
                    City.find(callback);
                }
            }, function (err, results) {
                if (err) { return next(err); }

                // Mark our selected books as checked.
                for (let i = 0; i < results.books.length; i++) {
                    if (library.book.indexOf(results.books[i]._id) > -1) {
                        results.books[i].checked = 'true';
                    }
                }
                res.render('library_form', { title: 'Create Library', books: results.books, library: library, cities: results.cities, errors: errors.array() });
            });
            return;
        }
        else {

            City.find({ name: req.body.city }).exec(function (err, thecity) {
                if (err) { return next(err); }
                // Create a Library object with escaped and trimmed data.
                console.log(thecity[0]);
                var library = new Library(
                    {
                        name: req.body.name,
                        books: req.body.book,
                        city: thecity[0]
                    });
                // Data from form is valid. Save book.
                library.save(function (err) {
                    if (err) { return next(err); }
                    //successful - redirect to new book record.
                    res.redirect(library.url);
                });
            })
        }
    }

];

// Display Author delete form on GET.
exports.library_delete_get = function (req, res, next) {

    async.parallel({
        library: function (callback) {
            Library.findById(req.params.id).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.library == null) { // No results.
            res.redirect('/catalog/libraries');
        }
        // Successful, so render.
        res.render('library_delete', { title: 'Delete Library', library: results.library });
    });

};

// Handle Author delete on POST.
exports.library_delete_post = function (req, res, next) {

    async.parallel({
        library: function (callback) {
            Library.findById(req.body.libraryid).exec(callback)
        }
    }, function (err, results) {
        if (err) { return next(err); }
        // Success
        // Author has no books. Delete object and redirect to the list of authors.
        Library.findByIdAndRemove(req.body.libraryid, function deleteLibrary(err) {
            if (err) { return next(err); }
            // Success - go to author list
            res.redirect('/catalog/library')
        })
    });
};

// Display book update form on GET.
exports.library_update_get = function (req, res, next) {
    // Get library, authors and books for form.
    async.parallel({
        library: function (callback) {
            Library.findById(req.params.id).populate('books').exec(callback);
        },
        cities: function (callback) {
            //buscamos todos los libros y decimos que nos de todos los datos de los libros
            City.find().populate('city').exec(callback);
        },
        books: function (callback) {
            //buscamos todos los libros y decimos que nos de todos los datos de los libros
            BookInstance.find().populate('book').exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.library == null) { // No results.
            var err = new Error('library not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        // Mark our selected books as checked.
        for (var all_g_iter = 0; all_g_iter < results.books.length; all_g_iter++) {
            for (var library_g_iter = 0; library_g_iter < results.library.books.length; library_g_iter++) {
                if (results.books[all_g_iter]._id.toString() == results.library.books[library_g_iter]._id.toString()) {
                    results.books[all_g_iter].checked = 'true';
                }
            }
        }
        res.render('library_form', { title: 'Update library', library: results.library, books: results.books, cities: results.cities });
    });

};



// Handle book update on POST.
exports.library_update_post = [

    // Convert the genre to an array
    (req, res, next) => {
        if (!(req.body.library instanceof Array)) {
            if (typeof req.body.library === 'undefined')
                req.body.library = [];
            else
                req.body.library = new Array(req.body.library);
        }
        next();
    },

    // Validate fields.
    body('name', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('city', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('name').escape(),
    sanitizeBody('city').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var library = new Library(
            {
                _id: req.params.id, //This is required, or a new ID will be assigned!
                name: req.body.name,
                books: (typeof req.body.book === 'undefined') ? [] : req.body.book,
                city: req.body.city,
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                cities: function (callback) {
                    //buscamos todos los libros y decimos que nos de todos los datos de los libros
                    City.find().populate('city').exec(callback);
                },
                books: function (callback) {
                    //buscamos todos los libros y decimos que nos de todos los datos de los libros
                    BookInstance.find().populate('book').exec(callback);
                },
            }, function (err, results) {
                if (err) { return next(err); }

                // Mark our selected books as checked.
                for (let i = 0; i < results.books.length; i++) {
                    if (library.books.indexOf(results.books[i]._id) > -1) {
                        results.books[i].checked = 'true';
                    }
                }
                res.render('book_form', { title: 'Update Book', cities: results.cities, books: results.books, library: library, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Library.findByIdAndUpdate(req.params.id, library, {}, function (err, thelibrary) {
                if (err) { return next(err); }
                // Successful - redirect to book detail page.
                res.redirect(thelibrary.url);
            });
        }
    }
];