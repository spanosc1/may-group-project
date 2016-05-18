var Sequelize = require('sequelize');
var DB = new Sequelize("mysql://kt8o3p913vhfxknj:mzga6g9a88kfqwpa@l9dwvv6j64hlhpul.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/j49lop4ye7vjz9cs");

var data = {

// recipes : DB.define('eatbudget', {
//   id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
//   recipe_name: Sequelize.TEXT,
//   recipe_text: Sequelize.TEXT, 
//   ingredients: Sequelize.TEXT,   //We'll json-stringify the list
//   whichmeal: Sequelize.INTEGER,  //0=breakfast, 1=lunch, 2=dinner
//   userid: Sequelize.INTEGER, // We may want to add a foreign key
// }, {timestamps: false}),         

userinfo : DB.define('userinfo', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  fullname: Sequelize.TEXT,
  email: Sequelize.TEXT,
  budget: Sequelize.INTEGER 
}, {timestamps: false}),

recipebox: DB.define('recipebox', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  api_id: Sequelize.INTEGER,
  recipe_name: Sequelize.TEXT,
  recipe_text: Sequelize.TEXT,
  ingredients: Sequelize.TEXT,
  cost: Sequelize.DECIMAL,
  calories: Sequelize.INTEGER, 
  userid: Sequelize.INTEGER
}, {timestamps: false}),

weekplan: DB.define ('weekplan', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  user_id: Sequelize.INTEGER,
  week_ending: Sequelize.DATEONLY, // Use Sat as start, Fri as end?
  date: Sequelize.DATEONLY,
  whichmeal: Sequelize.INTEGER, //0=breakfast, 1=lunch, 2=dinner
  recipebox_id: Sequelize.INTEGER
}, {timestamps: false}),

shoppinglist: DB.define('shoppinglist', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  recipefor: Sequelize.INTEGER,
  recipetitle: Sequelize.TEXT,
  listtobuy: Sequelize.TEXT,
  totalprice: Sequelize.DECIMAL,
  userid: Sequelize.INTEGER
})

}

DB.sync();

module.exports = data;
