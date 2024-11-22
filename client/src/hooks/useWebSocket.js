import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";

export function useWebSocket() {
  const queryClient = useQueryClient();
  const clientRef = useRef(null);

  useEffect(() => {
    const client = new Client({
      brokerURL: "ws://localhost:8080/ws/websocket",
      // debug: function (str) {
      //   console.log(str);
      // },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = function () {
      // console.log("Connected to WebSocket");

      client.subscribe("/topic/clubs", function (message) {
        const club = JSON.parse(message.body);
        queryClient.setQueryData(["clubs"], (oldData) => {
          if (!oldData) return [club];
          const index = oldData.findIndex((c) => c.id === club.id);
          if (index === -1) {
            return [...oldData, club];
          }
          const newData = [...oldData];
          newData[index] = club;
          return newData;
        });
      });

      client.subscribe("/topic/clubs/delete", function (message) {
        const clubId = JSON.parse(message.body);
        queryClient.setQueryData(["clubs"], (oldData) => {
          if (!oldData) return [];
          return oldData.filter((club) => club.id !== clubId);
        });
      });

      client.subscribe("/topic/messages", function (message) {
        const newMessage = JSON.parse(message.body);
        queryClient.setQueryData(["messages"], (oldData) => {
          if (!oldData) return [newMessage];
          return [...oldData, newMessage];
        });
      });

      client.subscribe("/topic/typing", function (message) {
        const typingStatus = JSON.parse(message.body);
        queryClient.setQueryData(["typingUsers"], (oldData) => {
          const newSet = new Set(
            typeof oldData === "object" ? oldData : new Set()
          );
          if (typingStatus.typing) {
            newSet.add(typingStatus.username);
          } else {
            newSet.delete(typingStatus.username);
          }
          return newSet;
        });
      });
    };

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [queryClient]);

  return clientRef.current;
}
