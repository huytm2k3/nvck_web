const fs = require('fs');
const db = require('../services/db')
const config = require('../config/config')

exports.public = function(app) {
    /**
     * Lấy danh sách danh mục
     */
    //Lấy comment truyện từ database
    app.get('/api/comment/:story_path', async function(req, res){
        let story_path = req.params.story_path;
        let query = `SELECT * FROM stories_comment,users 
                    WHERE stories_comment.hash_name = $1
                    and stories_comment.username = users.username
                    order by comment_id desc`
        
        const rows = await db.query(
            query, [ story_path ]
        );

        res.send(rows)
    });
    //Gửi comment lên database
    app.post('/api/comment/sendcomment/', async function(req, res){
        let username = req.body.username;
        let comment_content = req.body.comment_content;
        let hash_name = req.body.hash_name;
        let query = `INSERT INTO stories_comment(username,comment_content,hash_name,created_at) values($1,$2,$3,now())`;
        const rows = await db.query(
            query, 
            [username, comment_content, hash_name]
        );
        res.send(rows);
    })
    //Xóa comment
    app.post('/api/comment/removecomment/', async function(req, res){
        let comment_id = req.body.comment_id;
        let query = `delete from stories_comment where comment_id = $1`;
        const rows = await db.query(
            query,
            [comment_id]
        );
        console.log('da xoa')
        res.send(rows);
    })
    //Sửa comment
    app.post('/api/comment/editcomment/', async function(req, res){
        let comment_id = req.body.comment_id;
        let edited_comment = req.body.edited_comment;
        let query = `update stories_comment set comment_content = $2,updated_at=now() where comment_id = $1`;
        const rows = await db.query(
            query,
            [comment_id,edited_comment]
        );
        console.log('da sua')
        res.send(rows);
    })
}