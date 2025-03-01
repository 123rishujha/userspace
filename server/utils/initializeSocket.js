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
  // Object.keys(availableUserSpace).forEach((socketId) => {
  //   let withoutCurrent = { ...availableUserSpace };
  //   delete withoutCurrent[socketId];
  //   io.to(socketId).emit("getAvailableUserSpace", withoutCurrent);
  // });
  Object.keys(availableUserSpace).forEach((username) => {
    let socketId = availableUserSpace[username]?.socketId;

    let withoutCurrent = { ...availableUserSpace };
    delete withoutCurrent[username];
    let temp = {};
    for (let key in withoutCurrent) {
      temp[key] = { username: withoutCurrent[key].username };
    }
    if (socketId) {
      io.to(socketId).emit("getAvailableUserSpace", temp);
    }
  });
};

const removeUserFromAvailableUserSpaceById = (users) => {
  users.forEach((socketId) => {
    delete availableUserSpace[socketId];
  });
};

const findUserBySocket = (socket) => {
  let foundUsername = Object.values(availableUserSpace).find(
    (el) => el.socketId == socket.id
  );
  return foundUsername;
};

const triggerGetAvailableUserSpaceEvent = (socket) => {
  // let withoutCurrent = { ...availableUserSpace };
  // delete withoutCurrent[socket.id];
  // socket.emit("getAvailableUserSpace", withoutCurrent);

  let temp = {};
  for (let key in availableUserSpace) {
    if (availableUserSpace[key].socketId !== socket.id) {
      temp[key] = { username: availableUserSpace[key].username };
    }
  }
  socket.emit("getAvailableUserSpace", temp);
};

function initializeSocket(io) {
  io.on("connection", (socket) => {
    online[socket.id] = true;

    socket.on("joinSpace", (username) => {
      availableUserSpace[username] = {
        socketId: socket.id,
        username,
      };
      socket.emit("spaceJoined");
      broadcastAvailableUserInSpaceFunc(io);
    });

    socket.on("newMsg", (roomId, msgObj) => {
      socket.to(roomId).emit("receivedmsg", msgObj);
    });

    socket.on("createAndJoinChatRoom", (username) => {
      // username of user where want to connect
      const socketId = availableUserSpace[username].socketId;

      let user1 = availableUserSpace[username];
      let user2 = findUserBySocket(socket);

      if (user1 && user2) {
        let roomId = uuidv4();

        chatRooms[roomId] = {
          roomId: roomId,
          users: [user1, user2],
        };
        socket.join(roomId);
        let socket2 = io.sockets.sockets.get(socketId);
        if (socket2) {
          socket2.join(roomId);
        }
        io.to(roomId).emit("roomCreated", {
          roomId: roomId,
          users: [{ username: user1.username }, { username: user2.username }],
        });

        removeUserFromAvailableUserSpaceById([socketId, socket2?.id]);
        broadcastAvailableUserInSpaceFunc(io);
      }
    });

    socket.on("getAvailableUserSpace", () => {
      triggerGetAvailableUserSpaceEvent(socket);
    });

    socket.on("typing", (roomId, username) => {
      socket.to(roomId).emit("typing", username);
    });

    socket.on("disconnect", () => {
      let found = findUserBySocket(socket);
      console.log("socket disconnected", found);
      if (found) {
        delete availableUserSpace[found.username];
      }
    });
  });
}

module.exports = {
  initializeSocket,
};
