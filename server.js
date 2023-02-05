const express = require("express");
const { engine } = require("express-handlebars");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const messageBird = require("messagebird").initClient(
  process.env.MESSAGEBIRD_KEY
);
const bodyParser = require("body-parser");
const app = express();

app.engine("handlebars", engine({ defaultLayout: "main" }));

app.set("view engine", "handlebars");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("step1");
});

app.post("/step2", (req, res) => {
  let number = req.body.number;

  messageBird.verify.create(
    number,
    {
      template: "Your Verification code is %token",
    },
    function (err, response) {
      if (err) {
        console.log(err);
        res.render("step1", {
          error: err.errors[0].description,
        });
      } else {
        console.log(response);
        res.render("step2", {
          id: response.id,
        });
      }
    }
  );
});

app.post("/step3", (req, res) => {
  const id = req.body.id;
  const token = req.body.token;

  messageBird.verify.verify(id, token, (err, response) => {
    if (err) {
      res.render("step2", {
        error: err.errors[0].description,
        id: id,
      });
    } else {
      res.render("step3");
    }
  });
});

const port = 5555;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
