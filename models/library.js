var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var LibrarySchema = new Schema(
  {
    name: {type: String, required: true, max: 100},
    books: [{type: Schema.Types.ObjectId, ref: 'BookInstance'}], //referenciamos a las bookinstance
    city: {type: String, required: true, ref: 'City'}
  }
);

// Virtual for Library's URL
LibrarySchema
.virtual('url')
.get(function () {
  return '/catalog/library/' + this._id;
});

//Export model
module.exports = mongoose.model('Library', LibrarySchema);