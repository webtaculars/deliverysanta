var User = require('../models/user');
var Order = require('../models/order');
var Restaurant = require('../models/restaurant');
var Menu = require('../models/menu');
var Allcollege = require('../models/allcollege');
var Deliverytime = require('../models/deliverytime');
var Admin = require('../models/admin');
var DeliveryBoy = require('../models/deliveryBoy');
var GetId = require('../models/orderid');
var config = require('../../config');
var moment=require('moment');
var format=require('format');
var secretKey = config.secretKey;
var jsonwebtoken =require('jsonwebtoken');
var msg91=require('msg91-sms');
var random = require("random-js")(); // uses the nativeMath engine
var Otp = require('../models/otp');
var moment = require('moment-timezone');
var Details = require('../models/details');

function createUserToken(user){
    var token = jsonwebtoken.sign({
        id: user._id,
        name:user.name,
        email: user.email,
        college: user.college,
        contactNo:user.contactNo,
        tag:"user"
    },secretKey,{expiresInMinute: 1440});
    return token;
}

function createAdminToken(admin){
    var token = jsonwebtoken.sign({
        id: admin._id,
        username:admin.username,
        tag:"admin"
    },secretKey,{expiresInMinute: 1440});
    return token;
}
function createRestaurantToken(rest){
    var token = jsonwebtoken.sign({
        id: rest._id,
        tag:"restaurant",
        nameOfRestaurant: rest.nameOfRestaurant,
        ownerOfRestaurant:rest.ownerOfRestaurant,
        college: rest.college,
        contactNo:rest.contactNo,
        address:rest.address
    },secretKey,{expiresInMinute: 1440});

    return token;
}

function createDeliveryBoyToken(deliveryBoy){
    var token = jsonwebtoken.sign({
        id: deliveryBoy._id,
        name:deliveryBoy.name,
        delid: deliveryBoy.delid,
        timeOfDelivery: deliveryBoy.timeOfDelivery,
        contactNo:deliveryBoy.contactNo,
        college: deliveryBoy.college,
        tag:"deliveryboy"
    },secretKey,{expiresInMinute: 1440});

    return token;

}
function ifUser(tag){
    if(tag=="user"){
        return true;
    }
    return false;
}
function ifAdmin(tag){
    if(tag=="admin"){
        return true;
    }
    return false;
}
function ifRestaurant(tag){
    if(tag=="restaurant"){
        return true;
    }
    return false;
}
function ifDeliveryBoy(tag){
    if(tag=="deliveryboy"){
        return true;
    }
    return false;
}
module.exports= function(app,express){


    var api= express.Router();

   //                 //
    //    ADMIN        //
    //                 //


    //ADMIN








    api.post('/adminlogin',function(req,res){

        Admin.findOne({
            username: req.body.username
        }).select('username password').exec(function(err,admin){
            if(err) throw err;

            if(!admin){
                res.send({ message: "admin does not exist"});

            }else if(admin){
                var validPassword = admin.comparePassword(req.body.password);
                if(!validPassword){
                    res.send({message: "Invalid Pass"});
                }else {
                    var token = createAdminToken(admin);
                    res.json({
                        success:true,
                        message: "Successfully login",
                        token:token
                    });
                }
            }
        });
    });

  /*  //create admin
    api.post('/createadmin',function(req,res){
        var admin = new admin({
            username: req.body.username,
            password: req.body.password,
            tag:'admin'
        });
        var token = createadmintoken(admin);
        admin.save(function(err){
            if(err){
                res.send(err);
                return;
            }
            res.json({
                success: true,
                message: 'admin created',
                token: token
            });
        });
    });

*/    //                 //
    //    USERS        //
    //                 //
    //SIGNUP USER
    api.post('/signup',function(req,res){
        var value = random.integer(1000, 9999);

        var user = new User({
            name: req.body.name,
            email: req.body.email,
            college: req.body.college,
            contactNo:req.body.contactNo,
            password: req.body.password,
            tag:'user',
            active: '0',
            value: value
        });


        var token = createUserToken(user);
        user.save(function(err){
            if(err){
                res.json({'message':'User already exists'});
                return;
            }
            res.json({
                success: true,
                message: 'User created',
                token: token
            });
            var authkey = '101648AeV6o8poG569d48e4';
            var number = req.body.contactNo;
            var message = 'Hey. Your OTP is '+ value +'. Thanks.';
            var senderid = 'DSANTA';
            var route = '4';
            var dialcode = '91';

            msg91.sendOne(authkey, number, message, senderid, route, dialcode, function (response) {

                console.log(response);
            });
        });

    });

    //VERIFY OTP
    api.post('/verifyotp', function (req, res) {
        var number = req.body.contactNo;
        var value = req.body.value;
        var email =req.body.email;
        User.find({email: email, contactNo:number,value:value}).update({$set:{'active':'1'}},function (err, user) {
            if(err){
                res.send(err);
                return;
            }
            res.json(user);
        })

    });

    //RESEND OTP
    api.post('/resendotp', function (req, res) {
        var number =req.body.contactNo;
        var value = random.integer(1000, 9999);
        var value1 = value;
        var email=req.body.email;

        var authkey = '101648AeV6o8poG569d48e4';
        var message = 'Hey. Your one time password is '+ value1 +'. Thanks.';
        var senderid = 'DSANTA';
        var route = '4';
        var dialcode = '91';

        msg91.sendOne(authkey, number, message, senderid, route, dialcode, function (response) {

        });

        User.find({email:email, contactNo:number}).update({$set:{'value':value}},function (err, user) {
            if(err){
                res.send(err);
                return;
            }
            res.json({'message':"New OTP generated"});
        });

    })



    //LOGIN USER
    api.post('/login',function(req,res){

        User.findOne({
            contactNo: req.body.contactNo
        }).select('name email college active contactNo password').exec(function(err,user) {
            if (err) throw err;

            if (!user) {
                res.send({message: "User does not exist"});

            }else if(user && user.active=='0'){

                res.json({message: "User is not verified",
                            email: user.email,
                            contactNo: user.contactNo});

            }else if(user){
                var validPassword = user.comparePassword(req.body.password);
                if(!validPassword){
                    res.send({message: "Invalid Email/Password"});
                }else {
                    var token = createUserToken(user);
                    res.json({
                        success:true,
                        message: "Successfully login",

                        token:token
                    });
                }
            }
        });
    });

    //LOGIN RESTAURANT
    api.post('/loginrest',function(req,res){

        Restaurant.findOne({
            nameOfRestaurant: req.body.nameOfRestaurant
        }).select('nameOfRestaurant college password contactNo').exec(function(err,rest){
            if(err) throw err;

            if(!rest){
                res.send({ message: "Rest does not exist"});

            }else if(rest){
                var validPassword = rest.comparePassword(req.body.password);
                if(!validPassword){
                    res.send({message: "Invalid Pass"});
                }else {
                    var token = createRestaurantToken(rest);

                    res.json({
                        success:true,
                        message: "Successfully login",
                        token:token
                    });
                }
            }
        });
    });

    //DELIVERY TIME
    api.post('/deliverytime', function (req, res) {
        var current_time = new moment ().tz("Asia/Kolkata").format("HHmm");
        if(current_time>1945){
            res.json([{message:'Time Exceeded',deliveryTime:'21:30'}]);
        }
        else if(current_time<1945){
            res.json([{message:'Time Available',deliveryTime:'21:30'}]);
        }

    });

    api.post('/checkdeliveryprice', function (req, res) {
        if(req.body.totalAmount>0 && req.body.totalAmount <= 150)
        {
            res.json({deliveryprice:'30'})
        }
        else if(req.body.totalAmount>150 && req.body.totalAmount<=300)
        {
            res.json({deliveryprice:'40'})
        }
        else if(req.body.totalAmount>300 && req.body.totalAmount<=500)
        {
            res.json({deliveryprice:'50'})
        }
        else if(req.body.totalAmount>500)
        {
            res.json({deliveryprice:req.body.totalAmount/10}

                );
        }
        else{
            res.json({deliveryprice: '0'})
        }

    });

    //Show all college names
    api.get('/allcollegename', function (req, res) {
        Allcollege.find({},{"name":1,_id:0}, function (err, allcollege) {
            if(err){
                res.send(err);
                return;
            }
            res.json(allcollege);
        })
    });

    //SEARCH THE CITY AND GET THE NAME OF COLLEGES IN THAT CITY
    api.post('/collegesinacity',function(req,res){
        Allcollege.find({city:req.body.city},function(err,college){
            if(err){
                res.send(err);
                return;
            }
            else
                res.json(college);
        })
    });

    //SHOW ALL RESTAURANTS WHICH ARE AVAILABLE
    api.get('/allrestaurant',function(req,res){

        Restaurant.find({status:"1"}, function (err,allrestaurant) {
            if(err){
                res.send(err);
                return;
            }
            res.json(allrestaurant);
        });

    });

    //FIND RESTAURANT BY COLLEGE NAME
    api.route('/findrestbycollege')
        .post(function (req, res) {
            Restaurant.find({
                    college: req.body.college
                },function(err, college) {
                    if (err) {
                        res.send(err);
                        return;
                    }
                    res.json(college);
                }
            )
        });




    // DISPLAY TYPES OF DISHES OF A PARTICULAR RESTAURANT
    api.post('/typeofdish',function(req,res){
        Menu.find({
            restaurant: req.body.restaurant
        },{"typeOfDish":1,_id:0},function(err, menu){
            if(err){
                res.send(err);
                return;
            }

            var lookup = {};
            var items = menu;
            var result = [];
            var menu1 = {};

            for (var item, i = 0; item = items[i++];) {
                var name = item;

                if (!(name in lookup)) {
                    lookup[name] = 1;
                    result.push(name);
                }
            }
            res.json(result);
        });
    });

    // DISPLAY MENU OF A PARTICULAR RESTAURANT BY NAME OF REST and TYPE OF DISH
    api.post('/menubyrestnametype',function(req,res){
        Menu.find({
            restaurant: req.body.restaurant,
            typeOfDish: req.body.typeOfDish,
            dishStatus:'1'
        },function(err, menu){
            if(err){
                res.send(err);
                return;
            }
            res.json(menu);
        });
    });
	





    //                     //
    //    DELIVERY BOY     //
    //                     //




    //LOGIN DELIVERY BOY
    api.post('/logindeliveryboy',function(req,res){

        DeliveryBoy.findOne({
            name: req.body.name
        }).select('name college delid timeOfDelivery password').exec(function(err,deliveryBoy){
            if(err) throw err;

            if(!deliveryBoy){
                res.send({ message: "Delivery Boy does not exist"});

            }else if(deliveryBoy){
                var validPassword = deliveryBoy.comparePassword(req.body.password);
                if(!validPassword){
                    res.send({message: "Invalid Password"});
                }else {
                    var token = createDeliveryBoyToken(deliveryBoy);

                    res.json({
                        success:true,
                        message: "Successfully login",
                        token:token
                    });
                }
            }
        });
    });

    // DISPLAY MENU OF A PARTICULAR RESTAURANT BY NAME OF REST
    api.post('/menubyrestname',function(req,res){

        Menu.find({
            restaurant: req.body.nameOfRestaurant,
			dishStatus: '1'
        }, function (err, menu) {
            if (err) {
                res.send(err);
                return;
            }
            res.json(menu);
        });

    });
	// DISPLAY MENU OF A PARTICULAR RESTAURANT BY NAME OF REST TO A RESTAURANT
    api.post('/menubyrestnametorest',function(req,res){

        Menu.find({
            restaurant: req.body.nameOfRestaurant,
        }, function (err, menu) {
            if (err) {
                res.send(err);
                return;
            }
            res.json(menu);
        });

    });

//
// Middleware
    api.use(function (req,res,next) {
        var token = req.body.token || req.param('token') || req.headers['x-access-token'];

        if(token){
            jsonwebtoken.verify(token, secretKey, function(err, decoded){
                if(err){
                    res.status(403).send({success: false, message: "Failed to connect"});
                }else {
                    req.decoded= decoded;
                    next();
                }
            });
        }else {

            res.status(403).send({success: false, message: "false token"});
        }

    });


    //                 //
    //    AFTER LOGIN  //
    //                 //
    //SHOW ALL USERS
    api.get('/users',function(req,res){
        var result=ifAdmin(req.decoded.tag);
        if(result == true){
            User.find({}, function (err,users) {
                if(err){
                    res.send(err);
                    return;
                }
                res.json(users);
            });
        }
        else
            res.send("You can't access this api");
        return;


    });

    //DISPLAY RESTAURANTS AVAILABLE TO USER AFTER SIGNING IN
    api.get('/getrestbyuser',function(req,res){
        var result=ifUser(req.decoded.tag);
        if(result){
            var coll=req.decoded.college;
            Restaurant.find({college:coll,dishStatus:'1'},function(err,rest){
                if(err){
                    res.send(err);
                    return;
                }
                res.json(rest);
            })
        }
        else
            res.send("You can't access this api");
    });

    //SHOW ALL COLLEGES
    api.get('/allcollege', function (req, res) {
        var result=ifAdmin(req.decoded.tag);
        if(result == true){
            Allcollege.find({}, function (err,allcollege) {
                if(err){
                    res.send(err);
                    return;
                }
                res.json(allcollege);
            });
        }
        else
            res.send("You can't access this api");
        return;

    });
    //SHOW ALL DELIVERY BOY
    api.get('/alldeliveryboy',function(req,res){
        var result=ifAdmin(req.decoded.tag);
        if(result == true){
            DeliveryBoy.find({}, function (err,alldeliveryboy) {
                if(err){
                    res.send(err);
                    return;
                }
                res.json(alldeliveryboy);
            });
        }
        else
            res.send("You can't access this api");
        return;


    });
    //SIGNUP DELIVERY BOY
    api.post('/signupdeliveryboy',function(req,res){
        var result=ifAdmin(req.decoded.tag);
        if(result == true) {
            var deliveryBoy = new DeliveryBoy({
                name: req.body.name,
                college: req.body.college,
                password: req.body.password,
                delid:req.body.delid,
                contactNo:req.body.contactNo,
                timeOfDelivery:req.body.timeOfDelivery
            });
            deliveryBoy.save(function (err) {
                if (err) {
                    res.send(err);
                    return;
                }
                res.json({message: 'Delivery boy added'});
            });
        }
        else
            res.send("You can't access this api");
        return;

    });




    api.route('/addorder')
        .post(function(req,res){
            var result=ifUser(req.decoded.tag);
            if(result == true){
                var id;
                var date = new Date();
                date = moment(date).tz("Asia/Kolkata").format('YYYYMMDD');
                if(req.body.totalAmount >0 && req.body.totalAmount<=150)
                {
                    var finalAmount = Number(req.body.totalAmount) + 30;
                }
                else if(req.body.totalAmount >150 && req.body.totalAmount<=300)
                {
                    var finalAmount = Number(req.body.totalAmount) + 40;
                }
                else if(req.body.totalAmount >300 && req.body.totalAmount<=500)
                {
                    var finalAmount = Number(req.body.totalAmount) + 50;
                }
                else
                {
                    var finalAmount = Number(req.body.totalAmount) + Number(req.body.totalAmount)/10;
                }

                GetId.findOneAndUpdate({date:date}, { $inc: { orderNo: 1 } },                // function of assigning order id


                    function(err,getid){

                        if(err)
                            console.log(err);
                        else if(getid)
                            console.log(getid.orderNo);

                    });

                GetId.find({'date':date}, function (err, getid) {
                    if (err)
                        console.log(err);
                    else if (getid[0]==null) {
                        var oid=new GetId();
                        //var today = new Date();
                        //today = moment(date).format('YYYYMMDD');
                        oid.date=date;
                        oid.orderNo=1;

                        oid.save(function(err){

                            if(err)
                                console.log(err);
                            else {
                                console.log("orderNo value setup successful , new order for today created");
                            }
                        });
                        var value = random.integer(1, 100);

                        id='LNM'+oid.date+oid.orderNo;
                        var userid=req.decoded.id;
                        var username=req.decoded.name
                        console.log('id genreated is '+id);
                        var order = new Order({
                            orderBy:username ,
                            username: userid,
                            college: req.decoded.college,
                            userContactNo: req.decoded.contactNo,
                            restaurant: req.body.restaurant,
                            nameOfDish: req.body.nameOfDish,
                            quantityOfDish:req.body.quantityOfDish,
                            totalAmount:req.body.totalAmount,
                            timeOfDelivery:req.body.timeOfDelivery,
                            clgInitials:'LNM',
                            contactNo:req.body.contactNo,
                            specialInstruction: req.body.specialInstruction,
                            date: date,
                            status: '-2',
                            orderid:id,
                            uniqueCode:value,
                            orderNo:oid.orderNo,
                            finalAmount: finalAmount,
                            bags:'1'

                        });
                        order.save(function(err){
                            if(err){
                                res.send(err);
                                return
                            }

                            res.json(order);

                        })
                    }
                    else {
                        var value = random.integer(100, 999);

                        console.log("orderNo value setup successful");
                        id='LNM'+getid[0].date+getid[0].orderNo;
                        console.log('id genreated is '+id);
                        var userid =req.decoded.id;
                        var username=req.decoded.name

                        var order = new Order({
                            orderBy: username,
                            username: userid,
                            college: req.decoded.college,
                            userContactNo: req.decoded.contactNo,
                            restaurant: req.body.restaurant,
                            nameOfDish: req.body.nameOfDish,
                            quantityOfDish:req.body.quantityOfDish,
                            totalAmount:req.body.totalAmount,
                            timeOfDelivery:req.body.timeOfDelivery,
                            status: '-2',
                            contactNo:req.body.contactNo,
                            specialInstruction: req.body.specialInstruction,
                            clgInitials:'LNM',
                            orderid:id,
                            date: date,
                            uniqueCode:value,
                            orderNo: getid[0].orderNo,
                            finalAmount: finalAmount,
                            bags:'1'
                        });
                        order.save(function(err){
                            if(err){
                                res.send(err);
                                return
                            }
                            res.json(order);

                        })
                    }
                });

            }

            else
                res.send("You can't access this api.");
            return;

        });

    //UPDATE AVAILABILITY OF RESTAURANTS                                ////////added//////////
    api.route('/updatereststatus')
        .post(function (req, res) {
            var result=ifRestaurant(req.decoded.tag);
            if(result == true){

                Restaurant.update({"status": req.body.status},{$set:{'status': req.body.newstatus}}, function (err, rest) {
                    if(err){
                        res.send(err);
                        return;
                    }
                    res.json(rest);
                })
            }
            else
                res.send("You can't access this api");
            return;

        });
    //ASSIGN DELID TO THE DELIVERY BOY
    // api.post()


    //
    ////SEND ORDER TO RESTAURANTS
    //    api.route('/sendorder')
    //    .get(function(req,res){
    //        Order.find({orderBy: req.decoded.id, status:'-2'},function(err, orders){
    //                if(err){
    //                    res.send(err);
    //                    return;
    //                }
    //                res.json(orders);
    //
    //        });
    //    });
    //GET ORDER BY ADMIN FROM ALL THE USERS
    api.route('/getorderbyadmin')
        .post(function(req,res){
            var result=ifAdmin(req.decoded.tag);
            var date = new Date();
            date = moment(date).tz("Asia/Kolkata").format('YYYYMMDD');

            if(result == true){
                Order.find({date: date},function(err, orders){
                    if(err){
                        res.send(err);
                        return;
                    }
                    res.json(orders);
                });
            }
            else
                res.send("You can't access this api");
            return;

        });
    //ACCEPT OR DECLINE BY ADMIN
    api.post('/statuschangebyadmin', function (req, res) {
        var result=ifAdmin(req.decoded.tag);
        if(result == true){
            Order.find({orderid:req.body.orderid}).update({$set:{'status': req.body.status}}, function (err, status) {
                if(err){
                    res.send(err);
                    return;
                }
                 if(req.body.status == '-1') {
                    var authkey = '101648AeV6o8poG569d48e4';
                     var number = req.body.contactNo;
                     var message = 'Hey. New order has arrived. Please take a look at it. Thanks.';
                     var senderid = 'DSANTA';
                    var route = '4';
                    var dialcode = '91';

                    msg91.sendOne(authkey, number, message, senderid, route, dialcode, function (response) {

                        console.log(response);
                    });


                }
                else if(req.body.status == '-3'){
                     var authkey = '101648AeV6o8poG569d48e4';
                     var number = req.body.userContactNo;
                     var message = 'Hey. Your order has been rejected by admin. Please contact the customer representative at 7611048225. Thanks.';
                     var senderid = 'DSANTA';
                     var route = '4';
                     var dialcode = '91';

                     msg91.sendOne(authkey, number, message, senderid, route, dialcode, function (response) {

                         console.log(response);
                     });

                 }
                res.json({message: 'Status Changed'});

            });

        }
        else {
            res.send("You can't access this api");
        }
        return;

    });

    //   GET ORDER BY THE REST APPROVED BY ADMIN
    api.route('/getorderbyrest')
        .post(function(req,res){
            var result=ifRestaurant(req.decoded.tag);
            var date = new Date();
            date = moment(date).tz("Asia/Kolkata").format('YYYYMMDD');

            if(result == true){

            Order.find({date:date,restaurant: req.decoded.nameOfRestaurant,$or:[{status : '0'},{status: '-1'}]},function(err, orders){
                if(err){
                    res.send(err);
                    return;
                }
                res.json(orders);
            });
        }
            else
                res.send("You can't access this api");
        });


    //ACCEPT OR DECLINE BY RESTAURANT
    api.post('/statuschangebyrest', function (req, res) {
        var result=ifRestaurant(req.decoded.tag);
        if(result == true){
            Order.find({orderid:req.body.orderid}).update({$set:{'status': req.body.status}}, function (err, status) {
                if(err){
                    res.send(err);
                    return;
                }
                Order.find({orderid:req.body.orderid},function(err,order){
                        if(err){
                            res.send(err);
                            return
                        }
                        var userid=order[0].orderBy;
                        var id=order[0].orderid;
                        console.log(id);
                        User.findByIdAndUpdate({_id: userid},
                            {
                                $push: {"orderid":id}
                            },
                            function (err,order) {
                                if (err) {
                                    console.log(err);
                                }
                                else
                                    console.log('orderid pushed');

                            });
                    }

                );
                if(req.body.status == '0') {
                    var authkey = '101648AeV6o8poG569d48e4';
                    var number = req.body.userContactNo;
                    var message = 'Hey. Your order has been confirmed. Your ORDER No is ' + req.body.orderNo +'. Your unique code is '+ req.body.uniqueCode +'. Thanks.';
                    var senderid = 'DSANTA';
                    var route = '4';
                    var dialcode = '91';

                    msg91.sendOne(authkey, number, message, senderid, route, dialcode, function (response) {

                        console.log(response);
                    });


                }
                else if(req.body.status=='-3'){

                    var authkey = '101648AeV6o8poG569d48e4';
                    var number = req.body.userContactNo;
                    var message = 'Hey. Your order has been rejected by restaurant. Please contact our representative at 7611048225. Thanks.';
                    var senderid = 'DSANTA';
                    var route = '4';
                    var dialcode = '91';

                    msg91.sendOne(authkey, number, message, senderid, route, dialcode, function (response) {

                        console.log(response);
                    });

                }

                res.json({message: 'Status Changed'});

            });

        }
        else
            res.send("You can't access this api");
        return;


    });

    //                 //
    //    COLLEGES     //
    //                 //

    api.post('/addcollege', function (req, res) {
        var result=ifAdmin(req.decoded.tag);
        if(result == true){
            var college = new Allcollege({
                name: req.body.name,
                city:req.body.city
            });
            college.save(function(err){
                if(err){
                    res.send(err);
                    return;
                }
                res.json({
                    success: true,
                    message: 'college added'
                });
            });
        }
        else
            res.send("You can't access this api");
        return;
    });

    //                 //
    //    RESTAURANT   //
    //                 //

    //ADD RESTAURANT BY ADMIN
    api.post('/addrest',function(req,res){
        var result=ifAdmin(req.decoded.tag);
        if(result == true){
            var restaurant = new Restaurant({
                nameOfRestaurant: req.body.nameOfRestaurant,
                ownerOfRestaurant: req.body.ownerOfRestaurant,
                username: req.body.username,
                contactNo:req.body.contactNo,
                college:req.body.college,
                address:req.body.address,
                password: req.body.password,
                pickupTime:req.body.pickupTime,
                status: '1'
            });

            restaurant.save(function(err){
                if(err){
                    res.send(err);
                    return;
                }
                res.json({message: 'restaurant added'});
            });
        }
        else
            res.send("You can't access this api");
        return;

    });

    //UPDATE RESTAURANT NAME BY ADMIN
    api.route('/updaterestname')
        .post(function (req, res) {
            var result=ifAdmin(req.decoded.tag);
            if(result == true){
                var newname;
                Restaurant.update({"nameOfRestaurant": req.body.name},{$set:{'nameOfRestaurant': req.body.newname}}, function (err, name) {
                    if(err){
                        res.send(err);
                        return;
                    }
                    res.json(name);
                })
            }
            else
                res.send("You can't access this api");
            return;

        });


    //UPDATE RESTAURANT COLLEGE BY ADMIN
    api.route('/updaterestcollege')
        .post(function (req, res) {
            var result=ifAdmin(req.decoded.tag);
            if(result == true){
                var newcollege;
                Restaurant.update({"nameOfRestaurant": req.body.name},{$set:{'college': req.body.newcollege}}, function (err, college) {
                    if(err){
                        res.send(err);
                        return;
                    }
                    res.json(college);
                })
            }
            else
                res.send("You can't access this api");
            return;


        });


    //DELETE RESTAURANT BY ADMIN
    api.route('/deleterest')
        .post(function(req,res){
            var result=ifAdmin(req.decoded.tag);
            if(result == true){
                Restaurant.remove({
                    "nameOfRestaurant": req.body.name
                }, function (err,rest) {
                    if(err){
                        res.send(err);
                        return;
                    }
                    res.json(rest);
                })
            }
            else
                res.send("You can't access this api");
            return;

        });
    //DELETE MENU BY ADMIN

    api.route('/deletedish')
        .post(function(req,res){
            var result=ifAdmin(req.decoded.tag);
            if(result == true){
                Menu.remove({
                    "_id": req.body.id
                }, function (err,rest) {
                    if(err){
                        res.send(err);
                        return;
                    }
                    res.json(rest);
                })
            }
            else
                res.send("You can't access this api");
            return;

        });


    // ADD DISH TO MENU  BY ADMIN//
    api.post('/menubyadmin',function (req,res) {
        var result=ifAdmin(req.decoded.tag);
        if(result == true){
            var menu = new Menu({
                restaurant: req.body.restaurant,
                nameOfDish: req.body.nameOfDish,
                priceOfDish: req.body.priceOfDish,
                typeOfDish: req.body.typeOfDish,
                vegOrNonVeg: req.body.vegOrNonVeg,
                dishStatus:"1"
            });

            menu.save(function(err){
                if(err){
                    res.send(err);
                    return
                }
                res.json(menu);
            });

        }
        else
            res.send("You can't access this api");
        return;

    });


    // ADD DISH TO MENU  BY RESTAURANT//

    api.post('/menubyrest',function (req,res) {
        var result=ifRestaurant(req.decoded.tag);
        if(result == true){
            var menu = new Menu({
                restaurant: req.body.restaurant,
                nameOfDish: req.body.nameOfDish,
                priceOfDish: req.body.priceOfDish,
                typeOfDish: req.body.typeOfDish,
                vegOrNonVeg: req.body.vegOrNonVeg,

                dishStatus:"0"
            });

            menu.save(function(err){
                if(err){
                    res.send(err);
                    return
                }
                res.json({message: "menu Updated"})
            });

        }
        else
            res.send("You can't access this api");
        return;

    });
    //APPROVAL OF DISH BY ADMIN//
    api.post('/approveupdate',function(req,res){
        var result=ifAdmin(req.decoded.tag);
        if(result == true){
            Menu.find({"restaurant":req.body.restaurant, "nameOfDish":req.body.nameOfDish}).update({$set:{dishStatus:1}},function(err,menu){
                if(err){
                    res.send(err);
                    return;
                }
                res.json(menu);

            })
        }
        else
            res.send("You can't access this api");
        return;

    });
    //SHOW APIS ASKED TO APPROVE
    api.get('/requesttoapprove',function(req,res){
        var result=ifAdmin(req.decoded.tag);
        if(result == true){
            Menu.find({"status":'0'},function(err,menu){
                if(err){
                    res.send(err);
                    return;
                }
                res.json(menu);

            })
        }
        else
            res.send("You can't access this api");
        return;

    });

    //UPDATE PRICE BY RESTAURANT
    api.post('/updatepricebyrest',function(req,res){
        var result=ifRestaurant(req.decoded.tag);
        if(result == true){
            Menu.find({"restaurant":req.body.restaurant,"nameOfDish": req.body.nameOfDish}).update({$set:{priceOfDish:req.body.priceOfDish,dishStatus:'0'}}, function (err, menu) {
                if(err){
                    res.send(err);
                    return;
                }
                res.json(menu);
            })
        }
        else
            res.send("You can't access this api");
        return;

    });

    //UPDATE PRICE BY ADMIN
    api.post('/updatepricebyadmin',function(req,res){
        var result=ifAdmin(req.decoded.tag);
        if(result == true){
            Menu.find({"restaurant":req.body.restaurant,"nameOfDish":req.body.nameOfDish}).update({$set:{priceOfDish:req.body.priceOfDish,dishStatus:'1'}}, function (err, menu) {
                if(err){
                    res.send(err);
                    return;
                }
                res.json(menu);
            })
        }
        else
            res.send("You can't access this api");
        return;

    });

    //REMOVE DISH BY RESTAURANT
    api.post('/removedishbyrest',function(req,res){
        var result=ifRestaurant(req.decoded.tag);
        if(result == true){
            Menu.find({"restaurant":req.decoded.restaurant,"nameOfDish":req.body.nameOfDish}).update({$set:{status:'1'}}, function (err, menu) {
                if(err){
                    res.send(err);
                    return;
                }
                res.json(menu);
            })
        }
        else
            res.send("You can't access this api");
        return;
    });
    //REMOVE DISH BY ADMIN
    api.post('/removedishbyadmin',function(req,res){
        var result=ifAdmin(req.decoded.tag);
        if(result == true){
            Menu.find({"restaurant":req.body.name,"nameOfDish":req.body.nameOfDish},function (err, menu) {
                if (err) {
                    res.send(err);
                    return;
                }
                menu[0].remove();
                res.json(menu);
            });
        }
        else
            res.send("You can't access this api");
        return;
    });
    //SHOW ALL THE DISHES WHICH A RESTAURANT WANTS TO REMOVE
    api.get('/removerequest',function(req,res){
        var result=ifAdmin(req.decoded.tag);
        if(result == true){
            Menu.find({status:'-1'},function(err,menu){
                if(err){
                    res.send(err);
                    return;
                }
                res.json(menu);
            })
        }
        else
            res.send("You can't access this api");
        return;

    });

    //UNAVAILABLE DISH BY RESTAURANT
    api.post('/disabledishbyrest',function(req,res){
        var result=ifRestaurant(req.decoded.tag);
        if(result == true){
            Menu.find({"restaurant":req.decoded.nameOfRestaurant,"nameOfDish":req.body.nameOfDish}).update({$set:{dishStatus:'0'}}, function (err, menu) {
                if(err){
                    res.send(err);
                    return;
                }
                res.json(menu);
            })
        }
        else
            res.send("You can't access this api");
        return;
    });
    //AVAILABLE DISH BY RESTAURANT
    api.post('/enabledishbyrest',function(req,res){
        var result=ifRestaurant(req.decoded.tag);
        if(result == true){
            Menu.find({"restaurant":req.decoded.nameOfRestaurant,"nameOfDish":req.body.nameOfDish}).update({$set:{dishStatus:'1'}}, function (err, menu) {
                if(err){
                    res.send(err);
                    return;
                }
                res.json(menu);
            })
        }
        else
            res.send("You can't access this api");
        return;
    });
    //             //
    //    USER     //
    //             //

    //BLOCK USER
    api.route('/blockuser')
        .post(function (req, res) {
            var result=ifAdmin(req.decoded.tag);
            if(result == true){
                User.find({"_id": req.body.id}).update({$set:{'active': '0'}}, function (err, user) {
                    if(err){
                        res.send(err);
                        return;
                    }
                    res.json(user);
                })
            }
            else
                res.send("You can't access this api");
            return;
        });



    //UNBLOCK USER
    api.route('/unblockuser')
        .post(function (req, res) {
            var result=ifAdmin(req.decoded.tag);
            if(result == true){
                User.find({"_id": req.body.id}).update({$set:{'active': '1'}}, function (err, user) {
                    if(err){
                        res.send(err);
                        return;
                    }
                    res.json(user);
                })
            }
            else
                res.send("You can't access this api");
            return;

        });
    //                     //
    //    DELIVERY BOY     //
    //                     //

    //IF THE STATUS IS ZERO THEN NOTIFY THE USER.
    //ASSIGN DELIVERY BOY TO THE ORDER
   /* api.post('/assignboy',function(req,res){
        var result=ifRestaurant(req.decoded.tag);
        if(result == true){
            Order.find({orderid:req.body.orderid}).update({$set:{deliveredBy:req.body.timeOfDelivery}},function(err,order){
                if(err){
                    res.send(err);
                    return;
                }

                res.json(order);

            })
        }
        else
            res.send("You can't access this api");
        return;

    });*/

    // SHOW ALL ORDERS TO THE DELIVERY BOY OF THE PARTICULAR COLLEGE
    api.get('/getallrest', function (req, res) {
        var result=ifDeliveryBoy(req.decoded.tag);
        if(result == true){
            Order.find({"college": req.decoded.college},{"restaurant":1,_id:0},function(err, orders){
                if(err){
                    res.send(err);
                    return;
                }
                var lookup = {};
                var items = orders;
                var result = [];
                var menu1 = {};

                for (var item, i = 0; item = items[i++];) {
                    var name = item;

                    if (!(name in lookup)) {
                        lookup[name] = 1;
                        result.push(name);
                    }
                }
                res.json(result);

            });
        }
        else
            res.send("You can't access this api");
        return;
    });
    //// SHOW ORDER BY RESTAURANT
    //api.post('/getorderbyrest', function (req, res) {
    //    console.log("j");
    //    var result=ifUser(req.decoded.tag)  ;
    //        //|| ifUser(req.decoded.tag);
    //    console.log(result);
    //    if(result == true){
    //        Order.find({
    //            // "college": req.decoded.college,
    //            restaurant: req.body.restaurant
    //        }, function (err, orders) {
    //            if (err) {
    //                res.send(err);
    //                return;
    //            }
    //            var lookup = {};
    //            var items = orders;
    //            var result1 = [];
    //            var menu1 = {};
    //            for (var item, i = 0; item = items[i++];) {
    //                var name = item;
    //                if (!(name in lookup)) {
    //                    lookup[name] = 1;
    //                    result1.push(name);
    //                }
    //            }
    //            res.json(result1);
    //            //return;
    //        });
    //    }
    //    else
    //        console.log('oooo');
    //        res.send("You can't access this api");
    //       // console.log('oooo');
    //   // return;
    //});
    //SHOW ALL ORDERS TO THE DELIVERY BOY
    api.post('/allorderstoboy',function(req,res){
        var result=ifDeliveryBoy(req.decoded.tag);
        var date = new Date();
        date = moment(date).tz("Asia/Kolkata").format('YYYYMMDD');

        if(result == true){
            Order.find({"date":date},function(err,order){
                if(err){
                    res.send(err);
                    return;
                }
                res.json(order);
            })
        }
        else
            res.send("You can't access this api");
        return;

    });

    //SHOW ORDERS OF A PARTICULAR RESTAURANT TO THE DELIVERY BOY//
    api.post('/allorderstoboyofrest',function(req,res){
        var result=ifDeliveryBoy(req.decoded.tag);
        var date = new Date();
        date = moment(date).tz("Asia/Kolkata").format('YYYYMMDD');

        if(result == true){
            Order.find({"date":date,"restaurant":req.body.restaurant},function(err,order){
                if(err){
                    res.send(err);
                    return;
                }
                res.json(order);
            })
        }
        else
            res.send("You can't access this api");
        return;

    });

    api.post('/allresttoboy',function(req,res){
        var result=ifDeliveryBoy(req.decoded.tag);
        var date = new Date();
        date = moment(date).tz("Asia/Kolkata").format('YYYYMMDD');

        if(result == true){
            Order.find({"date":date,"status":'0'}).distinct("restaurant",function(err,order){
                if(err){
                    res.send(err);
                    return;
                }
                var len=order.length;
                var array=[];
                for(var i=0;i<len;i++){
                    data={restaurant:order[i]};
                    array.push(data);
                }
                res.json(array);
            })
        }
        else
            res.send("You can't access this api");
        return;
    });

    api.post('/addbags', function (req, res) {
    var result=ifDeliveryBoy(req.decoded.tag);
    if(result == true){
        Order.update({"orderNo":req.body.orderNo},{$set:{bags:req.body.bags}}, function (err, order) {
            if(err){
                res.send(err);
                return;
            }
            res.json({message: "bags added"});
        })
    }
    else
        res.send("You can't access this api");
    return;
});


    //CHANGE STATUS WHEN ITEMS DELIVERED AND DELETE ORDERID FROM THE USER
    api.post('/changestatusbyboy',function(req,res){
        var result=ifDeliveryBoy(req.decoded.tag);
        if(result == true){
            Order.update({"orderNo":req.body.orderNo},{$set:{'status': '1'}}, function (err,order) {
                if(err){
                    res.send(err);
                    return;
                }
                res.json(order);
            })
        }
        else
            res.send("You can't access this api");
        return;
    });

    //UPDATE THE POSITION OF DELIVERY BOY
    api.route('/updateposition')
        .post(function (req, res) {
            var result=ifDeliveryBoy(req.decoded.tag);
            if(result == true){
                DeliveryBoy.update({"_id": req.body.id},{$set:{'lat': req.body.lat,'long':req.body.long}}, function (err,boy) {
                    if(err){
                        res.send(err);
                        return;
                    }
                    res.json(boy);
                })
            }
            else
                res.send("You can't access this api");
            return;

        });
    //GET LOCATION BY THE USER
    api.get('/tracklocation',function(req,res){
        var result=ifUser(req.decoded.tag);
        if(result == true){
            User.find({_id:req.decoded.id},function(err,user) {
                if(err){
                    res.send(err);
                    return;
                }
                var oid=user[0].orderid[0];
                console.log(oid);
                Order.find({orderid:oid},function(err,order){
                    if(err){
                        res.send(err);
                        return;
                    }
                    var did=order.deliveredBy;
                    console.log(did);
                    DeliveryBoy.find({'delid':did},function(err,boy){
                        if(err){
                            res.send(err);
                            return;
                        }
                        res.json(boy);
                    })
                });

            });

        }
        else
            res.send("You can't access this api");
        return;

    });

    //HISTORY OF THE ORDERS BY USER
    api.post('/userhistory',function(req,res){
        var result=ifUser(req.decoded.tag);
        if(result==true){
            Order.find({'username':req.decoded.id},function(err,order){
                if(err){
                    res.send(err);
                    return;
                }
                else
                    res.json(order);
            })
        }
    });
    //HISTORY OF THE ORDERS OF A RESTAURANT
    api.post('/resthistory',function(req,res){
        var result=ifRestaurant(req.decoded.tag);
        if(result==true){
            Order.find({'restaurant':req.decoded.restaurant},function(err,order){
                if(err){
                    res.send(err);
                    return;
                }
                else
                    res.json(order);
            })
        }
    });

    //APPROVAL OF DISH BY ADMIN//
    api.post('/about',function(req,res){
        var result=ifAdmin(req.decoded.tag);
        if(result == true){
            var details = new Details({
                about: req.body.about
            });

            details.save(function(err){
                if(err){
                    res.send(err);
                    return;
                }
                res.json({message: 'about added'});
            });
        }
        else
            res.send("You can't access this api");
        return;

    });
    //APPROVAL OF DISH BY ADMIN//
    api.post('/privacy',function(req,res){
        var result=ifAdmin(req.decoded.tag);
        if(result == true){
            var details = new Details({
                privacy: req.body.privacy
            });

            details.save(function(err){
                if(err){
                    res.send(err);
                    return;
                }
                res.json({message: 'privacy added'});
            });
        }
        else
            res.send("You can't access this api");
        return;

    });
    //APPROVAL OF DISH BY ADMIN//
    api.post('/about',function(req,res){
        var result=ifAdmin(req.decoded.tag);
        if(result == true){
            var details = new Details({
                terms: req.body.terms
            });

            details.save(function(err){
                if(err){
                    res.send(err);
                    return;
                }
                res.json({message: 'privacy added'});
            });
        }
        else
            res.send("You can't access this api");
        return;

    });
    api.post('/me',function(req,res){
        res.json(req.decoded);

    });
    return api
}