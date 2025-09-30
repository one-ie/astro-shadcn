import * as React from 'react';
import { cn } from '@/lib/utils';

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export interface TableOfContentsProps {
  headings: Heading[];
  className?: string;
}

export function TableOfContents({ headings, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string>('');

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0% 0% -80% 0%' }
    );

    const headingElements = headings
      .map((heading) => document.getElementById(heading.slug))
      .filter((el): el is HTMLElement => el !== null);

    headingElements.forEach((el) => observer.observe(el));

    return () => {
      headingElements.forEach((el) => observer.unobserve(el));
    };
  }, [headings]);

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    slug: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(slug);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update URL without triggering navigation
      window.history.pushState(null, '', `#${slug}`);
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav
      className={cn('sticky top-4', className)}
      aria-label="Table of contents"
    >
      <h2 className="mb-4 text-sm font-semibold tracking-tight">
        On this page
      </h2>
      <ul className="space-y-2.5 text-sm">
        {headings.map((heading) => {
          const isActive = activeId === heading.slug;
          const paddingLeft = `${(heading.depth - 2) * 1}rem`;

          return (
            <li
              key={heading.slug}
              style={{ paddingLeft }}
              className="leading-relaxed"
            >
              <a
                href={`#${heading.slug}`}
                onClick={(e) => handleClick(e, heading.slug)}
                className={cn(
                  'inline-block py-0.5 text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'font-medium text-foreground'
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
