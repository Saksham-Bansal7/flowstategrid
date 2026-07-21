export function stableAgoraUid(userId: string): number {
  let hash = 2166136261;

  for (let i = 0; i < userId.length; i += 1) {
    hash ^= userId.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const uid = hash >>> 0;
  return uid === 0 ? 1 : uid;
}
