import type { PortfolioData } from "../supabase/types"
import { toBlogPost } from "../blog/post"

// Pure DB-row → view-model mapping, shared by server pages and the terminal (client).
export function transformPortfolioData(data: PortfolioData) {
  return {
    personal: {
      name: data.personal.name,
      title: data.personal.title,
      location: data.personal.location,
      email: data.personal.email,
      phone: data.personal.phone,
      working_at: data.personal.working_at,
      bio: data.personal.bio,
      about_me: data.personal.about_me,
      philosophy: data.personal.philosophy,
      story: (data.personal.story ?? "")
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
      image: data.personal.image,
      interests: data.interests.map((interest) =>
        interest.emoji ? `${interest.emoji} ${interest.interest}` : interest.interest,
      ),
      social: {
        github: data.personal.github_url,
        linkedin: data.personal.linkedin_url,
        twitter: data.personal.twitter_url,
        discord: data.personal.discord_handle,
      },
    },
    skills: data.skills.map((skill) => ({
      name: skill.name,
      level: skill.level,
      category: skill.category,
      display_order:skill.display_order
    })),
    projects: data.projects.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      image_url: project.image_url,
      longDescription: project.long_description,
      techStack: project.tech_stack,
      features: project.features,
      stats: project.stats,
      links: {
        github: project.github_url,
        live: project.live_url,
        demo: project.demo_url,
      },
      featured: project.is_featured,
      is_sellable: project.is_sellable,
      price_inr: project.price_inr,
      setup_guide_file_path: project.setup_guide_file_path,
      screenshot_urls: project.screenshot_urls,
      category: project.category,
    })),
    experience: data.experience.map((exp) => ({
      id: exp.id,
      title: exp.title,
      company: exp.company,
      location: exp.location,
      period: formatPeriod(exp.start_date, exp.end_date, exp.is_current),
      description: exp.description,
      technologies: exp.technologies,
      achievements: exp.achievements,
    })),
    education: data.education.map((entry) => ({
      id: entry.id,
      degree: entry.degree,
      institution: entry.institution,
      period: formatPeriod(entry.start_date, entry.end_date),
      gpa: entry.gpa,
      coursework: entry.coursework ?? [],
      activities: entry.activities ?? [],
      thesis: entry.thesis,
    })),
    certifications: data.certifications.map((cert) => ({
      name: cert.name,
      issuer: cert.issuer,
      year: new Date(cert.issue_date).getFullYear().toString(),
      url: cert.credential_url,
    })),
    blog: data.blog.map(toBlogPost),
    settings: data.settings,
    stats: Object.fromEntries(data.stats.map((stat) => [stat.stat_key, stat.stat_value])) as Record<string, string>,
    statList: data.stats.map((stat) => ({
      key: stat.stat_key,
      value: stat.stat_value,
      label: stat.display_name || humanize(stat.stat_key),
    })),
  }
}

// "linesOfCode" -> "Lines of code"
function humanize(key: string) {
  const words = key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").toLowerCase()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function formatPeriod(startDate: string, endDate?: string, isCurrent?: boolean): string {
  const start = new Date(startDate);
  const startYear = start.getFullYear();
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });

  if (isCurrent || !endDate) {
    return `${startMonth} ${startYear} - Present`;
  }

  const end = new Date(endDate);
  const endYear = end.getFullYear();
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' }); 

  return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
}
