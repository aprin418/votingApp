const express = require("express");
const res = require("express/lib/response");
const bodyParser = require("body-parser");
const { LocalStorage } = require("node-localstorage"),
  localStorage = new LocalStorage("./scratch");
const MongoClient = require("mongodb").MongoClient;
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

app.set("view engine", "ejs");
app.use(bodyParser.json());

const userNotVoted = localStorage.getItem("car-vote");

server.listen(3000, function () {
  console.log("Listening on port 3000");
});

io.on("connection", (socket) => {
  console.log("user connected " + socket.id);

  socket.on("results", (data) => {
    socket.broadcast.emit("results", data);
  });
});

MongoClient.connect(
  "mongodb+srv://aprin418:justTemp@cluster0.92dc7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
).then((client) => {
  console.log("connected to database");
  const db = client.db("car-voting-app");
  const collection = db.collection("votes");

  app.get("/vote/:name", (req, res) => {
    db.collection("votes")
      .updateOne(
        {
          name: req.params.name,
        },
        {
          $inc: {
            votes: 1,
          },
        }
      )
      .then((result) => {
        console.log(result);
        localStorage.setItem("car-vote", "voted");
        collection
          .find()
          .toArray()
          .then((results) => {
            res.render("index.ejs", {
              candidates: results,
              notVoted: false,
            });
          });
      })
      .catch((error) => console.error(error));
  });

  app.get("/", (req, res) => {
    collection
      .find()
      .toArray()
      .then((results) => {
        res.render("index.ejs", {
          candidates: results,
          notVoted: true,
        });
      })
      .catch((error) => console.error(error));
  });
});
