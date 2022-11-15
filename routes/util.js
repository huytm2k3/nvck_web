const fs = require('fs');
const db = require('../services/db')
const config = require('../config/config')



exports.on_error = function on_error(error, res) {
    console.log(error)
    res.send({ 'message': 'Lỗi của chúng tôi' })
}
