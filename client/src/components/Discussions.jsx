import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";

const fetchMessages = async () => {
  const { data } = await axios.get("http://localhost:8080/api/messages");
  return data;
};

export default function Discussions() {
  const { user, isSignedIn } = useUser();
  const [message, setMessage] = useState("");
  const messageContainerRef = useRef(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: fetchMessages,
  });

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const scrollWithDelay = () => {
      const timeouts = [0, 100, 500];
      timeouts.forEach((timeout) => {
        setTimeout(scrollToBottom, timeout);
      });
    };

    if (messages && !isLoading) {
      scrollWithDelay();
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const messageObserver = new MutationObserver(scrollToBottom);

    if (messageContainerRef.current) {
      messageObserver.observe(messageContainerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => messageObserver.disconnect();
  }, []);

  const sendMessageMutation = useMutation({
    mutationFn: (newMessage) =>
      axios.post(`http://localhost:8080/api/messages?clerkId=${user.id}`, {
        content: newMessage,
      }),
    onSuccess: () => {
      setMessage("");
      scrollToBottom();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

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
      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
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

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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
