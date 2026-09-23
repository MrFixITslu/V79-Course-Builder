import { CourseProgramme, DiagnosticQuestion, FinalExamQuestion, WorkbookSection } from '../types/programme';

export const IDEA_TO_ADVANTAGE_COURSE_ID = 'course-from-idea-to-advantage-01';

const diagnosticQuestions: DiagnosticQuestion[] = [
  // Financial Control (20%)
  {
    id: 'fin-1', categoryId: 'finance',
    prompts: {
      preLaunch: 'I have estimated startup costs, working capital and the cash reserve needed before the business opens.',
      operating: 'Business income, expenses and cash balances are recorded promptly and kept separate from personal money.'
    }
  },
  {
    id: 'fin-2', categoryId: 'finance',
    prompts: {
      preLaunch: 'I have created a realistic 12-month cash-flow forecast with conservative, expected and stronger-sales assumptions.',
      operating: 'I maintain and review a rolling cash-flow forecast that shows expected receipts, payments and cash shortages.'
    }
  },
  {
    id: 'fin-3', categoryId: 'finance',
    prompts: {
      preLaunch: 'I know the selling price, direct cost, contribution per sale and break-even volume for my main offer.',
      operating: 'I know the gross margin or contribution margin of my main products/services and my current break-even point.'
    }
  },
  {
    id: 'fin-4', categoryId: 'finance',
    prompts: {
      preLaunch: 'I have selected a bookkeeping process and know who will reconcile accounts and review results each month.',
      operating: 'Bank, cash, card and payment-platform balances are reconciled regularly and differences are investigated.'
    }
  },
  {
    id: 'fin-5', categoryId: 'finance',
    prompts: {
      preLaunch: 'I understand the records, registrations and professional advice the business will need in its country.',
      operating: 'Financial statements, receivables, payables, tax-ready records and key financial KPIs are reviewed on a defined schedule.'
    }
  },

  // Customers & Sales (15%)
  {
    id: 'cus-1', categoryId: 'customers',
    prompts: {
      preLaunch: 'I have defined a specific target customer and the costly or important problem they need solved.',
      operating: 'We can identify our most valuable customer segments and the problems that drive them to buy.'
    }
  },
  {
    id: 'cus-2', categoryId: 'customers',
    prompts: {
      preLaunch: 'I have tested demand through interviews, pre-orders, pilots or another form of real customer evidence.',
      operating: 'We collect and use customer feedback, sales data and lost-sale reasons to improve the offer.'
    }
  },
  {
    id: 'cus-3', categoryId: 'customers',
    prompts: {
      preLaunch: 'I have a clear sales process from first enquiry through follow-up, decision and payment.',
      operating: 'Every serious enquiry is captured, assigned, followed up and tracked through a defined sales pipeline.'
    }
  },
  {
    id: 'cus-4', categoryId: 'customers',
    prompts: {
      preLaunch: 'I know why a customer should choose this business instead of doing nothing or using a competitor.',
      operating: 'Our value proposition is understood by staff and consistently communicated in sales conversations.'
    }
  },
  {
    id: 'cus-5', categoryId: 'customers',
    prompts: {
      preLaunch: 'I have defined how the business will encourage repeat purchases, referrals and long-term customer relationships.',
      operating: 'We measure conversion, repeat business, retention and referrals and act when those measures decline.'
    }
  },

  // Marketing & Brand (15%)
  {
    id: 'mkt-1', categoryId: 'marketing',
    prompts: {
      preLaunch: 'The business name, promise, tone and visual identity are appropriate for the target customer and used consistently.',
      operating: 'Our brand and customer promise are consistent across signage, social channels, proposals, packaging and service.'
    }
  },
  {
    id: 'mkt-2', categoryId: 'marketing',
    prompts: {
      preLaunch: 'I have chosen marketing channels based on where target customers actually discover and evaluate businesses.',
      operating: 'We know which channels generate qualified leads and do not rely only on follower counts or likes.'
    }
  },
  {
    id: 'mkt-3', categoryId: 'marketing',
    prompts: {
      preLaunch: 'I have a practical launch campaign with an offer, audience, message, budget, owner and success measure.',
      operating: 'Campaigns are planned with a clear offer, audience, call to action, budget, tracking method and post-campaign review.'
    }
  },
  {
    id: 'mkt-4', categoryId: 'marketing',
    prompts: {
      preLaunch: 'The business will build owned customer contact lists with appropriate consent instead of depending entirely on social platforms.',
      operating: 'We maintain permission-based email, SMS, WhatsApp or CRM lists and can contact customers without relying on one social platform.'
    }
  },
  {
    id: 'mkt-5', categoryId: 'marketing',
    prompts: {
      preLaunch: 'I know how I will measure lead cost, conversion, sales and contribution from marketing.',
      operating: 'We regularly compare marketing spend and effort with qualified leads, conversions, revenue and contribution margin.'
    }
  },

  // Operations (15%)
  {
    id: 'ops-1', categoryId: 'operations',
    prompts: {
      preLaunch: 'I have mapped how an order or booking will move from customer request to delivery, payment and follow-up.',
      operating: 'Our core order/booking-to-cash workflow is understood, followed and reviewed for delays or rework.'
    }
  },
  {
    id: 'ops-2', categoryId: 'operations',
    prompts: {
      preLaunch: 'The most important recurring tasks have checklists or draft standard operating procedures.',
      operating: 'Critical recurring work has current SOPs, checklists, owners and quality standards.'
    }
  },
  {
    id: 'ops-3', categoryId: 'operations',
    prompts: {
      preLaunch: 'I have defined capacity, turnaround times and the limit beyond which quality or delivery will suffer.',
      operating: 'We track capacity, backlog, turnaround time and on-time delivery and adjust before service deteriorates.'
    }
  },
  {
    id: 'ops-4', categoryId: 'operations',
    prompts: {
      preLaunch: 'I have specified how quality will be checked and how customer complaints or errors will be corrected.',
      operating: 'Quality failures, complaints, refunds and repeat work are recorded, analysed and used to prevent recurrence.'
    }
  },
  {
    id: 'ops-5', categoryId: 'operations',
    prompts: {
      preLaunch: 'I have selected a small set of operational KPIs and a review rhythm for the first six months.',
      operating: 'A short operational dashboard is reviewed on schedule and leads to named corrective actions.'
    }
  },

  // Inventory / Purchasing (10%)
  {
    id: 'inv-1', categoryId: 'inventory',
    prompts: {
      preLaunch: 'I have calculated landed cost, expected demand, supplier lead time and the working capital tied up in stock.',
      operating: 'Landed cost includes supplier price, freight, insurance, duties, brokerage, local transport and other attributable costs.',
      preLaunchService: 'I have identified all equipment, licences, consumables and outside services needed to deliver reliably.',
      operatingService: 'We track critical equipment, licences, consumables and outside services needed for delivery.'
    }
  },
  {
    id: 'inv-2', categoryId: 'inventory',
    prompts: {
      preLaunch: 'I have set initial reorder logic using demand during lead time plus an appropriate safety-stock allowance.',
      operating: 'Reorder points are based on demand, supplier lead time, variability and safety stock rather than guesswork.',
      preLaunchService: 'I have planned replacement, maintenance and backup capacity for reusable equipment and essential tools.',
      operatingService: 'Maintenance, replacement and backup plans prevent equipment or licence failure from stopping service.'
    }
  },
  {
    id: 'inv-3', categoryId: 'inventory',
    prompts: {
      preLaunch: 'I have compared suppliers on total cost, reliability, quality, terms and recovery options—not price alone.',
      operating: 'Supplier performance is reviewed using delivery time, fill rate, quality, total cost and responsiveness.',
      preLaunchService: 'I have assessed contractors and service suppliers on quality, availability, confidentiality, terms and continuity.',
      operatingService: 'Contractors and service suppliers are monitored for quality, availability, confidentiality and delivery performance.'
    }
  },
  {
    id: 'inv-4', categoryId: 'inventory',
    prompts: {
      preLaunch: 'I have designed how stock will be received, counted, secured, issued, returned and adjusted.',
      operating: 'Stock movements and adjustments are recorded, physical counts are performed and variances are investigated.',
      preLaunchService: 'I have designed how shared resources, job materials, customer property and tools will be issued and controlled.',
      operatingService: 'Shared resources, job materials, customer property and tools are assigned, returned and reconciled.'
    }
  },
  {
    id: 'inv-5', categoryId: 'inventory',
    prompts: {
      preLaunch: 'I have planned for shipping delays, supplier failure, currency movement and the risk of buying too much.',
      operating: 'We review stock-outs, excess/dead stock, supplier concentration and cash tied up in inventory.',
      preLaunchService: 'I have planned for specialist unavailability, equipment failure, price changes and over-investment in underused assets.',
      operatingService: 'We review underused assets, resource shortages, supplier concentration and the cost of idle capacity.'
    }
  },

  // Digital & AI (10%)
  {
    id: 'dig-1', categoryId: 'digital_ai',
    prompts: {
      preLaunch: 'I have identified the business processes that need proper systems for accounting, customers, inventory, documents and communication.',
      operating: 'Core records are kept in fit-for-purpose systems rather than being scattered across paper, chat messages and personal devices.'
    }
  },
  {
    id: 'dig-2', categoryId: 'digital_ai',
    prompts: {
      preLaunch: 'I evaluate technology and AI tools by business problem, total cost, data risk, integration and measurable benefit.',
      operating: 'Technology and AI purchases require a defined problem, owner, expected benefit, risk review and success measure.'
    }
  },
  {
    id: 'dig-3', categoryId: 'digital_ai',
    prompts: {
      preLaunch: 'I know which information must never be entered into public AI tools without approval and protection.',
      operating: 'Staff have practical rules for customer data, confidential information, copyright, permissions and human review when using AI.'
    }
  },
  {
    id: 'dig-4', categoryId: 'digital_ai',
    prompts: {
      preLaunch: 'I have chosen one or two low-risk, high-value automation opportunities and defined how results will be checked.',
      operating: 'We pilot automation on bounded tasks, compare before/after performance and keep accountable human review.'
    }
  },
  {
    id: 'dig-5', categoryId: 'digital_ai',
    prompts: {
      preLaunch: 'Accounts, devices and important data will have strong authentication, backups, access controls and recovery procedures.',
      operating: 'Important accounts and data use MFA, least-privilege access, tested backups, updates and an incident response process.'
    }
  },

  // People (5%)
  {
    id: 'ppl-1', categoryId: 'people',
    prompts: {
      preLaunch: 'I have defined the roles, decisions and accountabilities required—even if one person initially performs several roles.',
      operating: 'Team members and contractors understand their roles, decision limits, outputs and performance standards.'
    }
  },
  {
    id: 'ppl-2', categoryId: 'people',
    prompts: {
      preLaunch: 'I know which work the owner must retain, delegate, outsource or automate as the business grows.',
      operating: 'Recurring work is delegated with clear outcomes, authority, check-ins and documentation instead of returning to the owner.'
    }
  },
  {
    id: 'ppl-3', categoryId: 'people',
    prompts: {
      preLaunch: 'Hiring or contractor decisions will be based on required outputs, capability, reliability, legal obligations and total cost.',
      operating: 'Hiring, onboarding and contractor selection follow a consistent process tied to role outcomes and business capacity.'
    }
  },
  {
    id: 'ppl-4', categoryId: 'people',
    prompts: {
      preLaunch: 'I have a plan to train people on service standards, systems, safety, security and customer care.',
      operating: 'Training, coaching and feedback address measured performance gaps and changes in process or risk.'
    }
  },
  {
    id: 'ppl-5', categoryId: 'people',
    prompts: {
      preLaunch: 'The business can continue basic operations when the owner is unavailable for a short period.',
      operating: 'Key information, authority and procedures are distributed enough that routine operations do not depend entirely on the owner.'
    }
  },

  // Risk & Resilience (10%)
  {
    id: 'rsk-1', categoryId: 'resilience',
    prompts: {
      preLaunch: 'I have identified the business activities that must be restored first after a hurricane, outage, cyber incident or supplier disruption.',
      operating: 'A current business continuity plan identifies critical activities, dependencies, owners, contacts and recovery priorities.'
    }
  },
  {
    id: 'rsk-2', categoryId: 'resilience',
    prompts: {
      preLaunch: 'I have planned alternative power, connectivity, work location and manual procedures for essential transactions.',
      operating: 'Backup power/connectivity and offline procedures are tested for the services the business cannot afford to lose.'
    }
  },
  {
    id: 'rsk-3', categoryId: 'resilience',
    prompts: {
      preLaunch: 'I have considered insurance, emergency cash, contracts and asset protection appropriate to the business risks.',
      operating: 'Insurance, emergency liquidity, supplier terms, customer contracts and physical safeguards are reviewed at least annually.'
    }
  },
  {
    id: 'rsk-4', categoryId: 'resilience',
    prompts: {
      preLaunch: 'I have identified single points of failure in suppliers, people, equipment, banking, data and communications.',
      operating: 'Single points of failure are recorded and reduced through alternatives, cross-training, spares or recovery agreements.'
    }
  },
  {
    id: 'rsk-5', categoryId: 'resilience',
    prompts: {
      preLaunch: 'I have defined how to communicate with staff, customers, suppliers and authorities during an interruption.',
      operating: 'Emergency contacts and pre-approved communication procedures are current, accessible offline and periodically tested.'
    }
  }
];

const workbookSections: WorkbookSection[] = [
  {
    id: 'wb-01', moduleNumber: 1, title: 'Business Health & Advantage Baseline',
    outcome: 'Define the present state, the desired advantage and the three most important constraints to address.',
    categoryIds: ['operations', 'finance'],
    prompts: [
      { id: 'current', label: 'Current reality', helpText: 'Describe what is working, what is not, and the evidence.', placeholder: 'Today the business/idea is…' },
      { id: 'advantage', label: 'Desired advantage', helpText: 'State the customer or operating advantage you want to create.', placeholder: 'Within 12 months we will be known for…' },
      { id: 'constraints', label: 'Top constraints', helpText: 'List the three constraints with the largest effect on success.', placeholder: '1. Cash flow…\n2. Customer acquisition…\n3. …' }
    ]
  },
  {
    id: 'wb-02', moduleNumber: 2, title: 'Caribbean Market Evidence',
    outcome: 'Define the target customer, validate the problem and compare direct and indirect alternatives.',
    categoryIds: ['customers'],
    prompts: [
      { id: 'segment', label: 'Priority customer', helpText: 'Be specific about location, need, ability to pay and buying context.', placeholder: 'Our priority customer is…' },
      { id: 'evidence', label: 'Demand evidence', helpText: 'Record interviews, observed behaviour, pilots, pre-orders or sales.', placeholder: 'Evidence collected and what it showed…' },
      { id: 'alternatives', label: 'Competitors & alternatives', helpText: 'Include doing nothing, informal providers and imported/online options.', placeholder: 'Customers currently solve this by…' }
    ]
  },
  {
    id: 'wb-03', moduleNumber: 3, title: 'Pricing & Break-even Model',
    outcome: 'Document unit economics, pricing logic, break-even and the sensitivity of profit to volume or cost changes.',
    categoryIds: ['finance'],
    prompts: [
      { id: 'economics', label: 'Unit economics', helpText: 'Show selling price, direct/variable cost and contribution per sale.', placeholder: 'Price = XCD…; variable cost = XCD…; contribution = XCD…' },
      { id: 'breakeven', label: 'Break-even', helpText: 'Show fixed cost ÷ contribution per unit or your service equivalent.', placeholder: 'Monthly fixed cost / contribution = … sales' },
      { id: 'pricing', label: 'Pricing decision', helpText: 'Explain customer value, competitor context, taxes/fees and margin target.', placeholder: 'We will price at… because…' }
    ]
  },
  {
    id: 'wb-04', moduleNumber: 4, title: '12-Month Cash & Finance Control Plan',
    outcome: 'Create a finance rhythm that protects cash and produces funding-ready records.',
    categoryIds: ['finance'],
    prompts: [
      { id: 'cash', label: 'Cash-flow forecast', helpText: 'Summarise expected monthly receipts, payments and low points.', placeholder: 'Lowest projected cash month is…' },
      { id: 'rhythm', label: 'Record-keeping rhythm', helpText: 'Define daily, weekly and monthly finance tasks and owners.', placeholder: 'Daily…\nWeekly…\nMonthly…' },
      { id: 'kpis', label: 'Financial KPIs', helpText: 'Select measures such as cash balance, gross margin, DSO and overdue payables.', placeholder: 'We will review… every…' }
    ]
  },
  {
    id: 'wb-05', moduleNumber: 5, title: 'Inventory, Assets & Supplier Plan',
    outcome: 'Protect availability and working capital using landed cost, reorder or resource-capacity controls.',
    categoryIds: ['inventory', 'resilience'],
    prompts: [
      { id: 'inputs', label: 'Critical inputs/resources', helpText: 'List stock, materials, assets, licences, contractors or consumables.', placeholder: 'Critical items and why they matter…' },
      { id: 'control', label: 'Control method', helpText: 'Show reorder points or service-resource maintenance/capacity rules.', placeholder: 'Demand/usage… lead time… safety allowance…' },
      { id: 'supplier', label: 'Supplier risk', helpText: 'Compare key suppliers and identify an alternative or recovery action.', placeholder: 'Primary supplier…; risk…; alternative…' }
    ]
  },
  {
    id: 'wb-06', moduleNumber: 6, title: 'Core Operations SOP',
    outcome: 'Document one important workflow with ownership, standard time, quality checks and exception handling.',
    categoryIds: ['operations'],
    prompts: [
      { id: 'workflow', label: 'Workflow', helpText: 'Describe trigger, steps, owner and completion condition.', placeholder: 'Trigger → step 1 → step 2 → completed when…' },
      { id: 'quality', label: 'Quality & exceptions', helpText: 'Define checks, failure handling and escalation.', placeholder: 'Quality is accepted when… If it fails…' },
      { id: 'metric', label: 'Operating metric', helpText: 'Choose a threshold for time, quality, backlog or rework.', placeholder: 'Measure… Target… Review frequency…' }
    ]
  },
  {
    id: 'wb-07', moduleNumber: 7, title: '90-Day Customer Marketing Plan',
    outcome: 'Run focused campaigns that produce measurable enquiries and sales, not only attention.',
    categoryIds: ['marketing', 'customers'],
    prompts: [
      { id: 'positioning', label: 'Message & offer', helpText: 'State audience, problem, promise, proof and call to action.', placeholder: 'For [audience], we…' },
      { id: 'calendar', label: '90-day campaign calendar', helpText: 'List campaign, channel, owner, date, budget and intended action.', placeholder: 'Month 1…\nMonth 2…\nMonth 3…' },
      { id: 'measurement', label: 'Campaign measurement', helpText: 'Define lead source, conversion, CAC and contribution tracking.', placeholder: 'A successful campaign will…' }
    ]
  },
  {
    id: 'wb-08', moduleNumber: 8, title: 'AI Opportunity & Tool Decision',
    outcome: 'Select one bounded AI use case based on value, risk, fit and measurable return.',
    categoryIds: ['digital_ai'],
    prompts: [
      { id: 'problem', label: 'Business problem', helpText: 'Quantify current time, cost, error or delay.', placeholder: 'This task currently takes… and causes…' },
      { id: 'choice', label: 'Tool category & choice', helpText: 'Compare fit, price, privacy, integration and exit options.', placeholder: 'We considered… and selected… because…' },
      { id: 'control', label: 'Pilot & human control', helpText: 'Define safe data, reviewer, baseline, KPI and stop rule.', placeholder: 'Pilot for… Human review by… Success =…' }
    ]
  },
  {
    id: 'wb-09', moduleNumber: 9, title: 'CRM & Repeat-Business System',
    outcome: 'Create a practical lead-to-loyalty process with consent, follow-up and service recovery.',
    categoryIds: ['customers', 'marketing'],
    prompts: [
      { id: 'pipeline', label: 'Sales pipeline', helpText: 'Define stages, owner, next action and stale-lead rule.', placeholder: 'New → qualified → proposal → won/lost…' },
      { id: 'followup', label: 'Follow-up rhythm', helpText: 'Specify timing and channels for leads and existing customers.', placeholder: 'Within 1 day… after 3 days… after purchase…' },
      { id: 'retention', label: 'Retention action', helpText: 'Choose an action tied to repeat rate, referrals or churn.', placeholder: 'We will improve retention by… measured by…' }
    ]
  },
  {
    id: 'wb-10', moduleNumber: 10, title: 'Roles, Delegation & People Plan',
    outcome: 'Make accountability visible and reduce unnecessary owner dependence.',
    categoryIds: ['people', 'operations'],
    prompts: [
      { id: 'roles', label: 'Responsibility chart', helpText: 'List major outputs, accountable person and backup.', placeholder: 'Output… owner… backup… decision limit…' },
      { id: 'delegate', label: 'Delegation plan', helpText: 'Choose work to retain, delegate, outsource or automate.', placeholder: 'Retain… Delegate… Outsource… Automate…' },
      { id: 'performance', label: 'Performance rhythm', helpText: 'Define expectations, KPIs, check-ins and development.', placeholder: 'Role… target… review every…' }
    ]
  },
  {
    id: 'wb-11', moduleNumber: 11, title: 'Business Continuity & Cyber Checklist',
    outcome: 'Prepare for severe weather, outages, cyber incidents and supplier disruption before they occur.',
    categoryIds: ['resilience', 'digital_ai'],
    prompts: [
      { id: 'bia', label: 'Critical operations', helpText: 'State maximum tolerable downtime, dependencies and recovery priority.', placeholder: 'Critical activity… maximum downtime… dependencies…' },
      { id: 'continuity', label: 'Continuity actions', helpText: 'Cover people, premises, power, internet, suppliers, cash and communications.', placeholder: 'Before… During… After…' },
      { id: 'cyber', label: 'Cyber & backup controls', helpText: 'Record MFA, access, updates, backups, restore test and incident contacts.', placeholder: 'Control… owner… last tested…' }
    ]
  },
  {
    id: 'wb-12', moduleNumber: 12, title: '12-Month Business Advantage Roadmap',
    outcome: 'Convert the course into an owned, funded and measurable implementation plan.',
    categoryIds: ['finance', 'customers', 'marketing', 'operations', 'inventory', 'digital_ai', 'people', 'resilience'],
    prompts: [
      { id: 'priorities', label: 'Three strategic priorities', helpText: 'Choose based on evidence and sequence them realistically.', placeholder: 'Priority 1…\nPriority 2…\nPriority 3…' },
      { id: 'roadmap', label: 'Quarterly roadmap', helpText: 'Define milestones, owner, budget and dependency by quarter.', placeholder: 'Q1…\nQ2…\nQ3…\nQ4…' },
      { id: 'dashboard', label: 'Executive dashboard', helpText: 'Select 8–12 KPIs with target, source, owner and review cadence.', placeholder: 'KPI… target… data source… owner… frequency…' }
    ]
  }
];

const finalExamQuestions: FinalExamQuestion[] = [
  {
    id: 'exam-01', moduleNumber: 1, categoryId: 'operations',
    questionText: 'A business owner is busy every day but cannot say which activities create profit or customer value. What is the best first management action?',
    options: ['Buy more advertising immediately', 'Map the business model and core workflows, then identify measurable constraints', 'Add more products before reviewing existing ones', 'Copy a competitor’s organisation chart'],
    correctAnswer: 'Map the business model and core workflows, then identify measurable constraints',
    reviewGuidance: 'Review Module 1: operator mindset and evidence-based business health.'
  },
  {
    id: 'exam-02', moduleNumber: 1, categoryId: 'finance',
    questionText: 'Which statement best separates a promising idea from an operating advantage?',
    options: ['The idea is unusual', 'The owner feels confident', 'Customers choose it and the business can deliver it repeatedly at sustainable economics', 'It has many social-media followers'],
    correctAnswer: 'Customers choose it and the business can deliver it repeatedly at sustainable economics',
    reviewGuidance: 'Review the Understand → Implement → Measure framework in Module 1.'
  },
  {
    id: 'exam-03', moduleNumber: 2, categoryId: 'customers',
    questionText: 'A Saint Lucia entrepreneur receives enthusiastic comments from friends about a new service. What evidence would most reduce demand risk before a large investment?',
    options: ['More logo concepts', 'Paid pilots, deposits or observed buying behaviour from target customers', 'A larger personal loan', 'A long list of possible features'],
    correctAnswer: 'Paid pilots, deposits or observed buying behaviour from target customers',
    reviewGuidance: 'Review Module 2: validation evidence is stronger than compliments.'
  },
  {
    id: 'exam-04', moduleNumber: 2, categoryId: 'customers',
    questionText: 'A small Caribbean market appears too limited for one broad offer. Which response is strongest?',
    options: ['Market to everyone with the same message', 'Choose a defined segment and test local, tourism, business, government or regional demand separately', 'Lower every price', 'Assume social media will create demand'],
    correctAnswer: 'Choose a defined segment and test local, tourism, business, government or regional demand separately',
    reviewGuidance: 'Review segmentation and market pathways in Module 2.'
  },
  {
    id: 'exam-05', moduleNumber: 3, categoryId: 'finance',
    questionText: 'A product sells for XCD 100 and has a variable cost of XCD 60. Monthly fixed costs are XCD 4,000. What is the break-even volume?',
    options: ['40 units', '67 units', '100 units', '160 units'],
    correctAnswer: '100 units',
    reviewGuidance: 'Contribution is 100 − 60 = 40; break-even is 4,000 ÷ 40 = 100 units.'
  },
  {
    id: 'exam-06', moduleNumber: 3, categoryId: 'finance',
    questionText: 'A retailer adds 25% to an XCD 80 cost and sells at XCD 100. What gross margin percentage is earned before other costs?',
    options: ['20%', '25%', '75%', '80%'],
    correctAnswer: '20%',
    reviewGuidance: 'Margin is (100 − 80) ÷ 100 = 20%; markup and margin are different.'
  },
  {
    id: 'exam-07', moduleNumber: 4, categoryId: 'finance',
    questionText: 'A restaurant reports a monthly profit but repeatedly lacks cash to pay suppliers. Which should the owner examine first?',
    options: ['Only follower growth', 'Timing of customer receipts, inventory purchases, debt payments and other cash movements', 'The colour of the menu', 'Revenue without costs'],
    correctAnswer: 'Timing of customer receipts, inventory purchases, debt payments and other cash movements',
    reviewGuidance: 'Review cash flow versus profit and the cash conversion cycle in Module 4.'
  },
  {
    id: 'exam-08', moduleNumber: 4, categoryId: 'finance',
    questionText: 'Which practice produces the strongest funding-ready financial evidence?',
    options: ['Mix personal and business cash', 'Reconstruct records only when applying for a loan', 'Maintain current books, reconciliations, receivables/payables and explainable forecasts', 'Record sales but ignore costs'],
    correctAnswer: 'Maintain current books, reconciliations, receivables/payables and explainable forecasts',
    reviewGuidance: 'Review the finance-control calendar in Module 4.'
  },
  {
    id: 'exam-09', moduleNumber: 5, categoryId: 'inventory',
    questionText: 'Average demand is 4 units per day, replenishment lead time is 30 days and safety stock is 40 units. What is the reorder point?',
    options: ['70 units', '120 units', '160 units', '200 units'],
    correctAnswer: '160 units',
    reviewGuidance: 'Reorder point = demand during lead time + safety stock = (4 × 30) + 40.'
  },
  {
    id: 'exam-10', moduleNumber: 5, categoryId: 'inventory',
    questionText: 'Which cost set gives the most useful landed cost for an imported product?',
    options: ['Supplier invoice only', 'Supplier price plus freight, insurance, duties, brokerage and attributable delivery costs', 'Advertising only', 'Rent divided by units only'],
    correctAnswer: 'Supplier price plus freight, insurance, duties, brokerage and attributable delivery costs',
    reviewGuidance: 'Review landed cost and supplier comparisons in Module 5.'
  },
  {
    id: 'exam-11', moduleNumber: 6, categoryId: 'operations',
    questionText: 'A repair business has repeated callbacks for the same fault. Which response is most likely to create lasting improvement?',
    options: ['Tell staff to be more careful', 'Record failure patterns, find root causes, update the SOP/checklist and measure repeat work', 'Stop accepting complaints', 'Buy a new logo'],
    correctAnswer: 'Record failure patterns, find root causes, update the SOP/checklist and measure repeat work',
    reviewGuidance: 'Review quality at the source and corrective action in Module 6.'
  },
  {
    id: 'exam-12', moduleNumber: 6, categoryId: 'operations',
    questionText: 'Which dashboard is most useful to a small owner-manager?',
    options: ['Fifty measures with no owner', 'A short set of actionable financial, customer and operating KPIs with targets and review dates', 'Only total revenue', 'Only social-media impressions'],
    correctAnswer: 'A short set of actionable financial, customer and operating KPIs with targets and review dates',
    reviewGuidance: 'Review the minimum viable management dashboard in Module 6.'
  },
  {
    id: 'exam-13', moduleNumber: 7, categoryId: 'marketing',
    questionText: 'A campaign generates 300 likes but no traceable enquiries. What is the best conclusion?',
    options: ['It definitely succeeded', 'The business needs a clear call to action and lead/conversion tracking before judging business impact', 'Double the spend immediately', 'Likes equal profit'],
    correctAnswer: 'The business needs a clear call to action and lead/conversion tracking before judging business impact',
    reviewGuidance: 'Review campaigns that produce customers in Module 7.'
  },
  {
    id: 'exam-14', moduleNumber: 7, categoryId: 'marketing',
    questionText: 'Why should a business build a permission-based customer list in addition to using social media?',
    options: ['To send unlimited unsolicited messages', 'To retain an owned, consent-based route to customers if platform reach or rules change', 'To avoid customer service', 'To replace all other channels'],
    correctAnswer: 'To retain an owned, consent-based route to customers if platform reach or rules change',
    reviewGuidance: 'Review owned channels, consent and channel risk in Module 7.'
  },
  {
    id: 'exam-15', moduleNumber: 8, categoryId: 'digital_ai',
    questionText: 'A five-person company spends six hours weekly drafting repetitive social posts. Which is the strongest AI approach?',
    options: ['Automate every post with no review', 'Pilot AI-assisted drafting and design with brand rules, human approval and time/lead measures', 'Upload confidential customer files to any free tool', 'Replace the accounting system with a chatbot'],
    correctAnswer: 'Pilot AI-assisted drafting and design with brand rules, human approval and time/lead measures',
    reviewGuidance: 'Review bounded AI pilots and human control in Module 8.'
  },
  {
    id: 'exam-16', moduleNumber: 8, categoryId: 'digital_ai',
    questionText: 'Which tool-selection principle is most defensible for a small business?',
    options: ['Choose the most fashionable model', 'Choose by problem fit, integration, total cost, data risk, support and measurable benefit', 'Use one chatbot for finance, stock and legal decisions', 'Ignore exit and data-export options'],
    correctAnswer: 'Choose by problem fit, integration, total cost, data risk, support and measurable benefit',
    reviewGuidance: 'Review the AI/tool decision matrix in Module 8.'
  },
  {
    id: 'exam-17', moduleNumber: 9, categoryId: 'customers',
    questionText: 'A sales lead has no next action or due date in the CRM. What does that usually mean operationally?',
    options: ['The lead is safely managed', 'The pipeline record is incomplete and follow-up can easily be lost', 'The sale is guaranteed', 'The CRM is unnecessary'],
    correctAnswer: 'The pipeline record is incomplete and follow-up can easily be lost',
    reviewGuidance: 'Review CRM minimum fields and pipeline discipline in Module 9.'
  },
  {
    id: 'exam-18', moduleNumber: 9, categoryId: 'customers',
    questionText: 'After a justified complaint, which response best protects the customer relationship?',
    options: ['Argue publicly', 'Acknowledge, clarify, correct, confirm satisfaction and record the root cause', 'Delete the message', 'Offer a discount without fixing the cause'],
    correctAnswer: 'Acknowledge, clarify, correct, confirm satisfaction and record the root cause',
    reviewGuidance: 'Review service recovery and retention in Module 9.'
  },
  {
    id: 'exam-19', moduleNumber: 10, categoryId: 'people',
    questionText: 'What makes delegation different from simply giving someone a task?',
    options: ['Delegation includes the outcome, authority, resources, deadline, check-ins and accountability', 'Delegation means no follow-up', 'Delegation transfers ownership of the company', 'Delegation requires the owner to redo every step'],
    correctAnswer: 'Delegation includes the outcome, authority, resources, deadline, check-ins and accountability',
    reviewGuidance: 'Review effective delegation in Module 10.'
  },
  {
    id: 'exam-20', moduleNumber: 10, categoryId: 'people',
    questionText: 'A solo owner is not ready to hire full-time. Which decision method is strongest?',
    options: ['Hire a friend without a role', 'Compare retain/delegate/outsource/automate options using risk, frequency, skill and total cost', 'Keep every task forever', 'Choose the cheapest contractor only'],
    correctAnswer: 'Compare retain/delegate/outsource/automate options using risk, frequency, skill and total cost',
    reviewGuidance: 'Review capacity and sourcing choices in Module 10.'
  },
  {
    id: 'exam-21', moduleNumber: 11, categoryId: 'resilience',
    questionText: 'What should determine which operation is restored first after a hurricane or major outage?',
    options: ['Which task is easiest', 'Business impact, maximum tolerable downtime and dependencies', 'Alphabetical order', 'Which employee arrives first'],
    correctAnswer: 'Business impact, maximum tolerable downtime and dependencies',
    reviewGuidance: 'Review business impact analysis and recovery priorities in Module 11.'
  },
  {
    id: 'exam-22', moduleNumber: 11, categoryId: 'resilience',
    questionText: 'Which backup statement is strongest?',
    options: ['A backup exists, so testing is unnecessary', 'Critical data has protected, separate copies and restoration is tested against recovery objectives', 'A copy on the same laptop is sufficient', 'Cloud services never fail'],
    correctAnswer: 'Critical data has protected, separate copies and restoration is tested against recovery objectives',
    reviewGuidance: 'Review cyber resilience, RPO/RTO and restore tests in Module 11.'
  },
  {
    id: 'exam-23', moduleNumber: 12, categoryId: 'finance',
    questionText: 'Which package is most useful when approaching a lender or investor?',
    options: ['A verbal promise only', 'Current records, realistic forecasts, assumptions, use of funds, repayment/return logic and risks', 'A high follower count only', 'A forecast with no supporting assumptions'],
    correctAnswer: 'Current records, realistic forecasts, assumptions, use of funds, repayment/return logic and risks',
    reviewGuidance: 'Review financing readiness in Module 12.'
  },
  {
    id: 'exam-24', moduleNumber: 12, categoryId: 'operations',
    questionText: 'A business has identified 18 improvements. What is the best way to build a credible 12-month roadmap?',
    options: ['Start all 18 immediately', 'Prioritise by impact, urgency, effort and dependency; assign owners, budgets, milestones and KPIs', 'Choose only the easiest tasks', 'Wait until every uncertainty is gone'],
    correctAnswer: 'Prioritise by impact, urgency, effort and dependency; assign owners, budgets, milestones and KPIs',
    reviewGuidance: 'Review sequencing and the Business Advantage Roadmap in Module 12.'
  }
];

export const IDEA_TO_ADVANTAGE_PROGRAMME: CourseProgramme = {
  kind: 'business_advantage',
  version: 1,
  name: 'From Idea to Advantage',
  framework: 'Understand → Implement → Measure',
  promise: 'Turn a promising idea or an existing Caribbean business into a better organised, financially controlled, digitally enabled and resilient operation.',
  diagnostic: {
    title: 'Business Advantage Diagnostic',
    intro: 'This is a practical self-assessment—not an audit, credit score or exam. Answer for the business as it operates today. The system adapts wording for pre-launch and operating businesses and for goods versus services.',
    categories: [
      { id: 'finance', label: 'Financial Control', description: 'Pricing, records, cash flow, margins and decision-ready financial information.', weight: 20, moduleNumbers: [3, 4, 12] },
      { id: 'customers', label: 'Customers & Sales', description: 'Market evidence, sales discipline, customer value, retention and conversion.', weight: 15, moduleNumbers: [2, 7, 9] },
      { id: 'marketing', label: 'Marketing & Brand', description: 'Positioning, channels, campaign execution, owned audiences and measurable return.', weight: 15, moduleNumbers: [7, 9] },
      { id: 'operations', label: 'Operations & Processes', description: 'Repeatable workflows, quality, capacity, service levels and management control.', weight: 15, moduleNumbers: [1, 6, 12] },
      { id: 'inventory', label: 'Inventory & Purchasing', serviceLabel: 'Purchasing & Resource Management', description: 'Availability, landed cost, suppliers, stock/assets and working-capital discipline.', weight: 10, moduleNumbers: [5] },
      { id: 'digital_ai', label: 'Digital Technology & AI', description: 'Fit-for-purpose systems, safe AI selection, automation, data protection and measurable value.', weight: 10, moduleNumbers: [8, 11] },
      { id: 'people', label: 'People & Management', description: 'Roles, delegation, capacity, performance and reducing owner dependence.', weight: 5, moduleNumbers: [10] },
      { id: 'resilience', label: 'Risk & Resilience', description: 'Continuity, cyber readiness, insurance, alternatives and recovery communication.', weight: 10, moduleNumbers: [5, 11] }
    ],
    questions: diagnosticQuestions,
    scale: [
      { value: 0, preLaunchLabel: 'Not started', operatingLabel: 'Not in place', description: 'No reliable evidence or action yet.' },
      { value: 1, preLaunchLabel: 'Initial idea', operatingLabel: 'Informal / rare', description: 'Discussed or attempted, but mostly informal and dependent on memory.' },
      { value: 2, preLaunchLabel: 'Drafted', operatingLabel: 'Partly in place', description: 'Some useful work exists, but gaps or inconsistent use remain.' },
      { value: 3, preLaunchLabel: 'Validated', operatingLabel: 'Consistent', description: 'Documented or tested and used reliably for normal decisions.' },
      { value: 4, preLaunchLabel: 'Ready & reviewed', operatingLabel: 'Measured & improved', description: 'Evidence is current, results are measured and the approach is improved deliberately.' }
    ]
  },
  workbookSections,
  finalExam: {
    title: 'From Idea to Advantage Final Examination',
    intro: 'Twenty-four scenario-based questions test whether you can apply the course to real Caribbean small-business decisions. The pass mark is 70%, and retakes are allowed after review.',
    questions: finalExamQuestions
  },
  certificate: {
    title: 'Certificate of Completion',
    requiredLessonCompletionPercent: 100,
    requireAllAssignments: true,
    finalExamMinimumScore: 70
  }
};

type LessonSeed = {
  title: string;
  description: string;
  objectives: string[];
  principles: string[];
  scenario: string;
  actions: string[];
  measures: string[];
  warning: string;
  decisionTools?: string[];
};

type QuizSeed = {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
};

type ModuleSeed = {
  title: string;
  description: string;
  categoryIds: string[];
  lessons: LessonSeed[];
  quiz: QuizSeed[];
  assignmentTitle: string;
  assignmentDescription: string;
};

const modules: ModuleSeed[] = [
  {
    title: 'Module 1: From Idea to Advantage',
    description: 'Move from enthusiasm and owner activity to a business that creates customer value, produces evidence and improves through a repeatable management system.',
    categoryIds: ['operations', 'finance'],
    lessons: [
      {
        title: 'The Difference Between an Idea and an Advantage',
        description: 'Define success as a repeatable customer and operating advantage—not simply opening a business.',
        objectives: ['Distinguish an idea, an offer, a business model and an advantage', 'Explain why repeatability and unit economics matter', 'Identify evidence that a business creates real value'],
        principles: [
          'An idea describes a possibility. An offer states what a customer can buy. A business model explains how value is created, delivered and paid for.',
          'An advantage exists when a defined customer chooses the business for a meaningful reason and the business can deliver that promise repeatedly at sustainable economics.',
          'Being busy is not the same as building value. Owner hours, social engagement and revenue must be connected to margin, cash, quality and customer outcomes.',
          'In a small Caribbean market, reputation moves quickly. Reliability, response time, trust and local understanding can be stronger advantages than scale.',
          'Every claimed advantage needs evidence: conversion, repeat business, delivery performance, customer feedback, margin or another observable result.'
        ],
        scenario: 'A mobile events company owns exciting equipment and receives many enquiries. It still lacks an advantage if quotations are slow, prices do not cover transport and staffing, and bookings depend entirely on the owner. The advantage emerges when the company packages a clear experience, responds quickly, prices profitably and delivers it consistently across communities.',
        actions: ['Write the customer problem in one sentence.', 'Describe the offer and the reason to choose it.', 'List the capabilities required to deliver every time.', 'Choose one customer measure and one financial measure that would prove the advantage.'],
        measures: ['Qualified enquiry-to-sale conversion', 'Contribution per sale or booking', 'On-time, first-time-right delivery'],
        warning: 'Do not confuse novelty with defensibility. A competitor can copy a feature; a trusted system of customer insight, process discipline and learning is harder to copy.'
      },
      {
        title: 'Think Like an Owner and Operate Like a Manager',
        description: 'Separate strategic ownership decisions from the daily work that keeps pulling the owner back in.',
        objectives: ['Identify the owner, manager and technician roles', 'Diagnose owner dependence', 'Create a practical weekly management rhythm'],
        principles: [
          'The owner chooses direction and risk; the manager plans, measures and corrects; the technician performs the work. One person may hold all three roles, but the roles still need separate time.',
          'Owner dependence appears when prices, customer records, supplier knowledge, approvals and procedures live only in one person’s head.',
          'A weekly management rhythm should review cash, sales pipeline, delivery commitments, customer issues, stock/resources and the few actions that need escalation.',
          'A constraint is the factor currently limiting throughput or results. Improving non-constraints can create more work without creating more value.',
          'Good management converts observations into a named action, owner, deadline and follow-up—not a vague intention.'
        ],
        scenario: 'A salon owner serves clients, orders supplies, answers every WhatsApp message and approves every discount. Hiring another stylist will not solve the underlying problem if booking rules, service standards, stock controls and decision limits remain undocumented.',
        actions: ['Track one week of owner time by role.', 'Identify work that only the owner should do.', 'Select one recurring task to document and delegate.', 'Schedule a 30-minute weekly business review with a fixed agenda.'],
        measures: ['Owner hours spent on strategic work', 'Decisions completed without owner intervention', 'Overdue management actions'],
        warning: 'Delegating a task without the expected outcome, authority, resources and check-in point usually creates rework rather than independence.'
      },
      {
        title: 'Your Business Advantage Baseline',
        description: 'Use evidence to establish where the business is now and where focused improvement will produce the greatest return.',
        objectives: ['Interpret the Business Advantage Score correctly', 'Select priorities without ignoring dependencies', 'Set a measurable 12-month direction'],
        principles: [
          'The diagnostic is a structured self-assessment, not an audit, valuation or guarantee. Its value comes from honest answers and later evidence.',
          'A weighted overall score prevents one strong area from hiding a serious weakness in finance, operations or resilience.',
          'Pre-launch learners are scored on readiness; operating businesses are scored on management maturity. Both use the same eight capability areas.',
          'Start with risks that threaten survival and constraints that block customer value, then address improvements with the best impact-to-effort ratio.',
          'Course assignments increase assessment confidence because completed plans and calculations provide evidence beyond self-perception.'
        ],
        scenario: 'A retailer scores 78% in marketing but 30% in financial control and 25% in inventory. More promotion may increase sales while worsening cash pressure and stock-outs. The correct sequence is to stabilise cash and availability before accelerating demand.',
        actions: ['Complete the starting diagnostic honestly.', 'Read category scores rather than only the overall number.', 'Identify the three weakest areas and their linked modules.', 'Write a 12-month advantage statement and the first 30-day action.'],
        measures: ['Starting and final Business Advantage Score', 'Assessment confidence', 'Priority actions completed by due date'],
        warning: 'Do not chase a high score by selecting aspirational answers. The baseline is useful only when it reflects the business today.'
      }
    ],
    quiz: [
      { question: 'Which best describes a business advantage?', options: ['A new idea with many features', 'A customer-valued difference the business can deliver repeatedly at sustainable economics', 'A high number of social followers'], correct: 'A customer-valued difference the business can deliver repeatedly at sustainable economics', explanation: 'An advantage combines customer choice, repeatable delivery and sustainable economics.' },
      { question: 'What is a strong response to owner dependence?', options: ['Keep every decision with the owner', 'Document outcomes, decision limits and recurring processes, then delegate deliberately', 'Hire people without defined roles'], correct: 'Document outcomes, decision limits and recurring processes, then delegate deliberately', explanation: 'Documented expectations and authority create controlled independence.' },
      { question: 'What should the starting diagnostic represent?', options: ['The business as it operates today', 'The business at its best imagined future', 'A credit score'], correct: 'The business as it operates today', explanation: 'A truthful baseline makes priorities and later improvement meaningful.' }
    ],
    assignmentTitle: 'Business Health & Advantage Baseline',
    assignmentDescription: 'Complete Workbook Section 1. Describe the current reality, define the advantage you want to create, identify three evidence-based constraints and commit to one 30-day improvement action.'
  },
  {
    title: 'Module 2: Know Your Caribbean Market',
    description: 'Validate demand and choose focused market pathways under the realities of small populations, tourism cycles, informal competition and regional opportunity.',
    categoryIds: ['customers'],
    lessons: [
      {
        title: 'Define the Customer and the Job to Be Done',
        description: 'Replace “everyone is my customer” with a specific buying situation and measurable problem.',
        objectives: ['Build an actionable customer profile', 'Separate users, buyers and influencers', 'Describe functional, emotional and social customer needs'],
        principles: [
          'Useful segmentation combines need, context, ability to pay and behaviour—not age or location alone.',
          'The user, buyer, approver and influencer may be different people, especially in business, government, education and family purchases.',
          'Customers often hire a product or service to make progress: save time, reduce risk, earn income, feel secure, create enjoyment or meet an obligation.',
          'A Caribbean business may serve residents, diaspora, tourists, government, other businesses or export customers; each pathway has different buying cycles and standards.',
          'The best initial segment is often the one with an urgent problem, reachable buyers and economics the business can support.'
        ],
        scenario: 'A training provider says its audience is “all young people.” A more usable segment is “parents in northern Saint Lucia seeking supervised, practical after-school digital learning for children aged 10–15 and willing to pay a monthly fee.” That definition changes the offer, timetable, channel and proof required.',
        actions: ['Name one priority customer segment.', 'Identify user, payer, approver and influencer.', 'Write the problem, current alternative and desired result.', 'List where and when the customer makes the decision.'],
        measures: ['Number of qualified customer conversations', 'Problem frequency and urgency', 'Willingness-to-pay evidence'],
        warning: 'A segment is not useful if it is broad enough to include people with different needs, budgets and buying processes.'
      },
      {
        title: 'Validate Demand Before You Spend',
        description: 'Use progressively stronger evidence to reduce market risk before committing scarce cash.',
        objectives: ['Rank validation evidence by strength', 'Design a low-cost market test', 'Avoid leading interviews and false-positive interest'],
        principles: [
          'Opinions and compliments are weak evidence. Past behaviour, deposits, pre-orders, paid pilots and repeat use are stronger.',
          'Customer interviews should explore recent behaviour and consequences before presenting the proposed solution.',
          'A minimum viable test should examine the riskiest assumption—not build a smaller version of every feature.',
          'Record who declined and why. Lost demand may reveal price, trust, timing, access or problem-priority issues.',
          'Set a decision rule before the test: continue, change or stop based on defined evidence.'
        ],
        scenario: 'Before importing 30 specialised units, an entrepreneur interviews 15 target customers, demonstrates one sample, asks for a refundable deposit and tests two price points. Five compliments are less useful than three deposits from the exact target segment.',
        actions: ['List the three assumptions most likely to make the idea fail.', 'Choose the riskiest assumption.', 'Design an interview, landing page, sample, pilot or pre-sale test.', 'Define the minimum evidence needed to proceed.'],
        measures: ['Interview-to-test participation', 'Deposit or pilot conversion', 'Repeat intent backed by action'],
        warning: 'Do not ask “Would you buy this?” and treat “yes” as a sale. Ask about real past behaviour or request a meaningful commitment.'
      },
      {
        title: 'Compete in Small, Seasonal and Regional Markets',
        description: 'Build a market strategy that recognises tourism cycles, limited local scale and the friction of regional expansion.',
        objectives: ['Assess market size without false precision', 'Plan for seasonality', 'Compare local, tourism, diaspora and regional growth options'],
        principles: [
          'Estimate reachable customers and purchase frequency from the bottom up; a global market statistic does not prove local demand.',
          'Seasonality affects cash, staffing, stock and promotion. Use monthly scenarios rather than dividing annual sales evenly by twelve.',
          'Informal competitors, substitutes and “do it yourself” are part of the competitive set even if they are not registered firms.',
          'Regional growth adds currency, payment, shipping, customs, legal, support and localisation requirements; test one market before scaling.',
          'Partnerships can reduce customer-acquisition and distribution friction when incentives, service levels and ownership of the customer are clear.'
        ],
        scenario: 'A tour-related business earns most revenue from December to April. Its plan reserves cash in strong months, develops resident packages for slower months and tests diaspora gift purchases rather than assuming identical demand year-round.',
        actions: ['Estimate reachable customers using a bottom-up method.', 'Plot high, normal and low demand months.', 'Map direct competitors, substitutes and doing nothing.', 'Choose one market pathway and a low-risk test.'],
        measures: ['Sales by segment and month', 'Market-test conversion', 'Contribution after channel or partner costs'],
        warning: 'Expansion that increases revenue but adds disproportionate fulfilment, returns, support or payment costs can destroy value.'
      }
    ],
    quiz: [
      { question: 'Which is the strongest early demand evidence?', options: ['Compliments from friends', 'A paid pilot from a target customer', 'A large global market report'], correct: 'A paid pilot from a target customer', explanation: 'A paid pilot demonstrates real willingness to commit.' },
      { question: 'Why model sales by month?', options: ['To make the plan longer', 'To reveal seasonality and cash/capacity needs', 'Because annual totals are always wrong'], correct: 'To reveal seasonality and cash/capacity needs', explanation: 'Monthly assumptions expose the operational effect of high and low periods.' },
      { question: 'Who belongs in a competitor analysis?', options: ['Only registered direct competitors', 'Direct rivals, substitutes, informal providers and doing nothing', 'Only the largest global brand'], correct: 'Direct rivals, substitutes, informal providers and doing nothing', explanation: 'Customers compare every practical alternative, not only firms that resemble yours.' }
    ],
    assignmentTitle: 'Caribbean Market Evidence Pack',
    assignmentDescription: 'Complete Workbook Section 2. Define one priority segment, document at least five pieces of customer evidence, compare three alternatives and state a go/change/stop decision rule for the next test.'
  },
  {
    title: 'Module 3: Build a Business That Makes Money',
    description: 'Translate price, cost, volume and capacity into a model that can cover obligations, finance growth and survive cost shocks.',
    categoryIds: ['finance'],
    lessons: [
      {
        title: 'Know Your Unit Economics',
        description: 'Understand what one product, job, booking or customer contributes before looking at total revenue.',
        objectives: ['Classify direct/variable and fixed costs', 'Calculate contribution and gross margin', 'Use unit economics for goods and services'],
        principles: [
          'For each unit or job, contribution equals selling price minus the costs that change with that sale.',
          'Gross profit is sales minus cost of goods sold; contribution can also subtract other variable selling or delivery costs. Define the measure consistently.',
          'Service businesses must include direct labour time, travel, consumables, commissions and other job-specific costs—not treat the owner’s time as free.',
          'A positive contribution does not guarantee total profit; contribution must cover fixed costs before profit begins.',
          'Average figures can hide unprofitable products, customers or channels. Analyse at a useful level of detail.'
        ],
        scenario: 'A technician charges XCD 250 for a visit. Parts cost XCD 70, travel averages XCD 25, payment fees are XCD 5 and direct technician time costs XCD 60. Contribution is XCD 90—not XCD 180—before rent, administration and other fixed costs.',
        actions: ['Choose the main unit: item, job, booking, hour or customer month.', 'List every variable cost tied to that unit.', 'Calculate contribution in XCD and as a percentage of price.', 'Compare the result across two offers or channels.'],
        measures: ['Contribution per unit/job', 'Gross margin percentage', 'Direct labour utilisation for services'],
        warning: 'Revenue can grow while profit falls if the mix shifts toward low-contribution sales or fulfilment costs are omitted.'
      },
      {
        title: 'Price for Value, Cost and Reality',
        description: 'Set and communicate prices without confusing markup, margin or competitor imitation.',
        objectives: ['Distinguish markup and margin', 'Use value, cost and market context together', 'Design discounts and packages safely'],
        principles: [
          'Markup is profit divided by cost; margin is profit divided by selling price. A 25% markup on XCD 80 produces a XCD 100 price but only a 20% gross margin.',
          'Cost provides a floor, customer value helps define the opportunity and competitive alternatives provide context. None should be used alone.',
          'Imported-cost exposure, payment fees, spoilage, commissions and taxes/levies where applicable must be reflected in pricing decisions.',
          'Discounts reduce contribution faster than many owners expect. Calculate the extra volume required before offering one.',
          'Packages and tiers should make differences clear and guide customers without hiding mandatory charges.'
        ],
        scenario: 'A business with a 30% contribution margin offers a 10% price discount without lowering cost. Contribution per sale falls by one-third, so the campaign needs roughly 50% more unit volume just to produce the same total contribution.',
        actions: ['Calculate current or proposed price, cost, markup and margin.', 'Identify customer value and credible alternatives.', 'Test one package or tier with real customers.', 'Create an approval rule for discounts.'],
        measures: ['Realised price versus list price', 'Contribution after discounts', 'Conversion by price/package'],
        warning: 'Matching a competitor’s price is dangerous when their scale, cost structure, cash position or strategic objective is unknown.'
      },
      {
        title: 'Break-even, Capacity and Scenario Planning',
        description: 'Connect the sales target to capacity and test what happens when demand, costs or timing change.',
        objectives: ['Calculate break-even volume and sales', 'Test scenarios and sensitivity', 'Check whether operational capacity supports the plan'],
        principles: [
          'Break-even units equal fixed costs divided by contribution per unit. For mixed offers, use a realistic sales mix or model each line separately.',
          'A service plan must reconcile required billable hours or bookings with available capacity after administration, travel, leave and downtime.',
          'Use conservative, expected and stronger scenarios with explicit assumptions. Avoid one forecast presented as certainty.',
          'Sensitivity analysis changes one important driver at a time—price, demand, cost, lead time or conversion—to reveal exposure.',
          'Cash break-even and accounting break-even can differ because loan principal, asset purchases, credit terms and depreciation affect them differently.'
        ],
        scenario: 'Monthly fixed costs are XCD 4,000 and contribution is XCD 40 per unit, so accounting break-even is 100 units. If capacity is only 80 units, the plan must improve price/contribution, reduce fixed cost or increase capacity before launch.',
        actions: ['Calculate monthly fixed costs and contribution.', 'Calculate break-even volume and revenue.', 'Compare break-even demand with capacity.', 'Run a cost +10%, sales −20% and late-payment scenario.'],
        measures: ['Break-even volume', 'Margin of safety', 'Capacity utilisation at break-even'],
        warning: 'A mathematically correct break-even point is not achievable if customer demand or delivery capacity cannot support it.'
      }
    ],
    quiz: [
      { question: 'Contribution per unit is generally calculated as:', options: ['Selling price minus variable costs', 'Selling price minus only rent', 'Cash balance divided by sales'], correct: 'Selling price minus variable costs', explanation: 'Contribution shows how much each sale contributes toward fixed costs and profit.' },
      { question: 'An XCD 80 cost sold for XCD 100 has what gross margin?', options: ['20%', '25%', '80%'], correct: '20%', explanation: 'Margin is (100 − 80) ÷ 100 = 20%; 25% is the markup on cost.' },
      { question: 'Fixed costs are XCD 6,000 and contribution is XCD 50 per sale. Break-even is:', options: ['120 sales', '300 sales', '6,050 sales'], correct: '120 sales', explanation: '6,000 ÷ 50 = 120 sales.' }
    ],
    assignmentTitle: 'Pricing, Margin & Break-even Model',
    assignmentDescription: 'Complete Workbook Section 3 using your main product, job or booking. Show all variable costs, contribution, markup/margin, monthly fixed costs, break-even, capacity and three sensitivity scenarios.'
  },
  {
    title: 'Module 4: Take Control of Your Money',
    description: 'Build cash visibility, disciplined records and a finance rhythm that supports decisions, tax readiness and access to funding.',
    categoryIds: ['finance'],
    lessons: [
      {
        title: 'Profit Is Not Cash',
        description: 'Understand why a profitable-looking business can still fail to pay wages, suppliers or debt on time.',
        objectives: ['Explain profit versus cash flow', 'Build a direct cash forecast', 'Identify working-capital pressure'],
        principles: [
          'Revenue may be recorded before cash arrives, while stock, deposits, debt and equipment may require cash earlier.',
          'A direct cash forecast lists opening cash, expected receipts, expected payments and closing cash by week or month.',
          'Receivable days, inventory days and payable days together shape the cash conversion cycle.',
          'Seasonal businesses should build reserves during stronger months and test the effect of delayed collections or disrupted tourism/trade.',
          'When a cash shortfall is visible early, the owner has more options: collect faster, renegotiate timing, reduce purchases, defer spending or arrange finance.'
        ],
        scenario: 'A wholesaler records XCD 30,000 in sales, but most customers pay in 45 days. It paid cash for imported stock and freight this month. The income statement may show profit while the bank balance falls dangerously low.',
        actions: ['List opening cash and confirmed receipts.', 'Schedule payroll, suppliers, tax/fees, debt and other payments by date.', 'Add conservative assumptions for late collections and cost increases.', 'Define a minimum cash threshold and action trigger.'],
        measures: ['Weekly closing cash forecast', 'Days sales outstanding', 'Cash runway or minimum reserve'],
        warning: 'Do not solve every cash shortage with new debt. First identify whether the cause is timing, low margin, excess stock, uncontrolled cost or an unviable model.'
      },
      {
        title: 'Bookkeeping and Reconciliation That Owners Can Use',
        description: 'Turn receipts and transactions into trustworthy information instead of year-end reconstruction.',
        objectives: ['Design a record-keeping workflow', 'Explain reconciliation', 'Separate source documents, records and financial reports'],
        principles: [
          'Use a separate business bank/payment account where practical and record cash sales with the same discipline as electronic payments.',
          'Source documents support a transaction; bookkeeping classifies it; reconciliation proves the records agree with independent balances.',
          'Reconcile bank, cash, card and payment-platform accounts on a defined schedule and investigate—not erase—differences.',
          'A proper accounting platform or qualified bookkeeper should hold the official books. General AI assistants may help explain or draft, but should not replace the ledger.',
          'Country-specific tax, payroll and statutory obligations require current guidance from the relevant authority or a qualified professional.'
        ],
        scenario: 'A small shop uses a POS, mobile transfers and cash. Daily close compares sales by tender with actual cash and platform totals; monthly reconciliation matches the books to bank and processor statements. Exceptions are documented and resolved.',
        actions: ['Choose the official bookkeeping system and chart of accounts.', 'Define how every sales channel enters the books.', 'Create daily/weekly document and cash controls.', 'Schedule monthly reconciliation and management review.'],
        measures: ['Days from transaction to record', 'Unreconciled differences', 'Month-end close completed by target date'],
        warning: 'Keeping receipts is not the same as maintaining books. Information that is months behind cannot reliably guide today’s decision.'
      },
      {
        title: 'Financial KPIs and Funding Readiness',
        description: 'Use a short financial dashboard and build the evidence lenders, investors and grant programmes expect.',
        objectives: ['Select actionable finance KPIs', 'Manage receivables and payables', 'Prepare an evidence-based funding package'],
        principles: [
          'A practical dashboard can include cash balance, revenue, gross/contribution margin, operating expenses, receivables ageing and forecast variance.',
          'Receivables need clear terms, prompt invoicing, scheduled reminders, dispute resolution and escalation. Sales are not complete until collection risk is controlled.',
          'Payables planning protects supplier relationships without sacrificing essential cash. Prioritise legal, payroll, critical supply and agreed commitments.',
          'Funding readiness combines historical records, realistic forecasts, assumptions, use of funds, repayment/return logic, risks and owner contribution.',
          'Separate controllable operating performance from one-off events so decisions are based on the underlying business.'
        ],
        scenario: 'A lender is more likely to trust an owner who can explain six months of reconciled records, ageing, margins, a forecast and how a new asset will create repayment capacity than an owner with only a revenue estimate.',
        actions: ['Select five to eight finance KPIs.', 'Assign data source, owner, target and frequency.', 'Create receivable follow-up rules.', 'Assemble current records, forecast assumptions and use-of-funds evidence.'],
        measures: ['Gross/contribution margin', 'Receivables ageing and collection days', 'Actual-versus-forecast cash'],
        warning: 'Financial dashboards should trigger decisions. Reporting a deteriorating measure without an owner and action creates awareness, not control.'
      }
    ],
    quiz: [
      { question: 'Why can profit and cash differ?', options: ['Because sales, collections, purchases, debt and assets occur at different times', 'Because cash never matters', 'Because profit is always false'], correct: 'Because sales, collections, purchases, debt and assets occur at different times', explanation: 'Timing and non-profit cash movements create the difference.' },
      { question: 'What does reconciliation do?', options: ['Compares records with independent account balances and resolves differences', 'Estimates sales without evidence', 'Deletes old transactions'], correct: 'Compares records with independent account balances and resolves differences', explanation: 'Reconciliation is a key completeness and accuracy control.' },
      { question: 'Which is most funding-ready?', options: ['Current reconciled records plus explainable forecasts and use of funds', 'A verbal promise', 'Follower count only'], correct: 'Current reconciled records plus explainable forecasts and use of funds', explanation: 'Funders need credible evidence and repayment/return logic.' }
    ],
    assignmentTitle: '12-Month Cash & Finance Control Plan',
    assignmentDescription: 'Complete Workbook Section 4. Prepare a 12-month cash forecast, define daily/weekly/monthly record controls, select financial KPIs and describe actions for the lowest-cash month.'
  },
  {
    title: 'Module 5: Inventory & Purchasing Without Guesswork',
    description: 'Protect cash and customer availability by managing landed cost, lead time, stock/assets and supplier risk. Service businesses use the same logic for equipment and critical resources.',
    categoryIds: ['inventory', 'resilience'],
    lessons: [
      {
        title: 'Landed Cost and the True Cost of Availability',
        description: 'Calculate what imported stock or resources really cost before setting price and purchase quantities.',
        objectives: ['Build a landed-cost calculation', 'Allocate shipment costs consistently', 'Identify cost and currency exposure'],
        principles: [
          'Landed cost normally includes purchase price, freight, insurance, duties, brokerage, port/handling and attributable local delivery. Use current local rules and professional advice where needed.',
          'Shared shipment cost can be allocated by weight, volume, value or another defensible driver; choose the method that best reflects the cost.',
          'Foreign-currency movements, minimum order quantities and payment timing can materially change margin and cash requirements.',
          'Service businesses should calculate total ownership cost for equipment: purchase, shipping, setup, maintenance, licences, downtime and eventual replacement.',
          'A cheaper supplier can be more expensive after defects, delays, incomplete deliveries and emergency replacement are included.'
        ],
        scenario: 'An item costs USD 40 but freight, duty, brokerage and local transport add the equivalent of XCD 45. Pricing from supplier cost alone would overstate margin and may make every sale unprofitable.',
        actions: ['Collect every attributable cost for a representative shipment/resource.', 'Choose and document an allocation method.', 'Convert currencies using a defensible rate and allowance.', 'Recalculate price and margin using landed cost.'],
        measures: ['Landed cost variance', 'Gross margin after landed cost', 'Cost of supplier defects/delay'],
        warning: 'Do not copy a duty rate or fee from a course example. Verify the current classification and local treatment for the actual item and country.'
      },
      {
        title: 'Reorder Points, Safety Stock and Service Capacity',
        description: 'Order or prepare before the business runs out—without tying unnecessary cash in idle stock or assets.',
        objectives: ['Calculate a practical reorder point', 'Set safety stock using variability and risk', 'Adapt the method to reusable service resources'],
        principles: [
          'Basic reorder point = average demand during replenishment lead time + safety stock.',
          'Lead time begins when the purchase decision is made and ends when usable stock is available—not when the supplier ships.',
          'Safety stock should reflect demand/lead-time variability, item criticality, alternatives, expiry/obsolescence and acceptable service level.',
          'Inventory records need units of measure, locations, receipts, issues, returns and adjustments that match the physical process.',
          'For services, capacity controls include equipment availability, maintenance windows, reusable kits, specialist hours and backup arrangements.'
        ],
        scenario: 'Average demand is four units daily, usable replenishment takes 30 days and safety stock is 40 units. The reorder point is 160 units. Waiting until only 20 remain almost guarantees a stock-out before imports arrive.',
        actions: ['Measure average demand/usage and real lead time.', 'Choose a justified safety allowance.', 'Calculate reorder or maintenance/capacity triggers.', 'Assign an owner and review frequency.'],
        measures: ['Stock-out or resource-unavailable rate', 'Inventory days / asset utilisation', 'Emergency purchase frequency'],
        warning: 'A formula does not replace judgement. Promotions, hurricanes, port disruption, perishability and supplier reliability can require explicit adjustments.'
      },
      {
        title: 'Supplier Performance, Counts and Working Capital',
        description: 'Create purchasing controls that preserve supplier options, detect loss and prevent cash from becoming trapped.',
        objectives: ['Evaluate suppliers beyond price', 'Design cycle counts and variance control', 'Manage excess, slow and critical items'],
        principles: [
          'A supplier scorecard can cover total cost, on-time delivery, fill rate, quality, responsiveness, terms and continuity capability.',
          'Separate purchasing approval, receipt confirmation and payment review where team size permits; otherwise use compensating owner review.',
          'Cycle counting checks selected items regularly; full counts validate the entire record. Variances need root-cause action, not silent adjustment.',
          'ABC analysis applies tighter control to high-value or critical items while simplifying low-impact items.',
          'Slow and dead stock consume cash, space and attention. Act through price, bundles, return, transfer, redesign or write-off with proper records.'
        ],
        scenario: 'A retailer with high recorded sales still cannot reorder fast-moving lines because cash is tied up in twelve months of slow stock. A monthly ageing review reveals the problem earlier than the year-end count.',
        actions: ['Create a supplier scorecard.', 'Classify stock/resources by value and criticality.', 'Set a count schedule and variance threshold.', 'Create a slow-stock or underused-asset action list.'],
        measures: ['Supplier on-time-in-full rate', 'Stock record accuracy', 'Value of excess/obsolete stock or idle assets'],
        warning: 'More inventory is not automatically safer. It can transfer availability risk into cash, damage, expiry and obsolescence risk.'
      }
    ],
    quiz: [
      { question: 'Which belongs in landed cost?', options: ['Supplier price plus attributable freight, duties, brokerage and delivery', 'Supplier price only', 'Social media impressions'], correct: 'Supplier price plus attributable freight, duties, brokerage and delivery', explanation: 'Landed cost captures the cost to make the item available for sale or use.' },
      { question: 'Reorder point is most commonly based on:', options: ['Demand during lead time plus safety stock', 'A number that feels low', 'Last year’s rent'], correct: 'Demand during lead time plus safety stock', explanation: 'The trigger must cover expected use before replenishment arrives, plus risk allowance.' },
      { question: 'What should happen after a count variance?', options: ['Investigate the root cause and correct records/process', 'Hide it', 'Order double without analysis'], correct: 'Investigate the root cause and correct records/process', explanation: 'Variance can signal receiving, issuing, theft, damage, unit or process errors.' }
    ],
    assignmentTitle: 'Inventory, Asset & Supplier Control Plan',
    assignmentDescription: 'Complete Workbook Section 5. Calculate landed/ownership cost for one critical input, set a reorder or capacity trigger, compare two suppliers and define a count/maintenance plus disruption plan.'
  },
  {
    title: 'Module 6: Build Reliable Operations',
    description: 'Turn customer promises into repeatable workflows, quality standards, capacity decisions and a management dashboard.',
    categoryIds: ['operations'],
    lessons: [
      {
        title: 'Map the Order-to-Cash Workflow',
        description: 'See the complete flow from enquiry or booking through delivery, invoicing, collection and follow-up.',
        objectives: ['Map triggers, steps, handoffs and completion', 'Identify bottlenecks and waste', 'Assign process ownership'],
        principles: [
          'A process has a trigger, inputs, steps, owners, handoffs, rules, outputs and a definition of done.',
          'Map what happens today before designing the ideal future. Hidden rework and waiting are often more costly than the visible task.',
          'Order-to-cash includes qualification, quotation, confirmation, fulfilment, acceptance, invoice/payment and follow-up—not just delivery.',
          'Look for waiting, duplicated entry, unclear approval, unnecessary movement, batching and failure demand created by earlier errors.',
          'Every workflow needs one accountable owner even when several people perform steps.'
        ],
        scenario: 'A maintenance company promises 24-hour quotation, but requests sit in personal WhatsApp inboxes. Mapping reveals no shared intake, priority rule or quote owner. A single request log and response SLA remove more delay than hiring another technician.',
        actions: ['Choose one high-volume or high-risk workflow.', 'Map current steps and handoffs.', 'Mark delays, rework and unclear decisions.', 'Design a simpler future flow with owner and SLA.'],
        measures: ['Enquiry-to-quote time', 'Order/booking cycle time', 'Work-in-progress or backlog'],
        warning: 'Digitising a broken process can make waste happen faster. Simplify the flow before automating it.'
      },
      {
        title: 'SOPs, Quality and Service Recovery',
        description: 'Create enough standardisation for reliable work without making a small team bureaucratic.',
        objectives: ['Write a usable SOP', 'Build quality checks into work', 'Handle complaints and corrective action'],
        principles: [
          'A useful SOP states purpose, scope, owner, prerequisites, steps, quality criteria, exceptions, records and revision date.',
          'Check quality as close as possible to where the error can occur. Final inspection alone discovers waste after it has accumulated.',
          'Define acceptance standards that another competent person can apply consistently.',
          'Service recovery follows acknowledge → clarify → correct → confirm → learn. The remedy and authority limit should be clear.',
          'Corrective action distinguishes containment of today’s problem from removal of the cause that may repeat tomorrow.'
        ],
        scenario: 'Customers repeatedly complain that installation teams leave without demonstrating the service. Adding “customer demonstration and signed acceptance” to the field checklist reduces callbacks and disputes.',
        actions: ['Write one SOP from trigger to record.', 'Add two in-process quality checks.', 'Define complaint response and escalation limits.', 'Review one repeated problem using “why?” until a controllable cause is found.'],
        measures: ['First-time-right rate', 'Repeat work/refund rate', 'Complaint resolution time'],
        warning: 'An SOP nobody can find or follow is not a control. Test it with the person doing the work and update it when reality changes.'
      },
      {
        title: 'Capacity, Scheduling and the Minimum Viable Dashboard',
        description: 'Balance demand and capability, then use a short dashboard to detect problems early.',
        objectives: ['Estimate effective capacity', 'Control backlog and commitments', 'Design a balanced KPI dashboard'],
        principles: [
          'Theoretical capacity assumes every hour is productive; effective capacity allows for setup, travel, administration, maintenance, leave and variation.',
          'A schedule should protect critical commitments, group work sensibly and make overload visible before dates are promised.',
          'Backlog needs age, priority, promised date and owner. A total count alone can hide urgent overdue work.',
          'Balance lagging results such as revenue with leading indicators such as enquiries, quotes, stock risk, backlog and scheduled capacity.',
          'Each KPI needs a definition, data source, owner, target, review frequency and action threshold.'
        ],
        scenario: 'Four technicians each work 40 hours, but meetings, travel and administration reduce productive capacity to 26 hours. Scheduling 160 billable hours guarantees delay; planning from 104 effective hours makes commitments realistic.',
        actions: ['Calculate effective weekly capacity.', 'Compare confirmed demand and backlog.', 'Set scheduling and escalation rules.', 'Create an 8–12 measure dashboard with thresholds.'],
        measures: ['Capacity utilisation', 'On-time delivery', 'Backlog age and forecast'],
        warning: 'Maximising utilisation to 100% can increase queues and delay when demand varies. Preserve sensible capacity for uncertainty and urgent work.'
      }
    ],
    quiz: [
      { question: 'What should happen before automating a workflow?', options: ['Map and simplify it', 'Add more approvals', 'Ignore current performance'], correct: 'Map and simplify it', explanation: 'Automation should support a sound process, not accelerate waste.' },
      { question: 'Which is part of service recovery?', options: ['Acknowledge, correct, confirm and learn', 'Delete the complaint', 'Promise without investigation'], correct: 'Acknowledge, correct, confirm and learn', explanation: 'Recovery protects the customer and improves the process.' },
      { question: 'A useful KPI needs:', options: ['Definition, source, owner, target and review/action rule', 'A colourful chart only', 'No connection to decisions'], correct: 'Definition, source, owner, target and review/action rule', explanation: 'Operational measures must lead to consistent interpretation and action.' }
    ],
    assignmentTitle: 'Core Operations SOP & KPI Dashboard',
    assignmentDescription: 'Complete Workbook Section 6. Map one core workflow, write its SOP, define quality/exception rules and add one KPI with a measurable target, source, owner and escalation threshold.'
  },
  {
    title: 'Module 7: Marketing That Produces Customers',
    description: 'Build a clear position, select channels for Caribbean buying behaviour and measure marketing by qualified demand and contribution—not visibility alone.',
    categoryIds: ['marketing', 'customers'],
    lessons: [
      {
        title: 'Positioning, Brand and a Customer-Centred Message',
        description: 'Make it easy for the right customer to understand who the business helps, what result it delivers and why it can be trusted.',
        objectives: ['Write a focused positioning statement', 'Translate features into customer outcomes', 'Build consistent trust signals'],
        principles: [
          'Positioning is the place the business seeks to occupy in the target customer’s mind relative to alternatives.',
          'A practical message states audience, problem, promised outcome, proof and the next action. Features support the promise; they are not the promise.',
          'Brand is the expectation created by every interaction—response time, quotation, packaging, staff behaviour and recovery—not only a logo.',
          'Trust signals can include clear contact details, professional proposals, reviews used with permission, guarantees, policies, demonstrations and relevant credentials.',
          'Use plain language appropriate to the audience. Local understanding is an advantage when it improves clarity and respect rather than relying on stereotypes.'
        ],
        scenario: '“We provide technology solutions” is broad. “We help small Saint Lucia businesses keep their network, cloud tools and customer systems working without hiring full-time IT staff” identifies the audience, problem and operating result.',
        actions: ['Write a one-sentence position for one target segment.', 'Turn five features into customer outcomes.', 'List proof for each important claim.', 'Audit five customer touchpoints for message and visual consistency.'],
        measures: ['Message comprehension in customer tests', 'Qualified enquiry rate', 'Proposal acceptance by segment'],
        warning: 'A polished identity cannot compensate for an unclear offer or unreliable experience. Make the promise specific and operationally true.'
      },
      {
        title: 'Choose Channels and Build an Owned Audience',
        description: 'Use Facebook, Instagram, WhatsApp, Google, email, partnerships and offline channels according to the customer journey.',
        objectives: ['Match channels to discovery, evaluation and purchase', 'Reduce platform dependence', 'Apply consent and contact-list discipline'],
        principles: [
          'Select channels from customer behaviour: where they discover options, verify trust, ask questions, buy and seek support.',
          'WhatsApp Business can support direct conversations and simple cataloguing for small teams; scaled messaging requires appropriate platform, consent and process controls.',
          'Google Business Profile and a useful website can capture high-intent searches, while social channels often create discovery and proof.',
          'An owned, permission-based email/SMS/CRM list reduces dependence on changing platform algorithms and account access.',
          'Offline referrals, community events, tourism partners, trade groups and local institutions can outperform paid digital reach for some segments.'
        ],
        scenario: 'A mobile family-entertainment business uses short social video for discovery, WhatsApp for enquiries, a booking page for dates and deposits, email/SMS consent for offers, and school/hotel partnerships for recurring demand. Each channel has one job.',
        actions: ['Map the customer journey from awareness to repeat purchase.', 'Assign one job and CTA to each channel.', 'Create a consent-based contact capture method.', 'Choose one platform-risk fallback.'],
        measures: ['Qualified leads by source', 'Contact-list growth with consent', 'Lead response time'],
        warning: 'Do not add people to broadcast lists or campaigns without the permissions and expectations required by the channel and applicable rules.'
      },
      {
        title: 'Campaigns, Content and Marketing Economics',
        description: 'Plan 90-day campaigns with an offer, owner, budget, measurement and a decision after the results.',
        objectives: ['Build a campaign brief', 'Calculate conversion and acquisition cost', 'Use content as a system rather than random posting'],
        principles: [
          'A campaign brief identifies objective, audience, insight, offer, message, proof, channel, CTA, timing, budget, owner and measurement.',
          'Content should answer real buying questions: problem recognition, options, proof, objections, use, results and next action.',
          'Customer acquisition cost equals relevant sales/marketing cost divided by new customers acquired. Interpret it with contribution and expected retention.',
          'Use trackable source fields, links, offer codes or “how did you hear?” discipline. Perfect attribution is rare; consistent tracking is still valuable.',
          'Review results by funnel stage: reach → response → qualified lead → proposal/cart → sale → repeat/referral.'
        ],
        scenario: 'A campaign spends XCD 600 and wins 12 new customers, so simple acquisition cost is XCD 50. If contribution from a first sale is only XCD 35, the campaign needs reliable repeat contribution or a lower cost to be sustainable.',
        actions: ['Write one 90-day campaign brief.', 'Create a weekly content calendar tied to buying questions.', 'Define source and conversion tracking.', 'Set continue/change/stop thresholds before launch.'],
        measures: ['Lead-to-customer conversion', 'Customer acquisition cost', 'Campaign contribution after variable fulfilment cost'],
        warning: 'Return on ad spend uses revenue, not profit. A strong ROAS can still lose money when margin, fulfilment and repeat value are ignored.'
      }
    ],
    quiz: [
      { question: 'A useful positioning statement should identify:', options: ['Audience, problem, promised result and credible difference', 'Every possible feature', 'Only the business name'], correct: 'Audience, problem, promised result and credible difference', explanation: 'Focused positioning helps the right customer understand relevance and trust.' },
      { question: 'Why build an owned contact list?', options: ['To retain a permission-based customer route beyond one platform', 'To send unsolicited messages', 'To eliminate customer choice'], correct: 'To retain a permission-based customer route beyond one platform', explanation: 'Owned consented contact data reduces platform dependence.' },
      { question: 'Customer acquisition cost is:', options: ['Relevant acquisition cost divided by new customers', 'Revenue divided by followers', 'Likes multiplied by price'], correct: 'Relevant acquisition cost divided by new customers', explanation: 'CAC connects marketing/sales investment with actual customer acquisition.' }
    ],
    assignmentTitle: '90-Day Customer Marketing Plan',
    assignmentDescription: 'Complete Workbook Section 7. Write the positioning and offer, select channels by journey stage, create a 90-day campaign calendar and define lead, conversion, CAC and contribution measures.'
  },
  {
    title: 'Module 8: AI as Your Small-Business Workforce Multiplier',
    description: 'Select AI and automation by business problem, risk and return. This module does not teach product buttons; it teaches durable tool-choice and governance decisions.',
    categoryIds: ['digital_ai'],
    lessons: [
      {
        title: 'Find the Right Work for AI',
        description: 'Separate useful assistance and automation from tasks that need authoritative systems or accountable professional judgement.',
        objectives: ['Identify bounded AI opportunities', 'Distinguish assistance, automation and systems of record', 'Estimate value before buying a tool'],
        principles: [
          'Start with a measurable business problem: time, delay, cost, inconsistency, backlog or missed opportunity—not with a fashionable product.',
          'Generative AI is useful for drafting, summarising, classifying, brainstorming and transforming content when a human can verify the result.',
          'Accounting, payroll, inventory balances, customer consent and other authoritative records belong in fit-for-purpose systems of record, not a general chatbot.',
          'Good first pilots are frequent, bounded, reversible, low-risk and easy to compare with a baseline.',
          'Estimate benefit as time saved, errors avoided, response improved or revenue/contribution influenced—then include subscription, setup, review and integration cost.'
        ],
        scenario: 'A business spends six hours weekly turning approved offers into channel-specific posts. AI-assisted drafting and design with a brand brief and human approval is a bounded pilot. Letting AI approve refunds or calculate official taxes autonomously is not.',
        actions: ['List ten repetitive or information-heavy tasks.', 'Score each for frequency, value, data sensitivity and ease of human verification.', 'Select one low-risk/high-value pilot.', 'Record baseline time, quality and outcome before the pilot.'],
        measures: ['Hours saved net of review', 'Error/rework rate', 'Response or cycle time improvement'],
        warning: 'AI can produce confident but incorrect output. The person accountable for the business decision remains accountable after AI is used.'
      },
      {
        title: 'Choose the Tool Category for the Task',
        description: 'Compare current tool examples without tying the business to a single vendor or turning the course into software training.',
        objectives: ['Match business tasks to tool categories', 'Compare integration and total cost', 'Avoid replacing proper systems with chatbots'],
        principles: [
          'General assistants such as ChatGPT, Claude, Gemini or Microsoft Copilot can support drafts, summaries, analysis and structured thinking; choose based on ecosystem, controls, fit and verification.',
          'Research-capable assistants can accelerate source discovery, but important claims still require direct source checks, dates and context.',
          'Canva and Adobe Express support AI-assisted design; CapCut and similar editors can support short-form video. Use brand templates, rights-aware assets and human approval.',
          'HubSpot or Zoho can provide CRM/automation; Mailchimp or Brevo can support permission-based campaigns. QuickBooks, Xero or Zoho Books are accounting systems; Odoo, Zoho Inventory or an appropriate POS/ERP support inventory. Product fit varies by country, payment, tax and support needs.',
          'Excel/Power BI and comparable spreadsheet/BI tools support structured analysis; AI may help interpret or draft, but owners must validate definitions, source quality and formulas.'
        ],
        scenario: 'A Microsoft 365-based firm may prefer Copilot for integrated documents and meetings; a Google Workspace business may value Gemini integration. A mixed environment may use another assistant. The decision is based on workflow and controls—not a universal ranking.',
        actions: ['Write the task, users, data and required output.', 'Compare three options on fit, controls, integration, total cost, support and export/exit.', 'Check country availability and current pricing directly.', 'Document the selected tool and a fallback.'],
        measures: ['Adoption by intended users', 'Cost per successful output', 'Integration or manual handoff count'],
        warning: 'Tool features, pricing and availability change. Treat examples as a current shortlist, verify official information and keep your decision criteria stable.'
      },
      {
        title: 'Run a Safe AI Pilot and Govern It',
        description: 'Protect customer trust, confidential information and quality while measuring whether the pilot works.',
        objectives: ['Classify data before AI use', 'Design human review and approval', 'Decide whether to scale, revise or stop'],
        principles: [
          'Classify information as public, internal, confidential or restricted. Define which tool/account settings are approved for each class.',
          'Do not submit customer secrets, credentials, payment data, health information, unpublished financials or protected personal data without explicit authority and suitable controls.',
          'Human review must be specific: check facts, numbers, tone, rights, bias, commitments and regulatory implications appropriate to the task.',
          'Keep prompts/templates, approved sources, brand rules and examples versioned so quality does not depend on one person improvising.',
          'Scale only when measured benefit exceeds total cost and residual risk is acceptable. Maintain an exit plan and manual fallback.'
        ],
        scenario: 'A proposal-drafting pilot uses only approved product facts and client requirements, flags all prices and contractual terms for human review, records drafting time, and compares win quality. Customer passwords and raw financial statements are excluded.',
        actions: ['Write an acceptable-use rule for the pilot.', 'Define allowed/prohibited data and the human reviewer.', 'Run a time-limited pilot against baseline measures.', 'Record incidents and choose scale/change/stop.'],
        measures: ['Human-review correction rate', 'Data/security incidents', 'Pilot ROI and user adoption'],
        warning: 'Automation can magnify errors. A small test with clear stop conditions is safer than connecting an unproven workflow to customers or critical records.'
      }
    ],
    quiz: [
      { question: 'What is the best starting point for AI selection?', options: ['A measurable business problem', 'The newest product announcement', 'A desire to remove all human review'], correct: 'A measurable business problem', explanation: 'Problem-first selection makes value and fit testable.' },
      { question: 'Where should official accounting records live?', options: ['A fit-for-purpose accounting system', 'A general chatbot conversation', 'An employee’s memory'], correct: 'A fit-for-purpose accounting system', explanation: 'Systems of record require structure, controls and auditability.' },
      { question: 'A safe AI pilot requires:', options: ['Allowed data, accountable review, baseline and success/stop rules', 'Confidential uploads to any free tool', 'No measurement'], correct: 'Allowed data, accountable review, baseline and success/stop rules', explanation: 'Governance and measurement make the experiment useful and controlled.' }
    ],
    assignmentTitle: 'AI Opportunity & Tool Decision',
    assignmentDescription: 'Complete Workbook Section 8. Quantify one business problem, compare at least three tool categories/options, define data and human-review controls, and design a 30-day pilot with baseline, target and stop rule.'
  },
  {
    title: 'Module 9: Customers, CRM & Repeat Business',
    description: 'Build a disciplined lead-to-loyalty system that improves response, conversion, service recovery, retention and referrals.',
    categoryIds: ['customers', 'marketing'],
    lessons: [
      {
        title: 'Build a Sales Pipeline That Drives Action',
        description: 'Capture every qualified opportunity with an owner, next action and due date.',
        objectives: ['Define pipeline stages', 'Set qualification and exit rules', 'Measure conversion and sales-cycle health'],
        principles: [
          'A CRM is a customer process supported by a tool. Buying software does not create follow-up discipline.',
          'Each opportunity needs contact/organisation, need, value, source, stage, owner, next action and next-action date.',
          'Stages should represent customer progress with entry/exit criteria: new, qualified, discovery, proposal, decision, won/lost is a common starting pattern.',
          'A stale lead has no recent activity or overdue next action. Define when to follow up, recycle or close it.',
          'Lost-sale reasons are management data. Use a controlled list plus notes rather than blaming “price” for everything.'
        ],
        scenario: 'A B2B service business receives leads by phone, email and WhatsApp. A shared CRM captures source, need, owner and next step. Weekly review focuses on overdue actions, high-value decisions and lost reasons—not on reading every note.',
        actions: ['Define five to seven pipeline stages.', 'Write the qualification and exit rule for each.', 'Set response and follow-up service levels.', 'Create a weekly pipeline review.'],
        measures: ['Lead response time', 'Stage conversion rate', 'Sales-cycle length and stale opportunities'],
        warning: 'A pipeline value is not a forecast until probability, timing, customer evidence and delivery capacity are considered.'
      },
      {
        title: 'Retention, Lifetime Value and Ethical Follow-up',
        description: 'Earn repeat business by staying relevant and useful without abusing customer attention.',
        objectives: ['Design post-purchase follow-up', 'Interpret retention and lifetime value', 'Use customer data with consent and purpose'],
        principles: [
          'Retention begins with delivering the original promise. Messages and loyalty offers cannot repair a consistently weak service.',
          'Segment follow-up by purchase, need, timing and permission so communication is relevant rather than repetitive.',
          'A simple customer lifetime value estimate considers contribution per purchase, purchase frequency, retention period and servicing/acquisition cost.',
          'Ask for reviews and referrals after a verified positive outcome, and make the process easy without manufacturing testimony.',
          'Collect only customer data the business can protect and use for a clear purpose; define retention and access rules.'
        ],
        scenario: 'An equipment supplier schedules installation follow-up, maintenance reminders and replenishment alerts based on the customer’s purchase. That is more valuable than sending the same weekly promotion to every contact.',
        actions: ['Map the first 90 days after purchase.', 'Identify one useful follow-up at each stage.', 'Estimate contribution-based customer value.', 'Create consent, preference and unsubscribe handling.'],
        measures: ['Repeat-purchase or renewal rate', 'Customer churn', 'Referral-to-sale conversion'],
        warning: 'Lifetime value is an estimate, not permission to overspend. Use contribution and realistic retention—not revenue and optimistic assumptions.'
      },
      {
        title: 'Customer Experience and Service Recovery',
        description: 'Set expectations, learn from complaints and use recovery to protect trust.',
        objectives: ['Map critical customer moments', 'Create complaint ownership and escalation', 'Turn feedback into corrective action'],
        principles: [
          'Customer experience includes discovery, enquiry, purchase, waiting, delivery, billing, support and exit—not only friendliness during service.',
          'Set clear response, delivery and support expectations before the customer pays. Silence and uncertainty often create more dissatisfaction than delay itself.',
          'Acknowledge quickly, understand impact, propose a fair remedy within authority, confirm completion and record cause.',
          'Separate individual recovery from systemic corrective action. Both are required.',
          'Use a small set of feedback methods: transactional question, complaint codes, interviews and behaviour such as repeat purchase.'
        ],
        scenario: 'A shipment delay is unavoidable, but the seller’s failure to inform customers creates anger. An update schedule, options and documented recovery authority preserve more trust than waiting for customers to complain.',
        actions: ['Map five moments that shape trust.', 'Set response/communication standards.', 'Create a complaint log and remedy limits.', 'Review repeated themes monthly and assign corrective action.'],
        measures: ['Complaint recurrence', 'Resolution time', 'Post-resolution retention or satisfaction'],
        warning: 'A refund can close one complaint without correcting the cause. Track repeated failures by process, supplier or offer.'
      }
    ],
    quiz: [
      { question: 'What must every active opportunity have?', options: ['An owner and dated next action', 'A social follower', 'A guaranteed close'], correct: 'An owner and dated next action', explanation: 'Without ownership and a next step, follow-up is easily lost.' },
      { question: 'CRM success begins with:', options: ['A defined customer and sales process', 'Buying the most expensive software', 'Capturing every possible personal detail'], correct: 'A defined customer and sales process', explanation: 'The tool supports process discipline; it does not create it.' },
      { question: 'Service recovery should include:', options: ['Correction for the customer and learning for the process', 'Argument and silence', 'Discounts without fixing the issue'], correct: 'Correction for the customer and learning for the process', explanation: 'Recovery restores trust and corrective action reduces recurrence.' }
    ],
    assignmentTitle: 'CRM & Repeat-Business System',
    assignmentDescription: 'Complete Workbook Section 9. Define pipeline stages and rules, response/follow-up timing, minimum CRM fields, a 90-day post-purchase journey and one retention or referral experiment.'
  },
  {
    title: 'Module 10: People, Leadership & Delegation',
    description: 'Clarify roles, expand capacity responsibly and build a team or contractor network that can deliver without constant owner intervention.',
    categoryIds: ['people', 'operations'],
    lessons: [
      {
        title: 'Design Roles Around Outcomes',
        description: 'Start with the outputs the business needs rather than job titles copied from larger organisations.',
        objectives: ['Define role purpose and outputs', 'Assign decision rights and backups', 'Prevent gaps and duplicate accountability'],
        principles: [
          'A role exists to produce outcomes. Define purpose, recurring outputs, standards, decisions, measures and key relationships.',
          'One person can hold several roles, but each critical output should have one accountable owner and a backup where continuity matters.',
          'Decision limits clarify what can be approved independently, what needs consultation and what must be escalated.',
          'Contractors still need scope, deliverables, confidentiality, quality, timing and issue-resolution terms.',
          'Review local labour, contractor, safety and statutory obligations with current qualified guidance.'
        ],
        scenario: 'Instead of hiring a vague “assistant,” an owner defines outcomes: respond to enquiries within two hours, maintain booking records, issue confirmations and report overdue deposits. The role can now be trained and measured.',
        actions: ['List the ten most important recurring outputs.', 'Assign accountable owner and backup.', 'Document decision limits.', 'Convert one vague title into an outcome-based role scorecard.'],
        measures: ['Outputs meeting standard', 'Unowned or duplicate work', 'Decisions escalated unnecessarily'],
        warning: 'A detailed task list without authority and priorities can make a role busy but ineffective.'
      },
      {
        title: 'Delegate, Outsource or Automate',
        description: 'Choose the right capacity model using risk, skill, frequency, demand and total cost.',
        objectives: ['Use a retain/delegate/outsource/automate framework', 'Delegate complete outcomes', 'Control contractor and automation risk'],
        principles: [
          'Retain work that is strategic, highly sensitive or requires owner authority; delegate repeatable internal outcomes; outsource specialist or variable work; automate stable rules/tasks.',
          'Delegation includes context, result, standard, authority, resources, deadline, checkpoints and escalation—not step-by-step control forever.',
          'Compare total cost: management time, quality variation, tools, rework, compliance and continuity as well as hourly price.',
          'Avoid automating unstable processes and outsourcing responsibility for customer promises without oversight.',
          'Build capacity in stages tied to demand evidence and cash—not optimism alone.'
        ],
        scenario: 'A small consultancy retains client diagnosis, delegates scheduling and document preparation, outsources specialised design, and automates appointment reminders. Each choice matches risk and capability.',
        actions: ['Classify recurring owner tasks.', 'Choose one task for each feasible capacity option.', 'Write a delegation brief with output and authority.', 'Define vendor/automation review and fallback.'],
        measures: ['Owner time released', 'Delegated output quality', 'Total cost and rework by capacity model'],
        warning: 'Cheap outsourced work can be expensive when briefs are weak, customer data is exposed or the owner must redo the output.'
      },
      {
        title: 'Performance, Coaching and a Healthy Accountability Rhythm',
        description: 'Set clear expectations, review evidence and help people improve without avoiding difficult conversations.',
        objectives: ['Connect role outcomes to KPIs', 'Run useful check-ins and coaching', 'Address persistent underperformance fairly'],
        principles: [
          'Performance standards should be specific, controllable and connected to customer or operating outcomes.',
          'Use a few balanced measures; a single speed target can damage quality, safety or customer care.',
          'Regular one-to-ones cover results, obstacles, priorities, feedback, development and support—not only mistakes.',
          'Coaching asks questions and builds capability; instruction provides direction when knowledge, risk or urgency requires it.',
          'Document expectations, support and outcomes consistently, and obtain current local HR/legal advice for formal employment actions.'
        ],
        scenario: 'A coordinator misses response targets because approvals wait on the owner. Coaching alone cannot fix the system. The owner changes decision limits and the coordinator then owns response performance.',
        actions: ['Choose two to four role measures.', 'Set weekly/monthly check-in agendas.', 'Separate skill, will, resource and process causes.', 'Create a 30-day improvement agreement for one real gap.'],
        measures: ['Role KPI attainment', 'Training action completion', 'Turnover/absence and employee feedback trends'],
        warning: 'Do not hold people accountable for outcomes they lack the authority, tools, information or capacity to influence.'
      }
    ],
    quiz: [
      { question: 'A strong role definition starts with:', options: ['Required outcomes and decision rights', 'A fashionable job title', 'A long list with no priorities'], correct: 'Required outcomes and decision rights', explanation: 'Roles exist to produce outputs with clear accountability.' },
      { question: 'Effective delegation includes:', options: ['Outcome, standard, authority, resources and check-ins', 'No context or follow-up', 'The owner redoing every step'], correct: 'Outcome, standard, authority, resources and check-ins', explanation: 'Complete delegation enables independence with control.' },
      { question: 'Before judging underperformance, check:', options: ['Skill, motivation, resources, authority and process constraints', 'Only personality', 'Only hours present'], correct: 'Skill, motivation, resources, authority and process constraints', explanation: 'Performance problems can be individual or systemic.' }
    ],
    assignmentTitle: 'Roles, Delegation & People Plan',
    assignmentDescription: 'Complete Workbook Section 10. Create an outcome-based responsibility chart, classify owner work as retain/delegate/outsource/automate and design one role scorecard and check-in rhythm.'
  },
  {
    title: 'Module 11: Caribbean Resilience & Risk',
    description: 'Prepare the business to continue or recover through severe weather, power/connectivity loss, cyber incidents, supplier failure and owner unavailability.',
    categoryIds: ['resilience', 'digital_ai'],
    lessons: [
      {
        title: 'Business Impact and Continuity Planning',
        description: 'Prioritise what must recover first and prepare practical actions before disruption.',
        objectives: ['Perform a simple business impact analysis', 'Set recovery priorities', 'Build before/during/after actions'],
        principles: [
          'Identify critical products/services, maximum tolerable downtime, minimum operating level and dependencies on people, premises, power, internet, suppliers, data, payments and transport.',
          'Recovery Time Objective is the target time to restore an activity. Recovery Point Objective is the acceptable data-loss window. Use plain language with small teams but preserve the concepts.',
          'Continuity may use alternate locations, manual records, backup power/connectivity, cross-training, substitute suppliers and staged service restoration.',
          'Prepare trigger points and decision authority for closure, evacuation, remote work, customer updates and reopening.',
          'Plans must be accessible offline, rehearsed and updated after tests, real events or major business changes.'
        ],
        scenario: 'Before hurricane season, a booking business exports the next seven days of schedules and contacts, tests UPS/mobile connectivity, secures equipment, assigns customer communications and defines when operations stop and resume.',
        actions: ['List critical activities and maximum tolerable downtime.', 'Map dependencies and single points of failure.', 'Set recovery sequence and responsible people.', 'Run a tabletop test using a realistic disruption.'],
        measures: ['Recovery objectives met in tests', 'Critical dependencies with alternatives', 'Continuity actions completed before risk season'],
        warning: 'A generic disaster document is not a continuity plan unless it names the business’s actual activities, contacts, resources and decisions.'
      },
      {
        title: 'Cybersecurity and Data Recovery for Small Teams',
        description: 'Apply a minimum practical control set to protect accounts, devices, customer information and business recovery.',
        objectives: ['Prioritise common cyber controls', 'Design tested backups', 'Prepare an incident response sequence'],
        principles: [
          'Use unique passwords with a password manager, multi-factor authentication and separate administrator accounts for important systems.',
          'Apply least privilege: people and integrations receive only the access needed, and access is removed promptly when roles change.',
          'Keep supported software updated, protect endpoints, secure Wi-Fi, verify payment/account-change requests and train against phishing.',
          'Maintain separate protected backups appropriate to the risk and test restoration. A synced deletion or ransomware event can affect ordinary cloud folders.',
          'Incident response covers detect, contain, preserve evidence, communicate, recover and learn, with current provider and authority contacts.'
        ],
        scenario: 'A fraudulent email asks staff to change a supplier bank account. A call-back verification rule using a known number prevents loss. MFA limits account takeover, while tested backups protect recovery if files are encrypted.',
        actions: ['Enable MFA on critical accounts.', 'Review user/admin access.', 'Document backup location, frequency, retention and restore test.', 'Create a one-page incident contact and first-actions card.'],
        measures: ['Critical accounts with MFA', 'High-risk access reviewed', 'Successful restore test and recovery time'],
        warning: 'Do not store recovery codes, password vault exports and primary devices together without protection. A control must survive the event it is meant to address.'
      },
      {
        title: 'Financial, Supplier and Reputation Resilience',
        description: 'Reduce single points of failure and prepare credible communication when normal service cannot continue.',
        objectives: ['Build a risk register', 'Evaluate insurance and emergency liquidity', 'Create stakeholder communication rules'],
        principles: [
          'A useful risk register states event, cause, impact, likelihood, existing controls, owner, next treatment and review date.',
          'Risk treatment options are avoid, reduce, transfer/share or accept with an explicit contingency.',
          'Insurance needs current asset values, covered perils, exclusions, deductibles, business-interruption terms and evidence requirements; obtain qualified advice.',
          'Emergency liquidity can include cash reserve, committed facility, staged purchasing and payment plans. Unarranged borrowing during crisis is uncertain and costly.',
          'Communications should be prompt, factual and consistent: what happened, impact, what customers should do, next update and contact route.'
        ],
        scenario: 'A business relies on one overseas supplier and one specialist employee. It qualifies an alternate supplier, cross-trains an internal backup, holds critical spares and defines customer messages. Risk is reduced through several modest controls.',
        actions: ['Create a top-ten risk register.', 'Identify single points of failure.', 'Review insurance and emergency-cash assumptions.', 'Draft disruption messages and an update schedule.'],
        measures: ['High risks with funded treatments', 'Supplier/role alternatives tested', 'Emergency reserve against essential outflows'],
        warning: 'Risk registers become paperwork when owners and due dates are missing. Review the top risks in the normal management rhythm.'
      }
    ],
    quiz: [
      { question: 'Recovery priority should be based on:', options: ['Business impact, tolerable downtime and dependencies', 'Alphabetical order', 'The easiest task'], correct: 'Business impact, tolerable downtime and dependencies', explanation: 'Business impact analysis directs scarce recovery resources.' },
      { question: 'What proves a backup can support recovery?', options: ['A successful restoration test', 'The backup icon is green', 'A copy on the same device'], correct: 'A successful restoration test', explanation: 'Restore testing validates usable data and recovery time.' },
      { question: 'Risk treatment options include:', options: ['Avoid, reduce, transfer/share or accept', 'Ignore every risk', 'Insure every possible event without review'], correct: 'Avoid, reduce, transfer/share or accept', explanation: 'Explicit treatment aligns response with risk and economics.' }
    ],
    assignmentTitle: 'Business Continuity & Cyber Plan',
    assignmentDescription: 'Complete Workbook Section 11. Identify critical operations and recovery targets, address power/internet/data/supplier/people dependencies, document cyber controls and run a tabletop scenario.'
  },
  {
    title: 'Module 12: Grow Beyond Survival',
    description: 'Prepare for finance and regional growth, choose priorities from evidence and leave with a 12-month Business Advantage Roadmap and dashboard.',
    categoryIds: ['finance', 'customers', 'marketing', 'operations', 'inventory', 'digital_ai', 'people', 'resilience'],
    lessons: [
      {
        title: 'Finance Readiness and the Growth Case',
        description: 'Show why money is needed, what it will change and how the business can sustain the obligation or expected return.',
        objectives: ['Build a use-of-funds case', 'Match financing to need and risk', 'Prepare credible evidence and assumptions'],
        principles: [
          'Finance should solve a defined constraint or fund a tested opportunity. Start with amount, timing, use, expected result and downside.',
          'Short-term working capital, long-lived equipment and uncertain product development have different risk and financing characteristics.',
          'A funder needs current records, owner contribution, realistic forecasts, repayment/return capacity, collateral or risk mitigation as applicable, and transparent assumptions.',
          'Grants still require strategic fit, eligible costs, delivery capacity, evidence and reporting. “Free money” thinking leads to poor projects.',
          'Model the business after financing, including repayments, fees, maintenance, capacity and the delay before benefits arrive.'
        ],
        scenario: 'A company requests XCD 50,000 for equipment. Its case links the asset to verified bookings, capacity increase, pricing, maintenance, cash flow and repayment under a conservative scenario—not merely to ownership of new equipment.',
        actions: ['Define the constraint/opportunity and amount.', 'Build a use-of-funds table and timeline.', 'Model expected and downside cash flow after finance.', 'Assemble evidence and risks.'],
        measures: ['Forecast debt-service or funding coverage', 'Use-of-funds milestone completion', 'Actual benefit versus investment case'],
        warning: 'Do not finance a structurally negative unit economics problem. More volume can magnify losses.'
      },
      {
        title: 'Scale Locally, Digitally or Regionally',
        description: 'Choose a growth pathway that the operating model, cash and customer evidence can support.',
        objectives: ['Compare growth pathways', 'Identify new-market friction', 'Test expansion before full commitment'],
        principles: [
          'Growth paths include deeper penetration, new segment, new offer, new channel, digital delivery, partnership, licensing or geographic expansion. Risk rises when several change at once.',
          'Standardise the core before copying it. If quality depends on the owner at one location, another location multiplies the problem.',
          'Regional expansion requires direct checks of country-specific registration, tax, payments, currency, customs, consumer rules, employment, data and support.',
          'Digital reach does not eliminate fulfilment friction. Payment acceptance, shipping, returns, service hours and trust must work.',
          'Use stage gates: research → small test → repeatable pilot → controlled scale, with explicit stop/continue criteria.'
        ],
        scenario: 'A consultancy first packages a repeatable remote service for one neighbouring market through a local partner. It tests payment, delivery, support and contribution with five clients before committing to a physical office.',
        actions: ['Compare three growth pathways on fit, cash, risk and capability.', 'Choose one test market/segment.', 'List legal, payment, delivery and support checks.', 'Define pilot size, budget and decision gates.'],
        measures: ['Pilot conversion and contribution', 'Delivery quality in new channel/market', 'Cash required to reach repeatability'],
        warning: 'Revenue growth is not successful scale if service quality, working capital, control or owner workload deteriorates faster.'
      },
      {
        title: 'The 12-Month Business Advantage Roadmap',
        description: 'Sequence improvements, assign ownership and use the final diagnostic to turn learning into sustained execution.',
        objectives: ['Prioritise and sequence initiatives', 'Build an executive KPI dashboard', 'Complete final assessment and certification requirements'],
        principles: [
          'Prioritise with impact, urgency, effort, risk and dependency. Survival controls and blockers come before attractive extras.',
          'Limit work in progress. Three completed improvements usually create more value than twelve initiatives that remain half-finished.',
          'Each roadmap item needs outcome, owner, milestone, budget, dependency, KPI and review date.',
          'Retake the diagnostic using present evidence, compare category movement and explain where scores did not improve.',
          'Certification recognises course completion, all required practical assignments and at least 70% on the final scenario exam. It is not professional licensure or a guarantee of business performance.'
        ],
        scenario: 'A business sequences cash control and stock accuracy in Q1, sales/CRM discipline in Q2, an AI-assisted marketing pilot in Q3 and regional market testing in Q4. Each later initiative depends on control built earlier.',
        actions: ['Choose three strategic priorities.', 'Sequence quarterly milestones and dependencies.', 'Assign KPI, owner, budget and review dates.', 'Complete the final diagnostic, exam and improvement review.'],
        measures: ['Roadmap milestones on time', 'Business Advantage Score improvement by category', 'Executive KPI target attainment'],
        warning: 'The roadmap is a living management tool. Revise it when evidence changes, but record why priorities changed rather than quietly abandoning them.'
      }
    ],
    quiz: [
      { question: 'Finance should primarily be tied to:', options: ['A tested opportunity or defined constraint with repayment/return logic', 'Wanting newer equipment', 'A vague growth goal'], correct: 'A tested opportunity or defined constraint with repayment/return logic', explanation: 'Funding needs evidence, purpose, economics and risk treatment.' },
      { question: 'What is a strong expansion approach?', options: ['Small staged test with clear gates', 'Change product, segment and country simultaneously at full scale', 'Assume digital reach removes fulfilment cost'], correct: 'Small staged test with clear gates', explanation: 'Staging isolates risk and creates evidence before larger commitment.' },
      { question: 'Which roadmap is most credible?', options: ['Prioritised outcomes with owners, milestones, budget, dependencies and KPIs', 'A wish list with no dates', 'Every idea started immediately'], correct: 'Prioritised outcomes with owners, milestones, budget, dependencies and KPIs', explanation: 'Clear ownership and sequencing turn learning into execution.' }
    ],
    assignmentTitle: 'Final Business Advantage Plan & 12-Month Roadmap',
    assignmentDescription: 'Complete Workbook Section 12 and export the full Business Advantage Plan. Include three priorities, quarterly milestones, owners, budgets, dependencies, 8–12 KPIs, final diagnostic comparison and the first 30-day review date.'
  }
];

const referenceGuidanceByModule: Record<number, string[]> = {
  1: [
    'Caribbean Development Bank — State of the MSME Sector in CARICOM: https://www.caribank.org/publications-and-resources/resource-library/conference-proceedings/state-msme-sector-caricom-prospects-future'
  ],
  2: [
    'Caribbean Development Bank — MSME digital transformation initiative: https://www.caribank.org/newsroom/news-and-events/caribbean-msmes-benefit-new-cdb-supported-digital-transformation-initiative'
  ],
  4: [
    'Eastern Caribbean Central Bank — Financial Literacy and Financial Inclusion: https://www.eccb-centralbank.org/financial-literacy-and-financial-inclusion'
  ],
  7: [
    'WhatsApp Business — current product options for small and larger businesses: https://www.whatsappbusiness.com/'
  ],
  8: [
    'OpenAI for Business: https://openai.com/business/',
    'Microsoft 365 Copilot for Business: https://www.microsoft.com/en-us/microsoft-365-copilot/business',
    'Google Workspace with Gemini: https://workspace.google.com/solutions/ai/',
    'Canva Magic Studio: https://www.canva.com/magic-studio/'
  ],
  11: [
    'Caribbean Disaster Emergency Management Agency: https://www.cdema.org/'
  ],
  12: [
    'Caribbean Development Bank — MSME resources and regional development guidance: https://www.caribank.org/'
  ]
};

function buildLessonContent(
  moduleNumber: number,
  moduleTitle: string,
  lesson: LessonSeed,
  lessonIndex: number
): string {
  const lines: string[] = [
    `# ${lesson.title}`,
    '',
    lesson.description,
    '',
    '## Why this matters in the Caribbean',
    'Caribbean entrepreneurs often operate with small teams, limited local scale, imported inputs, seasonal demand, high logistics costs and exposure to severe weather or connectivity disruption. The principle in this lesson should therefore be applied with explicit attention to cash, lead time, trust, capacity and recovery—not copied from a large-market example.',
    '',
    '## Learning objectives'
  ];

  lesson.objectives.forEach((item) => lines.push(`- ${item}`));

  lines.push('', '## Core principles');
  lesson.principles.forEach((item) => lines.push(`- ${item}`));

  lines.push('', '## Caribbean business scenario', lesson.scenario, '', '## Implement it in your business');
  lesson.actions.forEach((item, index) => lines.push(`${index + 1}. ${item}`));

  if (lesson.decisionTools?.length) {
    lines.push('', '## Decision tools');
    lesson.decisionTools.forEach((item) => lines.push(`- ${item}`));
  }

  lines.push('', '## Measure whether it works');
  lesson.measures.forEach((item) => lines.push(`- ${item}`));

  lines.push(
    '',
    '## Common mistake to avoid',
    `> ${lesson.warning}`,
    '',
    '## Apply, do not just read',
    `Use the practical assignment and Workbook Section ${moduleNumber} to apply this module to your own idea or operating business. Keep calculations and assumptions visible so they can be reviewed later.`,
    '',
    '## Important boundary',
    'This course provides business education and decision frameworks. It is not country-specific legal, tax, accounting, investment, employment, insurance or regulatory advice. Verify current requirements with the relevant authority or a qualified professional in the country where the business operates.'
  );

  if (lessonIndex === 2 && referenceGuidanceByModule[moduleNumber]?.length) {
    lines.push('', '## Current official guidance and product references');
    referenceGuidanceByModule[moduleNumber].forEach((item) => lines.push(`- ${item}`));
    lines.push('- Product capabilities, prices and country availability change. Verify current official information before making a purchase or implementation decision.');
  }

  lines.push('', `Module context: ${moduleTitle}`);
  return lines.join('\n');
}

function makeQuestion(moduleNumber: number, questionIndex: number, quizId: string, seed: QuizSeed) {
  return {
    id: `ita-q-${moduleNumber}-${questionIndex + 1}`,
    quizId,
    questionText: seed.question,
    questionType: 'multiple_choice',
    options: seed.options,
    correctAnswer: seed.correct,
    explanation: seed.explanation,
    orderNumber: questionIndex + 1
  };
}

export function ensureIdeaToAdvantageCourse(db: any): boolean {
  if (
    !db ||
    !Array.isArray(db.courses) ||
    !Array.isArray(db.modules) ||
    !Array.isArray(db.lessons) ||
    !Array.isArray(db.quizzes) ||
    !Array.isArray(db.assignments) ||
    !Array.isArray(db.publishingLogs)
  ) return false;

  // The migration marker ensures that an administrator can deliberately delete
  // the course later without a restart recreating it. Future curriculum releases
  // should use a new explicit migration rather than silently overwriting edits.
  const migrationId = 'ita-course-seed-log-v1';
  if (db.publishingLogs.some((log: any) => log.id === migrationId)) return false;
  if (db.courses.some((course: any) => course.id === IDEA_TO_ADVANTAGE_COURSE_ID)) return false;

  const createdAt = '2026-09-23T15:00:00.000Z';
  const learningObjectives = [
    'Diagnose business readiness or management maturity using an eight-area Business Advantage Score',
    'Validate demand and select realistic local, tourism, diaspora, business or regional market pathways',
    'Calculate unit economics, pricing, margin, break-even and cash requirements accurately',
    'Build financial, inventory/resource, supplier and operational control systems',
    'Create measurable marketing, CRM, retention and service-recovery processes',
    'Select AI and digital tools by business problem, fit, risk and measurable return',
    'Clarify roles, delegate responsibly and reduce unnecessary owner dependence',
    'Prepare for severe weather, outages, cyber incidents and other Caribbean business risks',
    'Complete a practical Business Advantage Plan and 12-month implementation roadmap'
  ];

  const course = {
    id: IDEA_TO_ADVANTAGE_COURSE_ID,
    slug: 'from-idea-to-advantage',
    title: 'From Idea to Advantage',
    subtitle: 'Practical Business Success for Caribbean Entrepreneurs',
    shortDescription: 'Build a financially controlled, customer-focused, AI-enabled and resilient Caribbean small business through practical systems—not theory alone.',
    fullDescription: 'From Idea to Advantage is a practical improvement programme for Caribbean entrepreneurs who are planning a business or already operating one. It addresses the realities of small markets, imported inputs, cash-flow pressure, tourism and seasonal demand, supplier lead times, platform dependence, small teams, outages and severe weather. Learners begin with a stage-aware Business Advantage Diagnostic, complete 12 implementation modules and a living Business Advantage Workbook, compare their starting and final scores, and pass a scenario-based final examination. AI is treated as a workforce multiplier: the course explains which categories of tools are suitable for specific business tasks, how to compare them and how to control risk, without becoming a tutorial for any single product.',
    category: 'General',
    difficultyLevel: 'Beginner',
    instructor: 'V79 Academy',
    courseVersion: '1.0.0',
    thumbnail: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80',
    estimatedDuration: '36 hours',
    prerequisites: [
      'A business idea or an existing small/medium business to apply the work to',
      'Basic numeracy and access to a spreadsheet or calculator',
      'No prior accounting, marketing or AI training required'
    ],
    learningObjectives,
    learning_objectives: learningObjectives,
    status: 'Published',
    pricingType: 'free',
    price: 0,
    programme: IDEA_TO_ADVANTAGE_PROGRAMME,
    createdAt,
    updatedAt: createdAt
  };

  db.courses.push(course);

  modules.forEach((moduleSeed, moduleIndex) => {
    const moduleNumber = moduleIndex + 1;
    const moduleId = `ita-mod-${moduleNumber}`;

    db.modules.push({
      id: moduleId,
      courseId: IDEA_TO_ADVANTAGE_COURSE_ID,
      title: moduleSeed.title,
      description: moduleSeed.description,
      categoryIds: moduleSeed.categoryIds,
      orderNumber: moduleNumber
    });

    moduleSeed.lessons.forEach((lessonSeed, lessonIndex) => {
      const lessonNumber = lessonIndex + 1;
      const lessonId = `ita-les-${moduleNumber}-${lessonNumber}`;

      db.lessons.push({
        id: lessonId,
        moduleId,
        courseId: IDEA_TO_ADVANTAGE_COURSE_ID,
        title: lessonSeed.title,
        description: lessonSeed.description,
        learningObjectives: lessonSeed.objectives,
        learning_objectives: lessonSeed.objectives,
        estimatedTime: lessonIndex === 2 ? '55 mins' : '45 mins',
        lessonContent: buildLessonContent(moduleNumber, moduleSeed.title, lessonSeed, lessonIndex),
        videoUrl: '',
        audioUrl: '',
        imageUrls: [],
        downloads: [],
        exercisePrompt: lessonSeed.actions.join(' '),
        orderNumber: lessonNumber
      });
    });

    const assessmentLessonId = `ita-les-${moduleNumber}-3`;
    const quizId = `ita-quiz-${moduleNumber}`;
    db.quizzes.push({
      id: quizId,
      lessonId: assessmentLessonId,
      title: `${moduleSeed.title.replace(/^Module \d+:\s*/, '')} Knowledge Check`,
      passingScore: 67,
      questions: moduleSeed.quiz.map((question, index) => makeQuestion(moduleNumber, index, quizId, question))
    });

    db.assignments.push({
      id: `ita-assign-${moduleNumber}`,
      courseId: IDEA_TO_ADVANTAGE_COURSE_ID,
      moduleId,
      lessonId: assessmentLessonId,
      title: moduleSeed.assignmentTitle,
      description: moduleSeed.assignmentDescription,
      maxPoints: 100,
      submissionType: 'text',
      required: true,
      workbookSectionId: `wb-${String(moduleNumber).padStart(2, '0')}`,
      createdAt,
      updatedAt: createdAt
    });
  });

  db.publishingLogs.push({
    id: migrationId,
    courseId: IDEA_TO_ADVANTAGE_COURSE_ID,
    courseTitle: course.title,
    event: 'Course Seeded',
    fromStatus: 'None',
    toStatus: 'Published',
    performedBy: 'Admin',
    timestamp: createdAt,
    details: 'Added the full From Idea to Advantage Caribbean small-business programme with reusable diagnostic, workbook, final examination and certificate rules.'
  });

  return true;
}
