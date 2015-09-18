var express = require("express");
var fs = require('fs');
var request = require('request');
var socket_io  = require('socket.io');

var app = express();
var http = require('http');
var server = http.createServer(app);
var io = socket_io.listen(server);
server.listen(8080);

app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

io.on('connection', function (socket) {
  var url = 'http://m.mlb.com/gdcross/components/game/mlb/year_2015/month_'+
  getMonth() + '/day_'+getDate()+'/master_scoreboard.json'; 
  setInterval(function () {
    request(url, function(error, response, body) {
      if(!error && response.statusCode == 200) {
        var mlbData = JSON.parse(body);
        var responseStr = "";
        var gameArray = mlbData.data.games.game;
        gameArray.forEach(function(element) {
          if (element.linescore) {
            responseStr += "<div class='row'><div class='col-md-6'>";
            responseStr += element.home_team_name + ": ";
            responseStr += element.linescore.r.home + "</div>"
            responseStr += element.away_team_name + ": ";
            responseStr += element.linescore.r.away + "</div></div>";   
          }
        });
        socket.emit('news', responseStr);
      }
    })
  }, 5000);
});

function getMonth() {
  var today = new Date();
  var mm = today.getMonth()+1; 
  if(mm<10) {
        mm='0'+mm;
  }
  return mm; 
}

function getDate() {
  var today = new Date();
  var dd = today.getDate();
  if(dd<10) {
       dd='0'+dd;
  }
  return dd; 
}
