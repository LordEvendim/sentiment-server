export const prompts = {
  getPageInsightsPrompt: (pageName: string, periodDescription: string) =>
    `These metrics represent page insights for ${pageName} from the last ${periodDescription}. Analyze this data and generate suggestions what and how to improve. `,
  OVERVIEW_PROMPT:
    "You are a digital marketing data analyst, and you are required to summarize the key insights of given data and provide recommendations for optimizing ads and CRO recommendations that relate to the website data.",
};
