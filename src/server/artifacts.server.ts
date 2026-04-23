// ─── Criptografia de artefatos SaudeJusia ─────────────────────────────────
// Server-only. Não importar do client.
//
// Web Crypto API (HKDF-SHA256 + AES-256-GCM). Compatível com Cloudflare
// Workers, Deno e Node 18+. Não usar node:crypto.hkdfSync — incompatível
// com runtime de edge.
//
// Layout do blob: [iv (12 bytes)] [ciphertext + auth tag inline]
// AES-GCM no Web Crypto inclui o tag automaticamente no final do ciphertext.

const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

/** Cria um Uint8Array com ArrayBuffer próprio (não SharedArrayBuffer). */
function newBytes(len: number): Uint8Array {
  return new Uint8Array(new ArrayBuffer(len));
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = newBytes(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function asBuffer(bytes: Uint8Array): ArrayBuffer {
  // Garante ArrayBuffer "puro" (não SharedArrayBuffer) para o tipo BufferSource estrito do TS.
  if (bytes.buffer instanceof ArrayBuffer && bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength) {
    return bytes.buffer;
  }
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  return ab;
}

function getMasterKeyBytes(): Uint8Array {
  const raw = process.env.ARTIFACT_ENCRYPTION_KEY;
  if (!raw) throw new Error("ARTIFACT_ENCRYPTION_KEY_NOT_CONFIGURED");
  const keyBytes = base64ToBytes(raw);
  if (keyBytes.byteLength !== 32) {
    throw new Error("ARTIFACT_ENCRYPTION_KEY_INVALID_LENGTH");
  }
  return keyBytes;
}

async function getMasterKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    asBuffer(getMasterKeyBytes()),
    { name: "HKDF" },
    false,
    ["deriveKey"],
  );
}

async function deriveFileKey(
  master: CryptoKey,
  artifactId: string,
): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: asBuffer(ENCODER.encode(artifactId)),
      info: asBuffer(ENCODER.encode("saudejusia-artifact-v1")),
    },
    master,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptArtifact(
  payload: object,
  artifactId: string,
): Promise<Uint8Array> {
  const master = await getMasterKey();
  const fileKey = await deriveFileKey(master, artifactId);
  const iv = newBytes(12);
  crypto.getRandomValues(iv);
  const plaintext = ENCODER.encode(JSON.stringify(payload));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: asBuffer(iv) },
      fileKey,
      asBuffer(plaintext),
    ),
  );
  const out = newBytes(iv.byteLength + ciphertext.byteLength);
  out.set(iv, 0);
  out.set(ciphertext, iv.byteLength);
  return out;
}

export async function decryptArtifact(
  blob: Uint8Array,
  artifactId: string,
): Promise<object> {
  if (blob.byteLength < 13) throw new Error("ARTIFACT_BLOB_INVALID");
  const master = await getMasterKey();
  const fileKey = await deriveFileKey(master, artifactId);
  const iv = blob.subarray(0, 12);
  const ciphertext = blob.subarray(12);
  const plaintext = new Uint8Array(
    await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: asBuffer(iv) },
      fileKey,
      asBuffer(ciphertext),
    ),
  );
  return JSON.parse(DECODER.decode(plaintext));
}

/**
 * Helper para gerar uma chave mestra base64 nova.
 * Uso operacional: em terminal local rodar
 *   `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
 * Esta função existe para testes e geração on-the-fly se necessário.
 */
export function generateMasterKeyBase64(): string {
  const bytes = newBytes(32);
  crypto.getRandomValues(bytes);
  return bytesToBase64(bytes);
}

export function isEncryptionConfigured(): boolean {
  try {
    getMasterKeyBytes();
    return true;
  } catch {
    return false;
  }
}
