import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { OpenProjectEmbed } from '@/components/projects/openproject-embed';
import { Button } from '@/components/ui/button';

export default function ProjectsPage() {
  const openProjectUrl = process.env.NEXT_PUBLIC_OPENPROJECT_URL || 'https://openproject.61.28.229.105.sslip.io';

  return (
    <div className="relative h-[100dvh] w-full">
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex h-[55px] items-center justify-center px-4">
        <div className="pointer-events-auto flex w-[180px] items-center justify-between gap-2 rounded-md border border-slate-200 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur">
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8"
            asChild
          >
            <Link href="/" aria-label="Quay lại KIDO">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="px-1 text-xs font-medium text-slate-500">KIDO OpenProject</span>
        </div>
      </div>
      <OpenProjectEmbed variant="full" height="100%" className="h-full" />
    </div>
  );
}
