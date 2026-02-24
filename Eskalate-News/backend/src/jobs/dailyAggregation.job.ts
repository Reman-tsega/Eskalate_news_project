import { analyticsProcessor } from "../modules/analytics/analytics.processor";

export const dailyAggregationJob = async () => {
  return analyticsProcessor.aggregateDailyReads();
};
