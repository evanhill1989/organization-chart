// Category templates for quick setup

export interface CategoryTemplate {
  name: string;
  description: string;
  color: string;
}

export interface TemplateSet {
  name: string;
  description: string;
  categories: CategoryTemplate[];
}

// Predefined category templates
export const CATEGORY_TEMPLATES: TemplateSet[] = [
  {
    name: "Default",
    description: "Balanced mix for personal task management",
    categories: [
      {
        name: "Household",
        description: "Home maintenance, chores, and household tasks",
        color: "#10B981", // Green
      },
      {
        name: "Finances",
        description: "Financial planning, budgeting, and money management",
        color: "#3B82F6", // Blue
      },
      {
        name: "Job",
        description: "Work-related tasks and career development",
        color: "#8B5CF6", // Purple
      },
      {
        name: "Social",
        description: "Social events, relationships, and networking",
        color: "#EC4899", // Pink
      },
      {
        name: "Personal",
        description: "Personal goals, hobbies, and self-improvement",
        color: "#06B6D4", // Cyan
      },
      {
        name: "Health",
        description: "Health, fitness, and wellness activities",
        color: "#F59E0B", // Amber
      },
      {
        name: "Misc",
        description: "Miscellaneous and uncategorized tasks",
        color: "#6B7280", // Gray
      },
    ],
  },
  {
    name: "Work-Focused",
    description: "Optimized for professional task management",
    categories: [
      {
        name: "Projects",
        description: "Active project work and deliverables",
        color: "#3B82F6", // Blue
      },
      {
        name: "Meetings",
        description: "Scheduled meetings and calls",
        color: "#8B5CF6", // Purple
      },
      {
        name: "Planning",
        description: "Strategy, planning, and roadmapping",
        color: "#06B6D4", // Cyan
      },
      {
        name: "Admin",
        description: "Administrative tasks and paperwork",
        color: "#6B7280", // Gray
      },
      {
        name: "Learning",
        description: "Professional development and training",
        color: "#F59E0B", // Amber
      },
      {
        name: "Personal",
        description: "Personal tasks and errands",
        color: "#10B981", // Green
      },
    ],
  },
  {
    name: "Student Life",
    description: "Designed for academic and student needs",
    categories: [
      {
        name: "Classes",
        description: "Course work, lectures, and assignments",
        color: "#3B82F6", // Blue
      },
      {
        name: "Study",
        description: "Study sessions and exam preparation",
        color: "#8B5CF6", // Purple
      },
      {
        name: "Projects",
        description: "Group projects and presentations",
        color: "#06B6D4", // Cyan
      },
      {
        name: "Extracurricular",
        description: "Clubs, sports, and activities",
        color: "#EC4899", // Pink
      },
      {
        name: "Personal",
        description: "Personal tasks and self-care",
        color: "#10B981", // Green
      },
      {
        name: "Social",
        description: "Social events and friendships",
        color: "#F59E0B", // Amber
      },
    ],
  },
  {
    name: "Family-Focused",
    description: "For managing family and household responsibilities",
    categories: [
      {
        name: "Kids",
        description: "Children's activities, school, and care",
        color: "#EC4899", // Pink
      },
      {
        name: "Home",
        description: "Home maintenance and household chores",
        color: "#10B981", // Green
      },
      {
        name: "Shopping",
        description: "Groceries, supplies, and errands",
        color: "#F59E0B", // Amber
      },
      {
        name: "Finances",
        description: "Bills, budgeting, and financial planning",
        color: "#3B82F6", // Blue
      },
      {
        name: "Health",
        description: "Medical appointments and health tasks",
        color: "#EF4444", // Red
      },
      {
        name: "Personal",
        description: "Personal time and self-care",
        color: "#8B5CF6", // Purple
      },
      {
        name: "Social",
        description: "Family events and social activities",
        color: "#06B6D4", // Cyan
      },
    ],
  },
  {
    name: "Minimal",
    description: "Simple setup with just the essentials",
    categories: [
      {
        name: "Work",
        description: "Work and professional tasks",
        color: "#3B82F6", // Blue
      },
      {
        name: "Personal",
        description: "Personal tasks and goals",
        color: "#10B981", // Green
      },
      {
        name: "Other",
        description: "Everything else",
        color: "#6B7280", // Gray
      },
    ],
  },
];
