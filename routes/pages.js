const express = require("express");
const router = express.Router();

const candidates = require("../models/candidate_model");
const { auth, requiresAuth } = require("express-openid-connect");
const users = require("../models/user_model");

router.get("/vote/:id", requiresAuth(), (req, res) => {
  const date = new Date();
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + 1);
  const email = req.oidc.user.email;
  users.findOne(
    {
      email: email,
    },
    (err, doc) => {
      if (err) {
        console.log(err);
      }
      if (doc === null) {
        let user = {
          name: req.oidc.user.name,
          email: email,
          date: newDate,
        };
        users.create(user);
      } else {
        users.findOneAndUpdate(
          {
            email: email,
          },
          {
            date: newDate,
            new: true,
          },
          (err, doc) => {
            if (err) {
              console.log(err);
            }
          }
        );
      }
    }
  );

  candidates.findByIdAndUpdate(
    {
      _id: req.params.id,
    },
    {
      $inc: {
        votes: 1,
      },
      new: true,
    },
    (err, doc) => {
      if (err) {
        console.log(err);
      }
    }
  );
  candidates.find().then((results) => {
    users
      .findOne({
        email: email,
      })
      .then((user) => {
        res.redirect("/");
      });
  });
});

router.get("/", (req, res) => {
  let email = null;
  if (req.oidc.isAuthenticated()) {
    email = req.oidc.user.email;
  }
  candidates
    .find()
    .then((results) => {
      users.findOne(
        {
          email: email,
        },
        (err, doc) => {
          if (err) {
            console.log(err);
          }
          if (doc === null) {
            res.render("index", {
              candidates: results,
              notVoted: email === null ? false : true,
              timeVoted: null,
              isAuthenticated: req.oidc.isAuthenticated(),
            });
          } else {
            users
              .findOne({
                email: email,
              })
              .then((user) => {
                res.render("index", {
                  candidates: results,
                  notVoted: user.date <= new Date(),
                  timeVoted: user.date,
                  isAuthenticated: req.oidc.isAuthenticated(),
                });
              });
          }
        }
      );
    })
    .catch((err) => console.error(err));
});

module.exports = router;

/* 
Show total votes unless allowed to vote, if allowed to vote show buttons
logged in auth0 user not in DB should see ability to vote - notVoted: true
logged in auth0 user in DB should see ability to vote if after an hour, less than an hour should see totals of votes notVoted: new Date() >= newDate
logged out user should see buttons but be prompted to log in when voting notVoted: false
*/
