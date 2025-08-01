import { getPortfolioData as getPortfolioDataFromSupabase } from "../supabase/queries"
import type { PortfolioData } from "../supabase/types"

export async function getPortfolioDataCached(): Promise<PortfolioData | null> {
  // Add cache control to prevent aggressive caching
  const data = await getPortfolioDataFromSupabase()

  // Force fresh data by adding a small delay (helps with Vercel caching)
  await new Promise(resolve => setTimeout(resolve, 100))

  return data
}

// Transform database data to match the existing interface
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
    education: {
      degree: data.education.degree,
      institution: data.education.institution,
      period: formatPeriod(data.education.start_date, data.education.end_date),
      gpa: data.education.gpa,
      coursework: data.education.coursework,
      activities: data.education.activities,
      thesis: data.education.thesis,
    },
    certifications: data.certifications.map((cert) => ({
      name: cert.name,
      issuer: cert.issuer,
      year: new Date(cert.issue_date).getFullYear().toString(),
      url: cert.credential_url,
    })),
    blog: data.blog.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      publishDate: post.publish_date,
      readTime: post.read_time,
      tags: post.tags,
      url: post.url || post.id,
      image_url: post.image_url,
      featured: post.is_featured,
      trending: post.is_trending,
      popular: post.is_popular,
    })),
    stats: data.stats,
  }
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
