var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var bcrypt =require('bcrypt-nodejs');

var AdminSchema = new Schema({
    username: String,
    password: {type: String, required: true, select: false},
    tag: String
});


AdminSchema.pre('save', function (next) {
    var admin = this;

    if(!admin.isModified('password')) return next();

    bcrypt.hash(admin.password,null,null, function(err,hash){
        if(err) return next(err);

        admin.password = hash;
        next();
    });
});

AdminSchema.methods.comparePassword = function(password){
    var admin = this;
    return bcrypt.compareSync(password, admin.password);
}
module.exports = mongoose.model('Admin',AdminSchema);
