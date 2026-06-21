import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// genAI — Gemini ka client banao
// API key .env se aati hai — directly nahi likhte security ke liye

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// gemini-1.5-flash — fast aur free model
// gemini-1.5-pro bhi hai — zyada smart but slow

// Interview questions generate karo
export const generateInterviewQuestions = async ({
  role,  // "sde","frontend","backend"
  difficulty, //"easy","medium","hard"
  type, // "technical", "behavioral", "coding"
  company, // "Google", "Amazon", "Meta"
  count = 10, // kitne questions — default 10
}) => {
  const prompt = `
    You are an expert technical interviewer at ${company || "a top tech company"}.
    
    Generate ${count} interview questions for:
    - Role: ${role}
    - Difficulty: ${difficulty}
    - Interview Type: ${type}

    Rules:
    - Questions should be realistic and asked in actual ${company || "FAANG"} interviews
    - Mix of conceptual and practical questions
    - For coding type — include problem statements
    - For behavioral — include situation based questions
    
    Return ONLY a JSON array like this, nothing else:
    [
      {
        "question": "question text here",
        "type": "${type}",
        "difficulty": "${difficulty}",
        "order": 1
      }
    ]
  `;

  const result = await model.generateContent(prompt);
  // Gemini ko prompt bhejo — response aata hai
  const response = result.response.text();
// response text mein convert karo
  // JSON parse karo
  const cleaned = response.replace(/```json|```/g, "").trim();
    // AI kabhi kabhi markdown backticks daal deta hai
  // ```json ... ``` — ye hata do
  // warna JSON.parse fail ho jayega
  const questions = JSON.parse(cleaned);

  return questions;
};

// Answer evaluate karo
export const evaluateAnswer = async ({
  question,
  answer,
  role,
  difficulty,
}) => {
  const prompt = `
    You are an expert technical interviewer.
    
    Evaluate this interview answer:
    
    Question: ${question}
    Candidate's Answer: ${answer}
    Role: ${role}
    Difficulty: ${difficulty}
    
    Return ONLY a JSON object like this, nothing else:
    {
      "score": 7,
      "feedback": "detailed feedback here",
      "strengths": ["strength 1", "strength 2"],
      "improvements": ["improvement 1", "improvement 2"],
      "idealAnswer": "what a perfect answer would look like"
    }
    
    Score should be between 0-10.
  `;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  const cleaned = response.replace(/```json|```/g, "").trim();
  const evaluation = JSON.parse(cleaned);

  return evaluation;
};

// Resume se questions generate karo
export const generateResumeQuestions = async ({ resumeText, role, count = 10 }) => {
  const prompt = `
    You are an expert technical interviewer.
    
    Based on this resume, generate ${count} personalized interview questions:
    
    Resume:
    ${resumeText}
    
    Role applying for: ${role}
    
    Rules:
    - Questions should be based on candidate's actual experience
    - Ask about specific projects mentioned
    - Ask about technologies they have used
    - Mix technical and behavioral questions
    
    Return ONLY a JSON array like this, nothing else:
    [
      {
        "question": "question text here",
        "type": "technical",
        "difficulty": "medium",
        "order": 1
      }
    ]
  `;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  const cleaned = response.replace(/```json|```/g, "").trim();
  const questions = JSON.parse(cleaned);

  return questions;
};

// Overall interview feedback generate karo
export const generateOverallFeedback = async ({ answers, role, company }) => {
  const prompt = `
    You are an expert technical interviewer at ${company || "a top tech company"}.
    
    Based on these interview answers, provide overall feedback:
    
    ${answers
      .map(
        (a, i) => `
    Q${i + 1}: ${a.question}
    Answer: ${a.transcript}
    Score: ${a.score}/10
    `
      )
      .join("\n")}
    
    Role: ${role}
    
    Return ONLY a JSON object like this, nothing else:
    {
      "overallScore": 7.5,
      "summary": "overall performance summary",
      "strengths": ["strength 1", "strength 2"],
      "improvements": ["area 1", "area 2"],
      "recommendation": "Strong Hire / Hire / No Hire",
      "nextSteps": ["what to study", "what to practice"]
    }
  `;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  const cleaned = response.replace(/```json|```/g, "").trim();
  const feedback = JSON.parse(cleaned);

  return feedback;
};