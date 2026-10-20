import {
  formatPersonalInfo,
  formatSkills,
  formatProjects,
  formatExperience,
  formatBlog,
  formatContact,
} from "./formatters/terminal-formatters"
import { getPortfolioDataClient as getPortfolioData } from "./data/portfolio-client"

export interface Command {
  name: string
  description: string
  aliases?: string[]
  execute: () => Promise<string> | string
}

export const commands: Command[] = [


  {
    name: "help",
    description: "Show available commands",
    aliases: ["h", "?"],
    execute: () => `
Available Commands:
==================

‎\n📋 COMMANDS

  help, h                 - Show this help message
  about, bio              - Learn about me
  skills, tech            - View my technical skills
  projects, work          - See my projects and work
  experience, exp         - View my work experience
  contact, reach          - Get my contact information
  blog, articles          - Read my latest blog posts
  open-ui, ui             - Open portfolio in UI mode
  clear                   - Clear the terminal

‎\n💡 TIPS
  - Type 'open-ui' to open the portfolio in UI mode
  - Use Tab for autocomplete
  - Use ↑↓ arrows for command history
  - Commands are case-insensitive

‎\nTry typing 'about' to get started!`,
  },

  {
    name: "open-ui",
    description: "Open portfolio in UI mode",
    aliases: ["ui", "gui", "web"],
    execute: () => {
      return `🚀 Opening UI Mode...`
    },
  },

  {
    name: "about",
    description: "Learn about Alex Chen",
    aliases: ["bio", "info"],
    execute: async () => {
      const state = await getPortfolioData()
      if (!state.data) {
        return "Error: Could not load portfolio data"
      }
      return formatPersonalInfo(state.data.personal)
    },
  },

  {
    name: "skills",
    description: "View technical skills and technologies",
    aliases: ["tech", "technologies"],
    execute: async () => {
      const state = await getPortfolioData()
      if (!state.data) {
        return "Error: Could not load portfolio data"
      }
      return formatSkills(state.data.skills)
    },
  },

  {
    name: "projects",
    description: "View portfolio projects",
    aliases: ["work", "portfolio"],
    execute: async () => {
      const state = await getPortfolioData()
      if (!state.data) {
        return "Error: Could not load portfolio data"
      }
      return formatProjects(state.data.projects)
    },
  },

  {
    name: "experience",
    description: "View work experience",
    aliases: ["exp", "work-history", "career"],
    execute: async () => {
      const state = await getPortfolioData()
      if (!state.data) {
        return "Error: Could not load portfolio data"
      }
      return formatExperience(state.data.experience, state.data.education, state.data.certifications)
    },
  },

  {
    name: "contact",
    description: "Get contact information",
    aliases: ["reach", "connect", "hire"],
    execute: async () => {
      const state = await getPortfolioData()
      if (!state.data) {
        return "Error: Could not load portfolio data"
      }
      return formatContact(state.data.personal)
    },
  },

  {
    name: "blog",
    description: "Read latest blog posts",
    aliases: ["articles", "posts", "writing"],
    execute: async () => {
      const state = await getPortfolioData()
      if (!state.data) {
        return "Error: Could not load portfolio data"
      }
      return formatBlog(state.data.blog)
    },
  },

  {
    name: "clear",
    description: "Clear the terminal",
    aliases: ["cls", "clr"],
    execute: () => {
      return `Clearing terminal...`
    },
  },
  {
    name: "exit",
    description: "Exit the terminal",
    aliases: ["quit", "q"],
    execute: () => {
      return `Exiting terminal...`
    },
  },
  {
    name: "admin-signin",
    description: "Sign in to the admin panel",
    aliases: ["admin-login", "admin-signin"],
    execute: () => {
      return `Signing in...`
    },
  },
  {
    name: "admin-signout",
    description: "Sign out of the admin panel",
    aliases: ["admin-logout", "admin-signout"],
    execute: () => {
      return `Signing out...`
    },
  },
  {
    name: "admin-postblog",
    description: "Post blogs to the admin panel",
    aliases: ["admin-post-blog", "admin-postblog"],
    execute: () => {
      return `Posting blogs...`
    },
  },
]
