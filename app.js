const express = require("express");
const app = express();
const socketio = require("socket.io");
const Message = require("./Models/Message");
const User = require("./Models/User");
const path = require("path");

const allowCrossDomain = (req, res, next) => {
  res.header(`Access-Control-Allow-Origin`, `*`);
  res.header(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
  res.header(`Access-Control-Allow-Headers`, `Content-Type`);
  next();
};

const expressServer = app.listen(process.env.PORT || 3000, () => {
  console.log(process.env.PORT || 3000);
});

const io = socketio(expressServer, {
  cors: true,
  origins: ["*"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});

app.use(allowCrossDomain);
app.use(express.json());

app.post("/adduser", async (req, res) => {
  const user = await User.findOne({
    where: {
      name: req.body.name.toLowerCase().trim(),
    },
  });
  if (!user) {
    await User.create({
      name: req.body.name.toLowerCase().trim(),
      framework: req.body.framework,
    });
    return res
      .status(200)
      .json({ message: `Connected with name ${req.body.name}` });
  } else {
    return res.status(400).send("Name already Taken");
  }
});

(async () => {
  //await Message.sync({ force: true });
  //await User.sync({ force: true });
})();

app.post("/checkname", async (req, res) => {
  const user = await User.findOne({
    where: {
      name: req.body.name.toLowerCase().trim(),
    },
  });
  if (user) {
    res.status(400).send("Name already Taken");
  } else {
    res.status(200).json({ message: "Name is available" });
  }
});

app.use("/react", express.static(path.join(__dirname, "Redist")));
console.log(path.join(__dirname, "dist"));

app.use("/react/*", (req, res) => {
  res.sendFile(path.join(__dirname, "Redist", "index.html"));
});

app.use("/", express.static(path.join(__dirname, "Andist")));

app.use("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "Andist", "index.html"));
});

io.use((socket, next) => {
  socket.name = socket.handshake.query.name.toLowerCase().trim();
  socket.framework = socket.handshake.query.framework;
  next();
});

let awaitedMessages;
let connectedUsers;

io.on("connection", async (socket) => {
  const messages = Message.findAll({
    raw: true,
    attributes: ["name", "message", "framework"],
  });

  connectedUsers = await User.findAll({
    raw: true,
    attributes: ["name", "framework"],
  });

  socket.on("disconnect", async () => {
    User.destroy({ where: { name: socket.name } });

    const index = connectedUsers.find((user) => {
      return user.name === socket.name;
    });

    connectedUsers.splice(connectedUsers.indexOf(index), 1);

    io.emit("users", connectedUsers);
  });
  io.emit("users", connectedUsers);

  awaitedMessages = await messages;

  socket.emit("messages", awaitedMessages);

  socket.on("sendmessage", (data) => {
    const newMessage = {
      name: socket.name,
      message: data.trim(),
      framework: socket.framework,
    };
    Message.create({ ...newMessage });

    awaitedMessages = [...awaitedMessages, newMessage];

    io.emit("messages", awaitedMessages);
  });
});
app.use("/react", express.static(path.join(__dirname, "dist")));

app.use("/react*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
