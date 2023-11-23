const express = require('express');
const { createTask, getTasks, getWishlistTasks, completeTask, getTaskOfTheDay, fetchTask, addTaskToWishList } = require("../controllers/taskController");
const router = express.Router();

// Define the routes using your route handlers
router.get('/task-of-the-day', getTaskOfTheDay); // Get Task of the Day
router.get('/userswishlist/:user', getWishlistTasks); // Get User's Wish List
router.get('/user/:user', getTasks); // Get User's Wish List and completed tasks
router.post('/user/:user', addTaskToWishList); // Add a Task to the Wish List
// router.patch('/:taskId/complete', completeTask); // Mark a Task as Completed
router.get('/fetch-task', fetchTask); // Fetch Tasks from Bored API

// router.post('/', createTask); // Create a Task (Add a task to the wish list)

module.exports = router;