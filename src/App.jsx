
import React, { useEffect, useState } from "react";
import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ToastContextProvider } from "@/components/ui/ToastContext";
import Home from "@/components/Home";
import Chat from "@/components/Chat";
import SavedChats from "@/components/SavedChats";
import ImageGeneration from "@/components/ImageGeneration";
import DocumentAnalysis from "@/components/DocumentAnalysis";
import DocumentMining from "@/components/DocumentMining";
import Settings from "@/components/Settings";
import Login from "@/components/Login";
import { auth } from "@/lib/firebase";

import { onAuthStateChanged } from "firebase/auth";

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const ErrorBoundary = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
        <p className="text-gray-600 mb-4">We're sorry for the inconvenience. Please try again later.</p>
        <a href="/" className="text-blue-500 hover:text-blue-600 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/",
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "chat",
        element: <Chat />
      },
      {
        path: "saved-chats",
        element: <SavedChats />
      },
      {
        path: "image-generation",
        element: <ImageGeneration />
      },
      {
        path: "document-analysis",
        element: <DocumentAnalysis />
      },
      {
        path: "document-mining",
        element: <DocumentMining />
      },
      {
        path: "settings",
        element: <Settings />
      }
    ],
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

function App() {
  return (
    <ToastContextProvider>
      <LanguageProvider>
        <RouterProvider router={router} />
        <Toaster />
      </LanguageProvider>
    </ToastContextProvider>
  );
}

export default App;
