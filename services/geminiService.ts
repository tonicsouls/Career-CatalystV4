

import { GoogleGenAI, Type, Modality } from "@google/genai";
import { BrainDumpModule, GeneratedResumeData, TimelineEvent, ProjectDetails, InitialAnalysisResult, CategorizedSkills, EducationSection, HeadshotPresetSettings } from "../types";

// Ensure the API key is available, otherwise throw an error.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const brainDumpSchema = {
    type: Type.OBJECT,
    properties: {
        modules: {
            type: Type.ARRAY,
            description: "An array of career modules, one for each distinct job or event from the user's timeline.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "The unique ID of the corresponding timeline event." },
                    title: { type: Type.STRING, description: "The job title or event name." },
                    date: { type: Type.STRING, description: "The dates for this role or event." },
                    stories: {
                        type: Type.ARRAY,
                        description: "A list of key stories or achievements from this role, extracted from the resume.",
                        items: {
                             type: Type.OBJECT,
                             properties: {
                                id: { type: Type.NUMBER, description: "A unique ID for the story, e.g., timestamp." },
                                text: { type: Type.STRING, description: "The achievement text, extracted directly from the resume bullet point." },
                                isPlaceholder: { type: Type.BOOLEAN, description: "Should always be true for initial generation." },
                                prompt: { type: Type.STRING, description: "A targeted question to prompt the user to add more detail, results, or context to this specific story. (e.g., 'What was the quantifiable result of this initiative?')." },
                             },
                             required: ["id", "text", "isPlaceholder", "prompt"],
                        }
                    }
                },
                required: ["id", "title", "date", "stories"],
            }
        }
    },
    required: ["modules"],
};


const projectionsSchema = {
    type: Type.OBJECT,
    properties: {
        careerProjections: {
            type: Type.ARRAY,
            description: "Based on the user's experience and target role, suggest 2-3 related, alternative career paths or next-level roles they are well-suited for.",
            items: {
                type: Type.OBJECT,
                properties: {
                    role: { type: Type.STRING, description: "The suggested job title." },
                    reason: { type: Type.STRING, description: "A brief, 1-2 sentence explanation of why this role is a good fit." },
                }
            }
        }
    }
}

const coreCompetenciesSchema = {
    type: Type.ARRAY,
    description: "Generate 4 distinct versions for the 'Core Competencies' section. Each version should present the candidate's skills in a categorized format based on the resume and target job. Categories should be relevant to the candidate's field, such as 'Technical Acumen', 'Methodologies', 'Industry Verticals', 'Data Analysis', etc. The skills within each category should be a detailed string, not an array.",
    items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING, description: "A unique identifier for this version, e.g., 'version-1'." },
            title: { type: Type.STRING, description: "A descriptive title for this competency layout, e.g., 'Option 1: Functional Breakdown'." },
            categories: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING, description: "The name of the skill category (e.g., 'Data Analysis')." },
                        details: { type: Type.STRING, description: "A string containing the skills for this category, often starting with a brief description. Example: 'Familiar with SQL and Python for data mining and analysis, expertise in time-series forecasting (ARIMA)'." }
                    },
                    required: ["category", "details"]
                }
            }
        },
        required: ["id", "title", "categories"]
    }
};


const resumeSchema = {
    type: Type.OBJECT,
    properties: {
        contactInfo: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                location: { type: Type.STRING },
                phone: { type: Type.STRING },
                email: { type: Type.STRING },
                linkedin: { type: Type.STRING },
            }
        },
        executiveSummaries: {
            type: Type.ARRAY,
            description: "Generate 3 distinct versions of an executive summary. One professional, one more direct and results-oriented, and one that is slightly more creative.",
            items: { type: Type.STRING },
        },
        coreCompetencies: coreCompetenciesSchema,
        experience: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    company: { type: Type.STRING },
                    location: { type: Type.STRING },
                    dates: { type: Type.STRING },
                    achievements: { 
                        type: Type.ARRAY,
                        description: "A list of 3-5 bullet points for this role, rewritten to be achievement-focused using the STAR method (Situation, Task, Action, Result). Each bullet should start with a strong action verb.",
                        items: { type: Type.STRING }
                    },
                }
            }
        },
        education: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    degree: { type: Type.STRING },
                    institution: { type: Type.STRING },
                }
            }
        },
        careerProjections: projectionsSchema.properties.careerProjections
    }
};

const coverLetterSchema = {
    type: Type.OBJECT,
    properties: {
        coverLetter: {
            type: Type.STRING,
            description: "The full text of the generated cover letter, written in a professional and engaging tone based on the user's unique voice from their stories."
        }
    },
    required: ["coverLetter"],
};

const interviewQuestionsSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            description: "A list of 5-7 tailored interview questions.",
            items: { type: Type.STRING },
        }
    },
    required: ["questions"],
};

const interviewFeedbackSchema = {
    type: Type.OBJECT,
    properties: {
        clarity: {
            type: Type.STRING,
            description: "Feedback on the clarity and conciseness of the answer."
        },
        impact: {
            type: Type.STRING,
            description: "Feedback on how well the answer demonstrates impact and results."
        },
        starMethodAdherence: {
            type: Type.STRING,
            description: "Feedback on how well the answer follows the STAR (Situation, Task, Action, Result) method."
        },
        overallSuggestion: {
            type: Type.STRING,
            description: "A final, actionable suggestion for improving the answer."
        }
    },
    required: ["clarity", "impact", "starMethodAdherence", "overallSuggestion"],
};

const linkedInHeadlineSchema = {
    type: Type.OBJECT,
    properties: {
        headlines: {
            type: Type.ARRAY,
            description: "A list of 3-5 distinct, keyword-optimized LinkedIn headlines.",
            items: { type: Type.STRING },
        }
    },
    required: ["headlines"],
};

const linkedInSummarySchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A compelling, narrative-driven LinkedIn summary ('About' section) written in the first person."
        }
    },
    required: ["summary"],
};

const recommendationRequestSchema = {
    type: Type.OBJECT,
    properties: {
        requestMessage: {
            type: Type.STRING,
            description: "The full text of the generated LinkedIn recommendation request message, written in a polite and professional tone."
        }
    },
    required: ["requestMessage"],
};

const elevatorPitchSchema = {
    type: Type.OBJECT,
    properties: {
        pitches: {
            type: Type.ARRAY,
            description: "An array of 3 distinct pitch variations.",
            items: { type: Type.STRING },
        }
    },
    required: ["pitches"],
};

const initialAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        contactInfo: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "The candidate's full name." },
                email: { type: Type.STRING, description: "The candidate's primary email address." },
                phone: { type: Type.STRING, description: "The candidate's phone number." },
                linkedin: { type: Type.STRING, description: "The full URL of the candidate's LinkedIn profile." },
                location: { type: Type.STRING, description: "The candidate's city and state (e.g., Dallas, TX)." },
            },
            required: ["name", "email"]
        },
        summary: { 
            type: Type.STRING, 
            description: "A concise 2-3 sentence professional summary of the candidate based on the entirety of their resume(s)." 
        },
        keySkills: {
            type: Type.ARRAY,
            description: "A list of the top 10-15 most important technical and soft skills mentioned in the resume(s).",
            items: { type: Type.STRING }
        },
        experience: {
            type: Type.ARRAY,
            description: "The candidate's professional work experience, listed chronologically.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    company: { type: Type.STRING },
                    location: { type: Type.STRING },
                    dates: { type: Type.STRING },
                    achievements: { 
                        type: Type.ARRAY,
                        description: "A list of bullet points describing responsibilities and achievements, extracted directly from the resume.",
                        items: { type: Type.STRING }
                    },
                },
                required: ["title", "company", "dates", "achievements"]
            }
        },
        education: {
            type: Type.ARRAY,
            description: "The candidate's educational background.",
            items: {
                type: Type.OBJECT,
                properties: {
                    degree: { type: Type.STRING },
                    institution: { type: Type.STRING },
                    dates: { type: Type.STRING, description: "Graduation year or dates of attendance." },
                },
                required: ["degree", "institution"]
            }
        },
        matchAnalysis: {
            type: Type.OBJECT,
            description: "This field should ONLY be populated if a job description is provided. Otherwise, it should be omitted.",
            properties: {
                matchSummary: { type: Type.STRING, description: "A brief, 1-2 sentence analysis of how well the resume(s) align with the job description." },
                matchingKeywords: {
                    type: Type.ARRAY,
                    description: "A list of 5-8 crucial keywords found in BOTH the resume(s) and the job description.",
                    items: { type: Type.STRING }
                },
                missingKeywords: {
                    type: Type.ARRAY,
                    description: "A list of 3-5 important keywords from the job description that are MISSING from the resume(s).",
                    items: { type: Type.STRING }
                }
            },
            required: ["matchSummary", "matchingKeywords", "missingKeywords"]
        }
    },
    required: ["contactInfo", "summary", "keySkills", "experience", "education"]
};

const skillsCategorizationSchema = {
    type: Type.OBJECT,
    properties: {
        categorizedSkills: {
            type: Type.ARRAY,
            description: "A list of 4 skill categories with the provided skills grouped under them.",
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING, description: "The name of the skill category (e.g., 'Technical Skills', 'Leadership & Management')." },
                    skills: {
                        type: Type.ARRAY,
                        description: "A list of the skills belonging to this category.",
                        items: { type: Type.STRING }
                    }
                },
                required: ["category", "skills"]
            }
        }
    },
    required: ["categorizedSkills"]
};

const suggestedSkillsSchema = {
    type: Type.OBJECT,
    properties: {
        suggestedSkills: {
            type: Type.ARRAY,
            description: "A list of 5-7 suggested skills.",
            items: { type: Type.STRING },
        }
    },
    required: ["suggestedSkills"],
};

const jobTitleSchema = {
    type: Type.OBJECT,
    properties: {
        jobTitle: {
            type: Type.STRING,
            description: "The job title extracted from the job description text."
        }
    },
    required: ["jobTitle"],
};

const summaryOptionsSchema = {
    type: Type.OBJECT,
    properties: {
        summaries: {
            type: Type.ARRAY,
            description: "A list of 3 distinct professional summary versions.",
            items: { type: Type.STRING },
        }
    },
    required: ["summaries"],
};

const enhancementSuggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            description: "An array of suggestions for each provided achievement.",
            items: {
                type: Type.OBJECT,
                properties: {
                    original: { type: Type.STRING, description: "The original achievement text." },
                    enhancements: {
                        type: Type.ARRAY,
                        description: "A list of 2-3 suggested improvements.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, description: "The type of suggestion (e.g., 'Add Metrics', 'Use Action Verb', 'Clarify Impact')." },
                                text: { type: Type.STRING, description: "The rewritten achievement text." },
                            },
                             required: ["type", "text"],
                        }
                    }
                },
                required: ["original", "enhancements"],
            }
        }
    },
    required: ["suggestions"],
};

const educationSchema = {
    type: Type.OBJECT,
    properties: {
        degree: { type: Type.STRING, description: "The degree obtained (e.g., 'Bachelor of Science in Computer Science')." },
        institution: { type: Type.STRING, description: "The name of the institution (e.g., 'University of Texas at Austin')." },
        dates: { type: Type.STRING, description: "The graduation year or dates of attendance (e.g., '2018 - 2022' or 'May 2022')." },
    },
    required: ["degree", "institution"],
};

const headshotPresetSchema = {
    type: Type.OBJECT,
    properties: {
        style: {
            type: Type.STRING,
            description: "The recommended overall style for the headshot.",
        },
        businessCategory: {
            type: Type.STRING,
            description: "The business category that best fits the professional.",
        },
        lighting: {
            type: Type.STRING,
            description: "The suggested lighting for the headshot.",
        },
        setting: {
            type: Type.STRING,
            description: "The recommended background or setting.",
        },
        reasoning: {
            type: Type.STRING,
            description: "A brief, 1-2 sentence explanation for these choices, based on the resume."
        }
    },
    required: ["style", "businessCategory", "lighting", "setting", "reasoning"],
};

/**
 * Analyzes a resume and timeline to structure an initial Brain Dump for the user.
 * @param timelineEvents The user's career timeline events.
 * @returns An array of BrainDumpModule objects with AI-generated prompts.
 */
export const structureInitialBrainDump = async (timelineEvents: TimelineEvent[]): Promise<BrainDumpModule[]> => {
  const context = timelineEvents.map(event => 
    `## Role/Event: ${event.title} (${event.date})\nID: ${event.id}\n**Resume Content for this role:**\n${event.description}`
  ).join('\n\n---\n\n');

  const prompt = `
    Act as an expert career coach. Your task is to analyze the provided career timeline and resume content to structure an initial "Brain Dump" for the user. The goal is to extract key achievements and prompt the user to add more detail and quantifiable results. The output must be a valid JSON object adhering to the schema.

    **User's Career Data:**
    ---
    ${context}
    ---

    **Instructions:**
    1.  For each "Role/Event" provided, create a corresponding module in the output. Use the provided ID.
    2.  For each module, parse the "Resume Content" and treat each bullet point or distinct achievement as a "story".
    3.  For each story, set 'isPlaceholder' to true.
    4.  CRITICAL: For each story, create a targeted, insightful 'prompt' that encourages the user to elaborate. Ask for numbers, context, or the "so what" factor. For example, if a story says "Increased efficiency," a good prompt would be "By what percentage did you increase efficiency, and what was the business impact?". Avoid generic prompts.
    5. Ensure the final output is a single, valid JSON object matching the schema.
  `;
  
  try {
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: brainDumpSchema,
        }
    });
    
    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    return result.modules || [];

  } catch (error) {
    console.error("Error structuring brain dump:", error);
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse the AI's response. The format was invalid. Please try again.");
    }
    throw new Error("Failed to structure brain dump with AI. Please check the console for details.");
  }
};


export const generateResume = async (timeline: TimelineEvent[], brainDump: BrainDumpModule[], jobDescription: string): Promise<any> => {
    const timelineContext = timeline.map(event => `## ${event.title} (${event.date})\n${event.description}`).join('\n\n');
    const brainDumpContext = brainDump.map(module => 
        `## Stories for ${module.title}\n` +
        module.stories.map(story => `- ${story.text}`).join('\n')
    ).join('\n\n');

    const prompt = `
        Act as an expert career coach and professional resume writer. Your task is to synthesize the provided information into a complete, achievement-oriented resume. The output must be a valid JSON object that strictly adheres to the provided schema.

        **Candidate's Information:**

        **1. Career Timeline (High-Level Experience):**
        ---
        ${timelineContext}
        ---

        **2. Detailed Career Stories (Brain Dump - use for achievement bullet points):**
        ---
        ${brainDumpContext}
        ---

        **3. Target Job Description (for tailoring):**
        ---
        ${jobDescription}
        ---

        **Instructions:**
        1.  **Parse all provided information.** Extract contact details, skills, and work history.
        2.  **Core Competencies:** This is critical. Generate FOUR distinct, categorized versions of the candidate's core competencies. Analyze the resume and job description to create logical groupings (e.g., Technical Acumen, Methodologies, Industry Knowledge, Leadership). Each version should have a unique title. Format this according to the schema.
        3.  **Rewrite Experience:** For each role in the experience section, use the "Detailed Career Stories" to write 3-5 powerful, quantifiable achievement bullet points. Start each bullet with a strong action verb.
        4.  **Executive Summaries:** Generate THREE distinct versions of an executive summary, as described in the schema.
        5.  **Career Projections:** Based on the user's complete profile and the target job, provide 2-3 insightful career projections.
        6.  **Format:** Ensure the final output is a single, valid JSON object matching the schema. Do not include any text or markdown outside of the JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: resumeSchema,
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating resume:", error);
        if (error instanceof SyntaxError) {
            throw new Error("Failed to parse the AI's resume response. The format was invalid. Please try again.");
        }
        throw new Error("Failed to generate AI Resume. Please check the console for details.");
    }
};

export const tailorResumeFromVersion = async (baseResume: GeneratedResumeData, newJobDescription: string, userNotes: string): Promise<GeneratedResumeData> => {
    const prompt = `
        Act as an expert resume writer. You are tasked with tailoring an existing resume for a new job application.

        **1. Base Resume Data (JSON format):**
        ---
        ${JSON.stringify(baseResume, null, 2)}
        ---

        **2. New Target Job Description:**
        ---
        ${newJobDescription}
        ---

        **3. Additional User Notes for Tailoring:**
        ---
        ${userNotes || "No additional notes provided."}
        ---

        **Instructions:**
        1.  **Analyze the New Job Description:** Identify the key skills, responsibilities, and qualifications required.
        2.  **Rewrite Executive Summary:** Craft a new executive summary that directly addresses the new role, using language from the job description. Generate 3 versions as per the schema.
        3.  **Update Core Competencies:** Re-evaluate and rewrite the 4 versions of the categorized 'Core Competencies' to align with the new job description. Prioritize skills and create categories that are most relevant to the new role, based on the base resume's competencies and the new JD.
        4.  **Tailor Achievements:** Review the experience bullet points from the base resume. Rephrase them to highlight the most relevant accomplishments for the new job. Ensure they remain achievement-oriented (e.g., using STAR method).
        5.  **Maintain Structure:** The output must be a complete, valid JSON object that strictly adheres to the provided resume schema. Do not change the fundamental work history or education, only the presentation and emphasis.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: resumeSchema,
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error tailoring resume:", error);
        throw new Error("Failed to tailor AI Resume. Please check your inputs and try again.");
    }
};

export const regenerateProjections = async (resumeData: GeneratedResumeData, customInput: string): Promise<GeneratedResumeData['careerProjections']> => {
    const prompt = `
        Act as a career strategist. Based on the user's existing resume summary and their new stated interest, generate 2-3 refined career projections. The output must be a valid JSON object matching the schema.

        **User's Executive Summary (for context):**
        ---
        ${resumeData.executiveSummaries[0]}
        ---

        **User's Stated Interest:**
        ---
        "${customInput}"
        ---

        **Instructions:**
        Generate new projections that align the user's established experience with their new interest. Provide a brief reason for each projection.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: projectionsSchema,
            }
        });
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return result.careerProjections || [];
    } catch (error) {
        console.error("Error regenerating projections:", error);
        throw new Error("Failed to refine career projections.");
    }
};

export const refineBrainDumpStory = async (storyText: string, instruction: string): Promise<string> => {
    const prompt = `
        Act as a professional resume writer. Your task is to refine the following career story based on a specific instruction.
        
        **Instruction:** ${instruction}
        
        **Original Story:**
        ---
        ${storyText}
        ---

        Please provide only the rewritten story text as a raw string, without any extra formatting or explanation.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error refining story:", error);
        throw new Error("Failed to refine the story with AI.");
    }
};

export const summarizeProjectDetails = async (details: ProjectDetails): Promise<string> => {
    const prompt = `
      Act as an expert resume writer. Your task is to synthesize the following structured project details into a single, compelling, and concise paragraph. This paragraph will be used as a bullet point or a short description in a resume. Focus on action verbs and quantifiable outcomes.

      **Project Details:**
      - **Category:** ${details.category}
      - **Company/Context (Where):** ${details.where}
      - **Timeline (When):** ${details.when}
      - **Stakeholders (Who):** ${details.who.join(', ')}
      - **Actions Taken (What):** ${details.what.join(', ')}
      - **Key Outcome:** ${details.outcome}

      **Instructions:**
      1.  Start with a strong action verb derived from the 'Actions Taken'.
      2.  Integrate the most important details from "Actions Taken" and "Stakeholders".
      3.  Crucially, end with the "Key Outcome", making it the highlight of the story.
      4.  Keep the tone professional and results-oriented.
      5.  The output must be a single string of text, no longer than 3-4 sentences. Do not use markdown or JSON.
    `;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error summarizing project:", error);
        throw new Error("Failed to summarize the project with AI.");
    }
};


export const generateCoverLetter = async (resume: GeneratedResumeData, brainDump: BrainDumpModule[], jobDescription: string, optionalInputs: { hiringManager?: string }): Promise<string> => {
    const resumeSummary = `**Executive Summary:**\n${resume.executiveSummaries[0]}\n\n**Key Competencies:**\n- ${resume.coreCompetencies[0].categories.map(c => `${c.category}: ${c.details}`).join('\n- ')}`;
    const brainDumpContext = brainDump.map(module => 
        `## Stories from ${module.title}\n` +
        module.stories.filter(s => s.text.trim()).map(story => `- ${story.text}`).join('\n')
    ).join('\n\n');

    const prompt = `
        Act as an expert career coach and professional writer. Your goal is to write a compelling, tailored cover letter.

        **Core Task:** Analyze the user's resume summary and their detailed "brain dump" stories to understand their unique "voice," accomplishments, and communication style. Then, craft a cover letter that is highly tailored to the target job description.

        **Candidate's Name:** ${resume.contactInfo.name}
        ${optionalInputs.hiringManager ? `**Hiring Manager's Name:** ${optionalInputs.hiringManager}` : ''}

        **1. Candidate's Resume Summary & Skills (for high-level context):**
        ---
        ${resumeSummary}
        ---

        **2. Candidate's Brain Dump Stories (CRITICAL for capturing their 'voice' and specific achievements):**
        ---
        ${brainDumpContext}
        ---

        **3. Target Job Description:**
        ---
        ${jobDescription}
        ---

        **Instructions:**
        1.  **Emulate Voice:** The most important task is to write in a style that reflects the user's own words from their "Brain Dump Stories." If their stories are direct and data-driven, the letter should be too. If they are more narrative, reflect that.
        2.  **Connect Stories to Job:** Select 1-2 of the most relevant stories from the brain dump and weave them into the cover letter to directly address requirements in the job description.
        3.  **Structure:** Follow a standard professional cover letter format.
        4.  **Output:** Provide a valid JSON object matching the schema. The cover letter should be a single string with appropriate line breaks (\\n).
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: coverLetterSchema,
            }
        });
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return result.coverLetter;
    } catch (error) {
        console.error("Error generating cover letter:", error);
        throw new Error("Failed to generate AI Cover Letter.");
    }
};

export const adjustCoverLetterTone = async (coverLetterText: string, instruction: string): Promise<string> => {
    const prompt = `
        Act as a professional editor. Rewrite the following cover letter to have a different tone.
        
        **Instruction:** Make the tone "${instruction}".
        
        **Original Cover Letter:**
        ---
        ${coverLetterText}
        ---

        Please provide only the rewritten cover letter text as a raw string.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error adjusting cover letter tone:", error);
        throw new Error("Failed to adjust the tone with AI.");
    }
};

export const generateInterviewQuestions = async (resumeData: GeneratedResumeData, jobDescription: string): Promise<string[]> => {
    const prompt = `
        Act as a senior hiring manager for the role described in the job description. Your task is to generate 5-7 insightful interview questions based on the candidate's resume and the target role.

        **Candidate's Resume (JSON):**
        ---
        ${JSON.stringify(resumeData, null, 2)}
        ---

        **Target Job Description:**
        ---
        ${jobDescription}
        ---

        **Instructions:**
        1.  Generate a mix of behavioral questions (e.g., "Tell me about a time when..."), situational questions (e.g., "How would you handle..."), and resume-specific questions (e.g., "Can you elaborate on your achievement in...").
        2.  The questions should directly probe the skills and experiences required by the job description and present on the resume.
        3.  The output must be a valid JSON object adhering to the schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: interviewQuestionsSchema,
            }
        });
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return result.questions || [];
    } catch (error) {
        console.error("Error generating interview questions:", error);
        throw new Error("Failed to generate AI interview questions.");
    }
};

export const analyzeInterviewAnswer = async (question: string, answer: string, resumeData: GeneratedResumeData, jobDescription: string): Promise<any> => {
    const prompt = `
        Act as an expert interview coach. Your task is to analyze a candidate's answer to an interview question and provide constructive feedback.

        **The Question Asked:**
        ---
        ${question}
        ---
        
        **The Candidate's Answer:**
        ---
        ${answer}
        ---

        **For Context - Candidate's Resume (JSON):**
        ---
        ${JSON.stringify(resumeData, null, 2)}
        ---

        **For Context - Target Job Description:**
        ---
        ${jobDescription}
        ---

        **Instructions:**
        Evaluate the answer based on the following criteria and provide feedback in a valid JSON object matching the schema.
        1.  **Clarity:** Is the answer clear, concise, and easy to follow?
        2.  **Impact:** Does the answer demonstrate tangible results or impact?
        3.  **STAR Method:** Does the answer effectively use the STAR method (Situation, Task, Action, Result)?
        4.  **Overall Suggestion:** Provide a single, actionable tip to improve this specific answer.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: interviewFeedbackSchema,
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error analyzing interview answer:", error);
        throw new Error("Failed to analyze the interview answer with AI.");
    }
};

export const generateLinkedInHeadline = async (resumeData: GeneratedResumeData): Promise<string[]> => {
    const prompt = `
        Act as a LinkedIn branding expert. Based on the provided resume, generate 3-5 distinct, keyword-optimized headlines that will grab recruiters' attention.

        **Resume Data (JSON):**
        ---
        ${JSON.stringify(resumeData, null, 2)}
        ---
        
        **Instructions:**
        1. Identify the user's core profession, key skills, and major achievements.
        2. Create a mix of headlines: some focused on job titles, some on skills, and some on value proposition (e.g., "Helping companies achieve X by doing Y").
        3. Ensure the output is a valid JSON object adhering to the schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: linkedInHeadlineSchema,
            }
        });
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return result.headlines || [];
    } catch (error) {
        console.error("Error generating LinkedIn headlines:", error);
        throw new Error("Failed to generate LinkedIn headlines.");
    }
};

export const generateLinkedInSummary = async (resumeData: GeneratedResumeData): Promise<string> => {
    const prompt = `
        Act as a professional storyteller and LinkedIn profile writer. Your task is to write a compelling 'About' section (summary) for a LinkedIn profile based on the user's resume.

        **Resume Data (JSON):**
        ---
        ${JSON.stringify(resumeData, null, 2)}
        ---

        **Instructions:**
        1.  Write in the first person ("I" or "My").
        2.  Start with a strong opening sentence that defines their professional identity.
        3.  Weave their work history and key achievements into a compelling narrative, not just a list.
        4.  Highlight their core skills and what makes them unique.
        5.  End with a call to action (e.g., "I'm passionate about X and open to connecting...").
        6.  The output must be a valid JSON object matching the schema.
    `;
    
     try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: linkedInSummarySchema,
            }
        });
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return result.summary || "";
    } catch (error) {
        console.error("Error generating LinkedIn summary:", error);
        throw new Error("Failed to generate LinkedIn summary.");
    }
};

export const generateRecommendationRequest = async (
    recipientName: string,
    relationship: string,
    keyPoints: string
): Promise<string> => {
    const prompt = `
        Act as a professional communication coach. Your task is to draft a polite, concise, and effective message to request a LinkedIn recommendation.

        **Recipient's Name:** ${recipientName}
        **My Relationship to Them:** ${relationship}
        **Key Points I'd like them to mention:**
        ---
        ${keyPoints}
        ---

        **Instructions:**
        1.  Start with a polite and friendly opening.
        2.  Briefly remind them of your shared work or relationship.
        3.  Clearly state that you are requesting a LinkedIn recommendation.
        4.  Subtly guide them by mentioning the key points or skills you'd appreciate them highlighting.
        5.  Make it easy for them to say no if they are too busy.
        6.  End with a warm closing.
        7.  The output must be a valid JSON object matching the schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recommendationRequestSchema,
            }
        });
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return result.requestMessage || "";
    } catch (error) {
        console.error("Error generating recommendation request:", error);
        throw new Error("Failed to generate recommendation request.");
    }
};

export const generateElevatorPitch = async (resumeData: GeneratedResumeData, pitchType: '10-second' | '2-minute'): Promise<string[]> => {
    const prompt = `
      Act as an expert communication coach and personal branding strategist. Based on the provided resume data, generate 3 distinct versions of an elevator pitch.

      **Resume Data (JSON):**
      ---
      ${JSON.stringify(resumeData, null, 2)}
      ---

      **Pitch Type Required:** ${pitchType}

      **Instructions:**
      1.  **For a '10-second' pitch:** Focus on a single, powerful "I am a [Job Title] who helps [company type/audience] achieve [value proposition] by [key skill/action]." Make it extremely concise and impactful.
      2.  **For a '2-minute' pitch:** Structure it with:
          a.  A hook (who you are, what you do).
          b.  A brief story or a key achievement from the resume that demonstrates your value and skills in action.
          c.  A closing statement about what you're looking for next or what kind of problems you're excited to solve.
      3.  Generate THREE distinct variations for the requested pitch type. Each variation should offer a slightly different angle or emphasis.
      4.  The output must be a valid JSON object that strictly adheres to the provided schema.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: elevatorPitchSchema,
            }
        });
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return result.pitches || [];
    } catch (error) {
        console.error("Error generating elevator pitch:", error);
        throw new Error("Failed to generate elevator pitch.");
    }
};


interface BannerConfig {
    style: string;
    palette: string;
    complexity: number;
    elements: string;
    inspirationImage?: {
        data: string;
        mimeType: string;
    };
}

export const generateLinkedInBanner = async (
    config: BannerConfig
): Promise<string> => {
    const prompt = `
        Generate a professional, high-quality, text-free LinkedIn banner image (1584 x 396 pixels aspect ratio).
        The banner should be visually appealing and abstract. DO NOT include any text, logos, or identifiable people.

        **Style:** ${config.style}
        **Color Palette:** ${config.palette}
        **Complexity:** ${config.complexity}/100 (where 100 is highly detailed)
        **Key Elements to include:** ${config.elements || 'artist\'s choice'}
    `;

    const parts: any[] = [{ text: prompt }];
    if (config.inspirationImage) {
        parts.unshift({
            inlineData: {
                data: config.inspirationImage.data,
                mimeType: config.inspirationImage.mimeType,
            },
        });
        parts.push({ text: "\nUse the provided image as a strong inspiration for the style, color, and composition of the banner."});
    }

     try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data; // Return the base64 string
            }
        }
        throw new Error("The AI did not return a banner image.");
    } catch (error) {
        console.error("Error generating LinkedIn banner:", error);
        throw new Error("Failed to generate AI banner.");
    }
};

export const generateHeadshot = async (
    base64ImageDatas: { data: string, mimeType: string }[],
    style: string,
    lighting: string,
    setting: string,
    businessCategory: string
): Promise<string> => {
    const prompt = `
        Generate a single, unified, professional headshot for a professional in the ${businessCategory} field, based on the provided image(s) and specifications.
        Synthesize the best features from all provided photos into one high-quality image. The final person should look directly at the camera. Maintain the person's core facial features and identity accurately.
        Style: ${style}.
        Lighting: ${lighting}.
        Setting: ${setting}.
    `;

    const imageParts = base64ImageDatas.map(img => ({
        inlineData: {
            data: img.data,
            mimeType: img.mimeType,
        },
    }));

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    ...imageParts,
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data; // Return the base64 string of the generated image
            }
        }
        throw new Error("The AI did not return an image. It may have returned a safety refusal text instead.");
    } catch (error) {
        console.error("Error generating headshot:", error);
        throw new Error("Failed to generate AI headshot. Please try a different image or adjust your settings.");
    }
};

export const analyzeDocuments = async (resumeTexts: string[], jdText: string): Promise<InitialAnalysisResult> => {
    const combinedResumes = resumeTexts.join('\n\n--- NEXT RESUME ---\n\n');

    const prompt = `
        Act as an expert AI recruiting assistant. Your task is to analyze the provided resume(s) and an optional job description to extract key information. The output must be a valid JSON object that strictly adheres to the provided schema.

        **Candidate's Resume(s):**
        ---
        ${combinedResumes}
        ---

        ${jdText ? `
        **Target Job Description:**
        ---
        ${jdText}
        ---
        ` : ''}

        **Instructions:**
        1.  **Parse all provided resume text.** Extract contact details, a professional summary, key skills, the entire work experience section, and the education section.
        2.  **Handle Multiple Resumes:** If multiple resumes are provided, synthesize the information into a single, cohesive profile.
        3.  **Job Description Analysis (Conditional):**
            -   **If a job description is provided**, you MUST populate the 'matchAnalysis' object.
            -   Analyze the alignment between the resume(s) and the job description.
            -   Identify keywords present in both (matching) and keywords present in the JD but not the resume (missing).
            -   **If NO job description is provided**, you MUST OMIT the 'matchAnalysis' object entirely from your JSON response.
        4.  **Format:** Ensure the final output is a single, valid JSON object matching the schema. Do not include any text or markdown outside of the JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: initialAnalysisSchema,
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error analyzing documents:", error);
        if (error instanceof SyntaxError) {
            throw new Error("Failed to parse the AI's analysis response. The format was invalid. Please try again.");
        }
        throw new Error("Failed to analyze documents with AI. Please check the console for details.");
    }
};

export const generateSummaryOptions = async (baseSummary: string, jobDescription: string): Promise<string[]> => {
    const prompt = `
        Act as a professional resume writer. Based on the following base summary and an optional job description, generate 3 distinct versions of an executive summary.

        **Base Summary (for context):**
        ---
        ${baseSummary}
        ---

        ${jobDescription ? `
        **Target Job Description (for tailoring):**
        ---
        ${jobDescription}
        ---
        ` : ''}

        **Instructions:**
        1.  **Version 1:** If a job description is provided, make this version highly tailored to it, using keywords and addressing key requirements. If no JD, make it a strong, general professional summary.
        2.  **Version 2:** Make this version more direct and results-oriented. Focus on quantifiable achievements and metrics.
        3.  **Version 3:** Make this version slightly more creative or narrative-driven, telling a brief story about the professional's value.
        4.  Return a valid JSON object matching the schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: summaryOptionsSchema,
            }
        });
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return result.summaries || [baseSummary, baseSummary, baseSummary]; // Fallback
    } catch (error) {
        console.error("Error generating summary options:", error);
        throw new Error("Failed to generate summary options with AI.");
    }
};

export const improveSummary = async (currentSummary: string): Promise<string> => {
    const prompt = `
        Act as a professional resume writer. Rewrite the following professional summary to be more impactful, concise, and achievement-oriented.
        
        **Original Summary:**
        ---
        ${currentSummary}
        ---

        Return only the rewritten summary as a raw string.
    `;
    try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text.trim();
    } catch (error) {
        console.error("Error improving summary:", error);
        throw new Error("Failed to improve summary with AI.");
    }
};

export const categorizeSkills = async (skills: string[]): Promise<CategorizedSkills[]> => {
    const prompt = `
        Act as a professional resume expert. Organize the following list of skills into 4 logical categories (e.g., "Technical Skills", "Leadership", "Software & Tools", "Methodologies").
        
        **Skills List:**
        - ${skills.join('\n- ')}

        Return a valid JSON object matching the schema.
    `;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: skillsCategorizationSchema,
            }
        });
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return result.categorizedSkills || [];
    } catch (error) {
        console.error("Error categorizing skills:", error);
        throw new Error("Failed to categorize skills with AI.");
    }
};

export const suggestRelatedSkills = async (skills: string[]): Promise<string[]> => {
    const prompt = `
        Act as a career coach. Based on the following list of skills from a user's resume, suggest 5-7 additional, related skills that would strengthen their profile. Focus on skills that are complementary or represent a logical next step in their career progression.
        
        **Current Skills:**
        - ${skills.join('\n- ')}

        Return a valid JSON object matching the schema. Only return the list of skill names.
    `;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestedSkillsSchema,
            }
        });
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return result.suggestedSkills || [];
    } catch (error) {
        console.error("Error suggesting skills:", error);
        throw new Error("Failed to suggest skills with AI.");
    }
};

export const transcribeAndSummarizeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    const prompt = `This audio recording contains a user's verbal description of their professional background. Please transcribe the audio and then rewrite the transcription into a concise, professional summary suitable for a resume. The summary should be 2-4 sentences long and written in a professional tone. Return only the final summary as a string.`;

    const audioPart = {
        inlineData: {
            mimeType,
            data: audioBase64,
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Flash model supports audio input
            contents: { parts: [audioPart, { text: prompt }] },
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error transcribing audio:", error);
        throw new Error("Failed to process audio with AI.");
    }
};

export const extractJobTitleFromJD = async (jobDescription: string): Promise<{ jobTitle: string; warning?: string }> => {
    const prompt = `
        Analyze the following job description and extract the primary job title. Return only the job title.

        **Job Description:**
        ---
        ${jobDescription}
        ---

        Return a valid JSON object matching the schema.
    `;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: jobTitleSchema,
            }
        });
        const jsonString = response.text.trim();
        const parsedResult = JSON.parse(jsonString);
        return { jobTitle: parsedResult.jobTitle };
    } catch (error: any) {
        console.warn("Could not extract job title from JD:", error);
        
        let warningMessage = "The AI failed to automatically extract the job title. A default name will be used, which you can edit now.";
        
        const errorMessage = typeof error === 'string' ? error : error.message || '';
        if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            warningMessage = "API quota limit reached. The AI couldn't extract the job title. Please check your Gemini API plan. A default name is suggested, which you can edit now.";
        }
        
        return { jobTitle: "New Application", warning: warningMessage };
    }
};

export type EnhancementSuggestion = {
    type: string;
    text: string;
};

export type AchievementSuggestion = {
    original: string;
    enhancements: EnhancementSuggestion[];
};

export const generateEnhancementSuggestions = async (achievements: string[]): Promise<AchievementSuggestion[]> => {
    const prompt = `
        Act as a professional resume writer. For each of the following resume achievement bullet points, provide 2-3 concrete enhancement suggestions. The goal is to make them more impactful.

        **Achievements to Enhance:**
        ${achievements.map(a => `- ${a}`).join('\n')}

        **Instructions:**
        1.  For each achievement, generate 2-3 rewritten versions.
        2.  Each suggestion should have a 'type' and the 'text' of the rewritten achievement.
        3.  Suggestion types should be one of: 'Add Metrics' (if you're adding quantifiable data), 'Use Action Verb' (if you're replacing a weak verb with a stronger one), or 'Clarify Impact' (if you're rephrasing to better show the business value).
        4.  Return a valid JSON object matching the schema.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: enhancementSuggestionsSchema,
            }
        });
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return result.suggestions || [];
    } catch (error) {
        console.error("Error generating enhancement suggestions:", error);
        throw new Error("Failed to generate enhancement suggestions with AI.");
    }
};

export const parseEducationFromText = async (text: string): Promise<EducationSection> => {
    const prompt = `
        Parse the following text, which is a user's spoken description of their education, and extract the institution, degree, and dates.
        
        **Text to Parse:**
        ---
        ${text}
        ---

        Return a valid JSON object matching the schema.
    `;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: educationSchema,
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error parsing education text:", error);
        throw new Error("AI failed to understand the education details. Please try again or enter manually.");
    }
};

export const generateHeadshotPresetFromResume = async (resumeAnalysis: InitialAnalysisResult): Promise<HeadshotPresetSettings> => {
    const styleOptions = ['Corporate', 'Business Casual', 'International Business', 'Federal/Government', 'Country Club Formal', 'West Coast Business (California)', 'Southern Business (Texas)'];
    const categoryOptions = ['Executive', 'Finance', 'Sales', 'Human Resources', 'Operations & Logistics', 'IT & Engineering', 'Product Management', 'Security', 'Blue Collar Managerial'];
    const lightingOptions = ['Studio Lighting', 'Natural Sunlight', 'Dramatic Lighting', 'Soft Light'];
    const settingOptions = ['Neutral Office Background', 'Outdoor (Nature)', 'Modern Abstract Background', 'Bookshelf Backdrop'];

    const prompt = `
        Act as a professional branding consultant and corporate photographer. Your task is to analyze the provided resume analysis and suggest the optimal settings for a professional headshot. The goal is to create a headshot that aligns with the user's seniority, industry, and professional brand.

        **Resume Analysis:**
        ---
        **Summary:** ${resumeAnalysis.summary}
        **Experience:**
        ${resumeAnalysis.experience.map(exp => `- ${exp.title} at ${exp.company}`).join('\n')}
        **Key Skills:** ${resumeAnalysis.keySkills.join(', ')}
        ---

        **Available Headshot Settings:**
        - **Style Options:** ${styleOptions.join(', ')}
        - **Business Category Options:** ${categoryOptions.join(', ')}
        - **Lighting Options:** ${lightingOptions.join(', ')}
        - **Setting Options:** ${settingOptions.join(', ')}

        **Instructions:**
        1.  Analyze the resume to determine the user's industry, seniority level (e.g., executive, mid-level, junior), and overall professional tone (e.g., formal, tech-focused, creative).
        2.  Based on your analysis, select the ONE most appropriate option from EACH of the four settings categories provided.
        3.  Provide a brief, 1-2 sentence 'reasoning' for your choices, explaining why they are a good fit for the user's professional brand.
        4.  The output must be a valid JSON object that strictly adheres to the provided schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: headshotPresetSchema,
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating headshot preset:", error);
        throw new Error("AI failed to generate a headshot preset from the resume. Please try again.");
    }
};