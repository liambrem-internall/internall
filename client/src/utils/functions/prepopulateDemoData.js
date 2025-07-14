import { apiFetch } from "../apiFetch";

const URL = import.meta.env.VITE_API_URL;

const demoSections = [
  {
    title: "Onboarding Docs",
    items: [
      { content: "Health Policy", link: "https://company.com/health-policy", notes: "Details about company health insurance and wellness benefits." },
      { content: "Vacation Policy", link: "https://company.com/vacation-policy", notes: "Information about paid time off and holidays." },
      { content: "IT Setup Guide", link: "https://company.com/it-setup", notes: "Instructions for setting up your work devices and accounts." },
      { content: "Welcome Letter", link: "https://company.com/welcome", notes: "A welcome message from the CEO." }
    ]
  },
  {
    title: "Engineering Resources",
    items: [
      { content: "API Reference", link: "https://company.com/api-docs", notes: "Comprehensive REST API documentation for all backend services." },
      { content: "Code Standards", link: "https://company.com/code-standards", notes: "Best practices and style guide for software development." },
      { content: "Dev Tools", link: "https://company.com/dev-tools", notes: "Recommended tools and extensions for engineering productivity." }
    ]
  },
  {
    title: "HR Forms",
    items: [
      { content: "Tax Form", link: "https://company.com/tax-form", notes: "W-4 and other tax documents required for payroll." },
      { content: "Direct Deposit", link: "https://company.com/direct-deposit", notes: "Set up your payroll direct deposit information." },
      { content: "Emergency Contact", link: "https://company.com/emergency-contact", notes: "Provide emergency contact details for HR records." },
      { content: "Benefits Enrollment", link: "https://company.com/benefits", notes: "Sign up for health, dental, and vision benefits." }
    ]
  },
  {
    title: "Team Contacts",
    items: [
      { content: "Manager", link: "mailto:manager@company.com", notes: "Your direct manager's contact information." },
      { content: "IT Support", link: "mailto:it-support@company.com", notes: "Contact IT for technical issues and troubleshooting." },
      { content: "HR Rep", link: "mailto:hr@company.com", notes: "Contact HR for benefits, policies, and forms." }
    ]
  },
  {
    title: "Company Policies",
    items: [
      { content: "Code of Conduct", link: "https://company.com/conduct", notes: "Expected behavior and ethics for all employees." },
      { content: "Remote Work", link: "https://company.com/remote-work", notes: "Guidelines and expectations for working remotely." },
      { content: "Expense Policy", link: "https://company.com/expense-policy", notes: "Rules for submitting and reimbursing business expenses." },
      { content: "Travel Policy", link: "https://company.com/travel-policy", notes: "Procedures for booking and reporting business travel." }
    ]
  }
];

export async function prepopulateDemoData({ username, getAccessTokenSilently }) {
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