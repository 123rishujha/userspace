import React, { useEffect, useState } from "react";
import { createContext } from "react";
import { io } from "socket.io-client";
import { backendUrl } from "../exports/commonExports";

export const socketContext = createContext(null);

const SocketContextProvider = ({ children }) => {
  const [socketInstance, setSocketInstance] = useState(null);
  const [mySpaceName, setMySpaceName] = useState("");

  useEffect(() => {
    if (!socketInstance) {
      const socket = io.connect(backendUrl);
      setSocketInstance(socket);
    }
    return () => {
      if (socketInstance) socketInstance.disconnect();
    };
  }, []);

  return (
    <socketContext.Provider
      value={{ socketInstance, mySpaceName, setMySpaceName }}
    >
      {children}
    </socketContext.Provider>
  );
};

export default SocketContextProvider;
