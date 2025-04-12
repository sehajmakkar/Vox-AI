# VOX AI - Multimodal Meeting Assistant

VOX AI is an advanced meeting assistant that uses **multimodal AI** to transform how teams conduct, analyze, and extract value from their meetings. This intelligent assistant **transcribes conversations in real-time**, provides **contextual insights**, and helps teams focus on meaningful discussions while **automating documentation**.

Unlike basic meeting summarizers, VOX AI creates a comprehensive, **searchable knowledge base** from all your meetings. The system allows you to **query specific information** across your entire meeting history, connecting related discussions and surfacing relevant insights exactly when you need them. Every conversation becomes part of your organization's **collective intelligence**, accessible through **natural language queries**.

## 🚀 Features

- **Real-time Transcription**: Convert speech to text during meetings with **high accuracy**
- **AI Insights**: Generate contextual summaries, **action items**, and key points using LLM
- **Vector Search**: Find relevant information from past meetings using **semantic search**
- **Meeting Management**: Schedule, join, and review past meetings in **one place**
- **Multimodal Analysis**: Process both **audio and video** streams to capture context
- **RAG (Retrieval Augmented Generation)**: Enhance AI responses with **context from your meeting history**
- **Knowledge Base**: Not just a basic meeting summarizer - VOX AI creates a **queryable knowledge base** from all your meetings
- **Contextual Queries**: Ask **specific questions** about any meeting and get **precise answers** drawn from your meeting history

## 🏗️ Tech Stack

### Backend
- **Node.js & Express**: RESTful API services
- **MongoDB**: Document database for meeting data and metadata
- **WebRTC**: Real-time audio/video capture
- **Socket.IO**: Real-time communication between clients and server
- **OpenAI Whisper API**: Speech-to-text transcription
- **Gemini API**: LLM for generating insights and responding to queries

### Frontend
- **React**: UI framework
- **Vite**: Fast build tool and development server
- **React Router**: Navigation and routing
- **CSS3**: Styling and responsive design

### RAG System
- **Python Flask**: API server for vector operations
- **ChromaDB**: Vector database for storing and retrieving embeddings
- **LangChain**: Framework for building LLM applications

## 📂 Project Structure

```
└── sehajmakkar-vox-ai/
    ├── backend/               # Node.js Express server
    │   ├── config/            # Database configuration
    │   ├── controllers/       # Request handlers
    │   ├── middlewares/       # Custom middleware functions
    │   ├── models/            # MongoDB data models
    │   ├── routes/            # API route definitions
    │   ├── services/          # Business logic services
    │   └── uploads/           # Temporary storage for meeting recordings
    ├── frontend/              # React application
    │   ├── public/            # Static assets
    │   └── src/
    │       ├── assets/        # Images, icons, etc.
    │       ├── components/    # React components
    │       │   ├── HomePage/  # Home page components
    │       │   ├── Landing/   # Landing page components
    │       │   └── Room/      # Meeting room components
    │       └── utils/         # Utility functions
    └── rag-backend/           # Python RAG system
        └── chroma_db/         # Vector database storage
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB
- API keys for Gemini and Whisper

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sehajmakkar/vox-ai.git
   cd vox-ai
   ```

2. **Set up backend**
   ```bash
   cd backend
   npm install
   # Create a .env file with your configuration
   cp .env.example .env
   # Edit .env with your API keys and MongoDB URI
   ```

3. **Set up frontend**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file if needed for environment-specific settings
   ```

4. **Set up RAG backend**
   ```bash
   cd ../rag-backend
   pip install -r requirements.txt
   # Create a .env file with your configuration
   cp .env.example .env
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npx nodemon
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Start the RAG backend**
   ```bash
   cd rag-backend
   streamlit run app.py
   ```

4. Open your browser and navigate to `http://localhost:5173`

## 🔧 Development Workflow

1. **Create a meeting**: Navigate to the dashboard and create a new meeting
2. **Join the meeting**: Click on the meeting link to join the virtual room
3. **Record the meeting**: Start recording to activate the **real-time transcription** service
4. **View insights**: See **AI-generated insights** during the meeting
5. **Ask questions**: Use the **AskAI feature** to query information from current or past meetings
6. **Review past meetings**: Access transcripts, summaries, and **action items** from previous meetings

## 🧩 Key Components

### Meeting Controller
Handles the creation, retrieval, and management of meeting sessions.

### Transcription Service
Processes audio streams and converts them to text using the **Whisper API** with **high accuracy**.

### Gemini Controller
Integrates with Google's **Gemini API** to generate insights, summaries, and **contextual responses** to user queries.

### RAG System
Stores meeting transcripts as **vector embeddings** and retrieves relevant context to enhance AI responses - creating a **searchable knowledge base**.

### Room Component
The core meeting interface that handles **WebRTC connections**, audio/video streams, and **real-time updates**.

## 📊 Future Scope

- **Enterprise Integration**: Connect with **CRM systems**, **ERP platforms**, and communication tools
- **Advanced Analytics**: Add **sentiment analysis**, trend identification, and **customizable dashboards**
- **Multilingual Support**: Enable transcription and insights in **multiple languages**
- **AI Video Analysis**: Incorporate **gesture recognition** and visual context understanding
- **Mobile Application**: Develop native **iOS and Android** applications with offline capabilities

## 💡 Why VOX AI?

- **Beyond Simple Transcription**: VOX AI doesn't just record meetings - it **understands them**
- **Time Savings**: Reduce meeting time by **30%** with better organization and follow-up
- **Knowledge Retention**: Never lose valuable insights from past discussions
- **Seamless Integration**: Works with your existing meeting tools and workflows
- **Context-Aware AI**: The more you use it, the **smarter it gets** about your organization
- **No More Note-Taking**: Focus on the conversation while VOX AI handles documentation

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.