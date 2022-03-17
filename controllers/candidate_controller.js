const candidates = require("../models/candidate_model");

// Display index of Candidates.
exports.candidate_index = (req, res) => {
  candidates
    .find()
    .then((results) => {
      res.render("./candidate/index", {
        title: "Candidate Index",
        candidate_index: results,
      });
    })
    .catch((err) => console.error(err));
};

// Display detail page for a specific Candidate.
exports.candidate_detail = (req, res) => {
  candidates
    .findOne({
      _id: req.params.id,
    })
    .then((candidate_details) => {
      res.render("./candidate/detail", {
        name: candidate_details.name,
        candidate_details: candidate_details,
      });
    })
    .catch((err) => console.error(err));
};

// Display Candidate create form on GET.
exports.candidate_create_get = (req, res) => {
  res.render("./candidate/create", {
    title: "Create Candidate",
  });
};

// Handle Candidate create on POST.
exports.candidate_create_post = (req, res) => {
  const name = req.body.name;
  const srcUrl = req.body.srcUrl;
  const altText = name + " photo";
  const createdBy = req.oidc.user.email;
  let candidate = {
    name,
    srcUrl,
    altText,
    createdBy,
  };
  candidates.create(candidate);
  res.redirect("/");
};

exports.candidate_delete_get = (req, res) => {
  candidates.findById(req.params.id).then((result) => {
    res.render("./candidate/delete", {
      title: "Update " + result.name,
      candidate: result,
    });
  });
};

// Handle Candidate delete on POST.
exports.candidate_delete_post = (req, res) => {
  console.log("DELETE");
  candidates.findByIdAndDelete({ _id: req.params.id }, (err) => {
    console.log(err);
  });
  res.redirect("/");
};

// Display Candidate update form on GET.
exports.candidate_update_get = (req, res) => {
  candidates.findById(req.params.id).then((result) => {
    res.render("./candidate/update", {
      title: "Update " + result.name,
      candidate: result,
    });
  });
};

// Handle candidate update on POST.
exports.candidate_update_post = (req, res) => {
  candidates
    .findByIdAndUpdate(
      {
        _id: req.params.id,
      },
      {
        name: req.body.name,
      },
      {
        srcUrl: req.body.srcUrl,
      },
      {
        altText: req.body.name + " photo",
      },
      {
        upsert: true,
      }
    )
    .then((result) => {
      console.log(result);
      candidates.findById(req.params.id).then((result) => {
        res.render("./candidate/update", {
          candidate: result,
          notVoted: false,
        });
      });
    })
    .catch((error) => console.error(error));
};
