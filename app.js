 const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended :true}));

app.get("/", function(req, res){
  res.sendFile(__dirname + "/signup.html")
})

app.post("/", function(req, res){
  var firstName = req.body.Fname;
  var lastName = req.body.Lname;
  var email = req.body.Ename;


  var data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields:
        {
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ]
  };

  var jasonData = JSON.stringify(data);

  var options = {
    url:"https://us10.api.mailchimp.com/3.0/lists/0f9bc1d883",
    method: "POST",
    headers: {
      "Authorization": "lloyd200 7356386cc55c9f34158f44c5229db949-us10"
    },
    body: jasonData
};


  request(options, function(error, response, body){
    if (error){
      res.sendFile(__dirname + "/failure.html");
    } else {
      if(response.statusCode ===200){
        res.sendFile(__dirname + "/success.html");
      }
      else{
        res.sendFile(__dirname + "/failure.html");
      }
    }
  });
});

app.post("/failure", function(req, res){
  res.redirect("/")
});

app.post("/success", function(req, res){
  res.redirect("/")
});

app.listen(process.env.PORT || 3000, function(){
  console.log('server started on port | 3000');
});

//7356386cc55c9f34158f44c5229db949-us10

// 0f9bc1d883
