const Blog = require('../models/Blog');

// Show all blogs
exports.getAllBlogs = async (req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.render('index', { blogs });
};

// Show form to create new blog
exports.newBlogForm = (req, res) => {
    res.render('new');
};

// Create a new blog
exports.createBlog = async (req, res) => {
    const { title, content } = req.body;
    await Blog.create({ title, content });
    res.redirect('/blogs');
};
