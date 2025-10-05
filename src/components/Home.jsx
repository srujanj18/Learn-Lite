
import React from "react";
import { motion } from "framer-motion";
import { 
  Brain, 
  Image as ImageIcon, 
  FileText, 
  MessageSquare, 
  Sparkles,
  Bot,
  Zap,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Learning",
    description: "Advanced AI technology powered by Gemini to help you learn and understand complex topics through natural conversations"
  },
  {
    icon: ImageIcon,
    title: "Image Generation",
    description: "Create stunning visuals using Stable Diffusion XL, transforming your text descriptions into high-quality images"
  },
  {
    icon: FileText,
    title: "Document Mining & Analysis",
    description: "Extract insights from CSV, Excel, and JSON files with advanced data visualization and AI-powered pattern recognition"
  },
  {
    icon: MessageSquare,
    title: "Interactive Chat",
    description: "Engage in natural conversations with AI to get instant answers, explanations, and personalized learning assistance"
  }
];

const Home = () => {
  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 space-y-6"
      >
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="gradient-primary p-6 rounded-full inline-block"
        >
          <Bot className="h-20 w-20 text-white" />
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-bold gradient-text">
          Welcome to LearnLite
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your AI-powered learning assistant that makes education interactive, 
          engaging, and personalized.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/chat">
            <Button size="lg" variant="gradient" className="gap-2">
              <MessageSquare className="h-5 w-5" />
              Start Learning
            </Button>
          </Link>
          <Link to="/document-analysis">
            <Button size="lg" variant="outline" className="gap-2 gradient-hover">
              <FileText className="h-5 w-5" />
              Analyze Documents
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 py-12"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="rounded-lg gradient-card gradient-border p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="gradient-primary w-16 h-16 rounded-lg flex items-center justify-center mb-4">
              <feature.icon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 gradient-text">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Benefits Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="py-12"
      >
        <div className="text-center mb-12">
          <div className="gradient-secondary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4 gradient-text">Why Choose LearnLite?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the future of learning with our cutting-edge AI technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center p-6 gradient-card gradient-border rounded-lg"
          >
            <div className="gradient-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 gradient-text">Fast & Efficient</h3>
            <p className="text-muted-foreground">
              Get instant answers and analysis for your learning needs
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center p-6 gradient-card gradient-border rounded-lg"
          >
            <div className="gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 gradient-text">Smart Learning</h3>
            <p className="text-muted-foreground">
              Adaptive AI that understands your learning style
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center p-6 gradient-card gradient-border rounded-lg"
          >
            <div className="gradient-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 gradient-text">Secure & Private</h3>
            <p className="text-muted-foreground">
              Your data is always protected and private
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center py-16"
      >
        <div className="rounded-lg gradient-card gradient-border p-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-4 gradient-text">Ready to Start Learning?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Experience the power of AI-driven learning with document analysis, image generation, and intelligent chat assistance - all in one platform
          </p>
          <Link to="/chat">
            <Button size="lg" variant="gradient" className="gap-2">
              <MessageSquare className="h-5 w-5" />
              Get Started Now
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
