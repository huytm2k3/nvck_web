const axios = require('axios').default
const on_error = require('./util').on_error

exports.public = function (app) {
    app.get('/forward', async function (req, res) {
        const url = '' + req.query.url
        console.log(url)
        let result = await axios({
            url: url,
            responseType: 'stream'
        })
        result.data.pipe(res)
    })
}