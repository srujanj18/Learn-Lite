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
import { Flame } from "lucide-react";
import { onAuthStateChanged, reload, signOut } from "firebase/auth";

const shouldForceSignOut = (error) => {
  const message = `${error?.message || ""} ${error?.customData?._serverResponse || ""}`.toLowerCase();

  return (
    error?.code === "auth/user-not-found" ||
    error?.code === "auth/user-token-expired" ||
    error?.code === "auth/invalid-user-token" ||
    (error?.code === "auth/network-request-failed" &&
      typeof navigator !== "undefined" &&
      navigator.onLine &&
      message.includes("user_not_found"))
  );
};

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        await reload(nextUser);
        setUser(auth.currentUser);
      } catch (error) {
        if (shouldForceSignOut(error)) {
          await signOut(auth);
          setUser(null);
        } else {
          setUser(nextUser);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glow-box lava-border flex w-full max-w-sm flex-col items-center gap-4 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#FF3B00] to-[#FF6A00] text-white shadow-[0_0_35px_rgba(255,60,0,0.35)]">
            <Flame className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Loading workspace</h2>
            <p className="mt-2 text-sm text-[rgba(237,237,237,0.65)]">Preparing the redesigned LearnLite environment.</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#FF3B00] to-[#FF6A00]" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const ErrorBoundary = () => (
  <div className="flex min-h-screen items-center justify-center px-4">
    <div className="glow-box lava-border w-full max-w-xl p-10 text-center">
      <p className="eyebrow mx-auto">System Notice</p>
      <h2 className="mt-5 text-4xl font-bold text-white">Something interrupted the interface</h2>
      <p className="mx-auto mt-4 max-w-md text-[rgba(237,237,237,0.68)]">
        The workspace hit an unexpected state. You can safely return home and continue from there.
      </p>
      <a href="/" className="btn-primary mt-8 inline-flex">Return to Home</a>
    </div>
  </div>
);

const router = createBrowserRouter(
  [
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        { index: true, element: <Home /> },
        { path: "chat", element: <Chat /> },
        { path: "saved-chats", element: <SavedChats /> },
        { path: "image-generation", element: <ImageGeneration /> },
        { path: "document-analysis", element: <DocumentAnalysis /> },
        { path: "document-mining", element: <DocumentMining /> },
        { path: "settings", element: <Settings /> },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  },
);

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
