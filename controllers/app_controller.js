var express = require("express");
var request = require("request");
var path = require("path");
var _ = require("lodash");
var key = 'WQFSAkYbqamshlMXWe0X3EnVkSmap13txkbjsna2ZL3tOG8BzJ';
var bodyParser = require("body-parser");
var myDB = require("../config/dbconnect");

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

    .get("/planner", function(req, res) {

        res.render("planner");
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
            console.log("usersarray" + usersArray);
            res.json(usersArray);
        });

    })

    // Store recipe in user's 'recipe box'
    // (Not completed)

    .post("/storeRecipe/:userid?", function(req, res) {
        var ingredient = req.body.ingredient
        var ingredID = "";
        var price = "";
        //gets the id of the product needed for each ingredient
        request('https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/food/products/search?mashape-key=WQFSAkYbqamshlMXWe0X3EnVkSmap13txkbjsna2ZL3tOG8BzJ&number=10&offset=0&query=' + ingredient, function(error, response, body) {
           if (error) {
                res.sendStatus(204);
            } else {
                ingredID = JSON.parse(body).products[0].id;
                //gets the price of the products
                request('https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/food/products/' + ingredID + '?mashape-key=WQFSAkYbqamshlMXWe0X3EnVkSmap13txkbjsna2ZL3tOG8BzJ', function(error, response, body) {
                    if(error) {
                        res.sendStatus(204);
                    } else {
                        price = JSON.parse(body).price;
                        res.json(price);
                    }
                });
            }
        });
    })
    	//var user = req.params.userid;

        //var Recipe = DB.recipebox.create('recipe', {
            // id: 0,

            // api_id:    

            // recipe_name: 

            // ingredients: 

            // cost: 

            // calories: 

            // userid: 
        //});

    // Get shopping list for a given user id

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

    .post("/addshoplist/:userid", function(req, res){
 
    	var user = req.params.userid;

    	var recipeid = req.body.recipefor,
    		recipetitle = req.body.recipetitle,
    		list = req.body.list,
    		totalprice = req.body.totalprice;

    	myDB.shoppinglist.create({
            recipefor: recipeid,    //again, this is the spoontacular
            recipetitle: recipetitle,	//recipe id number.
            listtobuy : list,
            totalprice: totalprice,
            userid: user
        }).then(function() {
            res.redirect("/"); // ??
        });

    })

    .use(function(req, res, next) {

        res.redirect("/");
        next();

    });

};