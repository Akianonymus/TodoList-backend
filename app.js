const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

require("dotenv").config();

const auth = require("./auth");
// require database connection
const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");
const Todo = require("./db/todoModel");

// execute database connection
dbConnect();

// Handle CORS Error by adding a header here
app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (_, response, next) => {
  response.json({
    message:
      "My Todo List app backend!, Checkout https://github.com/Akianonymus/TodoList",
  });
  next();
});

app.get("/auth", auth, (request, response) => {
  response
    .status(200)
    .send({ message: `User ${request.user.userName} authorized` });
});

// signup endpoint
app.post("/signup", (request, response) => {
  // hashing the password before sending it to db
  // 10 is salt rounds
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      // create a new user instance and collect the data
      const user = new User({
        username: request.body.username,
        password: hashedPassword,
      });

      // save the new user
      user
        .save()
        // return success if the new user is added to the database successfully
        .then((result) => {
          response.status(201).send({
            message: "User Created Successfully",
            result,
          });
        })
        // catch error if the new user wasn't added successfully to the database
        .catch((error) => {
          if (error?.keyValue?.username === request.body.username) {
            response.status(409).send({
              message: `User ${request.body.username} Already Exists`,
            });
          } else {
            console.log(error);
            response.status(500).send({
              message: "Error creating user",
              error,
            });
          }
        });
    })
    // catch error if the password hash isn't successful
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

// signin endpoint
app.post("/signin", (request, response) => {
  // check if username exists
  User.findOne({ username: request.body.username })

    // if username exists
    .then((user) => {
      // compare the password entered and the hashed password found
      bcrypt
        .compare(request.body.password, user.password)

        // if the passwords match
        .then((passwordCheck) => {
          // check if password matches
          if (!passwordCheck) {
            return response.status(401).send({
              message: "Passwords does not match",
              error,
            });
          }

          //   create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userName: user.username,
            },
            "RANDOM-TOKEN",
            { expiresIn: "30d" }
          );

          //   return success response
          response.status(200).send({
            message: "Login Successful",
            username: user.username,
            token,
          });
        })
        // catch error if password does not match
        .catch((error) => {
          response.status(401).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    // catch error if username does not exist
    .catch((e) => {
      response.status(404).send({
        message: "username not found",
        e,
      });
    });
});

// create new task
app.post("/new", auth, (request, response) => {
  const content = request.body.content;
  const author = request.user.userName;

  if (content.trim() === "") {
    response.status(400).send({
      message: "Empty content",
    });
    return;
  }

  const todoTask = new Todo({ author, content });

  // save the new user
  todoTask
    .save()
    // return success if the new task is added to the database successfully
    .then((result) => {
      response.status(201).send({
        message: "Task Created Successfully",
        content: content,
        result,
      });
    })
    // catch error if the new task wasn't added successfully to the database
    .catch((error) => {
      response.status(500).send({
        message: "Error creating task",
        error,
      });
    });
});

// to fetch all todos from the db
app.get("/tasks", auth, (request, response) => {
  const username = request.user.userName;

  Todo.find({ author: username }, (error, tasks) => {
    if (error) return response.status(500).send(error);

    let total_todos = tasks.length;
    response.status(200).send({
      total_todos,
      tasks,
    });
  });
});

// edit task
app.post("/edit/:id", auth, (request, response) => {
  const id = request.params.id;
  // edit the given task and update it
  Todo.findByIdAndUpdate(id, { content: request.body.content }, (error) => {
    if (error)
      return response.status(500).send({
        message: "Error editing task",
        error,
      });

    response.status(200).send({
      message: "Task edited Successfully",
      content: request.body.content,
      id,
    });
  });
});

// delete task
app.post("/delete/:id", auth, (request, response) => {
  const id = request.params.id;
  // delete the given task and update it
  Todo.findByIdAndRemove(id, (error) => {
    if (error)
      return response.status(500).send({
        message: "Error deleting task",
        error,
      });

    response.status(200).send({
      message: "Task deleted Successfully",
    });
  });
});

// delete all tasks
app.post("/deleteall", auth, (request, response) => {
  const user = request.user.userName;
  Todo.deleteMany({ author: user }, (error) => {
    if (error)
      return response.status(500).send({
        message: "Error deleting all tasks.",
        error,
      });

    response.status(200).send({
      message: "All tasks deleted Successfully",
    });
  });
});

module.exports = app;
