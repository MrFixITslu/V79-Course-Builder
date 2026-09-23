type QuizSeed = { question: string; options: string[]; correct: string; explanation: string };
type MissionSeed = {
  title: string;
  bigQuestion: string;
  badge: string;
  discover: string[];
  create: string[];
  explorerActivity: string;
  creatorActivity: string;
  teamMilestone: string;
  projectSkill: string;
  ethics: string;
  deliverable: string;
  quiz: QuizSeed[];
};

export const JUNIOR_AI_COURSE_ID = 'course-junior-ai-academy-01';

const missions: MissionSeed[] = [
  {
    title: 'Welcome to the World of AI',
    bigQuestion: 'What is AI, what can it do, and what is still our job as humans?',
    badge: 'AI Explorer',
    discover: [
      'AI is computer technology that learns patterns from examples and uses those patterns to predict, classify or create.',
      'AI can help with text, images, sound, video, recommendations, translation and recognizing patterns.',
      'AI is not a person. It can sound confident while being wrong, so humans still need to think and check.'
    ],
    create: [
      'Try one simple prompt and compare different possible answers.',
      'Sort familiar tools into AI might be helping, regular tool, or not sure.',
      'Introduce the V79 AI Creator Code: Think, Ask, Check, Create, Be Responsible, Share.'
    ],
    explorerActivity: 'Draw an AI helper you wish existed and explain what it helps people do.',
    creatorActivity: 'List five technologies you used this week and explain where AI might be involved and what a human should still decide.',
    teamMilestone: 'Form an AI Studio Team of three, choose a team name, create the Team Charter, choose the first leader and agree on one project idea to grow across the course.',
    projectSkill: 'Team Charter + To Do / Doing / Done board + first Uh-Oh Plan.',
    ethics: 'The person using AI is still responsible for how the result is used.',
    deliverable: 'Team Charter, first project idea, task board and first Weekly Studio Check-In.',
    quiz: [
      { question: 'Which statement is best?', options: ['AI is always correct', 'AI can help people, but people still need to think and check', 'AI is a person inside the computer'], correct: 'AI can help people, but people still need to think and check', explanation: 'AI is a tool. Humans remain responsible for checking and deciding.' },
      { question: 'Who is responsible for deciding how an AI result is used?', options: ['The AI alone', 'The person or team using it', 'Nobody'], correct: 'The person or team using it', explanation: 'People are responsible for choices made with AI outputs.' },
      { question: 'Which belongs in the Creator Code?', options: ['Think, Ask, Check', 'Copy, Hide, Pretend', 'Believe everything'], correct: 'Think, Ask, Check', explanation: 'The Creator Code builds thoughtful, safe AI habits.' }
    ]
  },
  {
    title: 'Prompt Power',
    bigQuestion: 'How do we tell AI what we really want?',
    badge: 'Prompt Wizard',
    discover: [
      'A prompt is an instruction or question given to an AI system.',
      'Clear details help AI make a result that is closer to what you imagined.',
      'The MAGIC prompt is Mission, Audience, Give details, Imagine the style, Check and Change.'
    ],
    create: [
      'Compare a tiny prompt with a detailed prompt.',
      'Improve the same prompt three times instead of accepting the first result.',
      'Explain why changing one detail can change the output.'
    ],
    explorerActivity: 'Use a picture-led MAGIC card to create a silly creature with at least three details.',
    creatorActivity: 'Write a MAGIC prompt for the team project, test it, then record two improvements and why you made them.',
    teamMilestone: 'Build a Team Prompt Bank with reusable prompts for brainstorming, research, creating and checking work.',
    projectSkill: 'Break one big project goal into small tasks with owners and due weeks.',
    ethics: 'Good prompting should not be used to trick, harass, impersonate or create harmful material.',
    deliverable: 'Three improved prompts plus the team Prompt Bank.',
    quiz: [
      { question: 'What does the C in MAGIC mean?', options: ['Copy everything', 'Check & Change', 'Cancel the project'], correct: 'Check & Change', explanation: 'Strong AI users review results and improve their instructions.' },
      { question: 'What usually makes a prompt more useful?', options: ['Clear details', 'Random words', 'No goal'], correct: 'Clear details', explanation: 'Useful context and constraints help the AI understand the task.' },
      { question: 'Should you always keep the first AI answer?', options: ['Yes', 'No, review and improve it', 'Only if it is long'], correct: 'No, review and improve it', explanation: 'Iteration is a core AI skill.' }
    ]
  },
  {
    title: 'Safe, Smart & Ethical AI',
    bigQuestion: 'How do we use AI without putting ourselves or other people at risk?',
    badge: 'AI Safety Hero',
    discover: [
      'STOP Before You Prompt: Secrets, Telephone/address, Online passwords, Personal information.',
      'Ask permission before using another person’s face, voice or private information.',
      'AI help is different from pretending AI work is entirely your own.'
    ],
    create: [
      'Sort examples into safe to share, ask an adult first, or do not share.',
      'Practice changing a risky prompt into a safe one.',
      'Create a team rule for crediting AI help honestly.'
    ],
    explorerActivity: 'Create an AI Safety Shield with four things you will protect.',
    creatorActivity: 'Review realistic school and creator scenarios and explain what is safe, unfair, misleading or private.',
    teamMilestone: 'Create the team Safety & Ethics Plan for the final project.',
    projectSkill: 'Add a safety check and permission check to the team’s project checklist.',
    ethics: 'Privacy, permission, honesty and respect are part of quality—not extras.',
    deliverable: 'Safety Shield plus team Safety & Ethics Plan.',
    quiz: [
      { question: 'What should never be put into a prompt?', options: ['A made-up character name', 'Your password', 'A colour'], correct: 'Your password', explanation: 'Passwords are private security information.' },
      { question: 'Before cloning or imitating someone’s voice, what should you have?', options: ['Permission', 'A louder microphone', 'More followers'], correct: 'Permission', explanation: 'People deserve control over the use of their identity.' },
      { question: 'If AI helped with a school project, what is a good habit?', options: ['Hide it', 'Be honest about the help you used', 'Claim AI never helped'], correct: 'Be honest about the help you used', explanation: 'Honest attribution supports trust and learning.' }
    ]
  },
  {
    title: 'Become a Fact Detective',
    bigQuestion: 'How do we know if an AI answer is actually true?',
    badge: 'Fact Detective',
    discover: [
      'AI can invent details, mix up facts or use information that is old.',
      'Captain Verify asks: Who says this? Where is the evidence? Is it current?',
      'Important claims should be compared with trustworthy sources.'
    ],
    create: [
      'Catch Pixel making a confident mistake.',
      'Separate facts, opinions and guesses.',
      'Record a claim, source, date and what the source actually supports.'
    ],
    explorerActivity: 'Use two teacher-approved sources to decide whether a simple claim is true.',
    creatorActivity: 'Research one project question using multiple sources and explain which source is strongest and why.',
    teamMilestone: 'Build the team Research Pack with verified facts and source notes for the final project.',
    projectSkill: 'Track research questions as tasks and mark which facts still need checking.',
    ethics: 'Do not repeat a dramatic claim simply because AI said it.',
    deliverable: 'Fact Detective evidence card plus Team Research Pack.',
    quiz: [
      { question: 'What should you do with an important AI claim?', options: ['Share it immediately', 'Check reliable sources', 'Assume it is true if it sounds confident'], correct: 'Check reliable sources', explanation: 'Confidence is not evidence.' },
      { question: 'Which question helps Captain Verify?', options: ['Who says this?', 'What colour is the app?', 'How many emojis are there?'], correct: 'Who says this?', explanation: 'Knowing the source helps evaluate a claim.' },
      { question: 'Why does the date of a source matter?', options: ['Information can change', 'Dates make pages prettier', 'It never matters'], correct: 'Information can change', explanation: 'Current information may be important for many topics.' }
    ]
  },
  {
    title: 'AI Everywhere: Possibilities & Future Careers',
    bigQuestion: 'What can people use AI skills for?',
    badge: 'Future Thinker',
    discover: [
      'AI can be a tool inside many careers rather than one special “AI job”.',
      'People combine subject knowledge, creativity, communication and judgment with AI.',
      'Useful projects begin with a real person, audience or problem.'
    ],
    create: [
      'Match AI uses to careers such as teacher, scientist, designer, farmer, filmmaker, engineer and entrepreneur.',
      'Ask how AI could help and what the professional still needs to know.',
      'Choose a project audience and learn what matters to them.'
    ],
    explorerActivity: 'Create a Future Me poster showing a job and one responsible way AI could help.',
    creatorActivity: 'Choose three careers and map AI tasks, human skills and risks for each.',
    teamMilestone: 'Define the final project audience: who are we helping, informing, entertaining or persuading?',
    projectSkill: 'Write a clear project goal: We are creating ___ for ___ so that ___.',
    ethics: 'AI skills do not replace expertise, care, responsibility or learning.',
    deliverable: 'Future-with-AI profile plus team audience statement.',
    quiz: [
      { question: 'Who can use AI skills?', options: ['Only programmers', 'People in many different careers', 'Only adults in technology companies'], correct: 'People in many different careers', explanation: 'AI can support work across many fields.' },
      { question: 'What should a project goal include?', options: ['What you are making and who it is for', 'Only the team name', 'Only a colour'], correct: 'What you are making and who it is for', explanation: 'A useful goal connects the product to an audience or problem.' },
      { question: 'Does using AI mean you can skip learning the subject?', options: ['Yes', 'No', 'Only on Fridays'], correct: 'No', explanation: 'Knowledge helps you ask better questions and recognize mistakes.' }
    ]
  },
  {
    title: 'AI Image Studio',
    bigQuestion: 'How do words become useful images?',
    badge: 'Image Creator',
    discover: [
      'Image prompts work well when they include subject, action, place, style, mood and details.',
      'Design choices should fit the audience and purpose.',
      'Generated images can look realistic even when the event never happened.'
    ],
    create: [
      'Generate or plan three variations of the same idea.',
      'Compare composition, colour, readability and mood.',
      'Choose the strongest version and explain why.'
    ],
    explorerActivity: 'Invent a new animal or hero using a guided picture prompt.',
    creatorActivity: 'Create a project poster, character or visual identity and document prompt revisions.',
    teamMilestone: 'Choose the visual direction for the final project and create the first approved visual asset.',
    projectSkill: 'Use a simple definition of done: correct size, readable, fits audience, checked by another teammate.',
    ethics: 'Never present a fake image of a real person or event as proof that it happened.',
    deliverable: 'Finished visual plus prompt notes and team visual direction.',
    quiz: [
      { question: 'Which detail helps an image prompt?', options: ['Style and mood', 'Your password', 'Nothing at all'], correct: 'Style and mood', explanation: 'Visual details help guide the result.' },
      { question: 'Can an AI image show something that never happened?', options: ['Yes', 'No', 'Only cartoons'], correct: 'Yes', explanation: 'Synthetic images can depict invented events or people.' },
      { question: 'What should the team do before using an image?', options: ['Check that it fits the purpose and is not misleading', 'Use the first one automatically', 'Remove all context'], correct: 'Check that it fits the purpose and is not misleading', explanation: 'Human review is essential.' }
    ]
  },
  {
    title: 'Story & Writing Lab',
    bigQuestion: 'How can AI help us tell better stories without taking over our ideas?',
    badge: 'Story Director',
    discover: [
      'Strong stories usually have a character or subject, a goal, a challenge and a change.',
      'AI can brainstorm options, but the human creator chooses, edits and adds meaning.',
      'Different audiences need different vocabulary, length and tone.'
    ],
    create: [
      'Turn one idea into a beginning, middle and end.',
      'Ask AI for options, then combine and rewrite instead of copying everything.',
      'Read work aloud to find boring, confusing or unnatural parts.'
    ],
    explorerActivity: 'Create a short illustrated story using a beginning-middle-end template.',
    creatorActivity: 'Write and edit a script, story or article section for the team project in your own voice.',
    teamMilestone: 'Create the core message, story or script for the final product.',
    projectSkill: 'Use version names such as Draft 1, Feedback, Draft 2 so the team can see improvement.',
    ethics: 'Do not copy another creator’s work and pretend it is original.',
    deliverable: 'Story/script draft plus a revised version showing human editing.',
    quiz: [
      { question: 'What is a good way to use AI for writing?', options: ['Ask for options, then edit and add your own ideas', 'Copy every word without reading', 'Never check the result'], correct: 'Ask for options, then edit and add your own ideas', explanation: 'AI works best as a partner, not a replacement for your judgment.' },
      { question: 'Why should you know your audience?', options: ['To choose suitable language and tone', 'To make the file larger', 'It does not matter'], correct: 'To choose suitable language and tone', explanation: 'Communication changes depending on who will receive it.' },
      { question: 'What does Draft 2 usually mean?', options: ['A revision after learning or feedback', 'The first idea was deleted forever', 'A password'], correct: 'A revision after learning or feedback', explanation: 'Versioning makes improvement visible.' }
    ]
  },
  {
    title: 'AI Audio Studio',
    bigQuestion: 'How can AI help us plan and create sound?',
    badge: 'Sound Designer',
    discover: [
      'Audio projects combine words, voice, music, sound effects and timing.',
      'A short audio piece needs a clear purpose and a simple structure.',
      'A person’s voice is part of their identity and should not be cloned without permission.'
    ],
    create: [
      'Plan a hook, message and ending for a short audio piece.',
      'Record or generate safe audio and listen back critically.',
      'Check whether the voice, pace and music fit the audience.'
    ],
    explorerActivity: 'Create a sound-scene plan or record a short team message with teacher help.',
    creatorActivity: 'Create a 20–45 second radio ad, podcast segment or narration for the team project.',
    teamMilestone: 'Produce the first audio asset or complete audio script for the final project.',
    projectSkill: 'Identify recording risks such as noise, missing permission, lost files or unclear scripts and make a backup plan.',
    ethics: 'Ask permission before imitating, cloning or publishing another person’s voice.',
    deliverable: 'Audio clip or production-ready audio script plus risk check.',
    quiz: [
      { question: 'What should happen before cloning a real person’s voice?', options: ['Get permission', 'Hide what you are doing', 'Post it first'], correct: 'Get permission', explanation: 'Voice identity deserves consent.' },
      { question: 'Why test-record audio?', options: ['To catch noise and clarity problems early', 'To use more storage', 'There is no reason'], correct: 'To catch noise and clarity problems early', explanation: 'Small tests reduce production risk.' },
      { question: 'What should a short audio message have?', options: ['A clear purpose', 'As many unrelated ideas as possible', 'No audience'], correct: 'A clear purpose', explanation: 'Focus makes audio easier to understand.' }
    ]
  },
  {
    title: 'AI Video Studio',
    bigQuestion: 'How do we turn an idea into a clear short video?',
    badge: 'Video Creator',
    discover: [
      'A storyboard plans scenes before time is spent making the final video.',
      'Video combines visuals, narration, sound, text and pacing.',
      'Synthetic or heavily edited video can mislead viewers if it is presented as real evidence.'
    ],
    create: [
      'Plan 4–6 scenes with one job for each scene.',
      'Create a short video using captions and readable visuals.',
      'Watch the video once with sound off and once without looking to find clarity problems.'
    ],
    explorerActivity: 'Draw a four-frame storyboard and act it out before recording.',
    creatorActivity: 'Produce a 30–60 second educational or promotional video for the team project.',
    teamMilestone: 'Create the team storyboard and first video asset.',
    projectSkill: 'Use a shot list and assign scene owners before production starts.',
    ethics: 'If synthetic media could be mistaken for a real event or real person, label it clearly.',
    deliverable: 'Storyboard plus short video.',
    quiz: [
      { question: 'What is a storyboard for?', options: ['Planning scenes before production', 'Storing passwords', 'Choosing lunch'], correct: 'Planning scenes before production', explanation: 'Storyboards make the sequence and purpose of scenes visible.' },
      { question: 'Why add captions?', options: ['They can improve accessibility and understanding', 'They always make videos shorter', 'They hide mistakes'], correct: 'They can improve accessibility and understanding', explanation: 'Captions help people follow spoken content.' },
      { question: 'What should you do with realistic synthetic footage?', options: ['Use it honestly and label it when needed', 'Always claim it is real', 'Never review it'], correct: 'Use it honestly and label it when needed', explanation: 'Viewers should not be tricked about important media.' }
    ]
  },
  {
    title: 'Presentation Power',
    bigQuestion: 'How do we explain an idea so people understand and remember it?',
    badge: 'Presentation Pro',
    discover: [
      'A slide should support the speaker, not become a wall of text.',
      'One main idea per slide makes a presentation easier to follow.',
      'Evidence, examples and visuals help an audience understand why an idea matters.'
    ],
    create: [
      'Fix an overcrowded slide.',
      'Turn research into a short presentation with a beginning, evidence and ending.',
      'Practice speaking to the audience rather than reading every word.'
    ],
    explorerActivity: 'Create a 3-slide show: our idea, why it matters, what we want people to remember.',
    creatorActivity: 'Create a 5–8 slide project presentation and practice a one-minute explanation.',
    teamMilestone: 'Build the first complete team pitch deck for the final project.',
    projectSkill: 'Plan rehearsal time as a real task, not something left until the last minute.',
    ethics: 'Do not use fake statistics or invented evidence just because it makes the pitch stronger.',
    deliverable: 'Team presentation draft and rehearsal reflection.',
    quiz: [
      { question: 'What is a good slide habit?', options: ['One main idea per slide', 'Tiny text everywhere', 'Read every word from the screen'], correct: 'One main idea per slide', explanation: 'Focused slides are easier to understand.' },
      { question: 'Should AI invent statistics for a presentation?', options: ['No', 'Yes, if they sound impressive', 'Only without sources'], correct: 'No', explanation: 'Evidence must be real and verifiable.' },
      { question: 'Why rehearse?', options: ['To find timing and clarity problems before presenting', 'To make the file bigger', 'It is only for actors'], correct: 'To find timing and clarity problems before presenting', explanation: 'Practice reduces risk and improves communication.' }
    ]
  },
  {
    title: 'Content Creator & Promotion Lab',
    bigQuestion: 'How do we make people notice an idea without tricking them?',
    badge: 'Content Creator',
    discover: [
      'Promotion starts with audience, message and a clear next action.',
      'The same idea can be adapted into a poster, caption, thumbnail, script or short video.',
      'Persuasion becomes unethical when it relies on lies, hidden facts or harmful manipulation.'
    ],
    create: [
      'Write three hooks for different audiences.',
      'Create a poster/caption/video-script content pack.',
      'Check that claims are accurate and the call to action is clear.'
    ],
    explorerActivity: 'Make a simple poster for the team project with one message and one action.',
    creatorActivity: 'Build a mini campaign with a poster, social-style caption and short promo script.',
    teamMilestone: 'Create the promotional content pack for the final project.',
    projectSkill: 'Set a simple success measure: what would tell us the message worked?',
    ethics: 'Persuade honestly—do not promise something the product or project cannot deliver.',
    deliverable: 'Promotional content pack plus audience and success measure.',
    quiz: [
      { question: 'What should promotion start with?', options: ['Audience and message', 'Random effects', 'A fake promise'], correct: 'Audience and message', explanation: 'Good communication starts by knowing who you are speaking to and why.' },
      { question: 'What is a call to action?', options: ['What you want the audience to do next', 'A secret password', 'A colour palette'], correct: 'What you want the audience to do next', explanation: 'Calls to action make the next step clear.' },
      { question: 'Is it okay to exaggerate a claim until it is untrue?', options: ['No', 'Yes', 'Only online'], correct: 'No', explanation: 'Ethical promotion remains truthful.' }
    ]
  },
  {
    title: 'AI Workflow Wizard',
    bigQuestion: 'How can different AI skills work together in one reliable process?',
    badge: 'Workflow Wizard',
    discover: [
      'A workflow is a sequence of steps that turns an idea into a finished result.',
      'Different tasks may need different tools, people and checks.',
      'A weak result early in the workflow can create bigger problems later.'
    ],
    create: [
      'Map research → script → image → audio/video → presentation → promotion.',
      'Mark the human check between major steps.',
      'Find bottlenecks and missing handoffs in a deliberately bad workflow.'
    ],
    explorerActivity: 'Arrange workflow cards in the right order and add a CHECK card.',
    creatorActivity: 'Create a detailed workflow map showing tools, owners, inputs, outputs and quality checks.',
    teamMilestone: 'Map the entire final-project workflow and identify unfinished pieces.',
    projectSkill: 'Identify dependencies: which tasks cannot start until something else is finished?',
    ethics: 'Automating more steps does not remove the need for human responsibility.',
    deliverable: 'Team workflow map and dependency check.',
    quiz: [
      { question: 'What is a workflow?', options: ['A sequence of steps toward a result', 'A type of password', 'One random prompt'], correct: 'A sequence of steps toward a result', explanation: 'Workflows connect tasks and outputs in a useful order.' },
      { question: 'Why add checks between workflow steps?', options: ['To catch errors before they spread', 'To slow everything down for no reason', 'To avoid planning'], correct: 'To catch errors before they spread', explanation: 'Early checking reduces rework.' },
      { question: 'What is a dependency?', options: ['A task that needs another task or result first', 'A badge colour', 'A microphone'], correct: 'A task that needs another task or result first', explanation: 'Dependencies affect scheduling and risk.' }
    ]
  },
  {
    title: 'AI Problem Solver',
    bigQuestion: 'What real problem can our team help solve?',
    badge: 'Problem Solver',
    discover: [
      'Before building a solution, understand the people and the real problem.',
      'A prototype is a small version used to test an idea before investing more time.',
      'Feedback is evidence that can change the design.'
    ],
    create: [
      'Write the problem in one sentence without jumping straight to a solution.',
      'Ask another team or test user what is clear, confusing or missing.',
      'Choose feedback to act on and explain why.'
    ],
    explorerActivity: 'Show the project to another team and collect one “I like” and one “I wonder”.',
    creatorActivity: 'Run a simple user test with prepared questions, record observations and revise the project.',
    teamMilestone: 'Test the final project with another team or approved audience and complete one meaningful revision.',
    projectSkill: 'Turn feedback into new tasks instead of treating feedback as criticism.',
    ethics: 'Do not collect private information you do not actually need for testing.',
    deliverable: 'Test notes, feedback decisions and revised project version.',
    quiz: [
      { question: 'What is a prototype?', options: ['A smaller version used to test an idea', 'The final certificate', 'A password'], correct: 'A smaller version used to test an idea', explanation: 'Prototypes help teams learn before final production.' },
      { question: 'What should a team do with feedback?', options: ['Consider it and decide what to improve', 'Ignore all of it', 'Take it as a personal attack'], correct: 'Consider it and decide what to improve', explanation: 'Feedback is information for better decisions.' },
      { question: 'Should a test collect private information it does not need?', options: ['No', 'Yes', 'Always'], correct: 'No', explanation: 'Collect only what is necessary and appropriate.' }
    ]
  },
  {
    title: 'Young AI Entrepreneur',
    bigQuestion: 'Can our skills create something useful for someone else?',
    badge: 'Young Entrepreneur',
    discover: [
      'A useful offer connects a person or customer with a problem they care about.',
      'A brand includes a name, promise, tone and visual identity—not only a logo.',
      'Value means the result is useful, enjoyable or important to someone.'
    ],
    create: [
      'Describe the customer/audience, problem and offer in simple language.',
      'Create or refine a name, visual identity and description.',
      'Discuss what people give in exchange for value: money, time, attention, participation or trust.'
    ],
    explorerActivity: 'Run a pretend AI shop and explain what your team makes and who it helps.',
    creatorActivity: 'Create a one-page mini-business or social-enterprise model for a supervised project.',
    teamMilestone: 'Explain the value of the final project and how it could be shared, sustained or turned into a supervised service/product.',
    projectSkill: 'Separate must-have work from nice-to-have ideas when time is limited.',
    ethics: 'A business or project should not misuse AI to deceive customers, copy others or make promises it cannot keep.',
    deliverable: 'One-page value/mini-business concept tied to the team project.',
    quiz: [
      { question: 'What makes an offer useful?', options: ['It helps a real audience with something they value', 'It has the longest name', 'It uses AI in every sentence'], correct: 'It helps a real audience with something they value', explanation: 'Value comes from usefulness or meaning to the audience.' },
      { question: 'Is a brand only a logo?', options: ['No', 'Yes', 'Always'], correct: 'No', explanation: 'Brand also includes promise, tone and experience.' },
      { question: 'What should teams do when time is short?', options: ['Prioritize must-have work', 'Start ten unrelated features', 'Hide the deadline'], correct: 'Prioritize must-have work', explanation: 'Prioritization is a basic project-management skill.' }
    ]
  },
  {
    title: 'Final Production Sprint',
    bigQuestion: 'Can our team bring the whole project together, manage risks and finish well?',
    badge: 'AI Builder',
    discover: [
      'Finishing means checking quality, completeness, safety and deadlines—not merely adding more features.',
      'Open risks should have an owner and a response plan.',
      'A final checklist prevents small missing pieces from spoiling good work.'
    ],
    create: [
      'Run a full project quality check.',
      'Close, reduce or accept open risks with instructor guidance.',
      'Practice the demo and assign speaking roles.'
    ],
    explorerActivity: 'Use a picture checklist to confirm the project has all required pieces.',
    creatorActivity: 'Run a structured pre-release review covering accuracy, accessibility, ethics, files, timing and presentation.',
    teamMilestone: 'Complete the final product, project board, risk review and rehearsal.',
    projectSkill: 'Practice escalation: tell the instructor early when a risk threatens the deadline.',
    ethics: 'Do not hide known errors simply to make the project look finished.',
    deliverable: 'Final product candidate, completed risk review, rehearsal and instructor submission.',
    quiz: [
      { question: 'What does “finished” include?', options: ['Quality and completeness checks', 'Only adding more features', 'Ignoring known errors'], correct: 'Quality and completeness checks', explanation: 'Completion includes verification, not just production.' },
      { question: 'What should happen if a serious risk threatens the deadline?', options: ['Tell the team/instructor early and make a plan', 'Hide it', 'Blame someone later'], correct: 'Tell the team/instructor early and make a plan', explanation: 'Early escalation supports accountability and recovery.' },
      { question: 'Why rehearse the final demo?', options: ['To find timing and handoff problems', 'To avoid teamwork', 'Because the files disappear'], correct: 'To find timing and handoff problems', explanation: 'Rehearsal reduces presentation risk.' }
    ]
  },
  {
    title: 'AI Creator Showcase & Portfolio',
    bigQuestion: 'How do we show what we created, how we worked and what we learned?',
    badge: 'V79 AI Creator',
    discover: [
      'A portfolio shows both final work and evidence of growth.',
      'A strong team presentation explains the problem, process, decisions, evidence and result.',
      'Reflection turns experience into skills you can use again.'
    ],
    create: [
      'Choose the strongest portfolio examples.',
      'Explain one project risk and one disagreement/challenge the team handled.',
      'Give every team member a meaningful speaking role.'
    ],
    explorerActivity: 'Use a simple show-and-tell card: We made, We learned, I helped.',
    creatorActivity: 'Deliver a team demo and an individual reflection on leadership, contribution and next steps.',
    teamMilestone: 'Present the finished product at Demo Day and complete the team retrospective.',
    projectSkill: 'Retrospective: What went well? What was hard? What would we change next time?',
    ethics: 'Give teammates credit and explain clearly where AI assisted the work.',
    deliverable: 'Final team product, presentation, portfolio and individual reflection.',
    quiz: [
      { question: 'What should a portfolio show?', options: ['Finished work and evidence of learning', 'Only one perfect-looking file', 'Only AI outputs'], correct: 'Finished work and evidence of learning', explanation: 'A portfolio can demonstrate process and growth.' },
      { question: 'What should every team member receive?', options: ['Credit for their contribution', 'The same leader role forever', 'No chance to speak'], correct: 'Credit for their contribution', explanation: 'Fair credit is part of responsible collaboration.' },
      { question: 'What is a retrospective?', options: ['A review of what went well, what was hard and what to improve', 'A password reset', 'A type of image filter'], correct: 'A review of what went well, what was hard and what to improve', explanation: 'Reflection helps teams improve future projects.' }
    ]
  }
];

function markdown(mission: MissionSeed, missionNumber: number, part: 1 | 2 | 3): string {
  const level = missionNumber <= 5 ? 'Level 1 — AI Explorer' : missionNumber <= 11 ? 'Level 2 — AI Creator' : 'Level 3 — AI Builder';
  const common = [
    '# ' + mission.title,
    '',
    '**' + level + ' • Mission ' + missionNumber + ' • Badge: ' + mission.badge + '**',
    '',
    '> Big question: ' + mission.bigQuestion,
    ''
  ];

  if (part === 1) {
    return common.concat([
      '## Discover',
      ...mission.discover.map(x => '- ' + x),
      '',
      '## Why this matters',
      'AI is most useful when you understand the idea behind the tool. Your job is to think, ask, check, create responsibly and explain your choices.',
      '',
      '## AI Explorers — ages 6–8',
      mission.explorerActivity,
      '',
      '## AI Creators — ages 9–12',
      mission.creatorActivity,
      '',
      '## Ethics & safety check',
      mission.ethics,
      '',
      '## Team talk',
      'Before moving on, every teammate gets a turn to explain one thing they understood and one question they still have.'
    ]).join('\n');
  }

  if (part === 2) {
    return common.concat([
      '## Create',
      ...mission.create.map((x, i) => (i + 1) + '. ' + x),
      '',
      '## MAGIC reminder',
      '**Mission → Audience → Give details → Imagine the style → Check & Change.**',
      '',
      '## Human contribution',
      'Write down at least one important choice the human creator or team made. Do not treat the AI output as the finished work automatically.',
      '',
      '## Pair check',
      'Ask a teammate: Is it clear? Is it accurate? Is it safe? Does it fit our audience? What should we improve?'
    ]).join('\n');
  }

  return common.concat([
    '## Studio Team Mission',
    mission.teamMilestone,
    '',
    '## Project-management power-up',
    mission.projectSkill,
    '',
    '### PLAN',
    'What must the team finish this week?',
    '',
    '### DO',
    'Who owns each task? Move work through **To Do → Doing → Done**.',
    '',
    '### CHECK',
    'Check facts, safety, quality and whether every teammate contributed.',
    '',
    '### RISK / UH-OH',
    'What could stop us? What can we do before it happens? What is our backup plan? Who owns the risk?',
    '',
    '### CONFLICT',
    'Use **CALM** for normal disagreements: **Cool down → Ask & listen → Look for fair choices → Make an agreement.** Tell an adult immediately about bullying, threats, unsafe behavior, discrimination, repeated exclusion or privacy problems.',
    '',
    '## Weekly deliverable',
    mission.deliverable,
    '',
    '## Submit for review',
    'Open the **AI Studio Team** workspace below. Every learner saves an individual reflection. The current Team Leader submits the Weekly Studio Check-In. Your instructor can approve it or return it as **Needs Changes** so your team can revise and improve.'
  ]).join('\n');
}

function lessonImages(missionNumber: number, lessonIndex: number): string[] {
  const n = String(missionNumber).padStart(2, '0');
  const images = [`/junior-ai/images/mission-${n}-cover.svg`];

  if (lessonIndex === 0) {
    if (missionNumber === 1) images.push('/junior-ai/images/character-pixel.svg', '/junior-ai/images/poster-creator-code.svg');
    if (missionNumber === 2) images.push('/junior-ai/images/poster-magic.svg');
    if (missionNumber === 3) images.push('/junior-ai/images/character-shield.svg', '/junior-ai/images/poster-stop.svg');
    if (missionNumber === 4) images.push('/junior-ai/images/character-captain-verify.svg');
    if (missionNumber === 5 || missionNumber === 14) images.push('/junior-ai/images/character-nova.svg');
  }

  if (lessonIndex === 1) images.push(`/junior-ai/images/mission-${n}-badge.svg`);
  if (lessonIndex === 2) images.push(`/junior-ai/images/mission-${n}-badge.svg`, '/junior-ai/images/poster-calm.svg');
  return images;
}

function lessonDownloads(missionNumber: number, lessonIndex: number) {
  const resources: Array<{ name: string; url: string; size: string; type: string }> = [];
  const add = (name: string, file: string) => resources.push({
    name,
    url: `/junior-ai/resources/${file}`,
    size: 'Printable',
    type: 'SVG worksheet'
  });

  if (missionNumber === 2 && lessonIndex === 1) add('MAGIC Prompt Workbench', 'magic-prompt-workbench.svg');
  if (missionNumber === 3 && lessonIndex === 0) add('STOP Safety Check', 'stop-safety-check.svg');

  if (lessonIndex === 2) {
    if (missionNumber === 1) add('AI Studio Team Charter', 'team-charter.svg');
    add('Weekly Studio Check-In', 'weekly-studio-check-in.svg');
    add('Risk / Uh-Oh Plan', 'risk-uh-oh-plan.svg');
    add('CALM Fix-It Card', 'calm-fix-it-card.svg');
    if (missionNumber === 16) add('Demo Day Reflection', 'demo-day-reflection.svg');
  }
  return resources;
}

function makeQuestion(missionNumber: number, index: number, quizId: string, seed: QuizSeed) {
  return {
    id: `jai-q-${missionNumber}-${index + 1}`,
    quizId,
    questionText: seed.question,
    questionType: 'multiple_choice',
    options: seed.options,
    correctAnswer: seed.correct,
    explanation: seed.explanation,
    orderNumber: index + 1
  };
}

export function ensureJuniorAIAcademyCourse(db: any): boolean {
  if (!db || !Array.isArray(db.courses) || !Array.isArray(db.publishingLogs)) return false;
  const marker = 'junior-ai-course-seed-v1';
  if (db.publishingLogs.some((log: any) => log.id === marker)) return false;
  if (db.courses.some((course: any) => course.id === JUNIOR_AI_COURSE_ID)) return false;

  const createdAt = '2026-09-23T18:00:00.000Z';
  const course = {
    id: JUNIOR_AI_COURSE_ID,
    slug: 'v79-junior-ai-academy',
    title: 'V79 Junior AI Academy: AI Superpowers for Kids',
    shortDescription: 'A hands-on, team-based AI adventure for ages 6–12 covering safe AI use, research, media creation, presentations, promotion, teamwork and project skills.',
    fullDescription: 'A 16-mission afterschool and subscription programme where learners build practical AI literacy through projects rather than lectures. Children work in AI Studio Teams of three, rotate leadership, submit weekly work for instructor review, learn age-appropriate planning, risk management and conflict resolution, and grow one team project from Week 1 into a finished Demo Day product. The curriculum covers prompting, verification, safety, images, writing, audio, video, presentations, promotion, workflows, problem solving and supervised entrepreneurship.',
    category: 'General',
    difficultyLevel: 'Beginner',
    instructor: 'V79 Academy',
    courseVersion: '1.0.0',
    thumbnail: '/junior-ai/images/mission-01-cover.svg',
    estimatedDuration: '16 weeks',
    prerequisites: [
      'Ages 6–12',
      'Basic ability to use a tablet or computer with instructor support',
      'No previous AI experience required',
      'Adult/instructor supervision for age-restricted third-party AI tools'
    ],
    learningObjectives: [
      'Use AI efficiently with clear prompts and human review',
      'Research with AI while verifying important claims',
      'Protect privacy and use AI ethically and honestly',
      'Create images, stories, audio, video, presentations and promotional content',
      'Work effectively in a team of three with rotating leadership',
      'Use simple goals, milestones, task ownership, deadlines and risk plans',
      'Resolve normal disagreements using the CALM method and escalate unsafe situations',
      'Submit weekly project work, respond to instructor feedback and revise',
      'Build and present a finished team product and individual portfolio'
    ],
    learning_objectives: [
      'Use AI efficiently with clear prompts and human review',
      'Research with AI while verifying important claims',
      'Protect privacy and use AI ethically and honestly',
      'Create images, stories, audio, video, presentations and promotional content',
      'Work effectively in a team of three with rotating leadership',
      'Use simple goals, milestones, task ownership, deadlines and risk plans',
      'Resolve normal disagreements using the CALM method and escalate unsafe situations',
      'Submit weekly project work, respond to instructor feedback and revise',
      'Build and present a finished team product and individual portfolio'
    ],
    status: 'Published',
    pricingType: 'subscription',
    price: 0,
    createdAt,
    updatedAt: createdAt
  };

  db.courses.push(course);

  missions.forEach((mission, missionIndex) => {
    const missionNumber = missionIndex + 1;
    const moduleId = `jai-mod-${missionNumber}`;
    db.modules.push({
      id: moduleId,
      courseId: JUNIOR_AI_COURSE_ID,
      title: `Mission ${missionNumber}: ${mission.title}`,
      description: mission.bigQuestion,
      orderNumber: missionNumber
    });

    const lessonTitles = [
      `Discover: ${mission.title}`,
      `Create: ${mission.badge} Challenge`,
      `Studio Team: Week ${missionNumber} Project Check-In`
    ];

    lessonTitles.forEach((title, lessonIndex) => {
      const lessonId = `jai-les-${missionNumber}-${lessonIndex + 1}`;
      db.lessons.push({
        id: lessonId,
        moduleId,
        courseId: JUNIOR_AI_COURSE_ID,
        title,
        description: lessonIndex === 0 ? mission.bigQuestion : lessonIndex === 1 ? 'Practice the mission skill through a hands-on creator activity.' : 'Apply the skill to the team project and submit the weekly Studio Check-In.',
        learningObjectives: lessonIndex === 2
          ? ['Apply the mission skill to the team project', 'Use teamwork and project-management habits', 'Submit work for review and respond to feedback']
          : ['Explain the mission concept in your own words', 'Apply it safely and responsibly', 'Create or improve a practical artifact'],
        learning_objectives: lessonIndex === 2
          ? ['Apply the mission skill to the team project', 'Use teamwork and project-management habits', 'Submit work for review and respond to feedback']
          : ['Explain the mission concept in your own words', 'Apply it safely and responsibly', 'Create or improve a practical artifact'],
        estimatedTime: lessonIndex === 2 ? '35 mins' : '25 mins',
        lessonContent: markdown(mission, missionNumber, (lessonIndex + 1) as 1 | 2 | 3),
        videoUrl: lessonIndex === 0 ? `/junior-ai/media/mission-${String(missionNumber).padStart(2, '0')}-intro.mp4` : '',
        audioUrl: '',
        imageUrls: lessonImages(missionNumber, lessonIndex),
        downloads: lessonDownloads(missionNumber, lessonIndex),
        exercisePrompt: lessonIndex === 2 ? mission.deliverable : lessonIndex === 0 ? mission.explorerActivity + ' / ' + mission.creatorActivity : mission.create.join(' '),
        orderNumber: lessonIndex + 1
      });
    });

    const quizId = `jai-quiz-${missionNumber}`;
    db.quizzes.push({
      id: quizId,
      lessonId: `jai-les-${missionNumber}-3`,
      title: `${mission.badge} Knowledge Check`,
      passingScore: 67,
      questions: mission.quiz.map((q, index) => makeQuestion(missionNumber, index, quizId, q))
    });

    db.assignments.push({
      id: `jai-assign-${missionNumber}`,
      courseId: JUNIOR_AI_COURSE_ID,
      moduleId,
      lessonId: `jai-les-${missionNumber}-3`,
      title: `Mission ${missionNumber} Weekly Studio Check-In`,
      description: mission.deliverable + ' Submit through the AI Studio Team workspace for instructor review. Every learner must also save an individual contribution reflection.',
      maxPoints: 100,
      submissionType: 'none',
      required: false,
      createdAt,
      updatedAt: createdAt
    });
  });

  db.publishingLogs.push({
    id: marker,
    courseId: JUNIOR_AI_COURSE_ID,
    courseTitle: course.title,
    event: 'Course Seeded',
    fromStatus: 'None',
    toStatus: 'Published',
    performedBy: 'Admin',
    timestamp: createdAt,
    details: 'Added the 16-mission V79 Junior AI Academy with team project milestones, weekly review, project management and conflict-resolution learning.'
  });

  return true;
}
