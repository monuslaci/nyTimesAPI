require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const ejs = require("ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
const request = require('request');

var artArray = [];
const apiKey = process.env.API_KEY;
var page;
var query;
var begin_date;
var end_date;


app.get("/", function (req, res) {
  res.render("home")
  });


app.post("/", function (req, res) {
 artArray=[];
 page=0;

  var currentDate = new Date().toJSON().slice(0,10).replace(/-/g,'');

  query = req.body.keyword;
  console.log(query);
  //if the "from date" was not filled than insert 1851.01.01 (the earliest date that can be searched)
  yearFrom = req.body.yearFrom === "" ? "18510101" : req.body.yearFrom;
  console.log(yearFrom);
  //if the "to date" was not filled  than insert today
  yearTo = req.body.yearTo === "" ? currentDate : req.body.yearTo;
  console.log(yearTo);

//convert string to date
begin_date=dateConvert(yearFrom);
end_date=dateConvert(yearTo);

if (!page){page=0;} 

resultPage(query, apiKey, page, begin_date, end_date, redir, ()=>{
});

function redir(){res.redirect("results"); }
})



app.get("/results", function (req, res) {
  //console.log("Results begin date: "+ begin_date);
  //console.log("Results end date: "+ end_date);

  res.render("results", {
    articles: artArray,
    pageNr: page
  })

  artArray=[];
});




app.post("/results", function (req, res) {
  
  var next = req.body.next;
  var previous = req.body.previous;
  if(next && page<100){page++}
  if(previous && page!==0){page--}

  resultPage(query, apiKey, page, begin_date, end_date, redir, ()=>{
   });
 
   
  function redir(){
      res.redirect("/results");
  }
});



app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});





function resultPage(query, apiKey, page, begin_date, end_date,  fct){


  const options = {
    "url": "https://api.nytimes.com/svc/search/v2/articlesearch.json?q=" + query + "&api-key=" + apiKey+"&page="+page+"&begin_date="+begin_date+"&end_date="+end_date,
    "method": "GET",
    "headers": {
      "Accept": "application/json"
    }
  };

  console.log(options);
  request(options, function (err, resp, body) {
    if (err) {
      console.error(err);
    } else {
      console.log(body.length)
      //console.log(JSON.parse(body));

      const articleData = JSON.parse(body);
      console.log(articleData);

      var articles = articleData.response.docs;
      console.log(articles.length);



      for (var i = 0; i < articles.length; i++) {
        console.log("nr: " + i + ": " + articles[i].abstract);
        console.log("nr: " + i + ": " + articles[i]?.multimedia[0]?.url);


        //optional chaining: ​​The ?.​ operator works by short-circuiting: if the left-hand side of the ?.​ operator evaluates to null​ or undefined​, the entire expression will evaluate to undefined​ and the right-hand side will remain unevaluated. To have a custom default, we can use the ||​ operator in the case of an undefined. console.log(favorites?.audio?.audiobooks[0] || "The Hobbit");
        artArray.push({
          abstract: articles[i].abstract,
          web_url: articles[i].web_url,
          picture: articles[i]?.multimedia[0]?.url,
          leadP: articles[i].lead_paragraph
        });
      }

    }

    fct();
    
  });


}


function dateConvert(year){
  var yearSplit =year.split('/');
  var yearsArr=[];
  yearsArr.push(yearSplit[2])
  yearsArr.push(yearSplit[0]);
  yearsArr.push(yearSplit[1]);
  var final_date=yearsArr.join("");
  console.log(final_date);
  return final_date;
}