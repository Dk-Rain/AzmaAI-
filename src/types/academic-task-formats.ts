import type { AcademicTaskType } from './academic-task-types';

export const academicTaskFormats: Record<AcademicTaskType, string> = {
  Custom: ``,
  Assignment: `
- Title Page
- Introduction
- Main Body (organized by subheadings/questions)
- Analysis/Discussion
- Conclusion
- References
`,
  "Term Paper": `
- Title Page
- Abstract
- Introduction
- Literature Review
- Methodology (if applicable)
- Main Body/Analysis
- Discussion
- Conclusion & Recommendations
- References
- Appendices (if any)
`,
  "Project Work": `
- Title Page
- Abstract/Executive Summary
- Introduction
- Statement of the Problem
- Objectives
- Literature Review
- Methodology
- Data Presentation & Analysis
- Findings & Discussion
- Conclusion & Recommendations
- References
- Appendices
`,
  "Research Paper": `
- Title Page
- Abstract
- Keywords
- Introduction
- Literature Review
- Methodology
- Results/Findings
- Discussion
- Conclusion
- References
- Appendices (if needed)
`,
  "Essay Writing": `
- Title Page
- Introduction (thesis statement)
- Body Paragraphs (each with a topic sentence, evidence, explanation)
- Counterargument (if required)
- Conclusion
- References
`,
  Thesis: `
- Title Page
- Certification Page / Approval Page
- Dedication & Acknowledgement
- Abstract
- Table of Contents
- List of Figures/Tables (if any)
- Chapter One – Introduction (background, problem statement, objectives, significance, scope, limitations)
- Chapter Two – Literature Review
- Chapter Three – Methodology
- Chapter Four – Data Analysis / Results
- Chapter Five – Discussion, Conclusion & Recommendations
- References
- Appendices
`,
  Dissertation: `
- Title Page
- Abstract
- Acknowledgments
- Table of Contents
- List of Figures/Tables
- Chapter One – Introduction
- Chapter Two – Literature Review
- Chapter Three – Theoretical/Conceptual Framework
- Chapter Four – Methodology
- Chapter Five – Results/Findings
- Chapter Six – Discussion
- Chapter Seven – Conclusion & Recommendations
- References
- Appendices
`,
  Coursework: `
- Title Page
- Introduction
- Task Instructions/Questions Answered in Sections
- Analysis / Arguments
- Conclusion
- References
`,
  "Group Project": `
- Title Page (with group member names & IDs)
- Abstract/Executive Summary
- Introduction
- Problem Statement / Objective
- Literature Review (if required)
- Methodology / Approach
- Findings / Analysis
- Conclusion & Recommendations
- References
- Appendices
`,
  "Book/Article Review": `
- Title & Author of the Book/Article
- Introduction (background of author & text)
- Summary of the Content
- Critical Analysis (strengths, weaknesses, evaluation)
- Conclusion (overall impression, contribution)
- References
`,
  "Annotated Bibliography": `
- Title Page
- Introduction (optional)
- List of References (each citation followed by an annotation)

  - Citation (APA, MLA, etc.)
  - Annotation: Summary, Evaluation, Relevance
`,
  "Literature Review": `
- Title Page
- Introduction (scope, objectives of the review)
- Thematic/Chronological/Methodological Review of Studies
- Critical Analysis of Sources
- Identification of Gaps
- Conclusion (summary of trends, direction for future research)
- References
`,
  "Field Work Report": `
- Title Page
- Abstract
- Introduction (aims of field work)
- Description of the Field Area/Organization/Activity
- Methodology (how observations/data were collected)
- Results/Findings
- Discussion
- Conclusion & Recommendations
- References
- Appendices (photos, charts, notes)
`,
  "Seminar Paper": `
- Title Page
- Abstract
- Introduction
- Literature Review
- Methodology (if applicable)
- Main Content/Analysis
- Discussion
- Conclusion
- References
`,
  "Internship Report": `
- Title Page
- Acknowledgements
- Abstract
- Introduction (about the organization, objectives of internship)
- Description of Internship Duties/Tasks
- Skills & Knowledge Acquired
- Challenges & Solutions
- Recommendations
- Conclusion
- References
- Appendices (logbook, supervisor evaluation, etc.)
`,
  "Position Paper": `
- Title Page
- Introduction (topic background)
- Statement of Position/Thesis
- Arguments Supporting Position (with evidence)
- Counterarguments & Rebuttals
- Conclusion
- References
`,
  "Concept Note / Proposal Writing": `
- Title
- Introduction/Background
- Problem Statement
- Objectives (general & specific)
- Significance/Justification
- Scope/Limitations
- Methodology/Approach
- Expected Outcomes
- Budget (if required)
- Timeline (if required)
- References
`,
  "Abstract Writing": `
- Background/Introduction (1–2 sentences)
- Purpose/Objective (1 sentence)
- Methodology (1–2 sentences)
- Key Findings/Results (2–3 sentences)
- Conclusion/Implication (1–2 sentences)
  *(150–300 words max depending on journal/institution rules)*
`,
  "Business Plan / Feasibility Study": `
- Cover Page
- Executive Summary
- Business Description
- Market Analysis
- Marketing Strategy
- Operations Plan
- Management & Organization
- Product/Service Description
- Financial Plan (projections, funding needs)
- Risk Analysis
- Conclusion
- Appendices
`,
  "Academic Debate Preparation": `
- Debate Topic / Motion
- Introduction (hook, definition of terms, stance)
- Main Arguments (3–4 points with evidence)
- Counterarguments & Rebuttals
- Conclusion (restating position strongly)
- References (if academic-based)
`,
  "Mock/ Exam Questions setup": `
- Title Page
- Instructions to Candidates
- Section A: Multiple Choice/Objective Questions
- Section B: Short Answer Questions
- Section C: Essay/Long Answer Questions
- Marking Guide (for internal use)
`,
};
