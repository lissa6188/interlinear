import type { APIRoute } from 'astro';
import { getAll } from '../lib/notes';

export const GET: APIRoute = async () => {
  const notes = await getAll();
  const index = notes.map((note) => ({
    href: note.href,
    haystack: `${note.haystack} ${note.bodyText.toLowerCase()}`,
    body: note.bodyText,
  }));

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
