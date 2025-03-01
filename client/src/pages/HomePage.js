import React, { useContext, useEffect, useRef, useState } from "react";
import { socketContext } from "../context/SocketContextProvider";
import { Navigate } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  Input,
  VStack,
  Heading,
  Container,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";

const HomePage = () => {
  const inputRef = useRef(null);
  const { socketInstance, setMySpaceName } = useContext(socketContext);
  const [navigateToChat, setNavigateToChat] = useState(false); // ✅ State to handle navigation

  const handleJoinSpace = (event) => {
    event.preventDefault();
    const username = inputRef.current.value;
    socketInstance.emit("joinSpace", username);
    setMySpaceName(username);
  };

  useEffect(() => {
    if (socketInstance) {
      socketInstance.on("spaceJoined", () => {
        console.log("client: spaceJoined");
        setNavigateToChat(true); // ✅ Trigger navigation on event
      });

      return () => {
        socketInstance.off("spaceJoined"); // ✅ Cleanup event listener
      };
    }
  }, [socketInstance]);

  // ✅ Redirect when state is true
  if (navigateToChat) {
    return <Navigate to="/userspace" />;
  }

  return (
    <Container maxW="md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg" textAlign="center">
          Join Space
        </Heading>

        <Box p={6} borderRadius="md" boxShadow="md" bg="white">
          <form onSubmit={handleJoinSpace}>
            <VStack spacing={4}>
              <FormControl id="userName" isRequired>
                <InputGroup>
                  <InputLeftElement pointerEvents="none"></InputLeftElement>
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    ref={inputRef}
                    focusBorderColor="blue.400"
                  />
                </InputGroup>
              </FormControl>

              <Button type="submit" colorScheme="blue" width="full" mt={4}>
                Join Space
              </Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  );
};

export default HomePage;
