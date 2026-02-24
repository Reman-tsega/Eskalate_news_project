export const analyticsProcessor = {
  aggregateDailyReads: () => {
    return { processed: true, at: new Date().toISOString() };
  },
};
