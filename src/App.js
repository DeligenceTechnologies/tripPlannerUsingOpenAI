import "./App.css";
import { useState, useCallback, useEffect } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  TypingIndicator,
  Message,
  MessageInput,
  ConversationHeader,
  Avatar,
  Sidebar,
  ConversationList,
  Conversation,
} from "@chatscope/chat-ui-kit-react";
function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am a Trip Planner",
      sender: "",
    },
  ]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarStyle, setSidebarStyle] = useState({});
  const [chatContainerStyle, setChatContainerStyle] = useState({});
  const [conversationContentStyle, setConversationContentStyle] = useState({});
  const [conversationAvatarStyle, setConversationAvatarStyle] = useState({});

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing",
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setTyping(true);
    await MessageToTripCHAT(newMessages);
  };
  async function MessageToTripCHAT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "TripCHAT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });
    const systemMessage = {
      role: "system",
      content:
        "I am giving you a location and you have to plan my trip for 7 days highlighting the best visitor places of the location.Show the output in proper formatted manner with bullet point and in English language",
    };
    const apiBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages],
      temperature: 0.7,
    };
    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "TripCHAT",
          },
        ]);
        setTyping(false);
      });
  }

  const handleBackClick = () => setSidebarVisible(!sidebarVisible);

  const handleConversationClick = useCallback(() => {
    if (sidebarVisible) {
      setSidebarVisible(false);
    }
  }, [sidebarVisible, setSidebarVisible]);
  useEffect(() => {
    if (sidebarVisible) {
      setSidebarStyle({
        display: "flex",
        flexBasis: "auto",
        width: "100%",
        maxWidth: "100%",
      });
      setConversationContentStyle({
        display: "flex",
      });
      setConversationAvatarStyle({
        marginRight: "1em",
      });
      setChatContainerStyle({
        display: "none",
      });
    } else {
      setSidebarStyle({});
      setConversationContentStyle({});
      setConversationAvatarStyle({});
      setChatContainerStyle({});
    }
  }, [
    sidebarVisible,
    setSidebarVisible,
    setConversationContentStyle,
    setConversationAvatarStyle,
    setSidebarStyle,
    setChatContainerStyle,
  ]);

  return (
    // <div className="App">
    // <div style={{position: "relative",height: "500px",width: "500px"}}>
    //   <MainContainer>
    //    <ChatContainer>

    //    </ChatContainer>
    //   </MainContainer>
    //   </div>
    // </div>
    <div
      style={{
        height: "100vh",
        position: "relative",
      }}
    >
      <MainContainer responsive>
        <Sidebar position="left" scrollable={false} style={sidebarStyle}>
          <ConversationList>
            <Conversation onClick={handleConversationClick}>
              <Avatar
                src="https://cdn-icons-png.flaticon.com/512/10479/10479785.png"
                name="Bot"
                status="available"
                style={conversationAvatarStyle}
              />
              <Conversation.Content
                name="Bot"
                info="I can plan your trip"
                style={conversationContentStyle}
              />
            </Conversation>
          </ConversationList>
        </Sidebar>
        <ChatContainer style={chatContainerStyle}>
          <ConversationHeader>
            <ConversationHeader.Back onClick={handleBackClick} />
            <Avatar
              src="https://cdn-icons-png.flaticon.com/512/10479/10479785.png"
              name="Bot"
            />
            <ConversationHeader.Content userName="Bot" info="" />
          </ConversationHeader>
          <MessageList
            scrollBehavior="smooth"
            typingIndicator={
              typing ? (
                <TypingIndicator content="Trip Planner is Typing...." />
              ) : null
            }
          >
            {messages.map((message, i) => {
              return <Message key={i} model={message} />;
            })}
          </MessageList>
          <MessageInput
            placeholder="Type Country/State Name here"
            onSend={handleSend}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}

export default App;
