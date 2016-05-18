// Boilerplate server code

var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override')
var app = express();
var port = process.env.PORT || 3000;

//Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(__dirname + '/views'));

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({
    extended: false
}))
 
app.use(methodOverride('_method'));



var exphbs = require('express-handlebars');

app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

var controller = require("./controllers/app_controller")(app);

app.listen(port, function(){
console.log("Listening on "+ port);
});


