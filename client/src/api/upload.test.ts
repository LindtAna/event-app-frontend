
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uploadToCloudinary } from "./upload";

const fetchMock = vi.fn<typeof fetch>();

function createResponse(data: unknown, ok = true): Response {
  return {
    ok,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response;
}

describe("uploadToCloudinary", () => {
  beforeEach(() => {
    fetchMock.mockReset();

    vi.stubGlobal("fetch", fetchMock);

    vi.stubEnv("VITE_CLOUDINARY_CLOUD_NAME", "test-cloud");
    vi.stubEnv("VITE_CLOUDINARY_EVENTS_UPLOAD_PRESET", "events-preset");
    vi.stubEnv("VITE_CLOUDINARY_AVATARS_UPLOAD_PRESET", "avatars-preset");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("uploads an event image using the default preset", async () => {
    const file = new File(["event image"], "event.png", {
      type: "image/png",
    });

    const imageUrl = "https://res.cloudinary.com/test-cloud/event.png";

    fetchMock.mockResolvedValueOnce(
      createResponse({ secure_url: imageUrl }),
    );

    const result = await uploadToCloudinary(file);

    expect(result).toBe(imageUrl);

    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "https://api.cloudinary.com/v1_1/test-cloud/image/upload",
    );

    expect(options?.method).toBe("POST");

    expect(options?.body).toBeInstanceOf(FormData);

    const formData = options?.body as FormData;

    expect(formData.get("file")).toMatchObject({
      name: "event.png",
      type: "image/png",
    });

    expect(formData.get("upload_preset")).toBe("events-preset");
  });

  it("uses the avatar upload preset when type is avatars", async () => {
    const file = new File(["avatar image"], "avatar.jpg", {
      type: "image/jpeg",
    });

    fetchMock.mockResolvedValueOnce(
      createResponse({
        secure_url: "https://res.cloudinary.com/test-cloud/avatar.jpg",
      }),
    );

    await uploadToCloudinary(file, "avatars");

    const [, options] = fetchMock.mock.calls[0];

    const formData = options?.body as FormData;

    expect(formData.get("upload_preset")).toBe("avatars-preset");
  });

  it("throws an error when the Cloudinary cloud name is missing", async () => {
    vi.stubEnv("VITE_CLOUDINARY_CLOUD_NAME", "");

    const file = new File(["image"], "image.png");

    await expect(uploadToCloudinary(file)).rejects.toThrow(
      "Cloudinary-Konfiguration fehlt in den Umgebungsvariablen",
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ["events", "VITE_CLOUDINARY_EVENTS_UPLOAD_PRESET"],
    ["avatars", "VITE_CLOUDINARY_AVATARS_UPLOAD_PRESET"],
  ] as const)(
    "throws an error when the %s upload preset is missing",
    async (type, envVariable) => {
      vi.stubEnv(envVariable, "");

      const file = new File(["image"], "image.png");

      await expect(
        uploadToCloudinary(file, type),
      ).rejects.toThrow(
        "Cloudinary-Konfiguration fehlt in den Umgebungsvariablen",
      );

      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("throws the error message returned by Cloudinary", async () => {
    const file = new File(["image"], "image.png");

    fetchMock.mockResolvedValueOnce(
      createResponse(
        {
          error: {
            message: "Upload preset not found",
          },
        },
        false,
      ),
    );

    await expect(uploadToCloudinary(file)).rejects.toThrow(
      "Upload preset not found",
    );
  });

  it("uses a fallback error message when Cloudinary returns no error message", async () => {
    const file = new File(["image"], "image.png");

    fetchMock.mockResolvedValueOnce(
      createResponse({}, false),
    );

    await expect(uploadToCloudinary(file)).rejects.toThrow(
      "Fehler beim Bildupload zu Cloudinary",
    );
  });
});
