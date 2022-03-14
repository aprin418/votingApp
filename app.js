// required imports
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const appRouter = require("./routes/pages");
const { ServerApiVersion } = require("mongodb");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const { auth } = require("express-openid-connect");

// middleware applications
const app = express();
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

app.use(bodyParser.json());
app.use(cors());
app.use("/", appRouter);

// extra for testing
const candidate_routes = require("./routes/candidate_routes");
const user_routes = require("./routes/user_routes");
app.use("/candidate", candidate_routes);
app.use("/user", user_routes);

// socket.io instantiation
const httpServer = require("http").createServer(app);
const io = new Server(httpServer);
const message = "";
httpServer.listen(3000, () => {
  console.log("Sockets are listening...");
});

// socket.io controller
io.on("connection", (socket) => {
  console.log("User connnected: " + socket.id);

  socket.on("results", (data) => {
    socket.broadcast.emit("results", data);
  });
});

// mongoose instance of mongodb
mongoose
  .connect(
    "mongodb+srv://aprin418:justTemp@cluster0.92dc7.mongodb.net/car-voting-app?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: ServerApiVersion.v1,
    }
  )
  .then(console.log("MongoDB is connected..."))
  .catch((err) => console.error(err));

console.log("Express server is running!");

// const express = require("express");
// // const path = require("path");
// const session = require("express-session");
// const MongoStore = require("connect-mongo");
// const mongoose = require("mongoose");
// const res = require("express/lib/response");
// const bodyParser = require("body-parser");
// const { LocalStorage } = require("node-localstorage"),
//   localStorage = new LocalStorage("./scratch");
// // const MongoClient = require("mongodb").MongoClient;

// const app = express();
// const PORT = 8000;
// const MONGO_URI =
//   "mongodb+srv://aprin418:justTemp@cluster0.92dc7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

// app.set("view engine", "ejs");

// mongoose
//   .connect(MONGO_URI, { useNewUrlParser: true })
//   .then(console.log(`MongoDB connected to ${MONGO_URI}`))
//   .catch((err) => console.log(err));

// app.use(express.json());

// app.use(express.urlencoded({ extended: false }));

// app.use(
//   session({
//     secret: "very secret this is",
//     cookie: { maxAge: 60000 },
//     resave: false,
//     saveUninitialized: true,
//     store: MongoStore.create({
//       mongoUrl:
//         "mongodb+srv://aprin418:justTemp@cluster0.92dc7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
//     }),
//   })
// );

// // app.use(passport.initialize());
// // app.use(passport.session());

// // Routes
// // app.use("/api/auth", auth);
// app.get("/vote/:name", (req, res) => {
//   db.collection("votes")
//     .updateOne(
//       {
//         name: req.params.name,
//       },
//       {
//         $inc: {
//           votes: 1,
//         },
//       }
//     )
//     .then((result) => {
//       console.log(result);
//       localStorage.setItem("car-vote", "voted");
//       Votes.find()
//         .toArray()
//         .then((results) => {
//           res.render("index.ejs", {
//             candidates: results,
//             notVoted: false,
//           });
//         });
//     })
//     .catch((error) => console.error(error));
// });

// app.get("/", (req, res) => {
//   Votes.find()
//     .toArray()
//     .then((results) => {
//       res.render("index.ejs", {
//         candidates: results,
//         notVoted: true,
//       });
//     })
//     .catch((error) => console.error(error));
// });

// app.listen(PORT, () => console.log(`Backend listening on port ${PORT}!`));

// //

// const server = require("http").createServer(app);
// const io = require("socket.io")(server, { cors: { origin: "*" } });

// app.set("view engine", "ejs");
// app.use(bodyParser.json());

// const userNotVoted = localStorage.getItem("car-vote");

// io.on("connection", (socket) => {
//   console.log("user connected " + socket.id);

//   socket.on("results", (data) => {
//     socket.broadcast.emit("results", data);
//   });
// });

// MongoClient.connect(
//   "mongodb+srv://aprin418:justTemp@cluster0.92dc7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   }
// ).then((client) => {
//   console.log("connected to database");
//   const db = client.db("car-voting-app");
//   const collection = db.collection("votes");
// });
