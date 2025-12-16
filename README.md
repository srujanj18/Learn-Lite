# Learn Lite AI

A comprehensive AI-powered learning platform with document analysis, image generation, and interactive chat features.

## Features

- **AI-Powered Chat**: Engage in natural conversations with advanced AI models
- **Document Analysis**: Upload and analyze documents with AI-powered summarization
- **Image Generation**: Create stunning visuals using Stable Diffusion XL
- **Document Mining**: Extract insights from CSV, Excel, and JSON files
- **Saved Chats**: Keep track of your conversations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **User Authentication**: Secure Firebase-based authentication
- **Real-time Collaboration**: Firebase-powered real-time features

## AI Models & APIs Used

### Primary AI Models
- **Groq API**: Fast inference for chat and document summarization
  - Model: `llama3-8b-8192` (for summarization)
  - Model: `openai/gpt-oss-120b` (for general chat)
- **Google Gemini AI**: Advanced generative AI for conversational interactions
- **Stable Diffusion XL**: High-quality image generation from text prompts

### Legacy/Alternative Models
- **Hugging Face BART**: Previously used for document summarization (replaced by Groq)
- **Facebook BART Large CNN**: Sequence-to-sequence model for text summarization

## Technologies Used

### Frontend
- **React 18**: Modern JavaScript library for building user interfaces
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Framer Motion**: Animation library for smooth transitions
- **Lucide React**: Beautiful icon library
- **React Router**: Client-side routing
- **PostCSS**: CSS processing tool

### Backend & APIs
- **FastAPI**: Modern Python web framework for the AI backend
- **Firebase**:
  - **Authentication**: User management and security
  - **Firestore**: NoSQL database for user data and chat storage
  - **Cloud Functions**: Serverless backend logic
  - **Hosting**: Web hosting for the frontend
- **Python Libraries**:
  - **Transformers**: Hugging Face library for NLP models
  - **Torch**: PyTorch for deep learning
  - **Pillow**: Image processing
  - **XLSX**: Excel file processing
  - **PyPDF2**: PDF text extraction

### Development Tools
- **TypeScript**: Type-safe JavaScript for Firebase functions
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Firebase CLI**: Firebase project management

## Project Structure

```
learn-lite-ai/
├── src/                          # Frontend React application
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   ├── Chat.jsx              # AI chat interface
│   │   ├── DocumentAnalysis.jsx  # Document analysis (JSX)
│   │   ├── DocumentAnalysis.tsx  # Document analysis (TSX)
│   │   ├── ImageGeneration.jsx   # Image generation
│   │   ├── Home.jsx              # Landing page
│   │   ├── Login.jsx             # Authentication
│   │   ├── Settings.jsx          # User settings
│   │   ├── SavedChats.jsx        # Chat history
│   │   └── Layout.jsx            # Main layout with responsive sidebar
│   ├── lib/
│   │   ├── auth.js               # Firebase authentication
│   │   ├── firebase.js           # Firebase configuration
│   │   ├── gemini.js             # Gemini AI integration
│   │   ├── groq.js               # Groq API integration
│   │   ├── chatStorage.js        # Chat persistence
│   │   ├── firestoreService.js   # Firestore operations
│   │   └── profileService.js     # User profile management
│   └── App.jsx                   # Main application component
├── functions/                    # Firebase Cloud Functions
│   └── src/
│       ├── documentAnalysis.js   # Document processing functions
│       └── index.ts              # Main functions entry point
├── learn-lite-ai/               # Python backend (FastAPI)
│   ├── main.py                   # FastAPI server
│   ├── summarize.py              # Document summarization logic
│   └── image_generation.py       # Image generation backend
├── public/                       # Static assets
├── dataconnect/                  # Firebase Data Connect
├── requirements.tsx              # System requirements documentation
└── README.md                     # This file
```

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Firebase CLI** (latest version)
- **Git** (latest version)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/learn-lite-ai.git
   cd learn-lite-ai
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd learn-lite-ai
   pip install -r requirements.txt
   cd ..
   ```

4. **Install Firebase functions dependencies**
   ```bash
   cd functions
   npm install
   cd ..
   ```

### Firebase Setup

1. **Create a Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project

2. **Enable required services**
   - Authentication (Email/Password)
   - Firestore Database
   - Storage (optional)
   - Hosting

3. **Initialize Firebase in your project**
   ```bash
   firebase init
   ```
   Select: Firestore, Functions, Hosting, and Emulators

4. **Link to your Firebase project**
   ```bash
   firebase use --add
   ```

### Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# AI API Keys
VITE_GROQ_API_KEY=your_groq_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key

# Optional: Image Generation API
VITE_STABLE_DIFFUSION_API_KEY=your_stable_diffusion_key
```

### API Key Setup

1. **Groq API**: Get your API key from [Groq Console](https://console.groq.com/)
2. **Google Gemini**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. **Hugging Face**: Get your API key from [Hugging Face](https://huggingface.co/settings/tokens)
4. **Stable Diffusion**: Use a compatible API service (optional)

## Running the Application

### Development Mode

1. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   Access at: `http://localhost:5173`

2. **Start the Python backend**
   ```bash
   cd learn-lite-ai
   python main.py
   ```
   API available at: `http://localhost:8000`

3. **Start Firebase emulators (optional)**
   ```bash
   firebase emulators:start
   ```

### Production Deployment

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

## API Endpoints

### Backend (FastAPI)

- `POST /analyze` - Analyze document content and generate summary
- `POST /chat` - Chat with analyzed documents
- `POST /generate-image` - Generate images from text prompts

### Frontend Routes

- `/` - Home page with feature overview
- `/chat` - AI chat interface
- `/document-analysis` - Document upload and analysis
- `/image-generation` - AI image generation
- `/saved-chats` - Chat history and management
- `/settings` - User preferences and profile
- `/login` - User authentication

## AI Model Details

### Groq API Integration
- **Primary Use**: Fast document summarization and general chat
- **Models Used**:
  - `llama3-8b-8192`: Optimized for summarization tasks
  - `openai/gpt-oss-120b`: General-purpose conversational AI
- **Advantages**: High-speed inference, cost-effective

### Google Gemini AI
- **Primary Use**: Advanced conversational interactions
- **Features**: Multi-modal capabilities, context awareness
- **Integration**: Real-time chat responses with memory

### Stable Diffusion XL
- **Primary Use**: High-quality image generation
- **Capabilities**: Text-to-image conversion, style transfer
- **Backend**: Python-based image processing pipeline

### Legacy Models (Maintained for Compatibility)
- **BART Large CNN**: Traditional summarization model
- **Hugging Face Transformers**: General NLP processing

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and structure
- Add proper TypeScript types for new components
- Update documentation for new features
- Test your changes thoroughly
- Ensure responsive design works on all devices

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Ensure all required API keys are set in `.env.local`
   - Check API key validity and permissions

2. **Firebase Connection Issues**
   - Verify Firebase project configuration
   - Check Firestore security rules

3. **Python Backend Issues**
   - Ensure all Python dependencies are installed
   - Check Python version compatibility

4. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for TypeScript errors: `npm run type-check`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Groq](https://groq.com/) for fast AI inference
- [Google Gemini](https://ai.google.dev/) for advanced AI capabilities
- [Stability AI](https://stability.ai/) for image generation
- [Hugging Face](https://huggingface.co/) for NLP models
- [Firebase](https://firebase.google.com/) for backend infrastructure
- [React](https://reactjs.org/) for the frontend framework
- [FastAPI](https://fastapi.tiangolo.com/) for the Python backend

---

Built with ❤️ for the future of AI-powered learning
