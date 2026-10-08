export const uploadToCloudinary = async (
  file: File,
  preset: string = import.meta.env.VITE_CLOUDINARY_EVENTS_UPLOAD_PRESET
): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  if (!cloudName || !preset) {
    throw new Error("Cloudinary-Konfiguration fehlt in den Umgebungsverablen");
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Fehler beim Bildupload zu Cloudinary");
  }

  return data.secure_url;
};