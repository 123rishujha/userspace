import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { socketContext } from "../context/SocketContextProvider";

import {
  Box,
  Heading,
  Text,
  Avatar,
  Flex,
  useColorModeValue,
  WrapItem,
  Wrap,
} from "@chakra-ui/react";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { FaCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const UserSpacePage = () => {
  const { socketInstance } = useContext(socketContext);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBgColor = useColorModeValue("gray.50", "gray.700");

  const handleChatWith = (socketId) => {
    socketInstance.emit("createAndJoinChatRoom", socketId);
  };

  useLayoutEffect(() => {
    if (socketInstance) {
      socketInstance.on("getAvailableUserSpace", (value) => {
        setUsers(Object.values(value));
      });

      socketInstance.on("roomCreated", (chatRoom) => {
        console.log("client:", chatRoom);
        navigate(`/chat/${chatRoom.roomId}`, { state: chatRoom });
      });

      return () => {
        socketInstance.off("getAvailableUserSpace");
      };
    }
  }, [socketInstance]);

  useEffect(() => {
    if (socketInstance) {
      socketInstance.emit("getAvailableUserSpace");
    }
  }, [socketInstance]);

  return (
    <Box bg={bgColor}>
      <Box p={4} borderBottomWidth="1px" margin={"auto"}>
        <Flex justifyContent="center" alignItems="center">
          <Heading size="md">User Space</Heading>
          {/* <IoEllipsisVertical /> */}
        </Flex>
      </Box>

      <Wrap gap="30px" justify="center" mt={"10px"}>
        {users.map((user, index) => (
          <WrapItem
            key={index}
            p={3}
            borderRadius="md"
            border="1px solid"
            borderColor={borderColor}
            _hover={{ bg: hoverBgColor, cursor: "pointer" }}
            transition="background 0.2s"
            onClick={() => handleChatWith(user.socketId)}
          >
            <Flex alignItems="center" gap={3} width={"200px"}>
              <Avatar
                size="md"
                name={user.username}
                src={user.avatar}
                bg="teal.500"
              />
              <Flex
                justifyContent="space-between"
                alignItems="center"
                flex={"1"}
              >
                <Text fontWeight="medium">{user.username}</Text>
                <Flex alignItems="center">
                  {user.isOnline && (
                    <FaCircle
                      size={15}
                      color="green"
                      style={{ marginRight: "6px" }}
                    />
                  )}
                  <IoChatbubbleEllipsesSharp color="teal" opacity={0.8} />
                </Flex>
              </Flex>
            </Flex>
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  );
};

export default UserSpacePage;
