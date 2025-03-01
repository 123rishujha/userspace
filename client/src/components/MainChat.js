import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Box,
  Input,
  Flex,
  VStack,
  Text,
  Container,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { IoSend } from "react-icons/io5";
import { socketContext } from "../context/SocketContextProvider";
// import { MyThrottleFunction } from "../utils/MyThrottleFunc";

const MainChat = () => {
  const { socketInstance, mySpaceName } = useContext(socketContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const clearTypingId = useRef(null);
  const { roomId } = useParams();

  const bgColor = useColorModeValue("gray.100", "gray.700");
  const messageBgColor = useColorModeValue("white", "gray.600");

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      let msgObj = {
        text: newMessage,
        sender: mySpaceName,
        timestamp: new Date(),
      };
      setMessages([...messages, msgObj]);
      socketInstance.emit("newMsg", roomId, msgObj);
      setNewMessage("");
      setIsTyping(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  // const handleTyping = MyThrottleFunction((roomId, username) => {
  //   socketInstance.emit("typing", roomId, username);
  // }, 2000);
  const handleTyping = (roomId, username) => {
    socketInstance.emit("typing", roomId, username);
  };

  useEffect(() => {
    if (socketInstance) {
      socketInstance.on("receivedmsg", ({ text, sender }) => {
        setMessages((prev) => [
          ...prev,
          { text, sender, timestamp: new Date() },
        ]);
      });
      socketInstance.on("typing", () => {
        if (clearTypingId.current) clearTimeout(clearTypingId.current);
        setIsTyping(true);

        clearTypingId.current = setTimeout(() => setIsTyping(false), 2000);
      });
      return () => {
        socketInstance.off("receivedmsg");
      };
    }
  }, [socketInstance]);

  return (
    <Container maxW="container.md" py={4}>
      <Box
        borderRadius="lg"
        bg={bgColor}
        p={4}
        height="500px"
        display="flex"
        flexDirection="column"
      >
        {/* Messages area */}
        <VStack
          flex="1"
          spacing={4}
          mb={4}
          overflowY="auto"
          alignItems="stretch"
          px={2}
        >
          {messages.length === 0 ? (
            <Flex justify="center" align="center" height="100%">
              <Text color="gray.500">
                No messages yet. Start a conversation!
              </Text>
            </Flex>
          ) : (
            messages.map((message, index) => (
              <Box
                key={index}
                alignSelf={
                  message.sender === mySpaceName ? "flex-end" : "flex-start"
                }
                bg={messageBgColor}
                p={3}
                borderRadius="lg"
                boxShadow="sm"
                maxWidth="70%"
              >
                <Text>{message.text}</Text>
                <Text fontSize="xs" color="gray.500" textAlign="right" mt={1}>
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </Box>
            ))
          )}
          {isTyping && (
            <Box
              alignSelf={"flex-start"}
              bg={messageBgColor}
              p={3}
              borderRadius="lg"
              boxShadow="sm"
              maxWidth="70%"
              fontWeight={"bold"}
            >
              <Text>Typing...</Text>
            </Box>
          )}
        </VStack>

        {/* Input area */}
        <Flex>
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping(roomId, mySpaceName);
            }}
            onKeyPress={handleKeyPress}
            mr={2}
            borderRadius="md"
          />
          <IconButton
            colorScheme="blue"
            aria-label="Send message"
            icon={<IoSend />}
            onClick={handleSendMessage}
            borderRadius="md"
          />
        </Flex>
      </Box>
    </Container>
  );
};

export default MainChat;
