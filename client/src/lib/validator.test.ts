
import { describe, expect, it } from "vitest";

import {
  eventFormSchema,
  registerFormSchema,
  profileFormSchema,
} from "./validator";

const validEvent = {
  title: "Test Event",
  description: "Test event description",
  location: "Cologne",
  imageUrl: "https://example.com/image.jpg",
  startDateTime: new Date("2026-12-01T10:00:00Z"),
  endDateTime: new Date("2026-12-01T12:00:00Z"),
  categoryId: "category-1",
  url: "https://example.com",
};

const validOwnerRegistration = {
  registrationType: "owner" as const,
  name: "Test Owner",
  email: "owner@example.com",
  password: "password123",
  confirmPassword: "password123",
  companyName: "Test Company",
};

const validMemberRegistration = {
  registrationType: "member" as const,
  name: "Test Member",
  email: "member@example.com",
  password: "password123",
  confirmPassword: "password123",
  invitationCode: "test-invitation-code",
};

const validProfile = {
  name: "Test User",
  email: "test@example.com",
};

// --------------------------------------------------
// Event Form Schema
// --------------------------------------------------

describe("eventFormSchema", () => {
  it("accepts valid event data", () => {
    expect(eventFormSchema.safeParse(validEvent).success).toBe(true);
  });

  it("enforces title length between 3 and 100 characters", () => {
    expect(
      eventFormSchema.safeParse({
        ...validEvent,
        title: "ab",
      }).success,
    ).toBe(false);

    expect(
      eventFormSchema.safeParse({
        ...validEvent,
        title: "a".repeat(3),
      }).success,
    ).toBe(true);

    expect(
      eventFormSchema.safeParse({
        ...validEvent,
        title: "a".repeat(100),
      }).success,
    ).toBe(true);

    expect(
      eventFormSchema.safeParse({
        ...validEvent,
        title: "a".repeat(101),
      }).success,
    ).toBe(false);
  });

  it("enforces description length between 3 and 400 characters", () => {
    expect(
      eventFormSchema.safeParse({
        ...validEvent,
        description: "ab",
      }).success,
    ).toBe(false);

    expect(
      eventFormSchema.safeParse({
        ...validEvent,
        description: "a".repeat(3),
      }).success,
    ).toBe(true);

    expect(
      eventFormSchema.safeParse({
        ...validEvent,
        description: "a".repeat(400),
      }).success,
    ).toBe(true);

    expect(
      eventFormSchema.safeParse({
        ...validEvent,
        description: "a".repeat(401),
      }).success,
    ).toBe(false);
  });

  it("enforces location length between 3 and 200 characters", () => {
    expect(
      eventFormSchema.safeParse({
        ...validEvent,
        location: "ab",
      }).success,
    ).toBe(false);

    expect(
      eventFormSchema.safeParse({
        ...validEvent,
        location: "a".repeat(3),
      }).success,
    ).toBe(true);

    expect(
      eventFormSchema.safeParse({
        ...validEvent,
        location: "a".repeat(200),
      }).success,
    ).toBe(true);

    expect(
      eventFormSchema.safeParse({
        ...validEvent,
        location: "a".repeat(201),
      }).success,
    ).toBe(false);
  });

  it("requires a category", () => {
    const result = eventFormSchema.safeParse({
      ...validEvent,
      categoryId: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) => issue.path[0] === "categoryId",
        ),
      ).toBe(true);
    }
  });

  it("allows an empty URL but rejects an invalid non-empty URL", () => {
    expect(
      eventFormSchema.safeParse({
        ...validEvent,
        url: "",
      }).success,
    ).toBe(true);

    expect(
      eventFormSchema.safeParse({
        ...validEvent,
        url: "not-a-valid-url",
      }).success,
    ).toBe(false);
  });

  it("requires the end date to be strictly later than the start date", () => {
    const sameDate = new Date("2026-12-01T10:00:00Z");

    const equalDatesResult = eventFormSchema.safeParse({
      ...validEvent,
      startDateTime: sameDate,
      endDateTime: sameDate,
    });

    const earlierEndResult = eventFormSchema.safeParse({
      ...validEvent,
      startDateTime: new Date("2026-12-01T12:00:00Z"),
      endDateTime: new Date("2026-12-01T10:00:00Z"),
    });

    expect(equalDatesResult.success).toBe(false);
    expect(earlierEndResult.success).toBe(false);

    if (!equalDatesResult.success) {
      expect(
        equalDatesResult.error.issues.some(
          (issue) => issue.path[0] === "endDateTime",
        ),
      ).toBe(true);
    }
  });
});

// --------------------------------------------------
// Registration Form Schema
// --------------------------------------------------

describe("registerFormSchema", () => {
  it("accepts valid owner registration data", () => {
    expect(
      registerFormSchema.safeParse(validOwnerRegistration).success,
    ).toBe(true);
  });

  it("accepts valid member registration data", () => {
    expect(
      registerFormSchema.safeParse(validMemberRegistration).success,
    ).toBe(true);
  });

  it("rejects registration when passwords do not match", () => {
    const result = registerFormSchema.safeParse({
      ...validOwnerRegistration,
      confirmPassword: "different-password",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) => issue.path[0] === "confirmPassword",
        ),
      ).toBe(true);
    }
  });

  it("requires a non-empty company name for owner registration", () => {
    const missingNameResult = registerFormSchema.safeParse({
      ...validOwnerRegistration,
      companyName: undefined,
    });

    const blankNameResult = registerFormSchema.safeParse({
      ...validOwnerRegistration,
      companyName: "   ",
    });

    expect(missingNameResult.success).toBe(false);
    expect(blankNameResult.success).toBe(false);

    if (!blankNameResult.success) {
      expect(
        blankNameResult.error.issues.some(
          (issue) => issue.path[0] === "companyName",
        ),
      ).toBe(true);
    }
  });

  it("requires a non-empty invitation code for member registration", () => {
    const missingCodeResult = registerFormSchema.safeParse({
      ...validMemberRegistration,
      invitationCode: undefined,
    });

    const blankCodeResult = registerFormSchema.safeParse({
      ...validMemberRegistration,
      invitationCode: "   ",
    });

    expect(missingCodeResult.success).toBe(false);
    expect(blankCodeResult.success).toBe(false);

    if (!blankCodeResult.success) {
      expect(
        blankCodeResult.error.issues.some(
          (issue) => issue.path[0] === "invitationCode",
        ),
      ).toBe(true);
    }
  });

  it("requires a password of at least 8 characters", () => {
    expect(
      registerFormSchema.safeParse({
        ...validOwnerRegistration,
        password: "short",
        confirmPassword: "short",
      }).success,
    ).toBe(false);
  });

  it("enforces the password limit of 72 bytes", () => {
    // 36 characters × 2 UTF-8 bytes = 72 bytes
    const password72Bytes = "ä".repeat(36);

    expect(
      registerFormSchema.safeParse({
        ...validOwnerRegistration,
        password: password72Bytes,
        confirmPassword: password72Bytes,
      }).success,
    ).toBe(true);

    // 37 characters × 2 UTF-8 bytes = 74 bytes
    const password74Bytes = "ä".repeat(37);

    expect(
      registerFormSchema.safeParse({
        ...validOwnerRegistration,
        password: password74Bytes,
        confirmPassword: password74Bytes,
      }).success,
    ).toBe(false);
  });

  it("trims name and email before returning registration data", () => {
    const result = registerFormSchema.safeParse({
      ...validOwnerRegistration,
      name: "  Test Owner  ",
      email: "  owner@example.com  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe("Test Owner");
      expect(result.data.email).toBe("owner@example.com");
    }
  });
});

// --------------------------------------------------
// Profile Form Schema
// --------------------------------------------------

describe("profileFormSchema", () => {
  it("accepts valid profile data without optional fields", () => {
    expect(profileFormSchema.safeParse(validProfile).success).toBe(true);
  });

  it("trims name and email before returning profile data", () => {
    const result = profileFormSchema.safeParse({
      name: "  Test User  ",
      email: "  test@example.com  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe("Test User");
      expect(result.data.email).toBe("test@example.com");
    }
  });

  it("rejects a name that is shorter than 2 characters after trimming", () => {
    expect(
      profileFormSchema.safeParse({
        ...validProfile,
        name: "   ",
      }).success,
    ).toBe(false);
  });

  it("rejects an invalid email address", () => {
    expect(
      profileFormSchema.safeParse({
        ...validProfile,
        email: "invalid-email",
      }).success,
    ).toBe(false);
  });

  it("enforces the bio limit of 200 characters", () => {
    expect(
      profileFormSchema.safeParse({
        ...validProfile,
        bio: "a".repeat(200),
      }).success,
    ).toBe(true);

    expect(
      profileFormSchema.safeParse({
        ...validProfile,
        bio: "a".repeat(201),
      }).success,
    ).toBe(false);
  });
});
