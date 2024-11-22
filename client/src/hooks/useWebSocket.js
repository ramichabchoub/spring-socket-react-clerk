import { useEffect } from "react";
import { Client } from "@stomp/stompjs";

// Create a simple event emitter
const listeners = new Map();

export const websocketEvents = {
  subscribe: (event, callback) => {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event).add(callback);
    return () => listeners.get(event).delete(callback);
  },
  emit: (event, data) => {
    if (listeners.has(event)) {
      listeners.get(event).forEach((callback) => callback(data));
    }
  },
};

export function useWebSocket() {
  useEffect(() => {
    const client = new Client({
      brokerURL: "ws://localhost:8080/ws/websocket",
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = function () {
      console.log("Connected to WebSocket");

      // Messages subscription
      client.subscribe("/topic/messages", function (message) {
        const newMessage = JSON.parse(message.body);
        websocketEvents.emit("newMessage", newMessage);
      });

      // Clubs subscription
      client.subscribe("/topic/clubs", function (message) {
        const club = JSON.parse(message.body);
        websocketEvents.emit("clubUpdate", club);
      });

      // Club deletions subscription
      client.subscribe("/topic/clubs/delete", function (message) {
        const clubId = JSON.parse(message.body);
        websocketEvents.emit("clubDelete", clubId);
      });
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);
}
