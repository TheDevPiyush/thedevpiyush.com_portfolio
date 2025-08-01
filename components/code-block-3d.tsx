import React from 'react'

export default function CodeBlock3D({ personal, skills, stats }: { personal: any, skills: any, stats: any }) {
    return (
        <div className="relative group">
            <div className="absolute inset-0 rounded-3xl blur-3xl" style={{ background: 'var(--gradient-primary)', opacity: 0.2 }} />

            <div className="relative aspect-square rounded-3xl p-8 backdrop-blur-sm transform transition-all duration-700 group-hover:scale-105 group-hover:rotate-y-0 group-hover:rotate-x-0 group-hover:rotate-z-0 group-hover:translate-z-10 shadow-2xl"
                style={{
                    backgroundColor: 'rgba(var(--color-bg-tertiary), 0.5)',
                    border: '1px solid rgba(var(--color-border-primary), 0.5)',
                    transform: 'perspective(1000px) rotateY(-15deg) rotateX(5deg) rotateZ(2deg)',
                    transformStyle: 'preserve-3d'
                }}
            >

                <div className="w-full h-fit rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 group-hover:translate-z-30 group-hover:scale-105"
                    style={{
                        transform: 'translateZ(20px)',
                        filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3))',
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        fontFamily: 'monospace'
                    }}>
                    <div className="p-4 h-full flex flex-col">
                        {/* Header */}
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="flex space-x-1">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff5f56' }}></div>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffbd2e' }}></div>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#27ca3f' }}></div>
                            </div>
                            <span className="text-xs" style={{ color: 'rgb(var(--color-text-tertiary))' }}>TheDevPiyush.json</span>
                        </div>

                        {/* JSON Content */}
                        <div className="flex-1 text-xs leading-relaxed" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                            <div className="space-y-1">
                                <span style={{ color: '#ff6b6b' }}>{'{'}</span>
                                <div className="ml-4 space-y-1">
                                    <div>
                                        <span style={{ color: '#4ecdc4' }}>"name"</span>
                                        <span style={{ color: 'rgb(var(--color-text-secondary))' }}>: </span>
                                        <span style={{ color: '#ffe66d' }}>"Piyush Choudhary"</span>
                                        <span style={{ color: 'rgb(var(--color-text-secondary))' }}>,</span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#4ecdc4' }}>"title"</span>
                                        <span style={{ color: 'rgb(var(--color-text-secondary))' }}>: </span>
                                        <span style={{ color: '#ffe66d' }}>"{personal.title}"</span>
                                        <span style={{ color: 'rgb(var(--color-text-secondary))' }}>,</span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#4ecdc4' }}>"location"</span>
                                        <span style={{ color: 'rgb(var(--color-text-secondary))' }}>: </span>
                                        <span style={{ color: '#ffe66d' }}>"{personal.location}"</span>
                                        <span style={{ color: 'rgb(var(--color-text-secondary))' }}>,</span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#4ecdc4' }}>"experience"</span>
                                        <span style={{ color: 'rgb(var(--color-text-secondary))' }}>: </span>
                                        <span style={{ color: '#ffe66d' }}>"{stats.experience} years"</span>
                                        <span style={{ color: 'rgb(var(--color-text-secondary))' }}>,</span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#4ecdc4' }}>"skills"</span>
                                        <span style={{ color: 'rgb(var(--color-text-secondary))' }}>: [</span>
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        {skills.slice(0, 6).map((skill: any, index: any) => (
                                            <div key={skill.name}>
                                                <span style={{ color: '#ffe66d' }}>"{skill.name}"</span>
                                                {index < Math.min(5, skills.length - 1) && <span style={{ color: 'rgb(var(--color-text-secondary))' }}>,</span>}
                                            </div>
                                        ))}
                                        {skills.length > 6 && (
                                            <div style={{ color: 'rgb(var(--color-text-tertiary))' }}>
                                                <span>// ... and {skills.length - 6} more</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <span style={{ color: 'rgb(var(--color-text-secondary))' }}>],</span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#4ecdc4' }}>"currentStatus"</span>
                                        <span style={{ color: 'rgb(var(--color-text-secondary))' }}>: </span>
                                        <span style={{ color: '#27ca3f' }}>"{personal.working_at}"</span>
                                        <span style={{ color: 'rgb(var(--color-text-secondary))' }}>,</span>
                                    </div>
                                </div>
                                <span style={{ color: '#ff6b6b' }}>{'}'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >


    )
}
