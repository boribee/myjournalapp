require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect(process.env.DB_LINK, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const entrySchema = new mongoose.Schema ({
  title: String,
  day: String,
  content: String
});

const secret = process.env.KEY;
entrySchema.plugin(encrypt, {secret: secret, encryptedFields: ["title", "content"]});

const Entry = mongoose.model("Entry", entrySchema);

app.get("/", (req, res) => {
  Entry.find({}, (err, entries) => {
    res.render("home", {
      entries: entries
    });
  });
});

app.get("/compose", (req, res) => {
  const today = new Date();
  function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}
  const date = formatDate(today);
  res.render("compose", {
    date: date
  });
});

app.post("/compose", function(req, res) {
  const entry = new Entry({
    title: req.body.entryTitle,
    day: req.body.entryDate,
    content: req.body.entryText
  });

  entry.save(function(err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.get("/entries/:entryId", (req, res) => {
  const requestedEntryId = req.params.entryId;
  Entry.findOne({
    _id: requestedEntryId
  }, (err, entry) => {
    res.render("entry", {
      title: entry.title,
      day: entry.day,
      content: entry.content,
      id: entry._id
    });
  });
});

app.post("/delete", (req, res) => {
  const currentEntryId = req.body.button;
  Entry.findByIdAndRemove(currentEntryId, (err) => {
    if (!err) {
      console.log("Successfully deleted checked item.");
      res.redirect("/");
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function(){
  console.log("Server started successfully");
});
