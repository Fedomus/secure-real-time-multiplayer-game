require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Security features
const helmet = require("helmet");
const nocache = require("nocache");
app.use(helmet({
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: {
    setTo: "PHP 7.4.3"
  },
  contentSecurityPolicy: {
    directives: {
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
    }
  }
}));
app.use(nocache());

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

// sockets fetures
const server = require("http").createServer(app);
const io = require("socket.io")(server);

let players = [];

io.on("connection", (socket) => {

  socket.on("disconnect", () => {
    players = players.filter(
      (player) => player.id != socket.id
    );
    io.emit("updatePlayers", players)
  });

  socket.on("joinGame", (newPlayer) => {
    players.push(newPlayer)
    io.emit("updatePlayers", players)
  })

  socket.on("movePlayer", (player) => {
    let index = players.findIndex(p => p.id == player.id)
    players[index] = player
    io.emit("updatePlayers", players)
  })

  socket.on("updateRank", (player) => {
    let index = players.findIndex(p => p.id == player.id)
    players[index] = player
    io.emit("updatePlayers", players)
  })

})

const portNum = process.env.PORT || 3000;

// Set up server and tests
server.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

module.exports = app; // For testing
