import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Loader2, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/firebase";
import { saveImageGeneration } from "@/lib/firestoreService";

const ImageGeneration = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && generatedImage) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [generatedImage]);

  const handleGenerate = async () => {
    const trimmedPrompt = prompt.trim();
    setError(null);

    if (!auth.currentUser) {
      toast({
        title: "Error",
        description: "Please sign in to generate images",
        variant: "destructive",
      });
      return;
    }

    if (!trimmedPrompt) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmedPrompt }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Image generation failed");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setGeneratedImage(imageUrl);

      await saveImageGeneration(auth.currentUser.uid, {
        prompt: trimmedPrompt,
        imageUrl,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Image generated successfully!",
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: "Generation Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded",
      description: "Image downloaded successfully",
    });
  };

  const handleReset = () => {
    setPrompt("");
    setGeneratedImage(null);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div
          className="
            mx-auto mb-4 w-20 h-20 rounded-full
            bg-gradient-to-br from-indigo-600 to-blue-600
            flex items-center justify-center
            shadow-lg shadow-indigo-700/50
          "
        >
          <ImageIcon className="h-10 w-10 text-slate-900" />
        </div>

        <h1
          className="
            text-3xl md:text-5xl font-bold
            bg-gradient-to-r from-indigo-400 to-blue-400
            bg-clip-text text-transparent
          "
        >
          AI Image Generation
        </h1>

        <p className="text-indigo-300 mt-2">
          Generate stunning images using AI-powered diffusion models
        </p>
      </motion.div>

      {/* Prompt Card */}
      <div
        className="
          p-6 rounded-3xl
          bg-slate-950
          border border-indigo-700/40
          shadow-xl shadow-indigo-900/40
          space-y-6
        "
      >
        {/* Prompt Input */}
        <div className="relative">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="
              min-h-[100px] w-full
              bg-slate-900 text-indigo-200
              border border-indigo-700/40
              focus:ring-2 focus:ring-indigo-500
              px-4 py-3
            "
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && handleGenerate()
            }
          />
          <div className="absolute bottom-2 right-3 text-xs text-indigo-400">
            {prompt.length} chars
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="
              bg-gradient-to-r from-indigo-600 to-blue-600
              hover:from-indigo-500 hover:to-blue-500
              text-slate-900
              shadow-lg shadow-indigo-700/50
            "
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Generate Image
              </>
            )}
          </Button>

          {generatedImage && (
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-indigo-600 text-indigo-300 hover:bg-indigo-900/40"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        {/* Result Area */}
        <div
          ref={containerRef}
          className="
            min-h-[320px]
            border-2 border-dashed border-indigo-700/40
            rounded-2xl
            flex items-center justify-center
            p-6
          "
        >
          {!generatedImage && !loading && !error && (
            <div className="text-indigo-400 text-center">
              <ImageIcon className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>Your generated image will appear here</p>
            </div>
          )}

          {loading && (
            <div className="text-indigo-400 text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin mb-2" />
              <p>Generating image...</p>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-center">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {generatedImage && (
            <div className="w-full text-center">
              <img
                src={generatedImage}
                alt="Generated"
                className="rounded-xl shadow-lg mx-auto max-w-full"
              />

              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="
                    border-indigo-600 text-indigo-300
                    hover:bg-indigo-900/40
                  "
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Image
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGeneration;
