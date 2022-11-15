const axios = require('axios').default

const on_error = require('./util').on_error

exports.public = function(app) {
    app.get('/register', async function(req, res){
        try {
          // let username = req.query.username;
          // let password = req.query.password;
       
          // let result_story_responese = await axios.get(`${config.server.url}/api/users/register?username=${username}&password=${password}`)
          res.render('register', {
            title: "",
          });
        } catch(err) {
          on_error(err, res)
        }
      })
      app.get('/login', async function(req, res){
        try {
          // let username = req.query.username;
          // let password = req.query.password;
       
          // let result_story_responese = await axios.get(`${config.server.url}/api/users/register?username=${username}&password=${password}`)
          res.render('login', {
            title: "",
          });
        } catch(err) {
          on_error(err, res)
        }
      })
}