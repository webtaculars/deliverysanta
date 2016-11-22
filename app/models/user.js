var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var bcrypt =require('bcrypt-nodejs');


var UserSchema =new Schema({
    name: {type:String, required: true},
    college: {type:String, required: true},
    password: {type: String, required: true, select: false},
    contactNo:{type:Number, required: true,min:7000000000,max:9999999999,index: { unique:true}},
    email: {type: String, required: true},
    active: {type: String},
    orderid:[String],
    tag:String,
    value: String
});



UserSchema.pre('save', function (next) {
    var user = this;

    if(!user.isModified('password')) return next();

    bcrypt.hash(user.password,null,null, function(err,hash){
        if(err) return next(err);

        user.password = hash;
        next();
    });
});


UserSchema.methods.comparePassword = function(password){
    var user = this;
    return bcrypt.compareSync(password, user.password);
}
module.exports = mongoose.model('User',UserSchema);

