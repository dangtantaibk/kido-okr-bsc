import Link from 'next/link';
import { ArrowLeft, ExternalLink, Link2 } from 'lucide-react';
import { OpenProjectEmbed } from '@/components/projects/openproject-embed';
import { Button } from '@/components/ui/button';

export default function ProjectsPage() {
  const openProjectUrl = process.env.NEXT_PUBLIC_OPENPROJECT_URL || 'https://openproject.61.28.229.105.sslip.io';

  return (
    <div className="relative h-[100dvh] w-full">
      <div className="absolute left-0 top-0 z-20 flex h-16 w-full items-center justify-center border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 shadow">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              KIDO
            </Link>
          </Button>
          <span className="text-xs font-medium text-slate-500">KIDO ↔ OpenProject</span>
          <Button variant="ghost" size="sm" asChild>
            <a href={openProjectUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              OpenProject
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>
      <OpenProjectEmbed variant="full" height="100%" className="h-full" />
    </div>
  );
}
