const { createServer } =  require("http");
const { appendFile } = require("fs");
const path = require("path");
const { eventListener } = require("events");
const { EventEmitter } = require("stream");

const NewsLetter = new EventEmitter();

const server =  createServer((req, res) => {
  const chunks = [];
  const { url, method } = req;

  req.on("error", (err) => {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify({ msg: "Invalid request :("}));
    res.end();
  });

  res.on("error", (err) => {
    console.log(err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify({ msg: "Server error :("}));
    res.end();
  });

  req.on("data", (chunk) => {
    chunks.push(chunk);
  });
  req.on("end", () => {
      if (url === "/newsletter_signup" && method === "POST") {
        const body = JSON.parse(Buffer.concat(chunks).toString());

        const newConcat = `${body.name},${body.email}\n`;

        NewsLetter.emit("signup", newConcat, res);

        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify({ msg: "Signed up to Newsletter!"}));
        res.end();
      } else {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify({ msg: "Invalid endpoint :("}));
        res.end();
      }
  });
});

server.listen(3000, () => console.log("Server is listening..."));

NewsLetter.on("signup", (newContact, res) => {
  let csvContacts = ``;
  contacts.forEach(({name, email }) => {
    csvContacts += `${name},${email}\n`;
  });

appendFile(
  path.join(__dirname, "../assets/newsletter.csv"),
  csvContacts,
  (err) =>{
    if (err) {
      NewsLetter.emit("error", err, res);
      return;
    }
    console.log("File Update Successful!");
  }
);
});

NewsLetter.on("error", (err, res) => {
  console.log(err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify({ msg: "Error adding new contact :("}));
    res.end();
});