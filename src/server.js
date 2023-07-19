import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use("/public", express.static(process.cwd() + "/src/public/"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => {
  console.log(`server on http://localhost:3000`);
};
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

function publicRooms() {
	const {
	  sockets: {
		adapter: { sids, rooms },
	  },
	} = wsServer;
	const publicRooms = [];
	rooms.forEach((_, key) => {
	  if (sids.get(key) === undefined) {
		publicRooms.push(key);
	  }
	});
	return publicRooms;
  }
  
  function countRoom(roomName) {
	return wsServer.sockets.adapter.rooms.get(roomName)?.size;
  }
  
  wsServer.on("connection", (socket) => {
	wsServer.sockets.emit("room_change", publicRooms());
	socket.onAny((event) => console.log(`Socket Event: ${event}`));
  
	socket.on("enter_room", (roomName, nickname, done) => {
	  socket["nickname"] = nickname;
	  socket.join(roomName);
	  socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
	  done();
	  wsServer.sockets.emit("room_change", publicRooms());
	});
  
	socket.on("disconnecting", () => {
	  socket.rooms.forEach((room) =>
		socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
	  );
	});
  
	socket.on("disconnect", () => {
	  wsServer.sockets.emit("room_change", publicRooms());
	});
  
	socket.on("new_message", (msg, room, done) => {
	  socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
	  done();
	});
  
	socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
  });

httpServer.listen(3000, handleListen);