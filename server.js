const express = require('express')
const app = express()
const moment = require('moment')
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }));

const story_api = require('./api/story_api')
const category_api = require('./api/category_api')
const users_api = require('./api/users_api')
const comment_api = require('./api/comment_api')

const story_route = require('./routes/story_route')
const other_route = require('./routes/other_route')
const auth_route = require('./routes/auth_route')


const config = require('./config/config');
const res = require('express/lib/response');

// Template engine EJS
{ 
  app.engine('.html', require('ejs').__express);
  app.use(express.static('public'))
  app.set('view engine', 'html');
}

{ // public api
  story_api.public(app)
  category_api.public(app)
  users_api.public(app)
  comment_api.public(app)
}

{ // public routes
  story_route.public(app)
  other_route.public(app)
  auth_route.public(app)
}

app.listen(config.server.port, () => {
  console.log(`Example app listening at http://localhost:${config.server.port}`)
})


