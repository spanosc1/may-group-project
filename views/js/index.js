$(document).ready(function() {




    // ========
    // This function renders an ingredient list to a modal popup,
    // based on recipe selected.  An AJAX Get request is sent to the 
    // server, which sends back a list of ingredients that you'd need
    // to make the recipe.
    // =======

    function userLogin() {

        $("#loginModal").modal("show");

        $("#loginFormButton").on("click", function(e) {

            e.preventDefault();

            var checkifUser = $('#usercheck').is(':checked')
            console.log(checkifUser);

            var useremail = $("#myemail").val().trim();

            if (!checkifUser) { // Verify that user exists if checkbox NOT checked ... 
                console.log(useremail);
                $.post("/verifyuser/" + useremail, function(respond) {
                    alert("got back: " + respond + respond.length);
                    if (respond.length > 0) {

                        console.log("User does in fact exist.");
                        sessionStorage.email = useremail;
                        sessionStorage.loggedIn = true;
                        sessionStorage.userId = respond[0].id;
                        $("#loginStatus").html("Welcome, " + useremail +
                            "id#" + sessionStorage.userId);
                        $("#loginModal").modal("hide");

                    } else {
                        // This needs to be made into something better
                        alert("User doesn't exist, sorry.  Create a new account.");

                    }

                });

            } else { // Create user account if checkbox IS checked

                $("#loginForm").submit();
                sessionStorage.loggedIn = true;
                sessionStorage.email = useremail;
                $("#loginStatus").html("Welcome, " + useremail);
                return false;
                $("#loginModal").modal("hide");

            }
        });

    }

    function clickIngredientModal(recipeid, title) {

        var currentItemName = "";
        var listWithPrices = []
            // Click listener, deals with ingredient price submission

        $(document).on("submit", ".addPrice", function() {
            alert("ok");
            $(".addPrice").html("");
            $(this).off("submit", ".addPrice");
            return false;
        });

        // Click listener -- when you click
        // on an ingredient, it is highighted in red, 
        // and then an input box is added dynamically.
        // (See above for 'submit' button behavior)

        $(document).on("click", ".modal-body li", function() {

            currentItemName = $(this).val();
            if ($(this).data("selected") == "1") {
                $(this).css("color", "black");
                $(this).data("selected", "0");
            } else {
                $(this).css("color", "red");
                $(this).data("selected", "1");
                $("#recipeModal .modal-body").append("<form class='addPrice'><input type='text' name='price' class='form-control'>Enter estimated purchase price:</input><input type='submit' class='form-control'</input></form>");

            }

        });

        // On clicking 'store recipe', this will extract all of
        // the ingredients back out of the displayed HTML.
        // We'll also want to store any purchase costs
        // and then send it all to a .post route on the server.

        $("#storeRecipe").click(function() {
            var ingredients = [];
            alert("click");

            $.when(
            $(".modal-body li").each(function() {
                ingredients.push($(this).text())
                console.log($(this).text());
            })).then(function(){

            var userId = sessionStorage.userId;
            ingredients = ingredients.join();
            // package info to send out to server

            var sendRecipe = {
                api_id: 10, // temporary value
                recipe_name: title, // see function arguments list above
                ingredients: ingredients, // see jquery 'each' function
                cost: 25, // temporary dummy value
                calories: 100 // temporary dummy value
            }
            alert("ingredients" + sendRecipe.ingredients);
            // JSON.stringify(sendRecipe);
            $.post("/storeRecipe/" + userId, sendRecipe, function(response) {
                alert("recipe sent to server for storage");
                window.location = "/";
            });
        });
        });  
        
    }

    function addtoModal(recipeid, title) {

        clickIngredientModal(recipeid, title);

        $("#recipeModal .modal-header").html("");
        $("#recipeModal .modal-header").html("<h5 class='text-center'>" + title + "</h5><hr>");

        $.get("/ingredientlist/" + recipeid, function(data) {
            $("#recipeModal .modal-body").html("");
            $("#recipeModal .modal-body").append("<h6>Ingredients Required</h6><hr>");
            for (i in data) {
                $("#recipeModal .modal-body").append("<li>" + data[i].name + "</li> ");
            }
            $("#recipeModal").modal("show");

        });

    }

    // function storeRecipe() {

    //     $("#storeRecipe").click(function() {

    //         $.post("/storeRecipe", sendobj, function(response) {



    //         });

    //     });


    // }

    // $("#loginModal").modal("show");
    // Click listener: Detect click on recipe card, opens modal (see 
    // function.  

    $(".recipes").click(function() {
        var recipeClicked = $(this).find(".card-content");
        if (sessionStorage.loggedIn) {
            addtoModal(recipeClicked.data("recipeid"), recipeClicked.data("recipetitle"));
        } else {
            userLogin();
        }
    });

    // Form submission listener:  Passes chosen recipe search data 
    // to server, which then gets data from recipe API.  
    // Handlebars is then used to generate a page of search results,
    // which is currently set at 100 max.  This is for the 'recipe search'

    $("#search").on("submit", function() {

        var searchTerm = $("#icon_prefix").val().trim();
        var currentURL = window.location.origin;
        $.get(currentURL + "/search/" + searchTerm)
            .done(function(response) {

                // alert("ok");
                // for(var i = 0; i < 10; i++)
                // {

                //   //recipe id, perhaps we could use these to search for the recipe of a specific dish
                //   var recipeID = data.results[i].id;

                //   //the name of the dish
                //   console.log(data.results[i].title);

                //   //how long the dish will take to make
                //   console.log(data.results[i].readyInMinutes);

                //   //must construct the url from the base and the image name from the image object
                //   console.log(data.baseUri + data.results[i].image);
                // }

                window.location = "/";

            });

        return false;

    });

    // Adjust carousel animation speed

    $('.carousel').carousel({
        interval: 4000
    });
});