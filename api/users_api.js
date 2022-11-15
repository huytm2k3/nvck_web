const fs = require('fs');
const db = require('./../services/db')
const config = require('../config/config')

exports.public = function(app) {
    /**
     * Lấy danh sách tài khoản
     */
    app.get('/api/users', async function(req, res) {
        let query = 'SELECT * FROM users'
        const rows = await db.query(
            query, 
            []
        );
        res.send(rows);
    });
    //api đăng kí
    app.post('/api/users/register', async function(req, res){
        let fullname = req.body.fullname;
        let username = req.body.username;
        let password = req.body.password;
        let repassword = req.body.repassword;
        let email = req.body.email;
        
        let query_3 =   `INSERT INTO users(fullname,username,password,email) values($1,$2,$3,$4)`;
        let query_1 =   `SELECT * FROM USERS
                        WHERE username = $1
                        `
        let query_2 =   `SELECT * FROM USERS
                        WHERE email = $1`
        const rows_1 = await db.query(
            query_1,
            [username]
        );
        if(rows_1.length>=1){
            res.send({
                status: "user",
                message: `Tên tài khoản đã có người đăng kí.`
            })
        }else if(rows_1.length==0){
            //6<=username<=20
            if(6>username.length || username.length>20){
                res.send({
                    status: "userlength",
                    message: `Tài khoản tối thiểu là 6 kí tự và tối đa là 20 kí tự.`
                })
            }else{
                if(8>password.length || password.length>20){
                    res.send({
                        status: "passlength",
                        message: `Mật khẩu tối thiểu là 6 kí tự và tối đa là 20 kí tự.`
                    })
                }else{
                    if(password!=repassword){
                        res.send({
                            status: "repass",
                            message: `Mật khẩu không trùng khớp.`
                        }) 
                    }else{
                        const rows_2 = await db.query(
                            query_2,
                            [email]
                        );
                        if(rows_2.length>=1){
                            res.send({
                                status: "email",
                                message: `Email đã có người đăng kí.`
                            })
                        }else if(rows_2.length==0){
                            const rows_3 = await db.query(
                                query_3,
                                [fullname, username, password, email]
                            );
                            res.send(rows_3);
                        }
                    }
                    }
                }
                
            
            
        }

        
    })
    //Api đăng nhập
    app.post('/api/users/login', async function(req, res){
        let username = req.body.username;
        let password = req.body.password;
        let query = `SELECT * FROM users WHERE username=$1 and password=$2`;
        const rows = await db.query(
            query, 
            [username, password]
        );
        if(rows.length>=1){
            res.send(rows[0]);   
        }else if(rows.length==0){
            res.send({
                status: "error",
                message: `Xin chào ${username}`
            })
        }
    })
}