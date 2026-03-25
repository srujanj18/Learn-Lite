import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Image as ImageIcon, FileText, Database, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const tools = [
  {
    icon: MessageSquare,
    title: "Chat with AI",
    description: "Ask questions, upload images, and continue saved conversations.",
    link: "/chat",
  },
  {
    icon: ImageIcon,
    title: "Generate Images",
    description: "Create images from text prompts in a simple studio layout.",
    link: "/image-generation",
  },
  {
    icon: FileText,
    title: "Analyze Documents",
    description: "Upload a file or paste text and get a quick summary.",
    link: "/document-analysis",
  },
  {
    icon: Database,
    title: "Explore Data",
    description: "Upload CSV, Excel, or JSON files and review clean insights.",
    link: "/document-mining",
  },
];

const Home = () => {
  return (
    <div className="page-shell">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div className="hero-copy">
          <p className="eyebrow">Welcome</p>
          <div>
            <h1 className="hero-title">
              Simple tools for <span>learning and productivity</span>
            </h1>
            <p className="hero-text mt-3">
              LearnLite brings chat, image generation, document analysis, and data tools into one clean workspace.
            </p>
          </div>
          <div className="hero-actions">
            <Link to="/chat">
              <Button>
                Open Chat
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/document-analysis">
              <Button variant="outline">Analyze Document</Button>
            </Link>
          </div>
        </div>
      </motion.section>

      <section className="card-grid">
        {tools.map((tool, index) => (
          <motion.div key={tool.title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="content-card panel">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(255,80,0,0.1)] text-[#FF8C42]">
              <tool.icon className="h-5 w-5" />
            </div>
            <h3 className="section-title">{tool.title}</h3>
            <p className="section-copy mt-2">{tool.description}</p>
            <Link to={tool.link} className="mt-5 inline-flex text-sm font-semibold text-[#FF8C42]">
              Open tool
            </Link>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default Home;
