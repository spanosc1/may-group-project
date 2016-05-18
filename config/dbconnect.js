var Sequelize = require('sequelize');
var DB = new Sequelize("mysql://kt8o3p913vhfxknj:mzga6g9a88kfqwpa@l9dwvv6j64hlhpul.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/j49lop4ye7vjz9cs");

var data = {

recipes : DB.define('eatbudget', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  recipe_name: Sequelize.TEXT,
  recipe_text: Sequelize.TEXT, 
  ingredients: Sequelize.TEXT,   //We'll json-stringify the list
  whichmeal: Sequelize.INTEGER,  //0=breakfast, 1=lunch, 2=dinner
  userid: Sequelize.INTEGER, // We may want to add a foreign key
}, {timestamps: false}),         

userinfo : DB.define('eatbudget', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  fullname: Sequelize.TEXT,
  email: Sequelize.TEXT,
  budget: Sequelize.INTEGER 
}, {timestamps: false}) 

}

DB.sync();

module.exports = data;
