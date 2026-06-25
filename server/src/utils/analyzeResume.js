import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const analyzeResume = async (extractedText) => {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content:
          "You are a resume analysis expert. Always respond with valid JSON only. No markdown, no explanation, no code fences, just the raw JSON object.",
      },
      {
        role: "user",
        content: `
Analyze the following resume text and return a JSON object with this EXACT structure:

{
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Start – End",
      "description": "What they did"
    }
  ],
  "education": [
    {
      "institution": "College/School Name",
      "degree": "Degree Name",
      "year": "Year or duration",
      "grade": "CGPA or percentage if mentioned"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "What it does",
      "techStack": ["tech1", "tech2"]
    }
  ],
  "atsScore": <number 0-100>,
  "atsFeedback": "2-3 lines explaining the score and improvements"
}

ATS Score Criteria:
- Clarity and structure (20 pts)
- Measurable achievements (20 pts)
- Technical skills depth (20 pts)
- Project quality (20 pts)
- Education and certifications (20 pts)

Resume Text:
"""
${extractedText}
"""
        `,
      },
    ],
  });

  const raw = response.choices[0].message.content.trim();

  // Strip markdown fences if Groq adds them
  const cleaned = raw.replace(/^```json|^```|```$/gm, "").trim();

  const parsed = JSON.parse(cleaned);
  return parsed;
};