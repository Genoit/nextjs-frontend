'use client';

// Runs from the server HTML only; on the client React sees a text/plain data block, so it neither re-runs it nor warns.
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
