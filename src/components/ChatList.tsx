import React from 'react';
import { Users, MessageSquare } from 'lucide-react';
import { useStore } from '../store';

export const ChatList: React.FC = () => {
  const { rooms, users, currentUser, currentRoom, setCurrentRoom, createRoom } = useStore();

  const handleCreatePrivateChat = (userId: string) => {
    createRoom('private', [userId]);
  };

  const handleCreateGroupChat = () => {
    const name = prompt('Enter group name:');
    if (name) {
      // For simplicity, creating a group with all users
      const otherUsers = users.filter(u => u.id !== currentUser?.id);
      createRoom('group', otherUsers.map(u => u.id), name);
    }
  };

  return (
    <div className="w-full h-full bg-gray-800 p-4 border-r border-gray-700 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Chats</h2>
        <button
          onClick={handleCreateGroupChat}
          className="p-2 rounded-full hover:bg-gray-700"
          title="Create Group"
        >
          <Users className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="space-y-2">
        {rooms.map(room => {
          const otherUser = room.type === 'private'
            ? users.find(u => u.id !== currentUser?.id && room.participants.includes(u.id))
            : null;

          return (
            <button
              key={room.id}
              onClick={() => setCurrentRoom(room.id)}
              className={`w-full p-3 rounded-xl flex items-center space-x-3 ${
                currentRoom === room.id ? 'bg-indigo-600' : 'hover:bg-gray-700'
              }`}
            >
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <span className="text-white">
                {room.type === 'private' ? otherUser?.username : room.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Users</h3>
        {users
          .filter(u => u.id !== currentUser?.id)
          .map(user => (
            <button
              key={user.id}
              onClick={() => handleCreatePrivateChat(user.id)}
              className="w-full p-2 rounded-lg flex items-center space-x-3 hover:bg-gray-700"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-white text-sm">{user.username[0].toUpperCase()}</span>
              </div>
              <span className="text-white">{user.username}</span>
            </button>
          ))}
      </div>
    </div>
  );
}; 