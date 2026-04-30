/**
 * Modulo de Encriptacion usando WebCrypto API (AES-GCM)
 * Ideal para el entorno de Convex/Edge.
 */

// Obtenemos la llave maestra desde las variables de entorno de Convex
// Esta debe ser una llave de 256 bits (32 bytes) codificada en base64
function getMasterKeyBuffer(): Uint8Array {
  const masterKeyBase64 = process.env.GOOGLE_TOKENS_MASTER_KEY;
  if (!masterKeyBase64) {
    throw new Error("Missing GOOGLE_TOKENS_MASTER_KEY environment variable");
  }
  
  // Convertir Base64 a Uint8Array
  const binaryString = atob(masterKeyBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Inicializa e importa la llave para uso con WebCrypto
async function getCryptoKey(): Promise<CryptoKey> {
  const keyBuffer = getMasterKeyBuffer();
  return await crypto.subtle.importKey(
    "raw",
    keyBuffer as BufferSource,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Cifra un texto usando AES-GCM
 * @returns { encrypted: string, iv: string } (ambos base64) agrupados como un solo string
 */
export async function encryptToken(text: string): Promise<string> {
  const key = await getCryptoKey();
  
  // Generar Vector de Inicializacion (IV) de 12 bytes para GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encodedText = new TextEncoder().encode(text);
  
  const cipherBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encodedText
  );

  // Convertir cipherBuffer a Base64
  const cipherArray = Array.from(new Uint8Array(cipherBuffer));
  const cipherBase64 = btoa(String.fromCharCode.apply(null, cipherArray));
  
  // Convertir IV a Base64
  const ivArray = Array.from(iv);
  const ivBase64 = btoa(String.fromCharCode.apply(null, ivArray));

  // Combinar IV + CipherText (separados por un punto)
  return `${ivBase64}.${cipherBase64}`;
}

/**
 * Descifra un string cifrado por encryptToken
 */
export async function decryptToken(encryptedString: string): Promise<string> {
  const key = await getCryptoKey();
  
  const parts = encryptedString.split(".");
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted string format");
  }
  
  const ivBase64 = parts[0]!;
  const cipherBase64 = parts[1]!;
  
  // Decodificar IV
  const ivBinaryString = atob(ivBase64);
  const iv = new Uint8Array(ivBinaryString.length);
  for (let i = 0; i < ivBinaryString.length; i++) {
    iv[i] = ivBinaryString.charCodeAt(i);
  }
  
  // Decodificar Cipher
  const cipherBinaryString = atob(cipherBase64);
  const cipher = new Uint8Array(cipherBinaryString.length);
  for (let i = 0; i < cipherBinaryString.length; i++) {
    cipher[i] = cipherBinaryString.charCodeAt(i);
  }

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    cipher
  );

  return new TextDecoder().decode(decryptedBuffer);
}
