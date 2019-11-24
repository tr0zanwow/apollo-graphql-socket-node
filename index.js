const express = require('express');
const bodyParser = require ('body-parser');
const twitterWebhooks = require('twitter-webhooks');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schemas.js')
const resolvers = require('./resolvers.js')
const cors = require('cors')
const app = express();
const socket = require('socket.io')

const server = new ApolloServer({ typeDefs, resolvers,playground: {
  settings: {
    'editor.theme': 'dark',
  },
  tabs: [
    {
      endpoint:'/playground',
      query: defaultQuery,
    },
  ],
},
});

app.use(bodyParser.json());

app.use(cors({ origin: '*'}));

const userActivityWebhook = twitterWebhooks.userActivity({
  serverUrl: 'https://'+process.env.HEROKU_APP_NAME+'.herokuapp.com',
  route: '/twitter',
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_KEY,
  accessToken: process.env.TWITTER_CONSUMER_KEY,
  accessTokenSecret: process.env.TWITTER_CONSUMER_KEY,
  environment: process.env.TWITTER_CONSUMER_KEY,
  app
});

app.get('/registerWebhook', (req, res) => {
  let promise = userActivityWebhook.register();
  console.log(promise)
  res.send(promise)
});

app.use(express.static(__dirname + '/node_modules'));
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/index.html');
});

server.applyMiddleware({ app });

const PORT = process.env.PORT || 4000;
const expressServer = app.listen(PORT, () => {
  let host = expressServer.address().address;
  let port = expressServer.address().port;

  console.log(`Listening at http://${host}:${port}`);
});

var io = socket(expressServer);

io.on('connection', (socket) => {
  console.log('made socket connection', socket.id);
  socket.on('join', function(data) {
    console.log(data);
    socket.emit('messages', 'Hello from server');
});
});

io.on('disconnect', (socket) => {
  console.log('disconnected connection', socket.id);
});
