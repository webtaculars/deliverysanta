var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GetIdSchema = new Schema({
    date: String,
    orderNo: Number
});

module.exports = mongoose.model('GetId',GetIdSchema);
