export function makeId(length) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function formatWithLamports(num): number {
  return Math.floor(num * 1000000000) / 1000000000;
}

export const bannedWords = ['admin', 'moderator', 'system', 'root'];
