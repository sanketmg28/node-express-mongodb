const Job = require("../models/jobModel");

// GET all jobs
exports.getAllJobs = async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  res.render("jobs/index", { jobs });
};

// GET job creation form
exports.getNewJobForm = (req, res) => {
  res.render("jobs/new");
};

// POST new job
exports.createJob = async (req, res) => {
  await Job.create(req.body);
  res.redirect("/jobs");
};

// GET job details
exports.getJobById = async (req, res) => {
  const job = await Job.findById(req.params.id);
  res.render("jobs/show", { job });
};
