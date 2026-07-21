# 📚 FlowStateGrid - AI-Powered Study Platform

[![GitHub](https://img.shields.io/badge/GitHub-FlowStateGrid-181717?style=for-the-badge&logo=github)](https://github.com/Saksham-Bansal7/flowstategrid)

> **FlowStateGrid** is a modern study platform that combines AI-powered learning assistance with collaborative study features. Built with Next.js and cutting-edge AI technology, it provides silent video study rooms, intelligent document analysis, social study feeds, and event scheduling to help students stay focused and achieve their academic goals.

## 🌟 Features

### 🎥 Video Study Rooms

- **Silent Focus Sessions**: Study together with video-only sessions - no audio distractions
- **Real-time Video**: Powered by Agora RTC for smooth, reliable video streaming
- **Visual Accountability**: See other students working to stay motivated
- **Room Creation**: Create private or public study rooms with optional passwords
- **Participant Tracking**: Monitor who's studying with you in real-time

### 📖 Study Feed

- **Achievement Sharing**: Post your study milestones and accomplishments
- **Community Engagement**: Like and interact with other students' posts
- **Image Uploads**: Share screenshots, notes, or study setups
- **Motivation Hub**: Stay inspired by seeing what others are working on
- **User Profiles**: View individual profiles and study statistics

### 🤖 AI Study Assistant (RAG)

- **PDF Document Upload**: Upload your study materials and lecture notes
- **Smart Question Answering**: Ask questions and get accurate answers from your documents
- **Vector Search Integration**: Uses MongoDB Vector Search with 768-dimensional embeddings
- **Context-Aware Responses**: Powered by Groq LLM with source citations
- **Document Library**: Organize and manage all your study materials
- **Session History**: Keep track of your conversations with the AI

### 📅 Event Scheduler

- **Interactive Calendar**: FullCalendar integration for managing study sessions
- **Drag & Drop**: Easy event creation and rescheduling
- **Event Categories**: Color-coded events for better organization
- **Reminders**: Track deadlines, exams, and study sessions
- **Responsive Design**: Works seamlessly across all devices

### 🔐 Secure Authentication

- **Multiple Login Options**: Email/password, Google OAuth, GitHub OAuth
- **Email Verification**: Secure account verification system
- **Password Reset**: Easy password recovery via email
- **Protected Routes**: Middleware-protected pages for authenticated users
- **Session Management**: Secure JWT-based authentication with NextAuth

### 🎨 Modern User Interface

- **Beautiful Design**: Clean, modern UI with gradient accents
- **Dark Theme**: Eye-friendly design optimized for long study sessions
- **Responsive Layout**: Fully optimized for desktop, tablet, and mobile
- **Smooth Animations**: Polished user experience with Tailwind CSS
- **Accessibility**: Built with user experience in mind

## 🛠️ Technology Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React features with async components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **React Query (TanStack Query)** - Data fetching and caching
- **FullCalendar** - Interactive calendar component
- **Agora RTC SDK** - Real-time video communication

### Backend & API

- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js** - Complete authentication solution
- **MongoDB & Mongoose** - NoSQL database with ODM
- **MongoDB Vector Search** - Semantic search for documents
- **bcryptjs** - Password hashing and encryption
- **Zod** - Schema validation

### AI & Machine Learning

- **HuggingFace Inference** - Text embeddings generation
- **Groq SDK** - Fast LLM inference for chat responses
- **sentence-transformers/all-mpnet-base-v2** - 768-dimensional embeddings
- **pdf-parse** - PDF text extraction

### File Storage & Media

- **Cloudinary** - Image and document storage
- **Multer** - File upload handling

## 🏗️ Project Architecture

```
flowstategrid/
├── app/                         # Next.js App Router
│   ├── api/                     # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   │   ├── [...nextauth]/  # NextAuth configuration
│   │   │   ├── signup/         # User registration
│   │   │   ├── verify-email/   # Email verification
│   │   │   ├── forgot-password/# Password reset request
│   │   │   └── reset-password/ # Password reset
│   │   ├── chat/               # AI chat endpoints
│   │   ├── documents/          # Document management
│   │   ├── events/             # Calendar events
│   │   ├── posts/              # Study feed posts
│   │   ├── rooms/              # Video study rooms
│   │   └── user/               # User profile & stats
│   ├── auth/                   # Authentication pages
│   │   ├── signin/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── dashboard/              # User dashboard
│   ├── feed/                   # Study feed
│   ├── rag/                    # AI assistant page
│   ├── rooms/                  # Study rooms
│   ├── calendar/               # Event calendar
│   └── u/[username]/           # User profiles
│
├── components/                  # Reusable components
│   ├── ui/                     # shadcn/ui components
│   ├── navbar.tsx              # Navigation
│   ├── chat-interface.tsx      # AI chat UI
│   ├── study-room-video.tsx    # Video component
│   ├── post-card.tsx           # Feed post display
│   ├── document-card.tsx       # Document display
│   └── upload-document-dialog.tsx
│
├── lib/                        # Utility functions
│   ├── db.ts                   # MongoDB connection
│   ├── embeddings.ts           # Vector embeddings
│   ├── groq.ts                 # Groq LLM integration
│   ├── email.ts                # Email sending
│   ├── cloudinary.ts           # File uploads
│   ├── text-processor.ts       # PDF processing
│   └── validations/            # Zod schemas
│
├── models/                     # MongoDB schemas
│   ├── User.ts
│   ├── Post.ts
│   ├── Document.ts
│   ├── DocumentChunk.ts
│   ├── ChatSession.ts
│   ├── Room.ts
│   ├── Event.ts
│   └── FocusSession.ts
│
├── hooks/                      # Custom React hooks
│   ├── use-posts.ts
│   ├── use-documents.ts
│   ├── use-dashboard.ts
│   └── use-user-profile.ts
│
└── types/                      # TypeScript definitions
    └── next-auth.d.ts
```

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Agora account for video
- HuggingFace API key
- Groq API key
- Cloudinary account
- Google/GitHub OAuth credentials (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/Saksham-Bansal7/flowstategrid.git

# Navigate to project directory
cd flowstategrid

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your environment variables (see below)

# Run development server
npm run dev
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/flowstategrid"

# NextAuth
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GITHUB_ID="your_github_id"
GITHUB_SECRET="your_github_secret"

# Agora (Video Calls)
AGORA_APP_ID="your_agora_app_id"
AGORA_APP_CERTIFICATE="your_agora_certificate"

# AI Services
HUGGINGFACE_API_KEY="your_huggingface_api_key"
GROQ_API_KEY="your_groq_api_key"

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_key"
CLOUDINARY_API_SECRET="your_cloudinary_secret"

# Email (Optional - currently using console logging)
RESEND_API_KEY="your_resend_api_key"
```

### MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster
2. Set up Vector Search index on `documentchunks` collection:
   - Index name: `vector_index`
   - Field: `embedding`
   - Dimensions: 768
   - Similarity: cosine

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🤖 AI Features

### RAG (Retrieval-Augmented Generation)

- **Vector Embeddings**: HuggingFace `all-mpnet-base-v2` model (768 dimensions)
- **Semantic Search**: MongoDB Vector Search for relevant document chunks
- **LLM Integration**: Groq LLaMA for generating contextual answers
- **Source Citations**: Responses include page numbers and source documents

### Document Processing

- **PDF Parsing**: Automatic text extraction from PDFs
- **Chunking Strategy**: Smart text splitting for optimal retrieval
- **Batch Processing**: Efficient embedding generation with rate limiting

## 🚀 Key Features to Try

1. **Sign Up/Login** - Create your account with email or OAuth
2. **Dashboard** - View your study stats and quick actions
3. **Create Study Room** - Start a silent video study session
4. **Upload Documents** - Add your study materials to the AI assistant
5. **Ask Questions** - Get AI-powered answers from your documents
6. **Study Feed** - Share your achievements and see others' progress
7. **Calendar** - Schedule and track your study sessions

## 👨‍💻 Author

**Saksham Bansal**

- GitHub: [@Saksham-Bansal7](https://github.com/Saksham-Bansal7)

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Vercel** - For seamless deployment
- **MongoDB** - For Vector Search capabilities
- **Agora** - For reliable video infrastructure
- **HuggingFace** - For open-source AI models
- **Groq** - For fast LLM inference
- **shadcn** - For beautiful UI components

---

<p align="center">
  <strong>📚 Start your focused study journey with FlowStateGrid today! 🎯</strong>
</p>

<p align="center">
  Made with ❤️ by <a href="https://github.com/Saksham-Bansal7">Saksham Bansal</a>
</p>
