var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var OtpSchema = new Schema({

    contactNo: String,
    value: String
});


module.exports = mongoose.model('Otp',OtpSchema);
