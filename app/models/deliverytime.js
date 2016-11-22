var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var DeliverytimeSchema = new Schema({

    college: String,
    deliveryTime: String,
    orderClosingTime: String
});


module.exports = mongoose.model('Deliverytime',DeliverytimeSchema);
