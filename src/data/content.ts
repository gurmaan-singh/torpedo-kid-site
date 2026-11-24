// Content slots the team fills in over time: build log, gallery, team and extra route stops.
// Everything marked `// TODO: real content` is a placeholder. Replace it, or delete the block.
// A missing `image` shows a designed placeholder panel, so nothing ever looks broken.
import type { ImageMetadata } from 'astro';
import frontFrame from '~/assets/images/torpedo/car/front-frame.jpg';
import rearFrame from '~/assets/images/torpedo/car/rear-frame.jpg';
import brakes from '~/assets/images/torpedo/car/brake-disc.jpg';
import glenville from '~/assets/images/torpedo/glenville-999-1903.jpg';

export interface Slot {
  image?: ImageMetadata;
  alt?: string;
}

// ---- Build log: newest first -------------------------------------------
export const buildLog: (Slot & { date: string; title: string; text: string })[] = [
  // TODO: real content
  {
    date: '00 / 00 / 2026',
    title: 'Your newest update goes here',
    text: 'Two or three sentences on what the team did this week. Replace this block in src/data/content.ts.',
  },
  // TODO: real content
  {
    date: '00 / 00 / 2026',
    title: 'A second update, a bit older',
    text: 'Add a photo by importing it at the top of this file and setting image and alt on the entry.',
  },
  // TODO: real content
  {
    date: '00 / 00 / 2026',
    title: 'And the one before that',
    text: 'Keep three entries here. Older ones can move to their own page later.',
  },
];

// ---- Gallery: six slots, real photos first --------------------------------
export const gallery: (Slot & { ratio: string })[] = [
  { image: frontFrame, alt: 'The red front frame on the workshop floor with steering rack, wishbones and wheels attached.', ratio: '3 / 4' },
  { image: glenville, alt: 'The white 1903 Torpedo Kid, number 999, between two open racing cars.', ratio: '4 / 3' },
  { ratio: '1 / 1' }, // TODO: real content
  { image: rearFrame, alt: 'The rear frame with a yellow coilover mounted above a wishbone and pushrod.', ratio: '3 / 4' },
  { image: brakes, alt: 'A rear brake disc and hub carrier seen through the spokes of a wheel.', ratio: '4 / 3' },
  { ratio: '4 / 5' }, // TODO: real content
];

// ---- Team: shown on /about --------------------------------------------------
export const team: (Slot & { name: string; role: string })[] = [
  // TODO: real content
  { name: 'Team member', role: 'Role' },
  { name: 'Team member', role: 'Role' },
  { name: 'Team member', role: 'Role' },
  { name: 'Team member', role: 'Role' },
  { name: 'Team member', role: 'Role' },
  { name: 'Team member', role: 'Role' },
  { name: 'Team member', role: 'Role' },
  { name: 'Team member', role: 'Role' },
];

// ---- The road to Sweden: milestones --------------------------------------
// `at` is how far along the route the stop sits (0 to 1). Keep them in order.
export const milestones: { at: number; label: string; text: string; placeholder?: boolean }[] = [
  { at: 0, label: '2022', text: 'Project starts at Fontys' },
  { at: 0.16, label: 'This year', text: 'First drive on a private road' },
  // TODO: real content
  { at: 0.46, label: 'Placeholder', text: 'Add a milestone in src/data/content.ts', placeholder: true },
  // TODO: real content
  { at: 0.72, label: 'Placeholder', text: 'Add a second milestone here', placeholder: true },
  { at: 1, label: 'Next', text: 'Drive it to Sweden' },
];
