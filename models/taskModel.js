const fs = require("fs");
const path = require("path");
const axios = require("axios");
const api = "https://www.boredapi.com/api/activity";

const usersDatabaseFilePath = path.join(
  __dirname,
  "../storage/usersTasks.json"
);
const tasksDatabaseFilePath = path.join(__dirname, "../storage/tasks.json");

function loadDatabase(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    console.log(`Database loaded from ${filePath}`);
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading the database from ${filePath}:`, error);
    return { activities: [] }; // Initialize with an empty array if the file doesn't exist
  }
}

function saveDatabase(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`Database saved to ${filePath}`);
  } catch (error) {
    console.error(`Error saving the database to ${filePath}:`, error);
  }
}

const fetchTaskFromExternalAPI = async (API_URL, params = {}) => {
  try {
    const response = await axios.get(API_URL, { params });
    if (response.status !== 200) {
      throw new Error("Failed to fetch a task from the external API");
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching task from external API:", error.message);
    throw error;
  }
};


const addTaskToDatabase = (database, newTask, filePath) => {
  // Avoid mutating the original array, create a new array with the new task
  const updatedActivities = [...database.activities, newTask];
  saveDatabase(filePath, { activities: updatedActivities });
};

const usersDatabase = loadDatabase(usersDatabaseFilePath);
const tasksDatabase = loadDatabase(tasksDatabaseFilePath);

// Function to find user by ID and return data
const findUserById = async (userId) => {
  const userData = usersDatabase.users.find((user) => user.id === userId);
  if (!userData) {
    console.error(`User with id ${userId} not found`);
    return null;
  }

  return userData;
};

// Function to create wishlist for a user
const createWishlist = async (userId) => {
  try {
    const userData = await findUserById(userId);

    if (!userData) {
      console.error(`User with id ${userId} not found`);
      return null;
    }

    return userData.wishList;
  } catch (error) {
    console.error(`Error creating wishlist for user ${userId}:`, error.message);
    throw error;
  }
};

function addToWishList(userId, taskId) {
  const user = findUserById(userId);
  if (user) {
    user.wishList.push(taskId);
    saveDatabase(database);
    return user;
  }
  return null;
}

function markAsCompleted(userId, taskId) {
  const user = findUserById(userId);
  if (user) {
    user.completedTasks.push(taskId);
    saveDatabase(database);
    return user;
  }
  return null;
}

function getWishList(userId) {
  const user = findUserById(userId);
  return user ? user.wishList : [];
}

function getCompletedTasks(userId) {
  const user = findUserById(userId);
  return user ? user.completedTasks : [];
}

module.exports = {
  findUserById,
  createWishlist,
  addToWishList,
  markAsCompleted,
  getWishList,
  getCompletedTasks,
  saveDatabase,
  loadDatabase,
  fetchTaskFromExternalAPI,
  addTaskToDatabase,
  usersDatabaseFilePath,
  tasksDatabaseFilePath,
  usersDatabase,
  tasksDatabase,
};
