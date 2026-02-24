import { analyticsProcessor } from "../modules/analytics/analytics.processor";

export const dailyAggregationJob = async (date?: Date) => {
  return analyticsProcessor.aggregateDailyReads(date);
};

