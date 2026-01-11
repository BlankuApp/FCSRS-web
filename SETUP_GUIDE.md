# TCSRS-Web Frontend Setup Complete! 🎉

A minimalistic Next.js + shadcn/ui frontend has been created for your Topic-Centric SRS application.

## What's Been Created

### Project Structure
```
TCSRS-Web/
├── API_DOCUMENTATION.md    (Your original API docs)
├── app/               (All pages: dashboard, decks, topics, review, profile, auth)
├── components/        (Reusable UI components)
├── contexts/          (Auth context for Supabase)
├── lib/              (API client, types, utilities)
└── .env.local        (Environment configuration)
```

### Key Features Implemented
✅ Authentication (login/signup with profile creation during signup)
✅ Deck management (create, view, delete)
✅ Topic management (create, view, delete)
✅ Card management (Q&A with hints & Multiple Choice)
✅ Review interface (weighted sampling, 4-level ratings)
✅ Profile management
✅ Markdown rendering for card content
✅ Empty states with helpful messages
✅ Responsive design with shadcn/ui

## Quick Start

### 1. Configure Environment Variables

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://mlubbzyctgiafjbiqyfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ACTUAL_SUPABASE_ANON_KEY_HERE
```

⚠️ **Important**: Replace `YOUR_ACTUAL_SUPABASE_ANON_KEY_HERE` with your real Supabase anonymous key!

### 2. Start the Backend API

Make sure your FastAPI backend is running:
```bash
# In your backend directory
python main.py  # or however you start your backend
```

The API should be accessible at `http://localhost:8000`

### 3. Start the Frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## First-Time Usage

1. **Sign Up**: Navigate to signup page, create an account and enter your name
2. **Dashboard**: After signup, you'll be directed to your dashboard
3. **Create Deck**: Go to "Decks" and create your first deck
4. **Add Topics**: Within a deck, create topics to organize cards
5. **Add Cards**: Create flashcards (Q&A or Multiple Choice)
6. **Review**: Check the dashboard for due reviews

## User Flow

```
Sign Up → Create Profile → Dashboard
    ↓
Decks → Create Deck → View Topics
    ↓
Topics → Create Topic → View Cards
    ↓
Cards → Create Cards (Q&A or Multiple Choice)
    ↓
Dashboard → Review Due Topics → Rate Recall
```

## API Integration

The frontend integrates with all backend endpoints:

**Authentication**: Supabase JWT tokens
**Decks**: GET, POST, PATCH, DELETE `/decks/`
**Topics**: GET, POST, PATCH, DELETE `/topics/`
**Cards**: GET, POST, PATCH, DELETE `/cards/`
**Review**: GET `/review/topics/{id}/review-card`, POST `/submit-review`
**Profile**: GET, POST, PATCH `/profile/`

## Troubleshooting

### Backend Connection Issues
- Verify backend is running at `http://localhost:8000`
- Test with: `curl http://localhost:8000/health`
- Check CORS settings in backend

### Authentication Issues
- Ensure Supabase credentials in `.env.local` are correct
- Check Supabase dashboard for user authentication status
- Try signing out and back in

### Missing Dependencies
```bash
npm install
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Auth**: Supabase
- **Markdown**: react-markdown + remark-gfm
- **State**: React Context API (simple & maintainable)

## Next Steps

1. **Update Supabase Key**: Edit `.env.local` with your actual key
2. **Start Backend**: Ensure FastAPI is running
3. **Test Frontend**: Run `npm run dev` in main directory
4. **Create Test Data**: Sign up and add some decks/topics/cards
5. **Try Review Flow**: Test the SRS review system

## Project Architecture

**Simple & Maintainable**:
- React Context for auth state
- Direct API calls (no complex state management)
- TypeScript for type safety
- shadcn/ui for consistent UI
- Markdown for rich content

**Scalable**:
- Easy to add new pages
- Modular component structure
- Type-safe API client
- Clear separation of concerns

## Support

For API documentation, refer to `API_DOCUMENTATION.md` in the root directory.

---

**Created**: December 21, 2025
**Status**: Ready for development! 🚀
