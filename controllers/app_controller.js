
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

module.exports = function(app)
{

app.get("/", function(req, res){
 		
	res.render("index", {recipeSearch: searchOrNot, recipeArray: currentRecipeList});
	// res.sendFile(path.join(__dirname+"/../views/oldindex.html"));

})

.get("/planner", function(req, res){

	res.render("planner");
})

.get("/search/:term?", function(req, res) {
	request('https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/search?mashape-key=WQFSAkYbqamshlMXWe0X3EnVkSmap13txkbjsna2ZL3tOG8BzJ&limitLicense=false&offset=0&number=100&query=' + req.params.term, function(error, response, body)
	{
	if(error){
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
	request("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/" 
		+req.params.id+"/information?mashape-key="+key, function(error, response, body)
	{
	if(error){
		res.sendStatus(204);
	} else {
		var json = JSON.parse(body);
		 
		res.send(json.extendedIngredients);
	}
	});
})

// add a user

.post("/adduser", function(req, res){

	var myname = req.body.myname;
    var myemail = req.body.myemail;
    var mybudgetmax = req.body.mybudgetmax;

     myDB.userinfo.create({
            fullname: myname,
            email: myemail,
            budget: mybudgetmax
        }).then(function() {
            res.redirect("/");  // ??
        });
})

// verify user by email address

.post("/verifyuser/:email", function(req, res){
		console.log("request received!");
		var emailgiven = req.params.email;

		myDB.userinfo.findAll({
			where: {
				email: emailgiven
			}
		}). then(function(usersArray){
			console.log("usersarray" + usersArray);
				res.json(usersArray);
		});

})

.use(function(req, res, next){

	res.redirect("/");
	next();

});

};






