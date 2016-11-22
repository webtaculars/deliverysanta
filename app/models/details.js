var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var DetailsSchema = new Schema({

    about: String,
    privacy: String,
    terms: String
});


module.exports = mongoose.model('Details',DetailsSchema);
