const { v4: uuidv4 } = require("uuid");

const online = {};

const availableUserSpace = {
  // socketId: {
  //     socketId: "socket kjal",
  //     username:"klajdlj",
  // }
};

const chatRooms = {
  // roomId: {
  //   roomId: "",
  //   users: [{socketId:"",username}, {socketId:"",username}]
  // }
};

const broadcastAvailableUserInSpaceFunc = (io) => {
  Object.keys(availableUserSpace).forEach((socketId) => {
    let withoutCurrent = { ...availableUserSpace };
    delete withoutCurrent[socketId];
    io.to(socketId).emit("getAvailableUserSpace", withoutCurrent);
  });
};

const removeUserFromAvailableUserSpace = (id1, id2) => {
  delete availableUserSpace[id1];
  delete availableUserSpace[id2];
};

const triggerGetAvailableUserSpaceEvent = (socket) => {
  let withoutCurrent = { ...availableUserSpace };
  delete withoutCurrent[socket.id];
  socket.emit("getAvailableUserSpace", withoutCurrent);
};

function initializeSocket(io) {
  io.on("connection", (socket) => {
    online[socket.id] = true;

    socket.on("joinSpace", (username) => {
      availableUserSpace[socket.id] = {
        socketId: socket.id,
        username,
      };
      socket.emit("spaceJoined");
      broadcastAvailableUserInSpaceFunc(io);
      // triggerGetAvailableUserSpaceEvent(socket);
    });

    socket.on("newMsg", (roomId, msgObj) => {
      socket.to(roomId).emit("receivedmsg", msgObj);
    });

    socket.on("createAndJoinChatRoom", (socketId) => {
      // socket id of user where want to connect
      let roomId = uuidv4();
      let user1 = availableUserSpace[socketId];
      let user2 = availableUserSpace[socket.id];
      if (user1 && user2) {
        chatRooms[roomId] = {
          roomId: roomId,
          users: [user1, user2],
        };
        socket.join(roomId);
        let socket2 = io.sockets.sockets.get(socketId);
        if (socket2) {
          socket2.join(roomId);
        }
        io.to(roomId).emit("roomCreated", chatRooms[roomId]);

        removeUserFromAvailableUserSpace(socketId, socket2?.id);
        broadcastAvailableUserInSpaceFunc(io);
      }
    });

    socket.on("getAvailableUserSpace", () => {
      triggerGetAvailableUserSpaceEvent(socket);
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected");
    });
  });
}

module.exports = {
  initializeSocket,
};
