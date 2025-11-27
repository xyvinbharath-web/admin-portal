"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { getToken } from "../lib/auth";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = getToken();
    const socket = io(SOCKET_URL, {
      auth: token ? { token } : undefined,
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return socketRef.current;
}
