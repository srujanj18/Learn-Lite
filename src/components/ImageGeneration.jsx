import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Loader2, Download, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { auth } from "@/lib/firebase";
import { saveImageGeneration } from "@/lib/firestoreService";

const IMAGE_GENERATION_DRAFT_KEY = "learnlite-image-generation-draft";

const ImageGeneration = () => {
  const savedDraft = (() => {
    try {
      return JSON.parse(localStorage.getItem(IMAGE_GENERATION_DRAFT_KEY) || "null");
    } catch {
      return null;
    }
  })();
  const [prompt, setPrompt] = useState(savedDraft?.prompt || "");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(savedDraft?.generatedImage || null);
  const [error, setError] = useState(savedDraft?.error || null);
  const { toast } = useToast();
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && generatedImage) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [generatedImage]);

  useEffect(() => {
    localStorage.setItem(
      IMAGE_GENERATION_DRAFT_KEY,
      JSON.stringify({
        prompt,
        generatedImage,
        error,
      }),
    );
  }, [prompt, generatedImage, error]);

  const handleGenerate = async () => {
    const trimmedPrompt = prompt.trim();
    setError(null);

    if (!auth.currentUser) {
      toast({ title: "Error", description: "Please sign in to generate images", variant: "destructive" });
      return;
    }

    if (!trimmedPrompt) {
      toast({ title: "Error", description: "Please enter a prompt", variant: "destructive" });
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
      const imageDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      setGeneratedImage(imageDataUrl);

      await saveImageGeneration(auth.currentUser.uid, {
        prompt: trimmedPrompt,
        imageUrl: imageDataUrl,
        timestamp: new Date().toISOString(),
      });

      toast({ title: "Success", description: "Image generated successfully" });
    } catch (err) {
      setError(err.message);
      toast({ title: "Generation Error", description: err.message, variant: "destructive" });
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

    toast({ title: "Downloaded", description: "Image downloaded successfully" });
  };

  const handleReset = () => {
    setPrompt("");
    setGeneratedImage(null);
    setError(null);
    localStorage.removeItem(IMAGE_GENERATION_DRAFT_KEY);
  };

  return (
    <div className="page-shell">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="page-header glow-box lava-border">
        <div className="page-header-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <Sparkles size={14} />
              Image Studio
            </p>
            <div>
              <h1 className="hero-title">
                Generate visuals in a <span>production-style studio</span>
              </h1>
              <p className="hero-text mt-4">
                Write a detailed prompt, render an image, and review the result in a cleaner preview-driven workspace.
              </p>
            </div>
          </div>

          <div className="hero-stats">
            <div className="metric-card">
              <p className="metric-kicker">Prompting</p>
              <p className="metric-value">Text to Image</p>
              <p className="metric-subtext">Describe the scene, mood, style, and details you want rendered.</p>
            </div>
            <div className="metric-card">
              <p className="metric-kicker">Delivery</p>
              <p className="metric-value">Preview First</p>
              <p className="metric-subtext">Review before downloading, and reset quickly for the next concept.</p>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="two-column">
        <div className="content-card panel">
          <h2 className="section-title">Prompt workspace</h2>
          <p className="section-copy mt-2">Use detailed directions for stronger output quality.</p>

          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="textarea-surface mt-6 min-h-[260px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />

          <div className="mt-3 flex items-center justify-between text-sm text-[rgba(237,237,237,0.48)]">
            <span>Be specific about lighting, angle, style, and subject.</span>
            <span>{prompt.length} chars</span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="h-12">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
              {loading ? "Generating" : "Generate Image"}
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={!prompt && !generatedImage && !error}>
              <RefreshCw className="mr-2 h-4 w-4" />
              New Session
            </Button>
          </div>
        </div>

        <div ref={containerRef} className="content-card panel">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="section-title">Render preview</h2>
              <p className="section-copy mt-2">Your generated image appears here after processing.</p>
            </div>
            {generatedImage && (
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
          </div>

          <div className="flex min-h-[420px] items-center justify-center rounded-[26px] border border-[rgba(255,120,50,0.12)] bg-[rgba(255,255,255,0.02)] p-6">
            {!generatedImage && !loading && !error && (
              <div className="empty-state min-h-[320px]">
                <ImageIcon className="h-12 w-12 text-[#FF8C42]" />
                <p className="text-white">No render yet</p>
                <p className="max-w-sm text-sm text-[rgba(237,237,237,0.62)]">Describe the image you want and start generation from the prompt workspace.</p>
              </div>
            )}

            {loading && (
              <div className="empty-state min-h-[320px]">
                <Loader2 className="h-12 w-12 animate-spin text-[#FF8C42]" />
                <p className="text-white">Generating image</p>
                <p className="text-sm text-[rgba(237,237,237,0.62)]">The renderer is building your preview now.</p>
              </div>
            )}

            {error && !loading && (
              <div className="empty-state min-h-[320px]">
                <p className="text-lg font-semibold text-white">Generation failed</p>
                <p className="max-w-sm text-sm text-[rgba(237,237,237,0.62)]">{error}</p>
              </div>
            )}

            {generatedImage && !loading && (
              <img src={generatedImage} alt="Generated" className="max-h-[540px] w-full rounded-[24px] object-contain shadow-[0_20px_60px_rgba(0,0,0,0.35)]" />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ImageGeneration;
