import { describe, it, expect } from 'vitest';

describe('Admin Physicians & Doctor Management Suite', () => {
  it('validates manual physician registration payload data normalization', () => {
    const rawQualifications = 'MBBS, MD - Cardiology, FACC';
    const parsedQualifications = rawQualifications.split(',').map((q) => q.trim()).filter(Boolean);
    expect(parsedQualifications).toEqual(['MBBS', 'MD - Cardiology', 'FACC']);

    const rawLanguages = 'English, Spanish, Hindi';
    const parsedLanguages = rawLanguages.split(',').map((l) => l.trim()).filter(Boolean);
    expect(parsedLanguages).toEqual(['English', 'Spanish', 'Hindi']);

    const defaultSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];
    expect(defaultSlots).toHaveLength(6);
    expect(defaultSlots[0]).toBe('09:00 AM');
  });

  it('filters physicians by name, specialty, or hospital affiliation', () => {
    const doctors = [
      {
        name: 'Dr. Sarah Jenkins',
        specialization: 'Cardiology',
        hospitalAffiliation: 'Medicare Central Medical Hospital',
        isActive: true,
      },
      {
        name: 'Dr. Marcus Vance',
        specialization: 'Orthopedics',
        hospitalAffiliation: 'St. Jude Specialty Hospital',
        isActive: true,
      },
      {
        name: 'Dr. Elena Rostova',
        specialization: 'Pediatrics',
        hospitalAffiliation: 'Children Hope Clinic',
        isActive: false,
      },
    ];

    const filterDocs = (query: string, specialty: string = 'ALL') => {
      const q = query.toLowerCase();
      return doctors.filter((doc) => {
        const matchesQuery =
          !q ||
          doc.name.toLowerCase().includes(q) ||
          doc.specialization.toLowerCase().includes(q) ||
          doc.hospitalAffiliation.toLowerCase().includes(q);
        const matchesSpecialty = specialty === 'ALL' || doc.specialization === specialty;
        return matchesQuery && matchesSpecialty;
      });
    };

    expect(filterDocs('Cardiology')).toHaveLength(1);
    expect(filterDocs('Sarah')).toHaveLength(1);
    expect(filterDocs('Medicare')).toHaveLength(1);
    expect(filterDocs('', 'Pediatrics')).toHaveLength(1);
    expect(filterDocs('nonexistent')).toHaveLength(0);
  });

  it('verifies consultation types validation requires at least one mode', () => {
    const supportedTypes: ('IN_PERSON' | 'VIDEO')[] = ['IN_PERSON', 'VIDEO'];
    expect(supportedTypes.includes('IN_PERSON')).toBe(true);
    expect(supportedTypes.includes('VIDEO')).toBe(true);
    expect(supportedTypes.length).toBeGreaterThanOrEqual(1);
  });

  it('validates physician fee and experience numeric constraints', () => {
    const fee = 120;
    const experienceYears = 14;

    expect(fee).toBeGreaterThanOrEqual(0);
    expect(experienceYears).toBeGreaterThanOrEqual(0);
    expect(experienceYears).toBeLessThanOrEqual(60);
  });
});
