import { redirect } from 'next/navigation';
import { use } from 'react';

export default function DeckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params Promise
  const { id } = use(params);
  
  // Redirect to the create topic page by default
  redirect(`/decks/${id}/create`);
}
