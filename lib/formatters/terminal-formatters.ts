import type { PersonalInfo, Skill, Project, Experience, BlogPost, Education, Certification } from "../data/portfolio"

export function createProgressBar(level: number, length = 20): string {
  // Adjust progress bar length for mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640
  const barLength = isMobile ? 10 : length
  const filled = Math.round((level / 100) * barLength)
  const empty = barLength - filled
  return "█".repeat(filled) + "░".repeat(empty)
}

export function getTerminalWidth(): number {
  if (typeof window === "undefined") return 60
  const width = window.innerWidth
  if (width < 640) return 50 // Mobile
  if (width < 768) return 40 // Tablet
  return 60 // Desktop
}

export function createBox(title: string, content: string[], width?: number): string {
  const terminalWidth = width || getTerminalWidth()
  const innerWidth = terminalWidth - 4

  let output = `┌${"─".repeat(terminalWidth - 2)}┐\n`
  output += `│ ${title.padEnd(innerWidth - 1)} │\n`
  output += `├${"─".repeat(terminalWidth - 2)}┤\n`

  content.forEach((line) => {
    if (line.length <= innerWidth) {
      output += `│ ${line.padEnd(innerWidth - 1)} │\n`
    } else {
      // Break long lines
      const words = line.split(" ")
      let currentLine = ""
      words.forEach((word) => {
        if ((currentLine + word).length <= innerWidth - 1) {
          currentLine += (currentLine ? " " : "") + word
        } else {
          if (currentLine) {
            output += `│ ${currentLine.padEnd(innerWidth - 1)} │\n`
          }
          currentLine = word
        }
      })
      if (currentLine) {
        output += `│ ${currentLine.padEnd(innerWidth - 1)} │\n`
      }
    }
  })

  output += `└${"─".repeat(terminalWidth - 2)}┘\n`
  return output
}

export function formatPersonalInfo(data: PersonalInfo): string {
  const width = getTerminalWidth()
  const isMobile = width < 50

  return `
${isMobile ? "═".repeat(width) : "╔" + "═".repeat(width - 2) + "╗"}
${isMobile ? ` ABOUT ${data.name.toUpperCase()}` : `║${`                   ABOUT ${data.name.toUpperCase()}`.padEnd(width - 2)}║`}
${isMobile ? "═".repeat(width) : "╚" + "═".repeat(width - 2) + "╝"}

👨‍💻 ${data.title} | 🌍 ${data.location} | ☕ Coffee Enthusiast

‎\nOVERVIEW
${"=".repeat(8)}
${data.bio}

‎\nBACKGROUND
${"=".repeat(10)}
• 🎓 Computer Science graduate with a focus on web technologies
• 🚀 Started coding during university, fell in love with the craft
• 🏢 Worked with startups and established companies
• 🌱 Always learning and exploring new technologies

‎\nPHILOSOPHY
${"=".repeat(10)}
"${data.philosophy}"

I believe in:
• Writing clean, maintainable code
• Creating user-centric experiences  
• Continuous learning and improvement
• Collaboration and knowledge sharing

‎\nWHEN I'M NOT CODING
${"=".repeat(19)}
${data.interests.join("\n")}

‎\nWant to know more? Try 'skills', 'experience', or 'projects'!
`
}

export function formatSkills(skills: Skill[]): string {
  const categories = [...new Set(skills.map((skill) => skill.category))]
  const width = getTerminalWidth()
  const isMobile = width < 50

  let output = `
${isMobile ? "═".repeat(width) : "╔" + "═".repeat(width - 2) + "╗"}
${isMobile ? " TECHNICAL SKILLS" : `║${"                    TECHNICAL SKILLS".padEnd(width - 2)}║`}
${isMobile ? "═".repeat(width) : "╚" + "═".repeat(width - 2) + "╝"}

🎯 EXPERTISE: ${createProgressBar(95)} 95%

`

  categories.forEach((category) => {
    const categorySkills = skills.filter((skill) => skill.category === category)
    output += `‎\n${category.toUpperCase()}\n${"=".repeat(category.length)}\n\n`

    categorySkills.forEach((skill) => {
      const skillName = isMobile ? skill.name.substring(0, 15) : skill.name
      const padding = isMobile ? 15 : 25
      output += `  • ${skillName.padEnd(padding)} ${createProgressBar(skill.level)} ${skill.level}%\n`
    })
    output += "\n"
  })

  output += `‎\n~Type 'projects' to see these skills in action!`
  return output
}

export function formatProjects(projects: Project[]): string {
  const featuredProjects = projects.filter((p) => p.featured)
  const otherProjects = projects.filter((p) => !p.featured)
  const width = getTerminalWidth()
  const isMobile = width < 50

  let output = `
${isMobile ? "═".repeat(width) : "╔" + "═".repeat(width - 2) + "╗"}
${isMobile ? " MY PROJECTS" : `║${"                       MY PROJECTS".padEnd(width - 2)}║`}
${isMobile ? "═".repeat(width) : "╚" + "═".repeat(width - 2) + "╝"}

🚀 FEATURED PROJECTS
${"=".repeat(20)}

`

  featuredProjects.forEach((project, index) => {
    if (isMobile) {
      // Mobile-friendly format
      output += `[${index + 1}] ${project.title}
      ${"─".repeat(width)}
      Description: ${project.longDescription}

      Tech Stack: ${project.techStack.join(", ")}

      Features:
      ${project.features.map((f) => `✓ ${f}`).join("\n")}

      ${project?.stats ? `Stats:
      ${Object.entries(project.stats)
            .map(([key, value]) => `${getStatIcon(key)} ${value}`)
            .join("\n")}` : ""}

      Links:
      🔗 ${project.links.github || "N/A"}
      🌐 ${project.links.live || "N/A"}`
    }

    else {
      // Desktop format with boxes
      output += createBox(`[${index + 1}] ${project.title}`, [
        `Description: ${project.longDescription}`,
        "",
        `Tech Stack: ${project.techStack.join(" • ")}`,
        "",
        "Features:",
        ...project.features.map((f) => `✓ ${f}`),
        "",
        ...(project?.stats ?
          ["Stats:",
            ...Object.entries(project.stats).map(([key, value]) => `${getStatIcon(key)} ${value}`)
          ] : []),
        "",
        "Links:",
        `🔗 ${project.links.github || "N/A"}`,
        `🌐 ${project.links.live || "N/A"}`,
      ])
      output += "\n"
    }
  })

  if (otherProjects.length > 0) {
    output += `💡 OTHER NOTABLE PROJECTS
${"=".repeat(26)}

`
    otherProjects.forEach((project) => {
      if (isMobile) {
        output += `${project.title}
${project.longDescription}
Tech: ${project.techStack.join(", ")}
Link: ${project.links.live || project.links.github || "N/A"}

`
      } else {
        output += createBox(project.title, [
          project.longDescription,
          `Tech: ${project.techStack.join(", ")}`,
          `Link: ${project.links.live || project.links.github || "N/A"}`,
        ])
        output += "\n"
      }
    })
  }

  output += `📈 PROJECT PORTFOLIO SUMMARY
${"=".repeat(29)}
Total Projects Completed: ${projects.length}+
Total Lines of Code: 500,000+
GitHub Stars Earned: 1,200+
Active Contributors: 15+
Combined User Base: 50,000+

🏆 RECOGNITION & ACHIEVEMENTS
${"=".repeat(29)}
• Featured on Product Hunt (3 projects)
• GitHub trending repositories (2 projects)
• Dev.to featured articles about projects
• Conference presentations on architecture
• Open source contributions to major projects

Want to collaborate on something amazing?
Type 'contact' to get in touch! 🚀
`

  return output
}

export function formatExperience(
  experiences: Experience[],
  education: Education[],
  certifications: Certification[],
): string {
  const width = getTerminalWidth()
  const isMobile = width < 50

  let output = `
${isMobile ? "═".repeat(width) : "╔" + "═".repeat(width - 2) + "╗"}
${isMobile ? " WORK EXPERIENCE" : `║${"                   WORK EXPERIENCE".padEnd(width - 2)}║`}
${isMobile ? "═".repeat(width) : "╚" + "═".repeat(width - 2) + "╝"}

💼 PROFESSIONAL JOURNEY
${"=".repeat(23)}

`

  experiences.forEach((exp) => {
    output += `‎\n[${exp.period}] 🏢 ${exp.title.toUpperCase()}
${exp.company} | ${exp.location}
├── ${exp.description}
├── Technologies: ${exp.technologies.join(", ")}
├── Achievements:
${exp.achievements.map((achievement) => `│   ├── 🎯 ${achievement}`).join("\n")}

`
  })

  output += `‎\n🎓 EDUCATION
${"=".repeat(12)}
${education
  .map(
    (entry) => `‎\n[${entry.period}] ${entry.degree}
${entry.institution}
├── Relevant Coursework: ${entry.coursework.join(", ")}
├── GPA: ${entry.gpa}
├── Activities: ${entry.activities.join(", ")}
└── Thesis: "${entry.thesis}"`,
  )
  .join("\n")}

‎\n🏆 CERTIFICATIONS & ACHIEVEMENTS
${"=".repeat(32)}‎\n
${certifications.map((cert) => `• ${cert.name} (${cert.year})`).join("\n")}
• Hackathon Winner - SF TechCrunch Disrupt (2021)
• Open Source Contributor - 50+ repositories
• Speaker at 3 tech conferences

‎\n📊 IMPACT METRICS
${"=".repeat(17)}‎\n
Projects Delivered: 50+
Team Members Mentored: 15+
Code Reviews Conducted: 500+
Bug Fix Rate: 95%
Client Satisfaction: 4.9/5

Type 'contact' to discuss opportunities!
`

  return output
}

export function formatBlog(posts: BlogPost[]): string {
  const featuredPost = posts.find((p) => p.featured)
  const otherPosts = posts.filter((p) => !p.featured)
  const width = getTerminalWidth()
  const isMobile = width < 50

  let output = `
${isMobile ? "═".repeat(width) : "╔" + "═".repeat(width - 2) + "╗"}
${isMobile ? " LATEST BLOG POSTS" : `║${"                   LATEST BLOG POSTS".padEnd(width - 2)}║`}
${isMobile ? "═".repeat(width) : "╚" + "═".repeat(width - 2) + "╝"}

📝 RECENT ARTICLES
${"=".repeat(18)}`

  if (featuredPost) {
    output += `‎\n[📌 FEATURED] ${featuredPost.title}
├── Published: ${new Date(featuredPost.publishDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
├── Read time: ${featuredPost.readTime}
├── Tags: ${featuredPost.tags.join(", ")}
├── Summary: ${featuredPost.excerpt}
└── URL: https://thedevpiyush.com/blog/${featuredPost.id}
‎\n`}

  otherPosts.forEach((post) => {
    const badge = post.trending ? "🔥 TRENDING" : post.popular ? "💡 POPULAR" : "📝 ARTICLE"
    output += `[${badge}] ${post.title}
├── Published: ${new Date(post.publishDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
├── Read time: ${post.readTime}
├── Tags: ${post.tags.join(", ")}
├── Summary: ${post.excerpt}
└── URL: https://thedevpiyush.com/blog/${post.id}
‎\n`
  })


  return output
}

export function formatContact(personal: PersonalInfo): string {
  const width = getTerminalWidth()
  const isMobile = width < 50

  return `
${isMobile ? "═".repeat(width) : "╔" + "═".repeat(width - 2) + "╗"}
${isMobile ? " CONTACT INFORMATION" : `║${"                   CONTACT INFORMATION".padEnd(width - 2)}║`}
${isMobile ? "═".repeat(width) : "╚" + "═".repeat(width - 2) + "╝"}

📧 LET'S CONNECT!
${"=".repeat(17)}

‎\nPRIMARY CONTACT
${"=".repeat(15)}
📧 Email: ${personal.email}
   └── Best for: Project inquiries, collaborations
   └── Response time: Within 24 hours

📱 Phone: ${personal.phone}
   └── Best for: Urgent matters, quick calls
   └── Available: Mon-Fri, 9AM-6PM PST

📍 Location: ${personal.location}
   └── Open to: Remote work worldwide, local meetups

‎\nPROFESSIONAL NETWORKS
${"=".repeat(21)}
💼 LinkedIn: ${personal.social.linkedin}
   └── Connect for: Professional networking

🐙 GitHub: ${personal.social.github}
   └── Check out: My open source projects

🐦 Twitter: ${personal.social.twitter}
   └── Follow for: Tech insights, development tips

💬 Discord: ${personal.social.discord}
   └── Chat about: Tech discussions, gaming

‎\nReady to start something amazing together? 
Drop me a line at ${personal.email}! 🚀
`}

function getStatIcon(key: string): string {
  const icons: { [key: string]: string } = {
    users: "👥",
    uptime: "⚡",
    transactions: "💰",
    mobile: "📱",
    teams: "🏢",
    projects: "📊",
    messages: "💬",
    productivity: "📈",
    content: "📝",
    satisfaction: "🎯",
    speed: "⚡",
  }
  return icons[key] || "📊"
}
