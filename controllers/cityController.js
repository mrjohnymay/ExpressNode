var City = require('../models/city');
var BookInstance = require('../models/bookinstance');
var async = require('async');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Citys.
exports.city_list = function (req, res, next) {
  var sort = new Array();
  if (typeof req.query.cityname !== 'undefined' && req.query.cityname !== 'name') {
      //si firstname no es undefined y tampoco es el valor por defecto añadimos la opcion al array
      sort.push(['name', req.query.cityname]);
  }
  if (typeof req.query.population !== 'undefined' && req.query.population !== 'population') {
      sort.push(['population', req.query.population]);
  }
  //Buscamos todas las ciudades y las ordenamos
  City.find()
    .sort(sort.length > 0 ? sort : null)
    .exec(function (err, list_city) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('city_list', { title: 'City List', city_list: list_city });
    });

};

// Display detail page for a specific City.
exports.city_detail = function (req, res, next) {

  async.parallel({
    city: function (callback) {
      //Buscamos la ciudad con el id
      City.findById(req.params.id)
        .exec(callback);
    }
  }, function (err, results) {
    if (err) { return next(err); }
    if (results.city == null) { // No results.
      var err = new Error('City not found');
      err.status = 404;
      return next(err);
    }
    // Successful, so render
    res.render('city_detail', { title: 'City Detail', city: results.city });
  });

};

// Display City create form on GET.
exports.city_create_get = function (req, res, next) {
  res.render('city_form', { title: 'Create City' });
};

// Handle City create on POST.
exports.city_create_post = [

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
      {
        name: req.body.name,
        population: req.body.population
      }
    );


    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('city_form', { title: 'Create City', city: city, errors: errors.array() });
      return;
    }
    else {
      // Data from form is valid.
      // Check if City with same name already exists.
      City.findOne({ 'name': req.body.name })
        .exec(function (err, found_city) {
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
exports.city_delete_get = function (req, res, next) {
  async.parallel({
    city: function (callback) {
      City.findById(req.params.id).exec(callback)
    },
  }, function (err, results) {
    if (err) { return next(err); }
    if (results.city == null) { // No results.
      res.redirect('/catalog/cities');
    }
    // Successful, so render.
    res.render('city_delete', { title: 'Delete City', city: results.city });
  });
};

// Handle City delete on POST.
exports.city_delete_post = function (req, res) {
  async.parallel({
    city: function (callback) {
      City.findById(req.params.id).exec(callback)
    }
  }, function (err, results) {
    if (err) { return next(err); }
    // Success
    // Genre has no books. Delete object and redirect to the list of genres.
    City.findByIdAndRemove(results.city._id, function deleteCity(err) {
      if (err) { return next(err); }
      // Success - go to genres list.
      res.redirect('/catalog/cities');
    });
  });
};

// Display City update form on GET.
exports.city_update_get = function (req, res) {
  City.findById(req.params.id, function (err, city) {
    if (err) { return next(err); }
    if (city == null) { // No results.
      var err = new Error('City not found');
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render('city_form', { title: 'Update City', city: city });
  });
};

// Handle City update on POST.
exports.city_update_post = [

  // Validate that the name field is not empty.
  body('name', 'City name required').isLength({ min: 1 }).trim(),
  body('population', 'Population name required').isLength({ min: 1 }).trim(),

  // Sanitize (escape) the name field.
  sanitizeBody('name').escape(),
  sanitizeBody('population').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request .
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data (and the old id!)
    var city = new City(
      {
        _id: req.params.id,
        name: req.body.name,
        population: req.body.population
      }
    );

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values and error messages.
      res.render('city_form', { title: 'Update City', city: city, errors: errors.array() });
      return;
    }
    else {
      // Data from form is valid. Update the record.
      City.findByIdAndUpdate(req.params.id, city, {}, function (err, thecity) {
        if (err) { return next(err); }
        // Successful - redirect to genre detail page.
        res.redirect(thecity.url);
      });
    }
  }
];