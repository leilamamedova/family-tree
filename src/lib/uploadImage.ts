export async function uploadImage(file: File, oldImageUrl?: string | null) {
  const formData = new FormData();

  formData.append('file', file);

  if (oldImageUrl) {
    formData.append('oldImageUrl', oldImageUrl);
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Image upload failed');
  }

  const data = await response.json();

  return data.url as string;
}
