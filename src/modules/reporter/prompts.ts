export const prompts = {
  getPageInsightsPrompt: (pageName: string, periodDescription: string) =>
    `These metrics represent page insights for ${pageName} from the last ${periodDescription}. Analyze this data and generate suggestions what and how to improve. `,
};
