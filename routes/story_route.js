const axios = require('axios').default
const config = require('../config/config')
const on_error = require('./util').on_error

exports.public = function (app) {
    /**
 * Trang chủ
 */
    app.get('/', async function (req, res, next) {
        try {
            let stories = []
            let newest_stories = await axios.get(`${config.server.url}/api/stories?type=newest&limit=12`)
            let random_stories = await axios.get(`${config.server.url}/api/stories?limit=12`)
            res.render('index', {
                title: "Ngàn vạn chân kinh | Đọc, tải, nghe truyện online offline",
                newest_stories: newest_stories.data,
                random_stories: random_stories.data,
            });
        } catch (err) {
            on_error(err, res)
        }
    });

    /**
     * Trang xem thông tin truyện
     */
    app.get('/doc-truyen/:story', async function (req, res) {
        try {
            let story = req.params.story
            let meta_response = await axios.get(`${config.server.url}/api/stories/${story}`)

            let chapter_count_response = await axios.get(`${config.server.url}/api/chapters_list/count/${story}`)
            let chapter_response = await axios.get(`${config.server.url}/api/chapters_list/${story}?limit=30&skip=0`)
            let new_chapters_response = await axios.get(`${config.server.url}/api/chapters_list/${story}?order=DESC&limit=6`)
            let comment_response = await axios.get(`${config.server.url}/api/comment/${story}`)

            res.render('story', {
                title: meta_response.data.name,
                hash_name: story,
                meta: meta_response.data,
                chapters: chapter_response.data, // list chapter of page 1
                chapters_count: chapter_count_response.data, // count for paging
                new_chapters: new_chapters_response.data, // newest chapters
                comment: comment_response.data, //comment
            });
        } catch (err) {
            on_error(err, res)
        }

    });


    /**
     * Trang đọc truyện
     */
    app.get('/doc-truyen/:story/:chapter', async function (req, res, next) {
        try {
            let story = req.params.story
            let chapter = req.params.chapter

            // ví dụ như cái này
            // mỗi khi gọi vào /doc-truyen/.../...
            // thì dùng axios này get vào api/story_api.js kia để lấy thông tin
            let chapter_response = await axios.get(`${config.server.url}/api/stories/${story}/${chapter}`)
            let story_response = await axios.get(`${config.server.url}/api/stories/${story}`)
            let content = chapter_response.data.content.replace(/\n/g, '<br>')

            // rồi render ra đây

            res.render('chapter', {
                story: story,
                chapter: chapter,
                title: story_response.data.name,
                meta: chapter_response.data,
                story_meta: story_response.data,
                content: content
            });
        } catch (err) {
            on_error(err, res)
        }
    });


    /**
     * Trang thể loại
     * // TODO: cần thêm api lấy thông tin của danh mục
     */
    app.get('/the-loai/:category_hash_name', async function (req, res) {
        try {
            let category_hash_name = req.params.category_hash_name
            let stories_response = await axios.get(`${config.server.url}/api/stories?category=${category_hash_name}`)
            res.render('category', {
                category_hash_name: category_hash_name,
                title: "EJS example",
                stories: stories_response.data,
            });

        } catch (err) {
            on_error(err, res)
        }
    })

    // Trang tìm kiếm
    // Server rendering
    app.get('/stories/search', async function (req, res) {
        try {
            let keyword = req.query.keyword;
            let category = req.query.category;
            let skip = req.query.skip || 0;
            let limit = req.query.limit || 30;
            let status = req.query.status;
            let result_story_responese = await axios.get(`${config.server.url}/api/stories/search?keyword=${keyword}&skip=${skip}&limit=${limit}&category=${category}&status=${status}`);
            let n_stories_response = await axios.get(`${config.server.url}/api/stories/search/count?keyword=${keyword}&category=${category}&status=${status}`)
            res.render('search', {
                title: "",
                result_story: result_story_responese.data,
                keyword: keyword,
                n_stories: n_stories_response.data,
                skip: skip,
                category: category,
                limit: limit,
                status: status,
            });
        } catch (err) {
            on_error(err, res)
        }
    })
    // app.get('/stories/search', async function(req, res){
    //   try {
    //     let keyword = req.query.keyword;
    //     let skip = req.query.skip || 0;
    //     let limit = req.query.limit || 30;
    //     let result_story_responese = await axios.get(`${config.server.url}/api/stories/search?keyword=${keyword}&skip=${skip}&limit=${limit}`)
    //     let n_stories_response = await axios.get(`${config.server.url}/api/stories/search/count?keyword=${keyword}`)

    //     res.render('search', {
    //       title: "",
    //       result_story: result_story_responese.data,
    //       keyword: keyword,
    //       n_stories: n_stories_response.data,
    //       skip: skip,
    //     });
    //   } catch(err) {
    //     on_error(err, res)
    //   }
    // })

    //Trang truyen yeu thich
    app.get('/stories/favorite_stories', async function (req, res) {
        try {

            res.render('favorite_stories', {
                title: "",

            });
        } catch (err) {
            on_error(err, res)
        }
    });
}