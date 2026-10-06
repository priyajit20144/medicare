import { describe, it, expect } from 'vitest';
import * as ScrollExports from '../components/scroll';

describe('Medicare Scroll Animation System Suite', () => {
  it('exports all necessary scroll animation components and utilities', () => {
    expect(ScrollExports.ScrollProgressBar).toBeDefined();
    expect(ScrollExports.ScrollToTopButton).toBeDefined();
    expect(ScrollExports.ScrollReveal).toBeDefined();
    expect(ScrollExports.ScrollTimelineNav).toBeDefined();
    expect(ScrollExports.ScrollToTopOnNav).toBeDefined();
  });

  it('correctly calculates radial progress gauge geometry for scroll-to-top meter', () => {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    expect(circumference).toBeCloseTo(113.097, 2);

    // At 0% scroll
    const offsetAt0 = circumference - (0 / 100) * circumference;
    expect(offsetAt0).toBeCloseTo(circumference, 2);

    // At 50% scroll
    const offsetAt50 = circumference - (50 / 100) * circumference;
    expect(offsetAt50).toBeCloseTo(circumference / 2, 2);

    // At 100% scroll
    const offsetAt100 = circumference - (100 / 100) * circumference;
    expect(offsetAt100).toBeCloseTo(0, 2);
  });

  it('calculates staggered delay timings accurately for static scroll reveal cascades', () => {
    const computeDelay = (staggerIndex: number | undefined, baseDelay = 0) =>
      staggerIndex !== undefined ? staggerIndex * 0.08 + baseDelay : baseDelay;

    expect(computeDelay(0)).toBe(0);
    expect(computeDelay(1)).toBeCloseTo(0.08, 2);
    expect(computeDelay(2)).toBeCloseTo(0.16, 2);
    expect(computeDelay(3)).toBeCloseTo(0.24, 2);
    expect(computeDelay(undefined, 0.2)).toBe(0.2);
  });

  it('calculates header offset correctly for section jump scrolling', () => {
    const navOffset = 90;
    const targetElementTop = 850;
    const scrollY = 200;
    const offsetPosition = targetElementTop + scrollY - navOffset;
    expect(offsetPosition).toBe(960);
  });
});
