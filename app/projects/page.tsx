import Image from "next/image"
import Link from "next/link"
import { ExternalLink, Github, Star } from "lucide-react"
import { NavigationMenu } from "@/components/navigation-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPortfolioData } from "@/lib/data/portfolio"
import type { Project } from "@/lib/data/portfolio"
import Script from "next/script"
import { BuyProjectButton } from "@/components/buy-project-button"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ProjectsPage() {
  const portfolioData = await getPortfolioData()

  if (portfolioData.error || !portfolioData.data) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--color-bg-primary))' }}>
        <NavigationMenu />
        <div className="pt-16">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4" style={{ color: 'rgb(239 68 68)' }}>Error Loading Portfolio</h1>
              <p style={{ color: 'rgb(var(--color-text-secondary))' }}>{portfolioData.error || "Failed to load portfolio data"}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { projects } = portfolioData.data
  const featuredProjects = projects.filter((p: Project) => p.featured)
  const otherProjects = projects.filter((p: Project) => !p.featured)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--color-bg-primary))' }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <NavigationMenu />

      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>My Projects</h1>
              <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                A collection of projects that showcase my skills in full-stack development, from concept to deployment.
                Each project represents a unique challenge and learning experience.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Featured Projects</h2>
              <p style={{ color: 'rgb(var(--color-text-secondary))' }}>
                These are some of my most significant projects that demonstrate my expertise and problem-solving
                abilities.
              </p>
            </div>

            <div className="space-y-20">
              {featuredProjects.map((project: Project, index: number) => (
                <div
                  key={index}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}
                >
                  <div className={`space-y-6 ${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5" style={{ color: 'rgb(var(--color-primary-light))' }} />
                        <span className="text-sm font-medium" style={{ color: 'rgb(var(--color-primary-light))' }}>Featured Project</span>
                      </div>
                      <h3 className="text-3xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>{project.title}</h3>
                      <p className="text-lg leading-relaxed" style={{ color: 'rgb(var(--color-text-secondary))' }}>{project.longDescription}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map((tech: string) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          style={{ backgroundColor: 'rgba(var(--color-bg-tertiary), 0.5)', color: 'rgb(var(--color-text-secondary))', border: '1px solid rgba(var(--color-border-primary), 0.5)' }}
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium" style={{ color: 'rgb(var(--color-text-tertiary))' }}>Key Features:</h4>
                      <ul className="space-y-2">
                        {project.features.map((feature: string, i: number) => (
                          <li key={i} className="flex items-start" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                            <span className="mr-2" style={{ color: 'rgb(var(--color-primary-light))' }}>✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {project?.stats && <div className="grid grid-cols-2 gap-4 py-4">
                      {Object.entries(project.stats)
                        .slice(0, 4)
                        .map(([key, value]: any) => (
                          <div key={key} className="text-center">
                            <div className="text-xl font-bold" style={{ color: 'rgb(var(--color-primary-light))' }}>{value}</div>
                            <div className="text-sm capitalize" style={{ color: 'rgb(var(--color-text-tertiary))' }}>{key}</div>
                          </div>
                        ))}
                    </div>}

                    <div className="flex space-x-4">
                      <BuyProjectButton
                        projectId={project.id}
                        projectTitle={project.title}
                        priceInr={project.price_inr}
                        isSellable={project.is_sellable}
                      />
                      {project?.links?.github && (
                        <Button asChild variant="outline" style={{ border: '1px solid rgb(var(--color-border-primary))', color: 'rgb(var(--color-text-secondary))' }} className="hover:bg-opacity-80">
                          <Link target="_blank" href={project.links.github} className="flex items-center">
                            <Github className="w-4 h-4 mr-2" />
                            View Code
                          </Link>
                        </Button>
                      )}
                      {project?.links?.live && (
                        <Button asChild style={{ background: 'var(--gradient-secondary)', color: 'rgb(var(--color-text-primary))' }} className="hover:opacity-90">
                          <Link target="_blank" href={project.links.live} className="flex items-center">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Live Demo
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className={`relative ${index % 2 === 1 ? "lg:col-start-1" : ""}`}>
                    <div className="absolute inset-0 rounded-2xl blur-3xl" style={{ background: 'var(--gradient-primary)', opacity: 0.2 }} />
                    <div className="relative aspect-video rounded-2xl backdrop-blur-sm overflow-hidden" style={{ backgroundColor: 'rgba(var(--color-bg-tertiary), 0.3)', border: '1px solid rgba(var(--color-border-primary), 0.5)' }}>
                      <Image
                        src={project?.image_url || "/placeholder.svg?height=400&width=600"}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Other Projects */}
        {otherProjects.length > 0 &&
          <section className="py-20" style={{ backgroundColor: 'rgba(var(--color-bg-secondary), 0.3)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Other Projects</h2>
                <p style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Additional projects and experiments that showcase different aspects of my development skills.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherProjects.map((project: Project, index: number) => (
                  <Card
                    key={index}
                    className="group backdrop-blur-sm hover:bg-opacity-50 transition-all duration-300"
                    style={{ backgroundColor: 'rgba(var(--color-bg-tertiary), 0.3)', border: '1px solid rgba(var(--color-border-primary), 0.5)' }}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <CardTitle className="text-xl transition-colors group-hover:opacity-80" style={{ color: 'rgb(var(--color-text-primary))' }}>
                          {project.title}
                        </CardTitle>
                        <CardDescription className="leading-relaxed" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                          {project.description}
                        </CardDescription>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.map((tech: string) => (
                            <Badge key={tech} variant="outline" className="text-xs" style={{ border: '1px solid rgb(var(--color-border-primary))', color: 'rgb(var(--color-text-tertiary))' }}>
                              {tech}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex space-x-3 pt-2">
                          <BuyProjectButton
                            projectId={project.id}
                            projectTitle={project.title}
                            priceInr={project.price_inr}
                            isSellable={project.is_sellable}
                          />
                          {project.links.github && (
                            <Button variant="ghost" size="sm" className="p-0 hover:opacity-80" style={{ color: 'rgb(var(--color-text-tertiary))' }}>
                              <Github className="w-4 h-4 mr-2" />
                              Code
                            </Button>
                          )}
                          {project.links.live && (
                            <Button variant="ghost" size="sm" className="p-0 hover:opacity-80" style={{ color: 'rgb(var(--color-text-tertiary))' }}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Demo
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>}
      </div>
    </div>
  )
}
