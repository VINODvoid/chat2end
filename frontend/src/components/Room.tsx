import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Message {
  message: string;
  name: string;
}

function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      message: "Welcome to the chat room! 👋",
      name: "System",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!roomId) return <div>Invalid room</div>;

  useEffect(() => {
    const ws = new WebSocket("https://chat2end.onrender.com");

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          payload: {
            roomId,
          },
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);
        setMessages((prev) => [...prev, data.payload]);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    if (!socket || !message.trim()) return;

    socket.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message: message.trim(),
          name: name?.trim() || "Anonymous",
        },
      })
    );

    setMessage("");
  }

  const shareRoom = async () => {
    const url = `${window.location.origin}/room/${roomId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Room link copied! Share with friends 🎉");
    } catch (err) {
      toast.error("Oops! Couldn't copy the link");
    }
  };
  function leaveRoom() {
    navigate("/");
  }

  return (
    <div className="h-screen flex flex-col bg-cartoon-bg text-cartoon-text">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-cartoon-light/80 backdrop-blur-lg shadow-lg border-b-2 border-cartoon-accent/20">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-xl text-cartoon-accent hover:bg-cartoon-accent/10 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-cartoon-accent">
                Room: {roomId}
              </h1>
              <p className="text-sm text-cartoon-text">
                Chatting as {name?.trim() || "Anonymous"}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            {" "}
            {/* Flex container for both buttons */}
            <button
              onClick={leaveRoom}
              className="flex items-center gap-2 px-5 py-2.5 bg-cartoon-accent text-cartoon-light rounded-xl
                 transition-all hover:bg-cartoon-accent/90 hover:scale-105 active:scale-100"
            >
              <ArrowLeft className="w-4 h-4" /> {/* Fix icon */}
              <span>Leave Room</span>
            </button>
            <button
              onClick={shareRoom}
              className="flex items-center gap-2 px-5 py-2.5 bg-cartoon-accent text-cartoon-light rounded-xl
                 transition-all hover:bg-cartoon-accent/90 hover:scale-105 active:scale-100"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Room</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.name === name ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                msg.name === name
                  ? "bg-cartoon-accent text-cartoon-light"
                  : "bg-cartoon-light text-cartoon-text"
              } shadow-lg`}
            >
              <div className="text-sm opacity-75 mb-1 flex items-center gap-2">
                {msg.name}
                {msg.name === "System" && <Sparkles className="w-3 h-3" />}
              </div>
              <div className="break-words">{msg.message}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="border-t-2 border-cartoon-accent/20 bg-cartoon-light p-4 space-y-4">
        <div>
          <label className="text-sm text-cartoon-text block mb-2">
            Your Name
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name || ""}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-cartoon-bg/50 border-2 border-cartoon-accent/20 rounded-xl
                     text-cartoon-text placeholder-cartoon-text/60
                     focus:ring-4 focus:ring-cartoon-accent/20 focus:border-cartoon-accent
                     outline-none transition-all"
          />
        </div>

        <div className="flex gap-3">
          <input
            className="flex-1 px-4 py-3 bg-cartoon-bg/50 border-2 border-cartoon-accent/20 rounded-xl
                     text-cartoon-text placeholder-cartoon-text/60
                     focus:ring-4 focus:ring-cartoon-accent/20 focus:border-cartoon-accent
                     outline-none transition-all"
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button
            onClick={sendMessage}
            className="px-5 py-3 bg-cartoon-accent text-cartoon-light rounded-xl
                     flex items-center gap-2 transition-all hover:bg-cartoon-accent/90
                     hover:scale-105 active:scale-100 shadow-lg shadow-cartoon-accent/20"
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Room;