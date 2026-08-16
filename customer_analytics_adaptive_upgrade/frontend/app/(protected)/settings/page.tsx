'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sun, Moon, Monitor, Bell, Database, Zap, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark')
  const [notifications, setNotifications] = useState({
    predictions: true,
    recommendations: true,
    reports: false,
    alerts: true,
    weekly: true,
  })
  const [modelSettings, setModelSettings] = useState({
    autoReindex: true,
    enableExplanations: true,
    confidenceThreshold: 0.7,
  })
  const [systemHealth, setSystemHealth] = useState({
    apiStatus: 'healthy',
    databaseStatus: 'healthy',
    modelStatus: 'healthy',
  })

  const handleThemeChange = (newTheme: typeof theme) => {
    setTheme(newTheme)
    toast.success(`Theme changed to ${newTheme}`)
  }

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
    toast.success('Notification preferences updated')
  }

  const handleModelSettingChange = (key: keyof typeof modelSettings, value: any) => {
    setModelSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
    toast.success('Model settings updated')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-2">Manage your application preferences and configuration</p>
      </div>

      {/* Theme Settings */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Appearance</CardTitle>
          <CardDescription>Customize how the application looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-300">Theme</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-lg border transition-all ${
                  theme === 'light'
                    ? 'border-sky-500 bg-sky-500/10'
                    : 'border-slate-700 bg-slate-700/30 hover:bg-slate-700/50'
                }`}
              >
                <Sun className="h-5 w-5 mx-auto mb-2 text-yellow-400" />
                <p className="text-sm font-medium text-white">Light</p>
              </button>

              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-lg border transition-all ${
                  theme === 'dark'
                    ? 'border-sky-500 bg-sky-500/10'
                    : 'border-slate-700 bg-slate-700/30 hover:bg-slate-700/50'
                }`}
              >
                <Moon className="h-5 w-5 mx-auto mb-2 text-slate-400" />
                <p className="text-sm font-medium text-white">Dark</p>
              </button>

              <button
                onClick={() => handleThemeChange('system')}
                className={`p-4 rounded-lg border transition-all ${
                  theme === 'system'
                    ? 'border-sky-500 bg-sky-500/10'
                    : 'border-slate-700 bg-slate-700/30 hover:bg-slate-700/50'
                }`}
              >
                <Monitor className="h-5 w-5 mx-auto mb-2 text-sky-400" />
                <p className="text-sm font-medium text-white">System</p>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Notifications</CardTitle>
          <CardDescription>Choose what notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { key: 'predictions', label: 'Prediction Alerts', desc: 'Get notified when new predictions are ready' },
              { key: 'recommendations', label: 'Recommendations', desc: 'Alerts for new retention recommendations' },
              { key: 'reports', label: 'Report Generation', desc: 'Notifications when reports are ready' },
              { key: 'alerts', label: 'System Alerts', desc: 'Critical system and model alerts' },
              { key: 'weekly', label: 'Weekly Digest', desc: 'Receive weekly summary reports' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={() => handleNotificationChange(item.key as keyof typeof notifications)}
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Settings */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Model Configuration</CardTitle>
          <CardDescription>Configure ML model behavior and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-slate-700/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white">Auto-Reindex</p>
                <input
                  type="checkbox"
                  checked={modelSettings.autoReindex}
                  onChange={(e) => handleModelSettingChange('autoReindex', e.target.checked)}
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </div>
              <p className="text-xs text-slate-400">Automatically reindex the model weekly</p>
            </div>

            <div className="p-4 bg-slate-700/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white">Enable SHAP Explanations</p>
                <input
                  type="checkbox"
                  checked={modelSettings.enableExplanations}
                  onChange={(e) => handleModelSettingChange('enableExplanations', e.target.checked)}
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </div>
              <p className="text-xs text-slate-400">Generate SHAP values for all predictions</p>
            </div>

            <div className="p-4 bg-slate-700/20 rounded-lg">
              <p className="text-sm font-medium text-white mb-2">Confidence Threshold</p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.5"
                  max="0.95"
                  step="0.05"
                  value={modelSettings.confidenceThreshold}
                  onChange={(e) => handleModelSettingChange('confidenceThreshold', parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-slate-300 w-12">{modelSettings.confidenceThreshold.toFixed(2)}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Minimum confidence score for predictions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">System Health</CardTitle>
          <CardDescription>Current status of all system components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-700/20 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-sky-400" />
                <p className="text-sm font-medium text-white">API</p>
              </div>
              <Badge className="bg-green-500/20 text-green-200 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {systemHealth.apiStatus}
              </Badge>
              <p className="text-xs text-slate-400 mt-2">Response time: 120ms</p>
            </div>

            <div className="p-4 bg-slate-700/20 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-5 w-5 text-emerald-400" />
                <p className="text-sm font-medium text-white">Database</p>
              </div>
              <Badge className="bg-green-500/20 text-green-200 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {systemHealth.databaseStatus}
              </Badge>
              <p className="text-xs text-slate-400 mt-2">Uptime: 99.9%</p>
            </div>

            <div className="p-4 bg-slate-700/20 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-yellow-400" />
                <p className="text-sm font-medium text-white">Model</p>
              </div>
              <Badge className="bg-green-500/20 text-green-200 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {systemHealth.modelStatus}
              </Badge>
              <p className="text-xs text-slate-400 mt-2">Accuracy: 87.4%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Information */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Model Information</CardTitle>
          <CardDescription>Current model version and training metadata</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Version</p>
              <p className="text-lg font-semibold text-white mt-1">v2.4.1</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Last Training</p>
              <p className="text-lg font-semibold text-white mt-1">3 days ago</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Training Data</p>
              <p className="text-lg font-semibold text-white mt-1">8,547 samples</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Training Time</p>
              <p className="text-lg font-semibold text-white mt-1">47 minutes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-sky-600 hover:bg-sky-700 text-white">Save Changes</Button>
      </div>
    </div>
  )
}
