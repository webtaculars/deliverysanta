var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var DeliveryBoySchema = new Schema({

    name: String,
    college: {type:String},
    timeOfDelivery:{type:String},
    delid:  {type:String, required: true},
    contactNo:  {type:String, required: true},
    password: {type: String, required: true,select: false}

});


DeliveryBoySchema.pre('save', function (next) {
    var deliveryBoy = this;

    if(!deliveryBoy.isModified('password')) return next();

    bcrypt.hash(deliveryBoy.password,null,null, function(err,hash){
        if(err) return next(err);

        deliveryBoy.password = hash;
        next();
    });
});

DeliveryBoySchema.methods.comparePassword = function(password){
    var deliveryBoy = this;
    return bcrypt.compareSync(password, deliveryBoy.password);
}
module.exports = mongoose.model('DeliveryBoy',DeliveryBoySchema);
