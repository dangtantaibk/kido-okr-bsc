import { OpenProjectEmbed } from '@/components/projects/openproject-embed';

export default function ProjectsPage() {
  return (
    <div className="h-[100dvh] w-full">
      <OpenProjectEmbed variant="full" height="100%" className="h-full" />
    </div>
  );
}
