const socket = io();

const welcome = document.getElementById("welcome");
const enterForm = welcome.querySelector("form");
const room = document.getElementById("room");

let roomName;

room.hidden = true;

const addMessage = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.append(li);
};

const handleNicknameSubmit = (event) => {
  event.preventDefault();
  const input = room.querySelector("#name input");
  socket.emit("nickname", input.value);
};

const handleMessageSubmit = (event) => {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const { value } = input;
  socket.emit("new_message", value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
};

const showRoom = () => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  room.hidden = false;
  welcome.hidden = true;
  const msgForm = room.querySelector("#msg");
  const nameForm = room.querySelector("#name");
  msgForm.addEventListener("submit", handleMessageSubmit);
  nameForm.addEventListener("submit", handleNicknameSubmit);
};

const handleRoomSubmit = (event) => {
  const roomNameInput = enterForm.querySelector("#roomName");
  const nickNameInput = enterForm.querySelector("#name");
  event.preventDefault();
  socket.emit("enter_room", roomNameInput.value, nickNameInput.value, showRoom);
  roomName = roomNameInput.value;
  roomNameInput.value = "";
  const changeNameInput = room.querySelector("#name input");
  changeNameInput.value = nickNameInput.value;
};

enterForm.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, count) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${count})`;
  addMessage(`${user} joined the room`);
});

socket.on("bye", (user, count) => {
  addMessage(`${user} left ㅠㅠ`);
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${count})`;
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.appendChild(li);
  });
});