export const prompts = {
  getPageInsightsPrompt: (pageName: string, periodDescription: string) =>
    `These metrics represent page insights for ${pageName} from the last ${periodDescription}. Analyze this data and generate suggestions what and how to improve. `,
  OVERVIEW_PROMPT:
    "You are a digital marketing data analyst, and you are required to summarize the key insights of given data and provide recommendations for optimizing ads and CRO recommendations that relate to the website data.",
  getMetricReportPrompt: (metricName: string) =>
    `You are a digital marketing data analyst, and you are required to analyze the ${metricName} metric. Look for trends and changes. Provide insights and recommendations. Write answer using a maximum of 2 or 3 sentences`,
  CAMPAIGN_REPORT: `
Analyze which channels and campaigns saw the highest swings in advertising costs based on the data for the current and previous period. Write answers with an explanation using a maximum of 7 or 8 sentences. Provide accurate calculations for % increases or decreases.

Output Instructions: Use the data within the document for this example. Format the output similar to the following example: Google Ads had the highest spending costs (and outline the top three campaigns from greatest to least). Mention meta and campaigns. Don't mention unnecessary phrases like "Based on the data proved in the output" in the output.`,
};
