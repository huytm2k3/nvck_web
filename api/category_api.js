const fs = require('fs');
const db = require('./../services/db')
const config = require('../config/config')

exports.public = function(app) {
    /**
     * Lấy danh sách danh mục
     */
    app.get('/api/categories', async function(req, res) {
        let query = 'SELECT * FROM categories'
        const rows = await db.query(
            query, 
            []
        );
        res.send(rows);
    });
}