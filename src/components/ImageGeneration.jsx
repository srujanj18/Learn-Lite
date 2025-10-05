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
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
        description: "Please enter a prompt to generate an image",
        variant: "destructive",
      });
      return;
    }

    if (!import.meta.env.VITE_HUGGINGFACE_API_KEY) {
      toast({
        title: "Configuration Error",
        description: "API key is not configured. Please check your environment variables.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`
          },
          body: JSON.stringify({
            inputs: trimmedPrompt,
            options: {
              wait_for_model: true,
              use_cache: false
            }
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setGeneratedImage(imageUrl);

      // Save image data to Firestore
      const imageData = {
        prompt: trimmedPrompt,
        imageUrl,
        timestamp: new Date().toISOString()
      };
      await saveImageGeneration(auth.currentUser.uid, imageData);

      toast({
        title: "Success",
        description: "Image generated successfully!",
      });
    } catch (error) {
      setError(error.message);
      toast({
        title: "Generation Error",
        description: error.message || "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "Image downloaded successfully!",
    });
  };

  const handleReset = () => {
    setPrompt("");
    setGeneratedImage(null);
    setError(null);
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        AI Image Generation
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="rounded-xl border-2 bg-card p-6 shadow-lg">
          <div className="space-y-4">
            <div className="relative">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="w-full min-h-[100px] resize-none p-4 text-base"
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
              />
              <div className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                {prompt.length} characters
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleGenerate}
                className="flex-1"
                disabled={loading || !prompt.trim()}
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
                  className="px-3"
                  title="Reset"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div
            ref={containerRef}
            className="mt-6 min-h-[300px] rounded-xl border-2 border-dashed p-4 flex items-center justify-center"
          >
            {!generatedImage && !loading && !error && (
              <div className="text-center text-muted-foreground">
                <ImageIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>Your generated image will appear here</p>
              </div>
            )}

            {loading && (
              <div className="text-center text-muted-foreground">
                <Loader2 className="mx-auto h-12 w-12 mb-2 animate-spin" />
                <p>Generating your image...</p>
              </div>
            )}

            {error && (
              <div className="text-center text-destructive">
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {generatedImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full"
              >
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="rounded-lg shadow-lg mx-auto max-w-full h-auto"
                />
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Image
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ImageGeneration;