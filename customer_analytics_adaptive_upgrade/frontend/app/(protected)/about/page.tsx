'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code, Mail, ArrowRight, Share2 } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">About This Project</h1>
        <p className="text-slate-400 mt-2">Customer Churn Prediction SaaS Platform</p>
      </div>

      {/* Research Problem */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Research Problem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-slate-300">
            <p>
              Customer churn is one of the most significant challenges for subscription-based businesses. While traditional
              rule-based systems can identify at-risk customers, they lack the nuance and proactivity needed for modern
              retention strategies.
            </p>
            <p>
              This project addresses the challenge of predicting customer churn with high accuracy while providing
              explainable insights that enable business teams to take immediate action.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Research Gap */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Research Gap & Novel Contribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">What's Missing</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex gap-2">
                  <span className="text-sky-400">•</span>
                  Most SaaS products show predictions but lack feature-level explanations
                </li>
                <li className="flex gap-2">
                  <span className="text-sky-400">•</span>
                  Existing tools don&apos;t bridge the gap between ML predictions and business actions
                </li>
                <li className="flex gap-2">
                  <span className="text-sky-400">•</span>
                  Real-time model performance monitoring is rare in production systems
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Our Innovation</h3>
              <ul className="space-y-2 text-emerald-300 text-sm">
                <li className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  SHAP-based explainability integrated directly into predictions
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  Automatic business-focused recommendation generation
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  Real-time model performance dashboards with segment analysis
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Architecture */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">System Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-slate-700/30 rounded-lg p-4 font-mono text-sm text-slate-300">
              <div className="mb-3">Frontend (Next.js 16 + React 19)</div>
              <div className="text-center text-sky-400 mb-3">↓</div>
              <div className="mb-3">Service Layer (Type-safe, Mockable)</div>
              <div className="text-center text-sky-400 mb-3">↓</div>
              <div className="mb-3">API Gateway</div>
              <div className="text-center text-sky-400 mb-3">↓</div>
              <div>ML Backend (FastAPI - Ready for Integration)</div>
            </div>
            <p className="text-sm text-slate-400">
              The architecture is designed for clean separation of concerns. All data flows through a dedicated service layer,
              making it trivial to replace mock services with real FastAPI endpoints.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Technology Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-white mb-3">Frontend</h3>
              <div className="space-y-2">
                {[
                  'Next.js 16 (App Router)',
                  'React 19 + TypeScript',
                  'Tailwind CSS',
                  'Framer Motion (Animations)',
                  'Recharts (Data Visualization)',
                  'shadcn/ui (Components)',
                  'Zustand (State Management)',
                  'SWR (Data Fetching)',
                ].map((tech) => (
                  <Badge key={tech} variant="outline" className="mr-2 mb-2">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Backend (Ready for Integration)</h3>
              <div className="space-y-2">
                {[
                  'FastAPI (Python)',
                  'Scikit-learn (ML Models)',
                  'SHAP (Explainability)',
                  'Pandas (Data Processing)',
                  'PostgreSQL (Data Store)',
                  'Docker (Containerization)',
                  'pytest (Testing)',
                  'Pydantic (Validation)',
                ].map((tech) => (
                  <Badge key={tech} variant="outline" className="mr-2 mb-2">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">User Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { num: '1', title: 'Upload Customer Data', desc: 'Import customer records and attributes' },
              { num: '2', title: 'Run Predictions', desc: 'Model predicts churn probability for each customer' },
              { num: '3', title: 'Review Explanations', desc: 'SHAP analysis shows which features drive churn risk' },
              { num: '4', title: 'Get Recommendations', desc: 'AI suggests specific retention offers' },
              { num: '5', title: 'Take Action', desc: 'Implement recommendations and track results' },
              { num: '6', title: 'Monitor Performance', desc: 'Track model accuracy and business impact' },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="min-w-fit bg-sky-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                  {item.num}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Future Work */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Future Enhancements</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-slate-300">
            <li className="flex gap-2">
              <ArrowRight className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" />
              <span>Real-time streaming predictions with Kafka</span>
            </li>
            <li className="flex gap-2">
              <ArrowRight className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" />
              <span>Multi-model ensemble with automated retraining</span>
            </li>
            <li className="flex gap-2">
              <ArrowRight className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" />
              <span>Custom retention offer generation with reinforcement learning</span>
            </li>
            <li className="flex gap-2">
              <ArrowRight className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" />
              <span>Integration with popular CRM platforms</span>
            </li>
            <li className="flex gap-2">
              <ArrowRight className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" />
              <span>A/B testing framework for retention campaigns</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Project Info */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Repository</p>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 mt-1 flex items-center gap-1"
              >
                <Code className="h-4 w-4" />
                View on GitHub
              </a>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">License</p>
              <p className="text-white mt-1">MIT</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Version</p>
              <p className="text-white mt-1">1.0.0</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Last Updated</p>
              <p className="text-white mt-1">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="border-slate-700 bg-sky-500/10 border-sky-500/30">
        <CardHeader>
          <CardTitle className="text-white">Questions? Get in Touch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <a href="mailto:contact@example.com" className="flex items-center gap-2 text-sky-400 hover:text-sky-300">
              <Mail className="h-5 w-5" />
              Email
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sky-400 hover:text-sky-300">
              <Code className="h-5 w-5" />
              GitHub
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sky-400 hover:text-sky-300">
              <Share2 className="h-5 w-5" />
              LinkedIn
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
