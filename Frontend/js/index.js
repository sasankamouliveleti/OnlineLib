const serviceCall = async function (url, method, data) {
  const response = await fetch("http://localhost:3000" + url, {
    method: method,
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const myJson = await response.json();
  return myJson;
};

const register = function () {
  var userName = document.getElementById("email").value;
  var enterPwd = document.getElementById("enterPwd").value;
  var confirmPwd = document.getElementById("confirmPwd").value;
  if (enterPwd === confirmPwd) {
    serviceCall("/register", "POST", {
      userName: userName,
      password: enterPwd,
    })
      .then((res) => {
        if (res.status == "success") {
          alert(
            "Please Activate your account using the link sent to your mail"
          );
          window.location.href = "login.html";
        } else {
          alert(res.status);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  } else {
    alert("password don't match");
  }
};

const login = function () {
  var userName = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  serviceCall("/login", "POST", {
    userName: userName,
    password: password,
  })
    .then((res) => {
      if (res.status == "success") {
        sessionStorage.setItem("userName", userName);
        window.location.href = "main.html";
      } else {
        alert(res.status);
      }
    })
    .catch((e) => {
      console.log(e);
    });
};

const upload = function () {
  var title = document.getElementById("bookName").value;
  var genre = document.getElementById("genre").value;
  var booklink = document.getElementById("booklink").value;
  var image = document.getElementById("image").value;
  if (title != "" && genre != "" && booklink != "" && image != "") {
    var req = {
      title: title,
      genre: genre,
      booklink: booklink,
      image: image,
    };
    serviceCall("/insertbook", "POST", req)
      .then((res) => {
        if (res.status == "success") {
          alert("Uploaded");
        } else {
          alert(res.status);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  } else {
    alert("Please enter all the fields");
  }
};

const logout = function () {
  var userName = sessionStorage.getItem("userName");
  serviceCall("/logout", "POST", {
    userName: userName,
  }).then((res) => {
    if (res.status == "success") {
      sessionStorage.removeItem("userName");
      window.location.href = "../index.html";
    } else {
      alert(res.status);
    }
  });
};
let booksArr;
const renderItems = function () {
  //sessionStorage.getItem("userName")!=null
  if (1) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        if (1) {
          var data = JSON.parse(this.response);
          booksArr = data.books;
          let genre = [];
          for (let i = 0; i < booksArr.length; i++) {
            if (!genre.includes(booksArr[i].genre)) {
              genre.push(booksArr[i].genre);
            }
          }
          let finalBooks = [];
          for (let i = 0; i < genre.length; i++) {
            let genreGeneral = [];
            for (let j = 0; j < booksArr.length; j++) {
              if (booksArr[j].genre == genre[i]) {
                genreGeneral.push(booksArr[j]);
              }
            }
            let finalGenre = {};
            finalGenre["genreVal"] = genre[i];
            finalGenre["bookNames"] = genreGeneral;
            finalBooks.push(finalGenre);
          }
          var template = $("#handlebars-demo").html();
          var templateScript = Handlebars.compile(template);
          var html = templateScript({ books: finalBooks });
          $("#books").append(html);
        }
      }
    };
    xhttp.open("GET", "http://localhost:3000/books", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
  } else {
    alert("Please Login");
    window.location.href = "login.html";
  }
};

const filter = function () {
  if (document.getElementById("txtSearch").value.length > 0) {
    document.getElementById("books").style.display = "none";
    document.getElementById("booksFilter").style.display = "block";
    let search = document.getElementById("txtSearch").value.toLowerCase();
    for (let i = 0; i < booksArr.length; i++) {
      if (!booksArr[i].title.toLowerCase().includes(search)) {
        document.getElementById(booksArr[i].title).style.display = "none";
      } else {
        document.getElementById(booksArr[i].title).style.display = "block";
      }
    }
  } else if (document.getElementById("txtSearch").value.length == 0) {
    document.getElementById("books").style.display = "block";
    document.getElementById("booksFilter").style.display = "none";
  }
};

const clearBooks = function () {
  document.getElementById("books").style.display = "none";
  var template = $("#handlebars").html();
  var templateScript = Handlebars.compile(template);
  var html = templateScript({ books: booksArr });
  $("#booksFilter").append(html);
};
