import scene from '../husky-cat-food/profile.config.ts';
import { defineProfile } from '../../src/config.ts';

export default defineProfile({
  ...scene,
  title: 'Curiosity, in motion.',
  scene: {
    ...scene.scene,
    eyebrow: 'AI-NATIVE SOFTWARE BUILDER / ZÜRICH',
    label: 'COMPLEX SYSTEMS. CURIOUS AGENTS. UNSUPERVISED SNACKS.',
  },
});
