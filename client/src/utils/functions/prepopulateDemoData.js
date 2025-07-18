import { apiFetch } from "../apiFetch";

const URL = import.meta.env.VITE_API_URL;

const demoSections = [
  {
    title: "Onboarding Docs",
    items: [
      {
        content: "Health Policy",
        link: "https://company.com/health-policy",
        notes: "Details about company health insurance and wellness benefits.",
      },
      {
        content: "Vacation Policy",
        link: "https://company.com/vacation-policy",
        notes: "Information about paid time off and holidays.",
      },
      {
        content: "IT Setup Guide",
        link: "https://company.com/it-setup",
        notes: "Instructions for setting up your work devices and accounts.",
      },
      {
        content: "Welcome Letter",
        link: "https://company.com/welcome",
        notes: "A welcome message from the CEO.",
      },
      {
        content: "Payroll Setup",
        link: "https://company.com/payroll-setup",
        notes: "How to set up your payroll account.",
      },
      {
        content: "Company Directory",
        link: "https://company.com/directory",
        notes: "Find contact info for all employees.",
      },
      {
        content: "Parking Info",
        link: "https://company.com/parking",
        notes: "Where to park at the office.",
      },
      {
        content: "Office Map",
        link: "https://company.com/office-map",
        notes: "Map of the office layout.",
      },
      {
        content: "Dress Code",
        link: "https://company.com/dress-code",
        notes: "Guidelines for workplace attire.",
      },
    ],
  },
  {
    title: "Engineering Resources",
    items: [
      {
        content: "API Reference",
        link: "https://company.com/api-docs",
        notes: "Comprehensive REST API documentation for all backend services.",
      },
      {
        content: "Code Standards",
        link: "https://company.com/code-standards",
        notes: "Best practices and style guide for software development.",
      },
      {
        content: "Dev Tools",
        link: "https://company.com/dev-tools",
        notes: "Recommended tools and extensions for engineering productivity.",
      },
      {
        content: "Release Notes",
        link: "https://company.com/releases",
        notes: "Latest product release information.",
      },
      {
        content: "Architecture Diagrams",
        link: "https://company.com/architecture",
        notes: "System architecture overview.",
      },
      {
        content: "Incident Response",
        link: "https://company.com/incidents",
        notes: "How to report and handle incidents.",
      },
      {
        content: "Code Review Process",
        link: "https://company.com/code-review",
        notes: "Steps for submitting code for review.",
      },
      {
        content: "Dev Environment Setup",
        link: "https://company.com/dev-env",
        notes: "Setting up your local development environment.",
      },
    ],
  },
  {
    title: "HR Forms",
    items: [
      {
        content: "Tax Form",
        link: "https://company.com/tax-form",
        notes: "W-4 and other tax documents required for payroll.",
      },
      {
        content: "Direct Deposit",
        link: "https://company.com/direct-deposit",
        notes: "Set up your payroll direct deposit information.",
      },
      {
        content: "Emergency Contact",
        link: "https://company.com/emergency-contact",
        notes: "Provide emergency contact details for HR records.",
      },
      {
        content: "Benefits Enrollment",
        link: "https://company.com/benefits",
        notes: "Sign up for health, dental, and vision benefits.",
      },
      {
        content: "Leave Request",
        link: "https://company.com/leave-request",
        notes: "Submit a request for leave.",
      },
      {
        content: "Performance Review",
        link: "https://company.com/performance-review",
        notes: "Annual performance review forms.",
      },
      {
        content: "401k Enrollment",
        link: "https://company.com/401k",
        notes: "Sign up for retirement savings plan.",
      },
      {
        content: "Tuition Reimbursement",
        link: "https://company.com/tuition",
        notes: "Apply for tuition reimbursement.",
      },
    ],
  },
  {
    title: "Team Contacts",
    items: [
      {
        content: "Manager",
        link: "mailto:manager@company.com",
        notes: "Your direct manager's contact information.",
      },
      {
        content: "IT Support",
        link: "mailto:it-support@company.com",
        notes: "Contact IT for technical issues and troubleshooting.",
      },
      {
        content: "HR Rep",
        link: "mailto:hr@company.com",
        notes: "Contact HR for benefits, policies, and forms.",
      },
      {
        content: "Facilities",
        link: "mailto:facilities@company.com",
        notes: "Contact for office maintenance and supplies.",
      },
      {
        content: "Legal",
        link: "mailto:legal@company.com",
        notes: "Contact for legal questions or concerns.",
      },
      {
        content: "Payroll",
        link: "mailto:payroll@company.com",
        notes: "Contact for payroll issues.",
      },
      {
        content: "Security",
        link: "mailto:security@company.com",
        notes: "Contact for security concerns.",
      },
      {
        content: "Reception",
        link: "mailto:reception@company.com",
        notes: "General office inquiries.",
      },
    ],
  },
  {
    title: "Company Policies",
    items: [
      {
        content: "Code of Conduct",
        link: "https://company.com/conduct",
        notes: "Expected behavior and ethics for all employees.",
      },
      {
        content: "Remote Work",
        link: "https://company.com/remote-work",
        notes: "Guidelines and expectations for working remotely.",
      },
      {
        content: "Expense Policy",
        link: "https://company.com/expense-policy",
        notes: "Rules for submitting and reimbursing business expenses.",
      },
      {
        content: "Travel Policy",
        link: "https://company.com/travel-policy",
        notes: "Procedures for booking and reporting business travel.",
      },
      {
        content: "Social Media Policy",
        link: "https://company.com/social-media",
        notes: "Guidelines for representing the company online.",
      },
      {
        content: "Privacy Policy",
        link: "https://company.com/privacy",
        notes: "How we handle employee and customer data.",
      },
      {
        content: "Harassment Policy",
        link: "https://company.com/harassment",
        notes: "Zero tolerance for workplace harassment.",
      },
      {
        content: "Attendance Policy",
        link: "https://company.com/attendance",
        notes: "Rules for attendance and punctuality.",
      },
    ],
  },
  {
    title: "Facilities & Office Info",
    items: [
      {
        content: "Office Hours",
        link: "https://company.com/office-hours",
        notes: "Standard office operating hours.",
      },
      {
        content: "Mail Room",
        link: "https://company.com/mail-room",
        notes: "How to send and receive mail.",
      },
      {
        content: "Conference Rooms",
        link: "https://company.com/conference-rooms",
        notes: "Booking and usage policies.",
      },
      {
        content: "Kitchen Rules",
        link: "https://company.com/kitchen",
        notes: "Guidelines for shared kitchen use.",
      },
      {
        content: "Visitor Policy",
        link: "https://company.com/visitor-policy",
        notes: "Bringing guests to the office.",
      },
      {
        content: "Cleaning Schedule",
        link: "https://company.com/cleaning",
        notes: "Office cleaning times and contacts.",
      },
      {
        content: "Lost & Found",
        link: "https://company.com/lost-found",
        notes: "Report or claim lost items.",
      },
      {
        content: "Building Access",
        link: "https://company.com/access",
        notes: "How to access the building after hours.",
      },
    ],
  },
  {
    title: "Learning & Development",
    items: [
      {
        content: "Training Portal",
        link: "https://company.com/training",
        notes: "Access online training modules.",
      },
      {
        content: "Mentorship Program",
        link: "https://company.com/mentorship",
        notes: "Sign up for a mentor.",
      },
      {
        content: "Skill Workshops",
        link: "https://company.com/workshops",
        notes: "Upcoming workshops and events.",
      },
      {
        content: "Certification Reimbursement",
        link: "https://company.com/certification",
        notes: "Get reimbursed for professional certifications.",
      },
      {
        content: "Book Club",
        link: "https://company.com/book-club",
        notes: "Join the company book club.",
      },
      {
        content: "Conference Attendance",
        link: "https://company.com/conferences",
        notes: "Apply to attend industry conferences.",
      },
      {
        content: "Career Pathways",
        link: "https://company.com/careers",
        notes: "Explore career growth opportunities.",
      },
      {
        content: "Learning Budget",
        link: "https://company.com/learning-budget",
        notes: "Request funds for learning resources.",
      },
    ],
  },
  {
    title: "Security & Compliance",
    items: [
      {
        content: "Password Policy",
        link: "https://company.com/password-policy",
        notes: "Requirements for secure passwords.",
      },
      {
        content: "Phishing Awareness",
        link: "https://company.com/phishing",
        notes: "How to spot and report phishing attempts.",
      },
      {
        content: "Data Protection",
        link: "https://company.com/data-protection",
        notes: "How we protect sensitive data.",
      },
      {
        content: "Device Encryption",
        link: "https://company.com/encryption",
        notes: "Encrypting work devices.",
      },
      {
        content: "Incident Reporting",
        link: "https://company.com/report-incident",
        notes: "Report security incidents.",
      },
      {
        content: "Compliance Training",
        link: "https://company.com/compliance-training",
        notes: "Required compliance courses.",
      },
      {
        content: "Access Control",
        link: "https://company.com/access-control",
        notes: "Who can access what systems.",
      },
      {
        content: "Physical Security",
        link: "https://company.com/physical-security",
        notes: "Office security measures.",
      },
    ],
  },
];

export async function prepopulateDemoData({
  username,
  getAccessTokenSilently,
}) {
  for (const sectionData of demoSections) {
    const section = await apiFetch({
      endpoint: `${URL}/api/sections/${username}`,
      method: "POST",
      body: { title: sectionData.title, username },
      getAccessTokenSilently,
    });
    const sectionId = section.id || section._id;

    for (const item of sectionData.items) {
      await apiFetch({
        endpoint: `${URL}/api/items/${sectionId}/items/${username}`,
        method: "POST",
        body: {
          content: item.content,
          link: item.link,
          notes: item.notes,
          sectionId,
          username,
        },
        getAccessTokenSilently,
      });
    }
  }
}
