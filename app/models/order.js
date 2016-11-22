var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var OrderSchema = new Schema({

    orderBy: { type:String, ref:'User'},
    username:{type:String,ref:'User'},
    userContactNo: {type:String, ref:'User'},
    college: { type:String, ref:'User'},
    restaurant: { type: String},
    nameOfDish:{type: String},
    quantityOfDish:{type:String},
    totalAmount:{type:String},
    timeOfDelivery:{type:String},
    clgInitials: {type: String},
    orderid:String,
    deliveredBy:String,
    specialInstruction: String,
    contactNo: String,
    date: String,
    status:String,
    uniqueCode:String,
    orderNo: String,
    finalAmount: String,
    bags:String,
    santaTotalOrder: String

});

module.exports = mongoose.model('Order',OrderSchema);
