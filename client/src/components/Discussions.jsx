import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";

const fetchMessages = async () => {
  const { data } = await axios.get("http://localhost:8080/api/messages");
  return data;
};

export default function Discussions() {
  const { user, isSignedIn } = useUser();
  const [message, setMessage] = useState("");
  const stompClient = useWebSocket();
  const typingTimeoutRef = useRef();

  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: fetchMessages,
  });

  const { data: typingUsers = new Set() } = useQuery({
    queryKey: ["typingUsers"],
    initialData: new Set(),
  });

  const otherTypingUsers = useMemo(() => {
    const others = new Set(typingUsers);
    if (user?.username) {
      others.delete(user.username);
    }
    return others;
  }, [typingUsers, user?.username]);

  const renderTypingIndicator = () => {
    if (otherTypingUsers.size === 0) return null;

    const typingList = Array.from(otherTypingUsers);
    if (typingList.length === 1) {
      return (
        <div className="px-4 text-sm text-muted-foreground italic">
          {typingList[0]} is typing...
        </div>
      );
    } else if (typingList.length === 2) {
      return (
        <div className="px-4 text-sm text-muted-foreground italic">
          {typingList[0]} and {typingList[1]} are typing...
        </div>
      );
    } else {
      return (
        <div className="px-4 text-sm text-muted-foreground italic">
          {typingList[0]}, {typingList[1]} and {typingList.length - 2} more are
          typing...
        </div>
      );
    }
  };

  const sendMessageMutation = useMutation({
    mutationFn: (newMessage) =>
      axios.post(`http://localhost:8080/api/messages?clerkId=${user.id}`, {
        content: newMessage,
      }),
    onSuccess: () => {
      setMessage("");
    },
  });

  const sendTypingStatus = useCallback(
    (isTyping) => {
      if (stompClient && user) {
        const username =
          user.username ||
          user.firstName ||
          user.primaryEmailAddress?.emailAddress;
        stompClient.publish({
          destination: "/app/typing",
          body: JSON.stringify({
            username,
            typing: isTyping,
          }),
        });
      }
    },
    [stompClient, user]
  );

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    sendTypingStatus(true);

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTypingStatus(false);
    sendMessageMutation.mutate(message);
  };

  useEffect(() => {
    return () => {
      sendTypingStatus(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [sendTypingStatus]);

  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-lg">Please sign in to participate in discussions</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-lg">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${
              msg.user.clerkId === user.id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex gap-2 max-w-[80%] ${
                msg.user.clerkId === user.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              } p-3 rounded-lg`}
            >
              {msg.user.clerkId !== user.id && (
                <img
                  src={msg.user.imageUrl}
                  alt={msg.user.username}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <div>
                {msg.user.clerkId !== user.id && (
                  <p className="text-sm font-medium">{msg.user.username}</p>
                )}
                <p>{msg.content}</p>
                <p className="text-xs opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {renderTypingIndicator()}

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!message.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
