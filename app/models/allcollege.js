var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var AllcollegeSchema = new Schema({

    name: String,
    city: String
});


module.exports = mongoose.model('Allcollege',AllcollegeSchema);
