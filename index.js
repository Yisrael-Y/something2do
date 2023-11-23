const express = require('express');
const bodyParser = require('body-parser');
const tasksRoute = require('./routes/taskRoute');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.json());
// Log HTTP requests to the console
app.use(morgan('dev'));

// Define the routes using your route handlers
app.use('/tasks', tasksRoute);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
