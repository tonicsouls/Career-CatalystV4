import { TimelineEvent } from "../types";

export const sampleResume = `
Alex Chen
Dallas, TX | (123) 456-7890 | alex.chen@email.com | linkedin.com/in/alexchen

Summary
Dynamic and results-oriented Senior Program Manager with over 10 years of experience leading complex, cross-functional projects in the tech industry. Proven ability to drive projects from conception to launch, manage stakeholder expectations, and deliver solutions that meet strategic business objectives. Expertise in Agile methodologies, risk management, and process optimization.

Experience

Senior Program Manager | Tech Solutions Inc. | Dallas, TX | 2018 - Present
- Led the planning and execution of a major platform migration project for a key enterprise client, involving teams across engineering, product, and operations. Completed the project 2 weeks ahead of schedule and 10% under budget.
- Developed and implemented a new Agile workflow for the program management office, increasing team velocity by 25% and improving on-time delivery of project milestones.
- Managed a portfolio of 5-7 concurrent projects with a total budget of over $5M.
- Facilitated communication and alignment between technical teams and executive stakeholders, providing regular status reports and risk assessments.

Project Manager | Innovate Corp. | Plano, TX | 2014 - 2018
- Managed the end-to-end lifecycle of software development projects for a suite of B2B SaaS products.
- Successfully launched three major product features that contributed to a 15% increase in customer retention.
- Coordinated with international development teams, managing timelines and mitigating risks associated with time zone differences.

Business Analyst | Data Insights LLC | Irving, TX | 2012 - 2014
- Gathered and analyzed business requirements for new software features.
- Created detailed documentation, including user stories and process flow diagrams.

Education
Master of Business Administration (MBA)
University of Texas at Dallas

Bachelor of Science in Information Systems
University of North Texas

Skills
- Program & Project Management
- Agile & Scrum Methodologies
- Stakeholder Management
- Risk Assessment & Mitigation
- Budgeting & Forecasting
- Process Improvement
- JIRA, Confluence, Asana
`;

export const sampleJobDescription = `
Director of Program Management - Cloud Services
Dallas, TX

We are seeking an experienced and strategic Director of Program Management to lead our Cloud Services program portfolio. The ideal candidate will have a strong technical background and a proven track record of delivering large-scale, complex cloud infrastructure and platform projects.

Responsibilities:
- Oversee the entire lifecycle of programs within the Cloud Services division, from strategic planning to tactical execution.
- Lead a team of program and project managers, providing mentorship and guidance.
- Develop and manage program budgets, timelines, and resource allocation.
- Drive alignment and communication with executive leadership, engineering, and product teams.
- Implement and refine program management processes to improve efficiency and predictability.
- Identify and mitigate program-level risks and dependencies.

Qualifications:
- 12+ years of experience in program management, with at least 5 years in a leadership role.
- Deep understanding of cloud technologies (AWS, Azure, or GCP).
- Experience managing programs with multi-million dollar budgets.
- Exceptional leadership and communication skills.
- PMP or PgMP certification is a plus.
`;

export const sampleTimelineEvents: TimelineEvent[] = [
    {
        id: 1,
        title: 'Senior Program Manager',
        date: '2018 - Present',
        description: `- Led the planning and execution of a major platform migration project for a key enterprise client, involving teams across engineering, product, and operations. Completed the project 2 weeks ahead of schedule and 10% under budget.
- Developed and implemented a new Agile workflow for the program management office, increasing team velocity by 25% and improving on-time delivery of project milestones.
- Managed a portfolio of 5-7 concurrent projects with a total budget of over $5M.`
    },
    {
        id: 2,
        title: 'Project Manager',
        date: '2014 - 2018',
        description: `- Managed the end-to-end lifecycle of software development projects for a suite of B2B SaaS products.
- Successfully launched three major product features that contributed to a 15% increase in customer retention.
- Coordinated with international development teams, managing timelines and mitigating risks associated with time zone differences.`
    },
    {
        id: 3,
        title: 'University of Texas at Dallas',
        date: 'MBA',
        description: 'Completed a Master of Business Administration with a focus on strategic management and IT.'
    }
];
