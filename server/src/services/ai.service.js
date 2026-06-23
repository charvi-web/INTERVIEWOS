import Groq from "groq-sdk";
// Groq — fastest LLM inference engine
// Meta ka Llama model use karta hai — GPT-4 level quality
// OpenAI jaisa hi API format — easy to switch

// Interview questions generate karo
export const generateInterviewQuestions = async ({
  role,       // "sde","frontend","backend"
  difficulty, // "easy","medium","hard"
  type,       // "technical", "behavioral", "coding"
  company,    // "Google", "Amazon", "Meta"
  count = 10, // kitne questions — default 10
}) => {
  // har function ke andar client banao
  // taaki dotenv pehle load ho jaye
  // top level pe banane se env variables nahi milte
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  // groq.chat.completions.create — Groq ko prompt bhejo
  // OpenAI jaisa hi API format hai — isliye easy to switch
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    // llama-3.3-70b — Meta ka model — GPT-4 level quality
    // versatile — general purpose tasks ke liye best
    messages: [
      {
        role: "user",
        // role: "user" — hum AI se bol rahe hain
        // role: "assistant" — AI ka response hota hai
        // role: "system" — AI ko role define karo
        content: `
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
        `,
      },
    ],
    temperature: 0.7,
    // temperature — creativity level
    // 0 = same response har baar — deterministic
    // 1 = zyada creative — random
    // 0.7 = balance — interview questions ke liye best
  });

  // AI ka response extract karo
  const response = completion.choices[0].message.content;
  // choices[0] — pehla response lo
  // message.content — actual text

  // Markdown backticks hata do agar AI ne daale
  // AI kabhi kabhi ```json ... ``` wrap kar deta hai
  const cleaned = response.replace(/```json|```/g, "").trim();

  // String ko actual JavaScript array mein convert karo
  const questions = JSON.parse(cleaned);

  return questions;
  // Controller ko array milta hai — DB mein save karta hai
};

// Answer evaluate karo
export const evaluateAnswer = async ({
  question,   // jo question pucha tha
  answer,     // user ne jo bola — Speech to Text se aayega
  role,       // context ke liye
  difficulty, // scoring strictness ke liye
}) => {
  // har function mein naya client — env variable fresh milta hai
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `
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
        `,
      },
    ],
    temperature: 0.7,
  });

  const response = completion.choices[0].message.content;
  const cleaned = response.replace(/```json|```/g, "").trim();

  // evaluation object parse karo
  // { score, feedback, strengths, improvements, idealAnswer }
  const evaluation = JSON.parse(cleaned);

  return evaluation;
  // Controller answer DB mein save karta hai evaluation ke saath
};

// Resume se questions generate karo
export const generateResumeQuestions = async ({
  resumeText, // PDF se extract hua text
  role,       // applying for kya
  count = 10,
}) => {
  // har function mein naya client banao
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `
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
        `,
      },
    ],
    temperature: 0.7,
  });

  const response = completion.choices[0].message.content;
  const cleaned = response.replace(/```json|```/g, "").trim();
  const questions = JSON.parse(cleaned);

  return questions;
  // Resume specific questions — FAANG mein yahi hota hai
  // "Tell me about this project you mentioned..."
};

// Overall interview feedback generate karo
export const generateOverallFeedback = async ({ answers, role, company }) => {
  // har function mein naya client banao
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `
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
        `,
      },
    ],
    temperature: 0.7,
  });

  const response = completion.choices[0].message.content;
  const cleaned = response.replace(/```json|```/g, "").trim();

  // final report card parse karo
  // overallScore, recommendation, nextSteps
  const feedback = JSON.parse(cleaned);

  return feedback;
  // Frontend pe final report card dikhta hai
  // Charts mein score visualize hota hai
};