const express = require("express");
const router = express.Router();

const candidates = require("../models/candidate_model");
const { auth, requiresAuth } = require("express-openid-connect");

router.get("/vote/:id", requiresAuth(), (req, res) => {
  candidates
    .findByIdAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $inc: {
          votes: 1,
        },
      }
    )
    .then((result) => {
      console.log(result);
      candidates.find().then((results) => {
        res.render("index", {
          candidates: results,
          notVoted: false,
        });
      });
    })
    .catch((error) => console.error(error));
});

// retreive all candidates
router.get("/", (req, res) => {
  candidates
    .find()
    .then((results) => {
      res.render("index", {
        candidates: results,
        notVoted: true,
      });
    })
    .catch((err) => console.error(err));
});

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

module.exports = router;
