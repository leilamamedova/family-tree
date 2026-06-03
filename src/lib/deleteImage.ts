export async function deleteImage(imageUrl: string) {
  const response = await fetch('/api/upload', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageUrl,
    }),
  });

  if (!response.ok) {
    throw new Error('Image delete failed');
  }

  return true;
}
