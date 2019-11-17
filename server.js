var express = require("express");
var logger = require("morgan");
var cheerio = require("cheerio");
var axios = require("axios");
var mongoose = require("mongoose");

var app = express();
var db = require("./models");
mongoose.connect("mongodb://localhost/AllTheNews", { useNewUrlParser: true });


app.get("/", function (req, res) {
    res.send("Hello Readers!")
});

app.get("/all", function (req, res) {
    db.scrapedData.find({}, function (error, found) {
        if (error) {
            console.log(error);
        } else {
            res.json(found);
        }
    });
});

app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://old.reddit.com/").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
      
      // Now, we grab every h2 within an article tag, and do the following:
      $("article h2").each(function(i, element) {
        // Save an empty result object
        var result = {};
        
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children("p .title")
          .text();
        result.link = $(this)
          .children("p .title")
          .attr("href");
  
        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
          });
      });
  
      // Send a message to the client
      res.send("Scrape Complete");
    });
  });

app.listen(3000, function() {
    console.log("App running on port 3000!");
});

