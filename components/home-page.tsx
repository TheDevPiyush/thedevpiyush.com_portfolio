import Image from "next/image"
import { ArrowRight, ExternalLink, Github, Mail, MapPin, Calendar, Coffee, Star, Download, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import CodeBlock3D from "./code-block-3d"

interface HomePageProps {
  data: {
    personal: {
      name: string
      title: string
      location: string
      email: string
      phone: string
      bio: string
      philosophy: string
      interests: string[]
      working_at: string
      image: string
      social: {
        github: string
        linkedin: string
        twitter: string
        discord: string
      }
    }
    skills: Array<{
      name: string
      level: number
      category: string
      display_order: number
    }>
    projects: Array<{
      id: string
      title: string
      description: string
      longDescription: string
      techStack: string[]
      image_url: string
      features: string[]
      stats: {
        [key: string]: string
      }
      links: {
        github?: string
        live?: string
        demo?: string
      }
      featured: boolean
      category: string
    }>
    experience: Array<{
      id: string
      title: string
      company: string
      location: string
      period: string
      description: string
      technologies: string[]
      achievements: string[]
    }>
    blog: Array<{
      id: string
      title: string
      excerpt: string
      publishDate: string
      readTime: string
      tags: string[]
      image_url: string
      url: string
      featured?: boolean
      trending?: boolean
      popular?: boolean
    }>
    stats: {
      experience: string
      [key: string]: string
    }
  }
}

export function HomePage({ data }: HomePageProps) {
  const { personal, skills, projects, experience, blog, stats } = data

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--color-bg-primary))', color: 'rgb(var(--color-text-primary))' }}>
      {/* Hero Section */}
      <section id="home" className="pt-16 pb-20 lg:pt-24 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <p style={{ color: 'rgb(var(--color-primary-light))' }} className="font-medium">Hello, I'm</p>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>{personal.name}</h1>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    {personal.title}
                  </h2>
                </div>
                <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'rgb(var(--color-text-secondary))' }}>{personal.bio}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  asChild
                  style={{ background: 'var(--gradient-secondary)', color: 'rgb(var(--color-text-primary))' }}
                  className="hover:opacity-90"
                >
                  <Link href={`/contact`}>
                    <Mail className="w-5 h-5 mr-2" />
                    Get In Touch
                  </Link>
                </Button>
              </div>

              <div className="flex items-center space-x-6" style={{ color: 'rgb(var(--color-text-tertiary))' }}>
                <div className="flex items-center text-sm font-semibold space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{personal.location}</span>
                </div>
                <div className="flex items-center text-sm font-semibold space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{stats.experience} years experience</span>
                </div>
                <div className="flex items-center text-sm font-semibold space-x-2">
                  <Coffee className="w-4 h-4" />
                  <span>{personal.working_at}</span>
                </div>
              </div>
            </div>

            <CodeBlock3D personal={personal} skills={skills} stats={stats} />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20" style={{ backgroundColor: 'rgba(var(--color-bg-secondary), 0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>About Me</h2>
            <p className="max-w-2xl mx-auto" style={{ color: 'rgb(var(--color-text-secondary))' }}>
              I'm all about creating digital experiences that make a difference
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🎯",
                title: "Mission",
                description: personal.philosophy,
              },
              {
                icon: "💡",
                title: "Approach",
                description:
                  "I believe in writing clean, maintainable code and creating user-centric experiences that solve real problems.",
              },
              {
                icon: "🚀",
                title: "Goals",
                description:
                  "Continuously learning and exploring new technologies while mentoring others and contributing to the developer community.",
              },
            ].map((item, index) => (
              <Card key={index} className="backdrop-blur-sm text-center" style={{ backgroundColor: 'rgba(var(--color-bg-tertiary), 0.3)', border: '1px solid rgba(var(--color-border-primary), 0.5)' }}>
                <CardHeader>
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <CardTitle style={{ color: 'rgb(var(--color-text-primary))' }}>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed" style={{ color: 'rgb(var(--color-text-secondary))' }}>{item.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Skills & Technologies</h2>
            <p className="max-w-2xl mx-auto" style={{ color: 'rgb(var(--color-text-secondary))' }}>
              Technologies I work with to build robust and scalable applications
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...new Set(skills.map((skill) => skill.category))].map((category) => {
              const categorySkills = skills
                .filter((skill) => skill.category === category)
                .sort((a, b) => a.display_order - b.display_order)

              return (
                <Card
                  key={category}
                  className="group backdrop-blur-sm cursor-pointer h-full flex flex-col rounded-2xl border-0 transition-all duration-300 hover:bg-gray-300/10 hover:shadow-lg/40 bg-gray-400/5 select-none"
                >
                  <CardHeader className="pb-2">
                    <CardTitle
                      className="text-base pb-2 font-semibold flex items-center justify-between transform transition-all duration-300 group-hover:text-lg"
                      style={{ color: 'rgb(var(--color-text-primary))' }}
                    >
                      <span>{category}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-1 flex-1">
                    <div className="space-y-2.5">
                      {categorySkills.slice(0, 6).map((skill) => (
                        <div
                          key={skill.name}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: 'rgb(var(--color-primary-light))' }}
                            />
                            <span style={{ color: 'rgb(var(--color-text-secondary))' }}>
                              {skill.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20" style={{ backgroundColor: 'rgba(var(--color-bg-secondary), 0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Featured Projects</h2>
            <p className="max-w-2xl mx-auto" style={{ color: 'rgb(var(--color-text-secondary))' }}>
              A showcase of my recent work and the technologies I've used to bring ideas to life
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {projects
              .filter((project) => project.featured)
              .map((project, index: number) => (
                <Card key={project.id} className="backdrop-blur-sm overflow-hidden" style={{ backgroundColor: 'rgba(var(--color-bg-tertiary), 0.3)', border: '1px solid rgba(var(--color-border-primary), 0.5)' }}>
                  <div className="aspect-video relative" style={{ backgroundColor: 'rgba(var(--color-bg-quaternary), 0.5)' }}>
                    <Image
                      src={project.image_url || "/placeholder.svg?height=300&width=500"}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge style={{ backgroundColor: 'rgba(var(--color-primary), 0.2)', color: 'rgb(var(--color-primary-light))', border: '1px solid rgba(var(--color-primary), 0.3)' }}>
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <CardTitle className="text-xl" style={{ color: 'rgb(var(--color-text-primary))' }}>{project.title}</CardTitle>
                      <CardDescription className="leading-relaxed" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                        {project.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.slice(0, 4).map((tech) => (
                          <Badge
                            key={tech}
                            variant="secondary"
                            style={{ backgroundColor: 'rgba(var(--color-bg-quaternary), 0.5)', color: 'rgb(var(--color-text-secondary))', border: '1px solid rgba(var(--color-border-secondary), 0.5)' }}
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex space-x-3 pt-2">
                        {project.links.github && (
                          <Button asChild variant="outline" size="sm" style={{ border: '1px solid rgb(var(--color-border-primary))', color: 'rgb(var(--color-text-secondary))' }} className="hover:bg-opacity-80">
                            <Link target="_blank" href={project.links.github} className="flex items-center">
                              <Github className="w-4 h-4 mr-2" />
                              Code
                            </Link>
                          </Button>
                        )}
                        {project.links.live && (
                          <Button asChild size="sm" style={{ background: 'var(--gradient-secondary)', color: 'rgb(var(--color-text-primary))' }} className="hover:opacity-90">
                            <Link target="_blank" href={project.links.live} className="flex items-center">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Live Demo
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" style={{ border: '1px solid rgb(var(--color-border-primary))', color: 'rgb(var(--color-text-secondary))' }} className="hover:bg-opacity-80">
              <Link href="/projects" className="flex items-center">
                View All Projects
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Experience</h2>
            <p className="max-w-2xl mx-auto" style={{ color: 'rgb(var(--color-text-secondary))' }}>
              My professional journey and the companies I've had the privilege to work with
            </p>
          </div>

          <div className="space-y-8">
            {experience.map((exp, index) => (
              <Card key={exp.id} className="backdrop-blur-sm" style={{ backgroundColor: 'rgba(var(--color-bg-tertiary), 0.3)', border: '1px solid rgba(var(--color-border-primary), 0.5)' }}>
                <CardContent className="p-6">
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>{exp.title}</h3>
                      <p className="font-medium" style={{ color: 'rgb(var(--color-primary-light))' }}>{exp.company}</p>
                      <p className="text-sm" style={{ color: 'rgb(var(--color-text-tertiary))' }}>{exp.location}</p>
                      <p className="text-sm" style={{ color: 'rgb(var(--color-text-tertiary))' }}>{exp.period}</p>
                    </div>
                    <div className="lg:col-span-2 space-y-4">
                      <p className="leading-relaxed" style={{ color: 'rgb(var(--color-text-secondary))' }}>{exp.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs" style={{ border: '1px solid rgb(var(--color-border-primary))', color: 'rgb(var(--color-text-tertiary))' }}>
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      {exp.achievements.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium" style={{ color: 'rgb(var(--color-text-tertiary))' }}>Key Achievements:</h4>
                          <ul className="space-y-1">
                            {exp.achievements.map((achievement, i) => (
                              <li key={i} className="text-sm flex items-start" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                                <span className="mr-2" style={{ color: 'rgb(var(--color-primary-light))' }}>✓</span>
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-20" style={{ backgroundColor: 'rgba(var(--color-bg-secondary), 0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Latest Blog Posts</h2>
            <p className="max-w-2xl mx-auto" style={{ color: 'rgb(var(--color-text-secondary))' }}>
              Thoughts on web development, programming best practices, and lessons learned
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blog.slice(0, 3).map((post) => (
              <Card key={post.id} className="group backdrop-blur-sm hover:bg-opacity-50 transition-all duration-300 overflow-hidden" style={{ backgroundColor: 'rgba(var(--color-bg-tertiary), 0.3)', border: '1px solid rgba(var(--color-border-primary), 0.5)' }}>
                <CardHeader className="p-0">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={post.image_url || "/placeholder.svg?height=200&width=400"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 text-sm" style={{ color: 'rgb(var(--color-text-tertiary))' }}>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    <CardTitle className="text-lg line-clamp-2" style={{ color: 'rgb(var(--color-text-primary))' }}>
                      {post.title}
                    </CardTitle>

                    <CardDescription className="line-clamp-3" style={{ color: 'rgb(var(--color-text-secondary))' }}>{post.excerpt}</CardDescription>

                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs" style={{ border: '1px solid rgb(var(--color-border-primary))', color: 'rgb(var(--color-text-tertiary))' }}>
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button variant="ghost" className="p-0 h-auto font-medium" style={{ color: 'rgb(var(--color-primary-light))' }}>
                      <Link href={`/blog/${post.url}`} className="flex items-center">
                        Read more
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" style={{ background: 'var(--gradient-secondary)', color: 'rgb(var(--color-text-primary))' }} className="hover:opacity-90">
              <Link href="/blog" className="flex items-center">
                View All Posts
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Get In Touch</h2>
            <p className="max-w-2xl mx-auto" style={{ color: 'rgb(var(--color-text-secondary))' }}>
              I'm always open to discussing new opportunities, interesting projects, or just having a chat about technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>Let's Connect</h3>
                <p className="leading-relaxed" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Whether you have a project in mind, want to collaborate, or just want to say hello, I'd love to hear from you.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5" style={{ color: 'rgb(var(--color-primary-light))' }} />
                  <span style={{ color: 'rgb(var(--color-text-secondary))' }}>{personal.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5" style={{ color: 'rgb(var(--color-primary-light))' }} />
                  <span style={{ color: 'rgb(var(--color-text-secondary))' }}>{personal.location}</span>
                </div>
              </div>

              <div className="flex space-x-4">
                {personal.social.github && (
                  <Button asChild variant="outline" size="sm" style={{ border: '1px solid rgb(var(--color-border-primary))', color: 'rgb(var(--color-text-secondary))' }} className="hover:bg-opacity-80">
                    <Link target="_blank" href={personal.social.github} className="flex items-center">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </Link>
                  </Button>
                )}
                {personal.social.linkedin && (
                  <Button asChild variant="outline" size="sm" style={{ border: '1px solid rgb(var(--color-border-primary))', color: 'rgb(var(--color-text-secondary))' }} className="hover:bg-opacity-80">
                    <Link target="_blank" href={personal.social.linkedin} className="flex items-center">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>Quick Actions</h3>
                <p style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Ready to start a project or want to learn more about my work?
                </p>
              </div>

              <div className="space-y-4">
                <Button asChild size="lg" className="w-full hover:opacity-90" style={{ background: 'var(--gradient-secondary)', color: 'rgb(var(--color-text-primary))' }}>
                  <Link href="mailto:piyushdev.developer@gmail.com" className="flex items-center justify-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Send Message
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full hover:bg-opacity-80" style={{ border: '1px solid rgb(var(--color-border-primary))', color: 'rgb(var(--color-text-secondary))' }}>
                  <Link href="/projects" className="flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    View Projects
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
