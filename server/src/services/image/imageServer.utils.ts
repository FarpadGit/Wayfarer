export async function postImagesToImageServer(payload: string) {
  const response = await fetch(`${process.env.IMAGE_SERVER_URL!}/api/images`, {
    headers: { 'Content-Type': 'Application/JSON' },
    body: JSON.stringify({
      origin: 'WF',
      ac: await AESEncode(payload),
    }),
    method: 'POST',
  });
  console.log(
    `POST Response from ${process.env.IMAGE_SERVER_URL!}/api/images: `,
    response,
  );
}

export async function deleteImageFromImageServer(images: string[]) {
  const response = await fetch(`${process.env.IMAGE_SERVER_URL!}/api/images`, {
    headers: { 'Content-Type': 'Application/JSON' },
    body: JSON.stringify({
      origin: 'WF',
      ac: await AESEncode(JSON.stringify({ img_names: images })),
    }),
    method: 'DELETE',
  });
  console.log(
    `DELETE Response from ${process.env.IMAGE_SERVER_URL!}/api/images: `,
    response,
  );
}

async function AESEncode(data: string) {
  const secretKey: string = process.env.IMAGE_SERVER_AES_KEY!;
  const binaryData = new TextEncoder().encode(data);

  const iv = crypto.getRandomValues(new Uint8Array(16));
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    str2ab(secretKey),
    { name: 'AES-CBC' },
    false,
    ['encrypt'],
  );

  const ctEncrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: iv },
    cryptoKey,
    binaryData,
  );

  const ciphertext = btoa(ab2str(ctEncrypted));
  const ivString = btoa(String.fromCharCode(...iv));

  return btoa(JSON.stringify({ iv: ivString, ciphertext }));
}

// string to ArrayBuffer
function str2ab(str: string) {
  const buffer = new ArrayBuffer(str.length);
  const binaryBuffer = new Uint8Array(buffer);
  for (let i = 0; i < str.length; i++) {
    binaryBuffer[i] = str.charCodeAt(i);
  }
  return buffer;
}

// ArrayBuffer to string
function ab2str(ab: ArrayBuffer) {
  const binary = new Uint8Array(ab);
  const text = Array.from(binary)
    .map((byte) => String.fromCharCode(byte))
    .join('');

  return text;
}
