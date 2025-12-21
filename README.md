# Topic-Centric SRS Frontend

A minimalistic Next.js frontend for the Topic-Centric Spaced Repetition System.

## Features

- **Authentication**: Supabase-powered sign up/sign in with automatic profile creation
- **Deck Management**: Create, view, and delete flashcard decks
- **Topic Organization**: Organize cards into topics with SRS parameters
- **Card Creation**: Support for Q&A with hints and Multiple Choice cards
- **Review System**: Intelligent review interface with weighted card sampling
- **Markdown Support**: Rich text formatting in all card content
- **Responsive Design**: Clean, minimalistic UI using shadcn/ui components

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Supabase** for authentication
- **React Markdown** for rendering card content

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Running FastAPI backend at `http://localhost:8000`
- Supabase project with authentication enabled

### Installation

1. Install dependencies (if not already done):
```bash
npm install
```

2. Configure environment variables:

Edit `.env.local` with your credentials:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://mlubbzyctgiafjbiqyfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
