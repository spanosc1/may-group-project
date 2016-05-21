var express = require("express"),
    request = require("request"),
    nodemailer = require('nodemailer'),
    path = require("path"),
    _ = require("lodash"),
    key = 'WQFSAkYbqamshlMXWe0X3EnVkSmap13txkbjsna2ZL3tOG8BzJ',
    bodyParser = require("body-parser"),
    myDB = require("../config/dbconnect");

// myDB.recipes = recipes table, myDB.userinfo = users table

// Variable is used to tell handlebars whether it's going to display
// an page with or without recipe results. 
var searchOrNot = false;
var currentRecipeList = [];

// Route for adding (posting) new burger to MYSQL via ORM from input box

module.exports = function(app) {

    app.get("/", function(req, res) {

        res.render("index", {
            recipeSearch: searchOrNot,
            recipeArray: currentRecipeList
        });
        // res.sendFile(path.join(__dirname+"/../views/oldindex.html"));

    })

    // Renders weekly meal plan using handlebars into planner.handlebars

    .get("/planpage", function(req, res) {

        res.sendFile(path.join(__dirname+"/../views/planpage.html"));
        
    })

    .get("/planner/:userid/:weekstart", function(req, res) {
        // get plan for week beginning whatever date (Monday)

        // weekstart must be formatted as mm-dd-yyyy

        //TESTING PURPOSES ONLY ---
        req.params.userid=1;
        var weekstart = "04-10-2016";
        // ----

        // Searches for a one week period only, 
        // based on start date
               
        var startDate = new Date(weekstart);
        var endDate = new Date(weekstart);

        endDate.setDate(startDate.getDate()+6);

        console.log("start date = "+startDate);
        console.log("end date="+endDate);
         
        myDB.recipebox.findAll({
            where: {
                userid: req.params.userid,
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        }).then(function(response) {
           console.log(response[0].recipe_name);
           res.json(response); 
        });
    })

    .get("/recipepicker/:userid", function(req, res) {

        myDB.recipebox.findAll({
            where: {
                userid: req.params.userid
            }
        }).then(function(response) {
            res.render("planner", {
                myRecipes: response,
                dayPlans: {
                    breakfastflag: 1,
                    lunchflag: 0,
                    dinnerflag: 0
                }
            });
        })
    })

    .get("/search/:term?", function(req, res) {
        request('https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/search?mashape-key=WQFSAkYbqamshlMXWe0X3EnVkSmap13txkbjsna2ZL3tOG8BzJ&limitLicense=false&offset=0&number=100&query=' + req.params.term, function(error, response, body) {
            if (error) {
                res.sendStatus(204);
            } else {
                var json = JSON.parse(body);
                // res.send(json);

                // searchorNot:  When the page reloads (at the / endpoint),
                // handlebars will know to insert results

                searchOrNot = true;
                currentRecipeList = json.results;
                res.sendStatus(200);
            }
        });
    })

    .get("/ingredientlist/:id?", function(req, res) {
        request("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/" + req.params.id + "/information?mashape-key=" + key, function(error, response, body) {
            if (error) {
                res.sendStatus(204);
            } else {
                var json = JSON.parse(body);

                res.send(json.extendedIngredients);
            }
        });
    })

    // add a user

    .post("/adduser", function(req, res) {

        var myname = req.body.myname;
        var myemail = req.body.myemail;
        var mybudgetmax = req.body.mybudgetmax;
        console.log("hit!");
        myDB.userinfo.create({
            fullname: myname,
            email: myemail,
            budget: mybudgetmax
        }).then(function() {
            res.redirect("/"); // ??
        });
    })

    // verify user by email address

    .post("/verifyuser/:email", function(req, res) {
        console.log("request received!");
        var emailgiven = req.params.email;

        myDB.userinfo.findAll({
            where: {
                email: emailgiven
            }
        }).then(function(usersArray) {
            if (usersArray[0] == undefined)
            {
                res.json(0);   // signals that no matches found  
            } else {
                JSON.stringify(usersArray);
                res.json(usersArray);
            }

        });

    })


    .post("/storerecipe/:userid", function(req, res) {

        var user = req.params.userid;
        console.log(req.body.api_id, req.body.recipe_name, req.body.ingredients);
        var breakfastflag = false;
        var lunchflag = false;
        var dinnerflag = false;
        console.log("meal = " + req.body.meal);

        if (req.body.meal = 0) {
            breakfastflag = true;
        } else if (req.body.meal = 1) {
            lunchflag = true;
        } else {
            dinnerflag = true;
        }

        var Recipe = myDB.recipebox.create({
            api_id: req.body.api_id,
            recipe_name: req.body.recipe_name,
            ingredients: req.body.ingredients,
            cost: req.body.cost,
            calories: req.body.calories,
            userid: user,
            date: req.body.date,
            breakfastflag: breakfastflag,
            lunchflag: lunchflag,
            dinnerflag: dinnerflag
        }).then(function() {
            console.log("recipe stored.");
            res.sendStatus(202);
        })
    })

    .get("/ingredientPrice/:ingredient", function(req, res) {
            var ingredient = req.params.ingredient;
            console.log("Ingredient search for: "+ ingredient);
            var ingredID = "";
            var price = "";
            //gets the id of the product needed for each ingredient
            request('https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/food/products/search?mashape-key=WQFSAkYbqamshlMXWe0X3EnVkSmap13txkbjsna2ZL3tOG8BzJ&number=10&offset=0&query=' + ingredient, function(error, response, body) {
                    if (error) {
                        res.sendStatus(204);
                    } else {
                        returnData = JSON.parse(body);
                        console.log("returndata = "+ returnData);
                        if (returnData.products[0] != undefined) {
                            ingredID = returnData.products[0].id;
                            console.log("ingred id="+ingredID);
                       

                        //gets the price of the products
                        request('https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/food/products/' + ingredID + '?mashape-key=WQFSAkYbqamshlMXWe0X3EnVkSmap13txkbjsna2ZL3tOG8BzJ', function(error, response, body) {
                            if (error) {
                                res.sendStatus(204);
                            } else {
                                price = JSON.parse(body).price;
                                res.json(price);
                            }
                        });
                        } else {
                            res.json(0);
                        }
                    }
            });
    })

.get("/getshoplist/:userid", function(req, res) {

    //userid will be the person's id in userinfo table

    var user = req.params.userid;

    myDB.shoppinglist.findAll({
        where: {
            userid: user
        }
    }).then(function(listArray) {
        console.log("shopping list items: " + listArray);
        res.json(listArray);
        // Array of objects will contain
        // every row in the shoppinglist table
        // attributable to the user selected.
        // In other words, their current shopping list.
        // Each position in the array correponds to one recipe
        // that was chosen by the user.

    });


})

// Takes form data / data submitted via ajax post
// and parses it (as req.body), then puts data into
// shopping list table.  Each row in the table is
// attributable to one recipe, one user. 
//
// Above, we get the list by just searching for any items
// that are attributable to a user.   

.post("/addshoplist/:userid", function(req, res) {

    var user = req.params.userid;

    var recipeid = req.body.recipefor,
        recipetitle = req.body.recipetitle,
        list = req.body.list,
        totalprice = req.body.totalprice;

    myDB.shoppinglist.create({
        recipefor: recipeid, //again, this is the spoontacular
        recipetitle: recipetitle, //recipe id number.
        listtobuy: list,
        totalprice: totalprice,
        userid: user
    }).then(function() {
        res.redirect("/"); // ??
    });

})

.post("/emaillist/:emailadd", function(req, res){

    var transporter = nodemailer.createTransport('smtps://eathottrash%40gmail.com:duke3799@smtp.gmail.com');

    console.log(req.body.list+"=list");
    var mailOptions = {
            from: '"Yourself" <eathottrash@gmail.com>', // sender address
            to: req.params.emailadd, // list of receivers
            subject: 'Your Shopping List', // Subject line
            text: req.body.list, // plaintext body
            html: req.body.list // html body
        };

     transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
            res.json(1);
        });

})

.use(function(req, res, next) {

    res.redirect("/");
    next();


});

};