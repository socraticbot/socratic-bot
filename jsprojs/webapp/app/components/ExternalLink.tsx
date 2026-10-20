'use client';

import { openExternal } from '@/lib/miniapp';

interface ExternalLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

/** A normal link on the web; inside a Farcaster Mini App it opens through the host. */
export default function ExternalLink({ href, className, children }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        openExternal(href).catch(() => window.open(href, '_blank', 'noopener,noreferrer'));
      }}
    >
      {children}
    </a>
  );
}
