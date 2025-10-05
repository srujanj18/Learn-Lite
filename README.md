# Learn-Lite

Learn-Lite is an AI-powered learning assistant platform designed to make education interactive, engaging, and personalized. It leverages advanced AI technologies including Gemini, Stable Diffusion XL, and various AI models to provide a comprehensive learning experience through natural conversations, document analysis, image generation, and intelligent chat assistance.

## Features

- **AI-Powered Learning:** Advanced AI technology powered by Gemini to help users learn and understand complex topics through natural conversations.
- **Image Generation:** Create stunning visuals using Stable Diffusion XL by transforming text descriptions into high-quality images.
- **Document Mining & Analysis:** Extract insights from CSV, Excel, and JSON files with advanced data visualization and AI-powered pattern recognition.
- **Interactive Chat:** Engage in natural conversations with AI to get instant answers, explanations, and personalized learning assistance.
- **Secure & Private:** User data is protected and kept private.
- **Fast & Efficient:** Instant answers and analysis for learning needs.
- **Smart Learning:** Adaptive AI that understands individual learning styles.

## Project Structure

- `src/` - Contains the React frontend source code.
  - `components/` - React components for different parts of the application such as Chat, Home, Document Analysis, Image Generation, Settings, etc.
  - `lib/` - Utility libraries including Firebase integration, authentication, chat storage, and AI service wrappers.
  - `App.jsx` - Main application component with routing and authentication protection.
- `functions/` - Backend cloud functions (likely Firebase Functions) for server-side logic.
- `dataconnect/` and `dataconnect-generated/` - Configuration and generated code for data connectors.
- `public/` - Static public assets.
- Configuration files for Firebase, Tailwind CSS, Vite, and other tools.

## Technologies Used

- React 18 with React Router for frontend UI and routing.
- Firebase for authentication and backend services.
- Tailwind CSS for styling.
- Vite as the build tool.
- AI integrations including Google Generative AI, Hugging Face, OpenAI, and Tesseract.js for OCR.
- Radix UI components for accessible UI primitives.
- Various utility libraries like Axios, date-fns, and Recharts for charts.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/srujanj18/Learn-Lite.git
   cd Learn-Lite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` (or the port Vite specifies).

## Usage

- Register or log in to access the platform.
- Use the chat feature for interactive AI-powered learning.
- Upload and analyze documents in various formats.
- Generate images from text descriptions.
- Save chats and manage settings through the user interface.

## Contributing

Contributions are welcome! Please fork the repository and submit pull requests for any improvements or bug fixes.

## License

This project is private and not licensed for public use.
