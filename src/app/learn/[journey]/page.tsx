import { notFound } from 'next/navigation';
import { JOURNEYS, JOURNEY_BY_SLUG } from '@/content/journeys';
import { experienceForJourney } from '@/content/experiences';
import LessonGate from './LessonGate';

export function generateStaticParams() {
  return JOURNEYS.map((j) => ({ journey: j.slug }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ journey: string }>;
}) {
  const { journey: slug } = await params;
  const journey = JOURNEY_BY_SLUG.get(slug);
  if (!journey) notFound();

  const experience = experienceForJourney(journey.id);
  if (!experience) notFound();

  return <LessonGate experience={experience} />;
}
