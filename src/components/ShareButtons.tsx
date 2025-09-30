'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Twitter, Facebook, Linkedin } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [isWebShareSupported, setIsWebShareSupported] = React.useState(false);

  React.useEffect(() => {
    // Check if Web Share API is available
    setIsWebShareSupported(
      typeof navigator !== 'undefined' && 'share' in navigator
    );
  }, []);

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (error) {
        // User cancelled share or share failed
        console.log('Share cancelled or failed:', error);
      }
    }
  };

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}`,
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Share:</span>

      {isWebShareSupported && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleWebShare}
          aria-label="Share via native share menu"
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        asChild
        aria-label="Share on Twitter/X"
      >
        <a
          href={shareUrls.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="gap-2"
        >
          <Twitter className="h-4 w-4" />
          <span className="hidden sm:inline">Twitter</span>
        </a>
      </Button>

      <Button
        variant="outline"
        size="sm"
        asChild
        aria-label="Share on Facebook"
      >
        <a
          href={shareUrls.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="gap-2"
        >
          <Facebook className="h-4 w-4" />
          <span className="hidden sm:inline">Facebook</span>
        </a>
      </Button>

      <Button
        variant="outline"
        size="sm"
        asChild
        aria-label="Share on LinkedIn"
      >
        <a
          href={shareUrls.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="gap-2"
        >
          <Linkedin className="h-4 w-4" />
          <span className="hidden sm:inline">LinkedIn</span>
        </a>
      </Button>
    </div>
  );
}
