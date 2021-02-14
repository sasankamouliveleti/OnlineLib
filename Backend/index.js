const mysql = require("mysql");
const express = require("express");
var app = express();
const bodyparser = require("body-parser");
const { json } = require("body-parser");

const bcrypt = require("bcrypt");

const mailgun = require("mailgun-js");
const DOMAIN = "sandboxda329b71fd0d428c81f835c8a9962318.mailgun.org";
const mg = mailgun({
  apiKey: "17e0eb6346eaa5749d378c497f021d5d-4de08e90-c70f4642",
  domain: DOMAIN,
});

app.use(bodyparser.json());

var mysqlconnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "admin",
  database: "OnlineLib",
});

mysqlconnection.connect((err) => {
  if (!err) {
    console.log("success");
  } else {
    console.log("not connected" + JSON.stringify(err));
  }
});

app.listen(3000, () => console.log("server started at 3000"));

app.get("/books", (req, res) => {
  mysqlconnection.query("SELECT * FROM books", (err, rows, fields) => {
    if (!err) {
      res.send({books:rows});
    } else {
      res.send({ status: "Books not found" });
      console.log("rows not found" + JSON.stringify(err));
    }
  });
});

app.post("/insertbook", (req, res) => {
  const title = req.body.title;
  const genre = req.body.genre;
  const booklink = req.body.booklink;
  const image = req.body.image;
  var sql = `INSERT INTO books (title, genre, booklink,image ) VALUES ('${title}', '${genre}', '${booklink}','${image}' )`;
  mysqlconnection.query(sql, (err, rows, fields) => {
    if (!err) {
      res.send({ status: "success" });
    } else {
      console.log("not inserted " + JSON.stringify(err));
      res.send({ status: "Not Uploaded" });
    }
  });
});

app.post("/login", async (req, res) => {
  const userName = req.body.userName;
  const password = req.body.password;
  var sql1 = "select password from studentLogin where (userName=?)";
  mysqlconnection.query(sql1, [userName], (err, rows, fields) => {
    try {
      if (!err) {
        console.log(rows);
        if (rows.length > 0) {
          const passwordinDB = rows[0].password;
          const isMatch = bcrypt.compare(password, passwordinDB);
          if (isMatch) {
            var sql =
              "UPDATE studentLogin SET loginFlag = ? WHERE (userName = ? and password = ?)";
            mysqlconnection.query(
              sql,
              ["Y", userName, passwordinDB],
              (err, rows, fields) => {
                if (!err) {
                  console.log(rows.changedRows);
                  if (rows.changedRows == 1) {
                    res.send({ status: "success" });
                  } else {
                    res.send({ status: "User not allowed" });
                  }
                } else {
                  res.send({ status: "Sorry Something Went Wrong!!!" });
                }
              }
            );
          } else {
            res.send({ status: "User not registered" });
          }
        } else {
          res.send({ status: "User not registered or activated" });
        }
      }
    } catch (e) {
      console.log(e);
      res.send({ status: "Sorry Something Went Wrong!!!!!" });
    }
  });
});

app.get("/authenticate", (req, res) => {
  const email = req.query.username;
  const password = req.query.password;
  if (email != undefined && password != undefined) {
    var sql = `INSERT INTO studentLogin (userName, password, loginFlag) VALUES ('${email}', '${password}','N')`;
    mysqlconnection.query(sql, (err, rows, fields) => {
      if (!err) {
        res.send({ status: "success" });
      } else {
        res.send({ status: "failure" });
      }
    });
  } else {
    res.send({ status: "failure" });
  }
});

app.post("/register", async (req, res) => {
  const userName = req.body.userName;
  const password = await bcrypt.hash(req.body.password, 8);
  const authenticateUrl =
    "http://localhost:3000/authenticate?username=" +
    userName +
    "&password=" +
    password;
  var sql = `select count(userName) from studentLogin where (userName = ?)`;
  mysqlconnection.query(sql, [userName], (err, rows, fields) => {
    if (!err) {
      var obj = JSON.parse(JSON.stringify(rows))[0];
      var count;
      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          count = obj[i];
          break;
        }
      }
      if (count == 0) {
        const data = {
          from: "activate@onlineLib.com",
          to: userName,
          subject: "Activation link for the user",
          html:
            "Hello, Please activate user mail id: " +
            userName +
            "<br>Using the below link <br>" +
            "<a href=" +
            authenticateUrl +
            ">Click here to add your email address to a mailing list</a>",
        };
        mg.messages().send(data, function (error, body) {
          console.log("fsdfds");
          console.log(body);
          res.send({ status: "success" });
        });
      } else {
        res.send({ status: "The user already exists" });
      }
    } else {
      res.send({ status: "Sorry Something went Wrong" });
    }
  });
});

app.post("/logout", (req, res) => {
  const userName = req.body.userName;
  var sql = "UPDATE studentLogin SET loginFlag = ? WHERE userName = ?";
  mysqlconnection.query(sql, ["N", userName], (err, rows, fields) => {
    if (!err) {
      res.send({ status: "success" });
    } else {
      res.send({ status: "failure" });
    }
  });
});
