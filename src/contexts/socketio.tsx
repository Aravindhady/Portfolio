"use client";

import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { generateRandomCursor } from "../lib/generate-random-cursor";

export type User = {
  socketId: string;
  name: string;
  color: string;
  pos: {
    x: number;
    y: number;
  };
  location: string;
  flag: string;
};

export type Message = {
  socketId: string;
  content: string;
  time: Date;
  username: string;
};

export type UserMap = Map<string, User>;

type SocketContextType = {
  socket: Socket | null;
  users: UserMap;
  setUsers: Dispatch<SetStateAction<UserMap>>;
  msgs: Message[];
};

const INITIAL_STATE: SocketContextType = {
  socket: null,
  users: new Map(),
  setUsers: () => {},
  msgs: [],
};

export const SocketContext = createContext<SocketContextType>(INITIAL_STATE);

const SocketContextProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<UserMap>(new Map());
  const [msgs, setMsgs] = useState<Message[]>([]);

  useEffect(() => {
    const username = localStorage.getItem("username") || generateRandomCursor().name;
    
    // Ensure we're using the correct WebSocket URL
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
    console.log("Connecting to WebSocket server at:", wsUrl);
    
    const socket = io(wsUrl, {
      query: { username },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("connect", () => {
      console.log("Socket connected successfully", socket.id);
      socket.emit("user-connect", { username });
    });

    socket.on("users-update", (updatedUsers) => {
      console.log("Users updated:", updatedUsers);
      const userMap = new Map();
      updatedUsers.forEach((user: User) => {
        userMap.set(user.socketId, user);
      });
      setUsers(userMap);
    });

    socket.on("msgs-receive-init", (msgs) => {
      console.log("Initial messages received:", msgs);
      setMsgs(msgs);
    });

    socket.on("msg-receive", (msg) => {
      console.log("New message received:", msg);
      setMsgs((prev) => [...prev, msg]);
    });

    setSocket(socket);

    return () => {
      console.log("Cleaning up socket connection");
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, users, setUsers, msgs }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContextProvider;
