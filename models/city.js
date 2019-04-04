var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CitySchema = new Schema(
  {
    name: {type: String, required: true, max: 100},
    population: {type: Number}
  }
);

// Virtual for City's URL
CitySchema
.virtual('url')
.get(function () {
  return '/catalog/city/' + this._id;
});

//Export model
module.exports = mongoose.model('City', CitySchema);