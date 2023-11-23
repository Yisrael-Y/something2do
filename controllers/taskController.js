const uuid = require("uuid");
const axios = require("axios");
const taskModel = require("../models/taskModel");

const api = "https://www.boredapi.com/api/activity";
const userDefault = "user123";

const isTaskInDatabase = (database, task) => {
  return database.activities.some(
    (existingTask) => existingTask.key === task.key
  );
};

const addTaskToDatabaseIfNeeded = (database, task) => {
  if (!isTaskInDatabase(database, task)) {
    console.log("Adding new task to the database:");
    taskModel.addTaskToDatabase(
      database,
      task,
      taskModel.tasksDatabaseFilePath
    );
  }
};

const getTasks = async (req, res) => {
  const user = req.params.user;
  try {
    if (user === userDefault) {
      const userTasks = await taskModel.findUserById(user);
      if (!userTasks) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(userTasks);
    } else {
      res.json(userTasks);
    }
  } catch (error) {
    console.error("Error in getTasks:", error.message);
    res.status(500).json({ error: "Failed to get tasks" });
  }
};

const getWishlistTasks = async (req, res) => {
  const user = req.params.user;
  try {
    if (user === userDefault) {
      const userWishlist = await taskModel.createWishlist(user);
      if (!userWishlist) {
        return res.status(404).json({ error: "User not found" });
      }

      const tenTasksDisplayed = userWishlist.slice(0, 10);
      // Fetch random tasks to complete the wishlist to 10 tasks
      while (tenTasksDisplayed.length < 10) {
        const response = await axios.get(api);
        const newTask = { ...response.data, score: 0 };
        tenTasksDisplayed.push(newTask);
      }
      res.json(tenTasksDisplayed);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error in getTasks:", error.message);
    res.status(500).json({ error: "Failed to get tasks" });
  }
};

const getRandomTaskFromDatabase = (database) => {
  const randomIndex = Math.floor(Math.random() * database.length);
  return database[randomIndex];
};

const getTaskOfTheDay = async (req, res) => {
  try {
    let taskToSend;

    // Check if the database contains 50 tasks
    if (taskModel.tasksDatabase.length >= 50) {
      console.log("Database has 50 tasks. Selecting a random task...");
      taskToSend = getRandomTaskFromDatabase(taskModel.tasksDatabase);
    } else {
      // Fetch a task from the external API
      const dailyTask = await taskModel.fetchTaskFromExternalAPI(api);

      // Check if the task is already in the database
      const taskExists = isTaskInDatabase(taskModel.tasksDatabase, dailyTask);

      console.log("Task exists in the database:", taskExists);

      if (!taskExists) {
        console.log("Task doesn't exist in the database. Adding...");
        addTaskToDatabaseIfNeeded(taskModel.tasksDatabase, {
          ...dailyTask,
          score: 0,
        });
        taskToSend = dailyTask;
      } else {
        // Task already exists in the database, no need to fetch from the API
        console.log(
          "Task exists in the database. Sending the existing task..."
        );
        taskToSend = dailyTask;
      }
    }

    res.json(taskToSend);
  } catch (error) {
    console.error("Error in getTaskOfTheDay:", error.message);
    res.status(500).json({ error: "Failed to get the task of the day" });
  }
};

//add task to users wishlist
const addTaskToWishList = async (req, res) => {
  const userId = req.params.user;
  const taskKey = req.body.key;

  try {
    const userData = await taskModel.findUserById(userId);

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the task is already in the wishlist
    if (userData.wishList.some((task) => task.key === taskKey)) {
      return res.status(400).json({ error: "Task is already in the wishlist" });
    }

    const newWish = await taskModel.fetchTaskFromExternalAPI(api, {
      key: taskKey,
    });
    if (newWish.error) {
      return res.status(404).json({ error: newWish.error });
    } else {
      console.log("Task found:", newWish);
    }
    // Add the task key to the wishlist array
    userData.wishList.push(newWish);

    try {
      // Save the updated user database
      taskModel.saveDatabase(
        taskModel.usersDatabaseFilePath,
        taskModel.usersDatabase
      );
      res.json(`Task ${taskKey} added to the wishlist`);
    } catch (error) {
      console.error("Error saving the database:", error.message);
      return res.status(500).json({ error: "Failed to save the database" });
    }
  } catch (error) {
    console.error("Error in addTaskToWishList:", error.message);
    res.status(500).json({ error: "Failed to add task to wishlist" });
  }
};

const fetchTask = async (req, res) => {
  try {
    const response = await axios.get(api);
    const { activity, type } = response.data;
    const id = uuid.v4();
    const task = {
      id,
      type,
      name: activity,
      rating: 0, // Initial rating
      isWishList: false,
      isCompleted: false,
    };
    tasks.push(task);
    res.json(task);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to fetch a task from the external API" });
  }
};

module.exports = {
  getTasks,
  getWishlistTasks,
  addTaskToWishList,
  getTaskOfTheDay,
  fetchTask,
};
