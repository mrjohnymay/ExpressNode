var City = require('../models/city');
var BookInstance = require('../models/bookinstance');
var async = require('async');

// Display list of all Citys.
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

// Display detail page for a specific City.
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
            var err = new Error('City not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('city_detail', { title: 'City Detail', city: results.city } );
    });

};

// Display City create form on GET.
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
  
      // Create a City object with escaped and trimmed data.
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
        // Check if City with same name already exists.
        City.findOne({ 'name': req.body.name })
          .exec( function(err, found_city) {
             if (err) { return next(err); }
  
             if (found_city) {
               // City exists, redirect to its detail page.
               res.redirect(found_city.url);
             }
             else {
  
               city.save(function (err) {
                 if (err) { return next(err); }
                 // City saved. Redirect to City detail page.
                 res.redirect(city.url);
               });
  
             }
  
           });
      }
    }
  ];

// Display City delete form on GET.
exports.city_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: City delete GET');
};

// Handle City delete on POST.
exports.city_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: City delete POST');
};

// Display City update form on GET.
exports.city_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: City update GET');
};

// Handle City update on POST.
exports.city_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: City update POST');
};