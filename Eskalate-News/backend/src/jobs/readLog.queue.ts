export const readLogQueue = {
  enqueue: async (payload: unknown) => {
    return { queued: true, payload };
  },
};
