import React, { useEffect, useState } from 'react';
import { Auth } from './components/Auth';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { useStore } from './store';
import { MessageSquare, LogOut, Menu, X } from 'lucide-react';
import { ChatList } from './components/ChatList';

function App() {
  const [error, setError] = useState<string>();
  const [showSidebar, setShowSidebar] = useState(true);
  const { messages, currentUser, initialize, loginUser, registerUser, logoutUser, addMessage, currentRoom } = useStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleLogin = (username: string, password: string) => {
    const result = loginUser(username, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  const handleRegister = (username: string, password: string) => {
    const result = registerUser(username, password);
    if (result.success) {
      handleLogin(username, password);
    } else {
      setError(result.error);
    }
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} onRegister={handleRegister} error={error} />;
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <div 
        className={`${showSidebar ? 'w-80 md:w-64 opacity-100' : 'w-0 opacity-0'} 
          transition-all duration-300 ease-in-out fixed md:relative z-30 h-full overflow-hidden`}
      >
        <div className={`h-full ${!showSidebar && 'invisible'}`}>
          <ChatList />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-gray-800 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
                title={showSidebar ? "Hide sidebar" : "Show sidebar"}
              >
                {showSidebar ? (
                  <X className="w-6 h-6 text-gray-400" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-400" />
                )}
              </button>
              <div className="p-2 bg-indigo-600 rounded-full">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Oati Chat</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Logged in as <span className="font-semibold">{currentUser.username}</span>
              </span>
              <button
                onClick={logoutUser}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentRoom ? (
            messages
              .filter(m => m.roomId === currentRoom)
              .map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isCurrentUser={currentUser.username === message.sender}
                />
              ))
          ) : (
            <div className="text-center text-gray-400 mt-8">
              Select a chat to start messaging
            </div>
          )}
        </div>

        {currentRoom && <ChatInput onSendMessage={addMessage} />}
      </div>

      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
}

export default App;