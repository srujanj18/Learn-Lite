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

  setLoading(true);

  try {
    const response = await fetch("http://localhost:8000/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: trimmedPrompt,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Image generation failed");
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    setGeneratedImage(imageUrl);

    // Save to Firestore
    await saveImageGeneration(auth.currentUser.uid, {
      prompt: trimmedPrompt,
      imageUrl,
      timestamp: new Date().toISOString(),
    });

    toast({
      title: "Success",
      description: "Image generated successfully!",
    });

  } catch (error) {
    setError(error.message);
    toast({
      title: "Generation Error",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
