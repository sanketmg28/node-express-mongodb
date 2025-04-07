const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");

router.get("/", jobController.getAllJobs);
router.get("/new", jobController.getNewJobForm);
router.post("/", jobController.createJob);
router.get("/:id", jobController.getJobById);

module.exports = router;
