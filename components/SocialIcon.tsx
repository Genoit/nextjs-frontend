// Small round logos of the networks an ad runs on (dashboard format picker, plans page).
export type Social = 'tiktok' | 'instagram' | 'youtube' | 'facebook';

/** `mono`: white mark on black, for menus that should not compete with the brand colours. */
export function SocialIcon({ name, mono = false }: { name: Social; mono?: boolean }) {
  const box = `size-[18px] shrink-0 rounded-full ring-2 ${mono ? 'ring-white/25' : 'ring-dash-panel'}`;
  const bg = (brand: string) => (mono ? 'bg-black' : brand);
  if (name === 'tiktok')
    return (
      <span className={`${box} flex items-center justify-center ${bg('bg-black')}`}>
        <svg viewBox="0 0 24 24" fill="#fff" className="size-[11px]">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.81 4.48 6.27 6.27 0 0 0 1.86-4.48V8.71a8.19 8.19 0 0 0 4.92 1.63V6.89a4.85 4.85 0 0 1-1-.2z" />
        </svg>
      </span>
    );
  if (name === 'instagram')
    return (
      <span
        className={`${box} flex items-center justify-center ${bg('bg-[radial-gradient(circle_at_30%_110%,#fdf497_0%,#fd5949_45%,#d6249f_60%,#285aeb_95%)]')}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          className="size-[11px]"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.6" fill="#fff" />
        </svg>
      </span>
    );
  if (name === 'youtube')
    return (
      <span className={`${box} flex items-center justify-center ${bg('bg-[#ff0000]')}`}>
        <svg viewBox="0 0 24 24" fill="#fff" className="size-[9px]">
          <path d="M7 4.5v15l13-7.5z" />
        </svg>
      </span>
    );
  return (
    <span className={`${box} flex items-center justify-center ${bg('bg-[#1877f2]')}`}>
      <svg viewBox="0 0 24 24" fill="#fff" className="size-[11px]">
        <path d="M14 8V6.2c0-.8.2-1.3 1.4-1.3H17V2h-2.6C11.6 2 10.6 3.6 10.6 6v2H8.5v3h2.1v11H14V11h2.6l.4-3z" />
      </svg>
    </span>
  );
}
