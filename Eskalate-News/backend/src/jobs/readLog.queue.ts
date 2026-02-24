import { prisma } from "../database/prisma";

type ReadLogPayload = {
  articleId: string;
  readerId: string | null;
  clientId: string;
};

const READ_DEDUP_WINDOW_MS = 10_000;
const recentReads = new Map<string, number>();

const getReadKey = (payload: ReadLogPayload) => {
  const actor = payload.readerId ?? payload.clientId;
  return `${payload.articleId}:${actor}`;
};

const shouldSkipRead = (payload: ReadLogPayload) => {
  const key = getReadKey(payload);
  const now = Date.now();
  const expiresAt = recentReads.get(key);

  if (expiresAt && expiresAt > now) {
    return true;
  }

  recentReads.set(key, now + READ_DEDUP_WINDOW_MS);
  return false;
};

export const readLogQueue = {
  enqueue: async (payload: ReadLogPayload) => {
    if (shouldSkipRead(payload)) {
      return { queued: false, reason: "deduplicated" };
    }

    setImmediate(() => {
      void prisma.readLog
        .create({
          data: {
            articleId: payload.articleId,
            readerId: payload.readerId,
          },
        })
        .catch(() => {
          // Intentionally ignored to keep read tracking non-blocking.
        });
    });

    return { queued: true };
  },
};

export const resetReadLogQueueStateForTests = () => {
  recentReads.clear();
};

