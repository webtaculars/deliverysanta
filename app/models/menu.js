var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MenuSchema = new Schema({

    restaurant: { type: String},
    nameOfDish: { type: String},
    priceOfDish: { type: String},
    typeOfDish: {type: String},
    vegOrNonVeg:{type:String},
	dishStatus:{type:String}

});

MenuSchema.pre('save', function (next) {
    var menu = this;

    if(!menu.isModified('password')) return next();

    bcrypt.hash(menu.password,null,null, function(err,hash){
        if(err) return next(err);

        menu.password = hash;
        next();
    });
});

module.exports = mongoose.model('Menu',MenuSchema);