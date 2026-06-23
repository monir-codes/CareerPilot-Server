export const PromptTemplates = {
  resumeAnalyzer: (text: string) => `
    Analyze the following resume text and provide a structured JSON evaluation.
    Resume Text:
    ${text}
    
    Expected JSON Output Structure:
    {
      "score": number (0-100),
      "summary": string,
      "strengths": string[],
      "weaknesses": string[],
      "missingSkills": string[],
      "formattingSuggestions": string[],
      "keywordSuggestions": string[],
      "recommendedRoles": string[]
    }
  `,
  coverLetterGenerator: (details: any) => `
    Generate a professional cover letter. Return strictly a JSON object.
    Details: ${JSON.stringify(details)}
    
    Expected JSON Output:
    {
      "coverLetter": string (markdown format)
    }
  `,
  careerRoadmap: (details: any) => `
    Generate a career roadmap. Return strictly a JSON object.
    Details: ${JSON.stringify(details)}
    
    Expected JSON Output:
    {
      "weeklyGoals": string[],
      "monthlyGoals": string[],
      "projects": string[],
      "learningResources": string[],
      "interviewPlan": string[]
    }
  `,
  interviewAssistant: (role: string) => `
    Generate 3 technical interview questions for a ${role}.
    Expected JSON Output:
    {
      "questions": [
        { "question": string, "expectedKeyPoints": string[] }
      ]
    }
  `
};
