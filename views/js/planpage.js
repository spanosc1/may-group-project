// Activates tabs on click

$('#myTab a').click(function(e) {
    e.preventDefault();
    $(this).tab('show');
});


var currentShoplistHTML;
var currentShoplistTEXT;

populateShoplist();
populatePlan();
sendEmailButton();


function sendEmailButton() {

    $("#sendNodemail").click(function() {
        $(this).html("Sending to " + sessionStorage.email);
        var self = $(this);

        $.post("/emaillist/" + sessionStorage.email, {
            list: currentShoplistHTML
        }, function(response) {
            self.html("sent");
            self.attr("disabled", true);
        });

    })

}


function populateShoplist() {

    var userId = sessionStorage.userId; // for testing ONLY

    $.get("/getshoplist/" + userId, function(gotBack) {

        var listBuy;

        for (i in gotBack) {

            var costAddup = 0;

            if (gotBack[i].listtobuy) {
                listBuy = gotBack[i].listtobuy.split(",");
            } else continue;

            var outerHtml = "<div class='col-xs-4'><div class='card hoverable small'><div class='card-text'>";
            var text = "<h6>" + gotBack[i].recipetitle + "</h6><br>";

            for (ii = 0; ii < listBuy.length; ii++) {

                if (listBuy[ii].indexOf("~" != -1)) {
                    tildeSplit = listBuy[ii].split("~");
                } else continue;

                text += "<li>" + tildeSplit[0] + " : $" + tildeSplit[1] + "</li>";
                if (typeof tildeSplit[1] != "string") {
                    tildeSplit[1] = 0;
                }
                costAddup += Number(tildeSplit[1]);

            }

            var closingTags = "</div></div></div>";
            var costTotal = "<br>- - - - -<br><p>Total Cost: " + costAddup + "</p>";
            var htmlOut = outerHtml + text + costTotal + closingTags;
            currentShoplistHTML += htmlOut + "<br><hr><br>";

            $(".shopHere").append(htmlOut);

        }


    });

}

// populate planner tab with meal info for user

function populatePlan() {

    var userId = sessionStorage.userId;
    // for testing purposes

    var startDate = "5-23-2016";


    $.get("/planner/" + userId + "/" + startDate, function(response) {

        // iterate over each position in array of objects, ie, each
        // row in the table matching date and user id
        var gotBack = response;



        for (i in gotBack) {
            var outerHtml = "<div class='col-xs-4 plancard'><div class='card hoverable small'><div class='card-text'>";
            var text = "<h6>" + gotBack[i].recipe_name + "</h6><br><h5>Designated Date: " + gotBack[i].date + "</h5><br>";
            var closingTags = "</div></div>";
            $(".eatThese").append(outerHtml + text + closingTags);
        }


    });



}