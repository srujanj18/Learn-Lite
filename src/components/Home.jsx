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
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Learning",
    description:
      "Advanced AI powered by Gemini to help you understand complex topics through natural, intelligent conversations.",
  },
  {
    icon: ImageIcon,
    title: "Image Generation",
    description:
      "Generate high-quality images from text prompts using state-of-the-art diffusion models.",
  },
  {
    icon: FileText,
    title: "Document Mining & Analysis",
    description:
      "Extract insights from CSV, Excel, and JSON files with AI-powered analysis.",
  },
  {
    icon: MessageSquare,
    title: "Interactive Chat",
    description:
      "Engage in real-time AI conversations for explanations, answers, and learning support.",
  },
];

const Home = () => {
  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-20 space-y-6"
      >
        <div className="flex justify-center">
          <div className="
            p-6 rounded-full
            bg-gradient-to-br from-indigo-600 to-blue-600
            shadow-xl shadow-indigo-700/50
          ">
            <Bot className="h-20 w-20 text-slate-900" />
          </div>
        </div>

        <h1 className="
          text-4xl md:text-6xl font-bold
          bg-gradient-to-r from-indigo-400 to-blue-400
          bg-clip-text text-transparent
        ">
          LearnLite
        </h1>

        <p className="text-lg md:text-xl text-indigo-200 max-w-2xl mx-auto">
          Your AI-powered learning assistant for smarter, faster, and more
          interactive education.
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <Link to="/chat">
            <Button
              size="lg"
              className="
                bg-gradient-to-r from-indigo-600 to-blue-600
                hover:from-indigo-500 hover:to-blue-500
                text-slate-900
                shadow-lg shadow-indigo-700/50
              "
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Start Learning
            </Button>
          </Link>

          <Link to="/document-analysis">
            <Button
              size="lg"
              variant="outline"
              className="
                bg-gradient-to-r from-indigo-600 to-blue-600
                hover:from-indigo-500 hover:to-blue-500
                text-slate-900
                shadow-lg shadow-indigo-700/50
              "
            >
              <FileText className="mr-2 h-5 w-5" />
              Analyze Documents
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-12">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="
              p-6 rounded-2xl
              bg-slate-950
              border border-indigo-700/40
              shadow-lg shadow-indigo-900/40
              hover:shadow-indigo-700/50
              transition-all
            "
          >
            <div className="
              w-14 h-14 rounded-xl
              bg-gradient-to-br from-indigo-600 to-blue-600
              flex items-center justify-center
              mb-4
            ">
              <feature.icon className="h-7 w-7 text-slate-900" />
            </div>

            <h3 className="
              text-xl font-semibold mb-2
              bg-gradient-to-r from-indigo-400 to-blue-400
              bg-clip-text text-transparent
            ">
              {feature.title}
            </h3>

            <p className="text-indigo-300 text-sm">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Benefits */}
      <div className="py-16">
        <div className="text-center mb-12">
          <div className="
            w-20 h-20 mx-auto rounded-full
            bg-gradient-to-br from-indigo-600 to-blue-600
            flex items-center justify-center
            shadow-lg shadow-indigo-700/50
            mb-4
          ">
            <Sparkles className="h-10 w-10 text-slate-900" />
          </div>

          <h2 className="
            text-3xl font-bold
            bg-gradient-to-r from-indigo-400 to-blue-400
            bg-clip-text text-transparent
          ">
            Why Choose LearnLite?
          </h2>

          <p className="text-indigo-300 mt-2 max-w-xl mx-auto">
            Experience next-generation learning powered by artificial
            intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: "Fast & Efficient", text: "Instant AI responses and insights." },
            { icon: Brain, title: "Smart Learning", text: "AI adapts to your learning style." },
            { icon: Lock, title: "Secure & Private", text: "Your data stays protected." },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="
                p-6 rounded-2xl text-center
                bg-slate-950
                border border-indigo-700/40
                shadow-lg shadow-indigo-900/40
              "
            >
              <div className="
                w-14 h-14 mx-auto rounded-full
                bg-gradient-to-br from-indigo-600 to-blue-600
                flex items-center justify-center
                mb-4
              ">
                <item.icon className="h-7 w-7 text-slate-900" />
              </div>

              <h3 className="
                text-lg font-semibold mb-2
                bg-gradient-to-r from-indigo-400 to-blue-400
                bg-clip-text text-transparent
              ">
                {item.title}
              </h3>

              <p className="text-indigo-300 text-sm">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center py-20"
      >
        <div className="
          p-10 rounded-3xl
          bg-slate-950
          border border-indigo-700/40
          shadow-xl shadow-indigo-900/50
        ">
          <h2 className="
            text-3xl font-bold mb-4
            bg-gradient-to-r from-indigo-400 to-blue-400
            bg-clip-text text-transparent
          ">
            Ready to Start Learning?
          </h2>

          <p className="text-indigo-300 mb-6 max-w-2xl mx-auto">
            Chat with AI, analyze documents, and generate images — all in one
            intelligent platform.
          </p>

          <Link to="/chat">
            <Button
              size="lg"
              className="
                bg-gradient-to-r from-indigo-600 to-blue-600
                hover:from-indigo-500 hover:to-blue-500
                text-slate-900
                shadow-lg shadow-indigo-700/50
              "
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Get Started Now
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
