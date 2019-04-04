var City = require('../models/city');
var BookInstance = require('../models/bookinstance');
var async = require('async');

// Display list of all Genres.
exports.city_list = function(req, res, next) {
    //Buscamos todas las ciudades y las ordenamos
    City.find()
      .sort([['name', 'ascending']])
      .exec(function (err, list_city) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('city_list', { title: 'City List', city_list: list_city });
      });

  };

// Display detail page for a specific Genre.
exports.city_detail = function(req, res, next) {

    async.parallel({
        city: function(callback) {
            //Buscamos la ciudad con el id
            City.findById(req.params.id)
              .exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.city==null) { // No results.
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('city_detail', { title: 'City Detail', city: results.city } );
    });

};

// Display Genre create form on GET.
exports.city_create_get = function(req, res, next) {     
    res.render('city_form', { title: 'Create City' });
};

// Handle City create on POST.
exports.city_create_post =  [
   
    //Comprobamos que el nombre tiene mas de una letra
    body('name', 'City name required').isLength({ min: 1 }).trim(),
    // escapamos el campo
    sanitizeBody('name').escape(),

    //Comprobamos que el campo de population es mayor a 1
    body('population', 'City population required').isLength({ min: 1 }).trim(),
    // escapamos el campo
    sanitizeBody('population').escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
  
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a genre object with escaped and trimmed data.
      var city = new City(
        { name: req.body.name,
          population: req.body.population }
      );
  
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render('city_form', { title: 'Create City', city: city, errors: errors.array()});
        return;
      }
      else {
        // Data from form is valid.
        // Check if Genre with same name already exists.
        City.findOne({ 'name': req.body.name })
          .exec( function(err, found_city) {
             if (err) { return next(err); }
  
             if (found_city) {
               // Genre exists, redirect to its detail page.
               res.redirect(found_city.url);
             }
             else {
  
               city.save(function (err) {
                 if (err) { return next(err); }
                 // Genre saved. Redirect to genre detail page.
                 res.redirect(city.url);
               });
  
             }
  
           });
      }
    }
  ];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};