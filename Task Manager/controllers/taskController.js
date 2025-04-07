const Task = require('../models/Task');

exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find();
        res.render('index', {tasks});
    } catch (err) {
        console.error(err);
    }
};

exports.createTask = async (req, res) => {
    try {
        await Task.create({title: req.body.title });
        res.redirect('/tasks');
    } catch (err) {
        console.error(err);
    }
};

exports.updateTask = async (req, res) => {
    try {
        await Task.findByIdAndUpdate(req.params.id, {completed: req.body.completed});
        res.redirect('/tasks');
    } catch (err) {
        console.error(err);
    }
};

exports.deleteTask = async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.redirect('/tasks');
    } catch (err) {
        console.error(err);
    }
};

