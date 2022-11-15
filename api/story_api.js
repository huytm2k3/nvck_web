const fs = require('fs');


const db = require('./../services/db')
const config = require('../config/config')
tf_base_url = config.tf_base_url


const story_type_list = {
    NEW_UPDATE: "new_update",
    MOST_VOTED: "most_voted",
    NEW: "new",
    FULL: "full",
    POPULAR: "popular",
}

/**
 * Story API
 * 
 * get list stories (nhiều tiêu chí)
 * get chapters list
 * get story detail
 * get chapter
 * 
 */
exports.public = function(app) {

    /**
     * Api tìm kiếm truyện
     * 
     * vì là api này trùng với /api/stories/:story_path
     * 
     * :story_path nghĩa là truyền cái gì vào cũng được, nên có thể hiểu nhầm search là :story_path
     * Nền là cho cái này lên đầu nó ưu tiên hơn
     * @param: query
     */
    app.get('/api/stories/search', async function(req, res) {
        // Hắn có thể accept current change , accept incoming change, hoặc là sửa bằng tay đề được
        let keyword = req.query.keyword || '';
        let skip = req.query.skip || 0;
        let limit = req.query.limit || 30;
        let category = req.query.category || 'tat-ca';
        let status = req.query.status;
        function unAccent(str) {
            str = str.toLowerCase();
            str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
            str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
            str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
            str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
            str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
            str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
            str = str.replace(/đ/g,"d");
            str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
            str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
            str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
            str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
            str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
            str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
            str = str.replace(/Đ/g, "D");
            return str;
        };
        // như cái dưới này thì cái nào đúng hắn tự làm xem
        
        let keywordNormalized = unAccent(keyword);

        // kết quả vẫn như thế
        
        if(category=='tat-ca'){
            category='';
        }
        
        if(status=='tat-ca'){
            status='';
        }else if(status=='full'){
            status='Full';
        }else if(status=='dang-ra'){
            status='Đang ra';
        }
        
        console.log(category);
        let query = `SELECT distinct stories_raw.hash_name,stories_raw.status,stories_raw.author_name,stories_raw.name,stories_raw.image FROM stories_raw,stories_categories
                    WHERE LOWER(translate(stories_raw.name,
                    '¹²³ÀÁẢẠÂẤẦẨẬẪÃÄÅÆàáảạâấầẩẫậãäåæĀāĂẮẰẲẴẶăắằẳẵặĄąÇçĆćĈĉĊċČčĎďĐđÈÉẸÊẾỀỄỆËèéẹêềếễệëĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨÌÍỈỊÎÏìíỉịîïĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłÑñŃńŅņŇňŉŊŋÒÓỎỌÔỐỒỔỖỘỐỒỔỖỘƠỚỜỞỠỢÕÖòóỏọôốồổỗộơớờỡợởõöŌōŎŏŐőŒœØøŔŕŖŗŘřßŚśŜŝŞşŠšŢţŤťŦŧÙÚỦỤƯỪỨỬỮỰÛÜùúủụûưứừửữựüŨũŪūŬŭŮůŰűŲųŴŵÝýÿŶŷŸŹźŻżŽžёЁ',
                    '123AAAAAAAAAAAAAAaaaaaaaaaaaaaaAaAAAAAAaaaaaaAaCcCcCcCcCcDdDdEEEEEEEEEeeeeeeeeeEeEeEeEeEeGgGgGgGgHhHhIIIIIIIiiiiiiiIiIiIiIiIiJjKkkLlLlLlLlLlNnNnNnNnnNnOOOOOOOOOOOOOOOOOOOOOOOooooooooooooooooooOoOoOoEeOoRrRrRrSSsSsSsSsTtTtTtUUUUUUUUUUUUuuuuuuuuuuuuUuUuUuUuUuUuWwYyyYyYZzZzZzеЕ')) like '%${keywordNormalized}%'
                    and stories_categories.categories_hash_name like '%${category}%'
                    and stories_raw.status like '%${status}%'
                    and stories_categories.story_hash_name = stories_raw.hash_name
                    order by name ASC
                    offset $1
                    limit $2`;
        const rows = await db.query(
            query, 
            [skip, limit]
        );
        res.send(rows);
        
        
    })

    /**
     * Lấy danh sách truyện: 
     * @param: limit, category
     * @return:
     * [
     *      {...story}
     * ]
     */
    app.get('/api/stories', async function(req, res) {
        // giống như api này
        let limit = req.query.limit || 12;
        let category_hash_name = req.query.category || ''

        let from_query = ''
        { // TODO: obtain from query
        }

        let query_where = ''
        { // obtain where query
            if (category_hash_name) {
                query_where = ` WHERE stories_categories.categories_hash_name = '${category_hash_name}' `
            }

        }
        let new_update_query = `
            SELECT DISTINCT stories_raw.*
            FROM stories_raw, (SELECT story_hash_name FROM stories_categories ${query_where}) as sub_categories
            WHERE stories_raw.hash_name = sub_categories.story_hash_name
            ORDER BY truyenfull_id DESC
            OFFSET $1 LIMIT $2
        `
        let most_voted_query = new_update_query
        let newest_query = new_update_query
        let full_query = new_update_query
        let popular = new_update_query

        let random_query = new_update_query
        let query = random_query

        {
            if (req.query.type == story_type_list.NEW_UPDATE) {
                query = new_update_query
            } else if (req.query.type == story_type_list.MOST_VOTED) {
                query = most_voted_query
            } else if (req.query.type == story_type_list.NEW) {
                query = newest_query
            } else if (req.query.type == story_type_list.FULL) {
                query = full_query
            } else if (req.query.type == story_type_list.POPULAR) {
                query = popular
            } 
        }

        const rows = await db.query(
            query, 
            [0, limit]
        );
        res.send(rows);
    });


    /**
     * Lấy danh sách chương
     * @return:
     * [
     * 
     * ]
     */
    app.get('/api/chapters_list/count/:story_path', async function(req, res) {
        let story_path = req.params.story_path;

        let query = `SELECT count(*)
                        FROM chapters_raw 
                        WHERE story_hash_name = $1
                        `

        const rows = await db.query(
            query, 
            [ story_path ]
        );
        
        res.send(rows[0].count); ;
    });
    // Lấy danh sách tìm kiếm
    app.get('/api/stories/search/count', async function(req, res) {
        function unAccent(str) {
            str = str.toLowerCase();
            str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
            str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
            str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
            str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
            str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
            str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
            str = str.replace(/đ/g,"d");
            str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
            str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
            str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
            str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
            str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
            str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
            str = str.replace(/Đ/g, "D");
            return str;
        };
        
        
        let category = req.query.category
        let keyword = req.query.keyword
        let keywordNormalized = unAccent(keyword);
        let status = req.query.status;
        if(category=='tat-ca'){
            category='';
        }
        if(status=='tat-ca'){
            status='';
        }else if(status='dang-ra'){
            status='Đang ra';
        }else if(status='full'){
            status='Full';
        }
        let query = `SELECT count(distinct stories_raw.hash_name) FROM stories_raw,stories_categories
                    WHERE LOWER(translate(stories_raw.name,
                    '¹²³ÀÁẢẠÂẤẦẨẬẪÃÄÅÆàáảạâấầẩẫậãäåæĀāĂẮẰẲẴẶăắằẳẵặĄąÇçĆćĈĉĊċČčĎďĐđÈÉẸÊẾỀỄỆËèéẹêềếễệëĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨÌÍỈỊÎÏìíỉịîïĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłÑñŃńŅņŇňŉŊŋÒÓỎỌÔỐỒỔỖỘỐỒỔỖỘƠỚỜỞỠỢÕÖòóỏọôốồổỗộơớờỡợởõöŌōŎŏŐőŒœØøŔŕŖŗŘřßŚśŜŝŞşŠšŢţŤťŦŧÙÚỦỤƯỪỨỬỮỰÛÜùúủụûưứừửữựüŨũŪūŬŭŮůŰűŲųŴŵÝýÿŶŷŸŹźŻżŽžёЁ',
                    '123AAAAAAAAAAAAAAaaaaaaaaaaaaaaAaAAAAAAaaaaaaAaCcCcCcCcCcDdDdEEEEEEEEEeeeeeeeeeEeEeEeEeEeGgGgGgGgHhHhIIIIIIIiiiiiiiIiIiIiIiIiJjKkkLlLlLlLlLlNnNnNnNnnNnOOOOOOOOOOOOOOOOOOOOOOOooooooooooooooooooOoOoOoEeOoRrRrRrSSsSsSsSsTtTtTtUUUUUUUUUUUUuuuuuuuuuuuuUuUuUuUuUuUuWwYyyYyYZzZzZzеЕ')) like '%${keywordNormalized}%'
                    and stories_categories.categories_hash_name like '%${category}%'
                    and stories_raw.status like '%${status}%'
                    and stories_categories.story_hash_name = stories_raw.hash_name`;
        const rows = await db.query(
            query, 
        );
        res.send(rows[0].count);
        
    });

    /**
     * Lấy danh sách chương
     * @param: order, limit, skip
     * @return:
     * [
     * 
     * ]
     */
    app.get('/api/chapters_list/:story_path', async function(req, res) {
        let story_path = req.params.story_path;

        let order = '' + req.query.order || 'ASC';
        let skip = req.query.skip || 0;
        let limit = req.query.limit || 30;

        let query = `SELECT name, hash_name, chapter_order
                                FROM chapters_raw 
                                WHERE story_hash_name = $1
                                ORDER BY chapter_order ${order === 'DESC'? 'DESC': ''}
                                OFFSET $2 LIMIT $3`

        const rows = await db.query(
            query, 
            [story_path, skip, limit]
        );
        res.send(rows);
    });

    
    /**
     * Lấy nội dung truyện từ database (android dùng cách này)
     */
    app.get('/api/stories/:story_path', async function(req, res){
        let story_path = req.params.story_path;
        let query = `SELECT * FROM stories_raw WHERE hash_name = $1`

        
        const rows = await db.query(
            query, [ story_path ]
        );

        if (rows.length >= 1) {
            res.send(rows[0]);   
        } else {
            res.status(404)
            res.send({
                message: `Không tìm thấy truyện ${story_path} trong CSDL`
            })
        }
    });
    
    
    //Lấy danh sách favorite stories
    app.post('/api/stories/favorite/', async function(req, res){
        let username = req.body.username;
        let query = `select * from favorite_stories,stories_raw
        where favorite_stories.hash_name = stories_raw.hash_name
        and favorite_stories.username = $1 ORDER BY fs_id DESC LIMIT 5`
        const rows = await db.query(
            query, [ username ]
        );
        res.send(rows)
    });
    //Thêm truyện vào danh sách favorite stories
    app.post('/api/stories/send_fv_stories/', async function(req, res){
        let username = req.body.username;
        let hash_name = req.body.hash_name;
        let query = `insert into favorite_stories(username,hash_name) values($1,$2)`
        const rows = await db.query(
            query, [ username, hash_name ]
        );
        res.send(rows)
    });
    //Kiểm tra xem truyện đã Yêu thích hay chưa
    app.post('/api/stories/fv_check', async function(req, res){
        let username = req.body.username;
        let hash_name = req.body.hash_name;
        let query = `select * from favorite_stories
                    where hash_name=$2
                    and username=$1`
        const rows = await db.query(
            query, [ username, hash_name ]
        );
        if(rows.length>=1){
            res.send(rows[0]);   
        }else if(rows.length==0){
            res.send({
                status: "error",
                message: `Xin chào ${username}`
            })
        }
    });
    // Xóa truyện khỏi danh sách yêu thích
    app.post('/api/stories/remove_fv_stories/', async function(req, res){
        let username = req.body.username;
        let hash_name = req.body.hash_name;
        let query = `delete from favorite_stories where username=$1 and hash_name=$2`
        const rows = await db.query(
            query, [ username, hash_name ]
        );
        res.send(rows)
    });
    //Lấy danh sách follow stories
    app.post('/api/stories/follow/', async function(req, res){
        let username = req.body.username;
        let query = `select * from follow_stories,stories_raw
        where follow_stories.hash_name = stories_raw.hash_name
        and follow_stories.username = $1 order by fl_stories_id DESC LIMIT 5
        `
        const rows = await db.query(
            query, [ username ]
        );
        res.send(rows)
    });
    //Thêm truyện vào danh sách follow stories
    app.post('/api/stories/send_fl_stories/', async function(req, res){
        let username = req.body.username;
        let hash_name = req.body.hash_name;
        let query = `insert into follow_stories(username,hash_name) values($1,$2)`
        const rows = await db.query(
            query, [ username, hash_name ]
        );
        res.send(rows)
    });
    //Thêm current chapter tiện cho user theo dõi
    app.post('/api/stories/add_current_chapter/', async function(req, res){
        let username = req.body.username;
        let hash_name = req.body.hash_name;
        let current_chapter = req.body.current_chapter;
        let chapter_hash_name = req.body.chapter_hash_name;
        let query = `update follow_stories set current_chapter=$3, current_chapter_hash_name=$4
                    where username=$1
                    and hash_name=$2
                    `
        const rows = await db.query(
            query, [ username, hash_name, current_chapter, chapter_hash_name ]
        );
        res.send(rows)
    });
    //Kiểm tra xem truyện đã Theo dõi hay chưa
    app.post('/api/stories/fl_check', async function(req, res){
        let username = req.body.username;
        let hash_name = req.body.hash_name;
        let query = `select * from follow_stories
                    where hash_name=$2
                    and username=$1`
        const rows = await db.query(
            query, [ username, hash_name ]
        );
        if(rows.length>=1){
            res.send(rows[0]);   
        }else if(rows.length==0){
            res.send({
                status: "error",
                message: `Xin chào ${username}`
            })
        }
    });
    // Xóa truyện khỏi danh sách theo dõi
    app.post('/api/stories/remove_fl_stories/', async function(req, res){
        let username = req.body.username;
        let hash_name = req.body.hash_name;
        let query = `delete from follow_stories where username=$1 and hash_name=$2`
        const rows = await db.query(
            query, [ username, hash_name ]
        );
        res.send(rows)
    });
    /**
     * Lấy nội dung chương
     * 
     * @return:
     *  {
     *      story_meta: story meta data
     *      meta: chapter meta data
     *      content: chapter content
     *  }
     * 
     */
    app.get('/api/stories/:story_path/:chapter_path', async function(req, res) {
        let story_path = req.params.story_path;
        let chapter_path = req.params.chapter_path;

        let query = `SELECT * FROM chapters_raw WHERE hash_name = $1 and story_hash_name = $2`

        
        const rows = await db.query(
            query, [ chapter_path, story_path ]
        );

        if (rows.length >= 1) {
            res.send(rows[0]);   
        } else {
            res.status(404)
            res.send({
                message: `Không tìm thấy truyện ${story_path} trong CSDL`
            })
        }
    });
    //Đánh giá
    app.post('/api/stories/rate', async function(req, res){
        let hash_name = req.body.hash_name;
        let username = req.body.username;
        let s_rates = req.body.s_rates;
        let query = `update stories_raw
        set rate = (cast(rate as float)*cast(n_rates as float) + $2)/(cast(n_rates as float)+1), n_rates = cast(n_rates as float) + 1
        where hash_name = $1`
        let query_2 = `insert into stories_rate(username,hash_name,s_rates) values($1,$2,$3)`
        const rows = await db.query(
            query,
            [hash_name,s_rates]
        )
        const rows_2 = await db.query(
            query_2,
            [username,hash_name,s_rates]
        )
        res.send(rows);
    })
    // Kiểm tra xem người dùng này đã đánh giá hay chưa
    app.post('/api/stories/rate_check', async function(req, res){
        let hash_name = req.body.hash_name;
        let username = req.body.username;
        let query = `select * from stories_rate
                    where username = $1
                    and hash_name = $2
                    `
        const rows = await db.query(
            query,
            [username,hash_name]
        )
        if(rows.length>=1){
            res.send(rows[0]);   
        }else if(rows.length==0){
            res.send({
                status: "error",
                message: `Xin chào ${username}`
            })
        }
    })
    //Tải ebook
    app.post('/api/story/ebook', async function(req,res){
        let hash_name = req.body.hash_name;
        let query = `select * from ebook where hash_name = $1`;
        const rows = await db.query(
            query,
            [hash_name]
        )
        if(rows.length>=1){
            res.send(rows[0]);
        }else if(rows.length==0){
            res.send({
                status: "error",
                message: `Truyện này hiện chưa có Ebook`
            })
        }
    })

    
    // để cho chắc
    // thì search Ctrl Shift F <<< xem còn bị conflict k
}
