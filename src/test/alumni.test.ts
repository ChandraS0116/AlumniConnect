import { describe, it, expect } from "vitest";
import { alumniData, industries, batches } from "../data/mockData";

describe("Real Andhra University Alumni Directory Verification", () => {
  it("should have at least 200 real Andhra University alumni", () => {
    expect(alumniData.length).toBeGreaterThanOrEqual(200);
  });

  it("should have verified fields for every single alumni", () => {
    alumniData.forEach((alumnus) => {
      expect(alumnus.id).toBeTruthy();
      expect(alumnus.name).toBeTruthy();
      expect(typeof alumnus.batch).toBe("number");
      expect(alumnus.batch).toBeGreaterThan(1900);
      expect(alumnus.role).toBeTruthy();
      expect(alumnus.company).toBeTruthy();
      expect(alumnus.industry).toBeTruthy();
      expect(industries).toContain(alumnus.industry);
      expect(alumnus.linkedin).toBeTruthy();
      expect(alumnus.linkedin).toMatch(/^https:\/\/(www\.)?linkedin\.com/);
      expect(alumnus.bio).toBeTruthy();
      expect(alumnus.skills.length).toBeGreaterThan(0);
    });
  });

  it("should cover diverse industries across the spectrum", () => {
    const industryCounts = alumniData.reduce((acc, a) => {
      acc[a.industry] = (acc[a.industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    expect(industryCounts["Technology"]).toBeGreaterThan(10);
    expect(industryCounts["Film & Media"]).toBeGreaterThan(10);
    expect(industryCounts["Law & Civil Services"]).toBeGreaterThanOrEqual(10);
    expect(industryCounts["Healthcare"]).toBeGreaterThanOrEqual(10);
    expect(industryCounts["Core Engineering"]).toBeGreaterThanOrEqual(10);
    expect(industryCounts["Arts & Culture"]).toBeGreaterThanOrEqual(5);
  });

  it("should include prominent real AU luminaries", () => {
    const names = alumniData.map((a) => a.name);
    expect(names).toContain("Trivikram Srinivas");
    expect(names).toContain("N. S. Raghavan");
    expect(names).toContain("Sandhya Devanathan");
    expect(names).toContain("Grandhi Mallikarjuna Rao");
    expect(names).toContain("Duvvuri Subbarao");
    expect(names).toContain("Jasti Chelameswar");
    expect(names).toContain("S. Rao Kosaraju");
    expect(names).toContain("Chennupati Jagadish");
  });
});
