const express = require('express');
const { getAllBlogs, newBlogForm, createBlog } = require('../controllers/blogController');
const router = express.Router();

router.get('/', getAllBlogs);
router.get('/new', newBlogForm);
router.post('/create', createBlog);

module.exports = router;
