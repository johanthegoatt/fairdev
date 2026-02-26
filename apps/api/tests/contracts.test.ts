import { describe, expect, it } from "vitest";
import { githubProfileUrlSchema } from "@fairdev/shared";

describe("github profile URL schema", () => {
  it("accepts valid profile URLs", () => {
    const valid = githubProfileUrlSchema.parse("https://github.com/octocat");
    expect(valid).toBe("https://github.com/octocat");
  });

  it("rejects invalid URLs", () => {
    expect(() => githubProfileUrlSchema.parse("https://github.com/octocat/repo")).toThrow();
    expect(() => githubProfileUrlSchema.parse("https://example.com/octocat")).toThrow();
  });
});