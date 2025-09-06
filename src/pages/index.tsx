import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { WhiteboardApp } from "@/components/WhiteboardApp";
import { generateId } from "@/lib/utils";

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [whiteboardId, setWhiteboardId] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if we have URL parameters for direct whiteboard access
    const { id, user, name } = router.query;

    if (id) {
      setWhiteboardId(id as string);

      if (user && name) {
        setUserId(user as string);
        setUserName(name as string);
      } else {
        // Generate a new user ID if not provided
        const storedUserId = localStorage.getItem("whiteboard_user_id");
        const storedUserName = localStorage.getItem("whiteboard_user_name");

        if (storedUserId && storedUserName) {
          setUserId(storedUserId);
          setUserName(storedUserName);
        } else {
          const newUserId = generateId();
          const newUserName = `User ${newUserId.substr(0, 6)}`;
          setUserId(newUserId);
          setUserName(newUserName);
          localStorage.setItem("whiteboard_user_id", newUserId);
          localStorage.setItem("whiteboard_user_name", newUserName);
        }
      }
      setIsInitialized(true);
    } else {
      // Generate a new user ID if not provided
      const storedUserId = localStorage.getItem("whiteboard_user_id");
      const storedUserName = localStorage.getItem("whiteboard_user_name");

      if (storedUserId && storedUserName) {
        setUserId(storedUserId);
        setUserName(storedUserName);
      } else {
        const newUserId = generateId();
        const newUserName = `User ${newUserId.substr(0, 6)}`;
        setUserId(newUserId);
        setUserName(newUserName);
        localStorage.setItem("whiteboard_user_id", newUserId);
        localStorage.setItem("whiteboard_user_name", newUserName);
      }
    }
  }, [router.query]);

  const handleCreateWhiteboard = () => {
    const newWhiteboardId = generateId();
    setWhiteboardId(newWhiteboardId);
    setIsInitialized(true);
  };

  const handleJoinWhiteboard = (id: string) => {
    setWhiteboardId(id);
    setIsInitialized(true);
  };

  const handleBackToHome = () => {
    setIsInitialized(false);
    setWhiteboardId("");
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Collaborative Whiteboard
            </h1>
            <p className="text-gray-600">
              Draw, collaborate, and create together in real-time
            </p>
          </div>

          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Your Profile
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      localStorage.setItem(
                        "whiteboard_user_name",
                        e.target.value
                      );
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={userId}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleCreateWhiteboard}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
              >
                Create New Whiteboard
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <JoinWhiteboardForm onJoin={handleJoinWhiteboard} />
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Features</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Real-time collaborative drawing</li>
              <li>• Multiple drawing tools (pen, eraser, highlighter)</li>
              <li>• Live cursor tracking</li>
              <li>• Persistent whiteboard state</li>
              <li>• Responsive design</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <WhiteboardApp
      whiteboardId={whiteboardId}
      userId={userId}
      userName={userName}
    />
  );
}

interface JoinWhiteboardFormProps {
  onJoin: (id: string) => void;
}

function JoinWhiteboardForm({ onJoin }: JoinWhiteboardFormProps) {
  const [whiteboardId, setWhiteboardId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (whiteboardId.trim()) {
      onJoin(whiteboardId.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        value={whiteboardId}
        onChange={(e) => setWhiteboardId(e.target.value)}
        placeholder="Enter whiteboard ID"
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
      >
        Join Existing Whiteboard
      </button>
    </form>
  );
}
