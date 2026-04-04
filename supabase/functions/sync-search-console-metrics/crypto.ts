import { getGoogleConnectEnv, GoogleSearchConsoleError } from '../google-search-console-connect/shared.ts';

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  const binary = atob(`${normalized}${padding}`);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function normalizeArrayBuffer(input: Uint8Array<ArrayBufferLike>) {
  return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
}

export async function decryptRefreshToken(ciphertext: string, iv: string) {
  const { encryptionKey } = getGoogleConnectEnv();
  const keyMaterial = fromBase64Url(encryptionKey);

  if (keyMaterial.byteLength !== 32) {
    throw new GoogleSearchConsoleError(500, 'La conexión segura con Google quedó mal configurada.', 'INVALID_KEY');
  }

  const key = await crypto.subtle.importKey('raw', normalizeArrayBuffer(keyMaterial), 'AES-GCM', false, ['decrypt']);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: normalizeArrayBuffer(fromBase64Url(iv)) },
    key,
    normalizeArrayBuffer(fromBase64Url(ciphertext)),
  );

  return new TextDecoder().decode(decrypted);
}
