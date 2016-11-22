var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var bcrypt =require('bcrypt-nodejs');

var RestaurantSchema = new Schema({

    nameOfRestaurant: {type:String, required: true},
    ownerOfRestaurant:{type:String, required: true},
    college: [{type:String}],
    password: {type: String, required: true, select: false},
    contactNo:{type:Number, required: true},
    address:String,
    status:{type:String},
    pickupTime:{type: String},
    tag:String

});


RestaurantSchema.pre('save', function (next) {
    var restaurant = this;

    if(!restaurant.isModified('password')) return next();

    bcrypt.hash(restaurant.password,null,null, function(err,hash){
        if(err) return next(err);

        restaurant.password = hash;
        next();
    });
});

RestaurantSchema.methods.comparePassword = function(password){
    var restaurant = this;
    return bcrypt.compareSync(password, restaurant.password);
}
module.exports = mongoose.model('Restaurant',RestaurantSchema);
