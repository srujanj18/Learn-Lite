# LearnLite - AI-Powered Learning Assistant

## Overview
LearnLite is an innovative AI-powered learning platform that combines cutting-edge artificial intelligence with an intuitive user interface to enhance the learning experience. Built with modern web technologies, it offers various AI-powered features to assist users in their learning journey.

## Features

### AI Chat
Interactive chat interface powered by advanced language models for:
- Personalized learning assistance
- Question answering
- Concept explanations
- Study guidance

### Document Analysis
Powerful document processing capabilities:
- Text extraction and analysis
- PDF document processing
- Intelligent content summarization
- Key information extraction

### Image Generation
AI-powered image generation features for:
- Visual learning aids
- Concept visualization
- Educational illustrations

### Document Mining
Advanced document mining capabilities for:
- Pattern recognition and analysis
- Data extraction and structuring
- Automated metadata generation
- Intelligent document classification

## Tech Stack

### Frontend
- React.js
- Vite (Build tool)
- TailwindCSS (Styling)
- Radix UI (Component library)
- Framer Motion (Animations)

### Backend & Services
- Firebase (Backend as a Service)
  - Authentication
  - Firestore Database
  - Cloud Functions
  - Storage
- Google Cloud Vision
- Google Generative AI
- OpenAI Integration
- HuggingFace Inference API

### Development Tools
- TypeScript/JavaScript
- ESLint
- PostCSS

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Firebase CLI

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd learn-lite
```

2. Install dependencies
```bash
npm install
```

3. Environment Setup
Create a `.env` file in the root directory and add the following variables (see `.env.example` for reference):
```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# AI Service Keys
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_google_ai_key
HUGGINGFACE_API_KEY=your_huggingface_key
```

4. Start the development server
```bash
npm run dev
```

### Firebase Setup
1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

2. Login to Firebase
```bash
firebase login
```

3. Initialize Firebase project
```bash
firebase init
```

## Project Structure
```
├── src/
│   ├── components/     # React components
│   ├── lib/            # Utility functions and services
│   ├── App.jsx         # Main application component
│   └── main.jsx        # Application entry point
├── public/             # Static assets
├── functions/          # Firebase Cloud Functions
└── dataconnect/        # Data Connect configuration
```

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Firebase Emulators
For local development, you can use Firebase emulators:
```bash
firebase emulators:start
```

## Deployment

1. Build the project
```bash
npm run build
```

2. Deploy to Firebase
```bash
firebase deploy
```

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Thanks to all contributors who have helped shape LearnLite
- Built with support from various open-source communities
- Powered by cutting-edge AI technologies from Google, OpenAI, and HuggingFace