"use client"

import { useState } from "react"
import { 
  HelpCircle, 
  Shield, 
  FileText, 
  Info, 
  ExternalLink, 
  X, 
  MessageSquare,
  Globe,
  Smartphone,
  Users,
  Lock,
  Download,
  Mail,
  Phone,
  MapPin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface HelpSettingsProps {
  onClose: () => void
}

export function HelpSettings({ onClose }: HelpSettingsProps) {
  const [activeTab, setActiveTab] = useState("help")

  const helpTopics = [
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Learn the basics of using Nex Chat",
      icon: MessageSquare,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      id: "messaging",
      title: "Messaging",
      description: "How to send messages and use chat features",
      icon: MessageSquare,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      id: "groups",
      title: "Group Chats",
      description: "Create and manage group conversations",
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      id: "privacy",
      title: "Privacy & Security",
      description: "Keep your conversations safe and private",
      icon: Lock,
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Manage your notification preferences",
      icon: Smartphone,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      description: "Common issues and solutions",
      icon: HelpCircle,
      color: "text-gray-500",
      bgColor: "bg-gray-500/10"
    }
  ]

  const contactMethods = [
    {
      type: "Email Support",
      value: "support@nexchat.com",
      icon: Mail,
      description: "Get help via email"
    },
    {
      type: "Phone Support",
      value: "+1 (555) 123-4567",
      icon: Phone,
      description: "Call us for immediate assistance"
    },
    {
      type: "Live Chat",
      value: "Available 24/7",
      icon: MessageSquare,
      description: "Chat with our support team"
    }
  ]

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-4xl h-[95vh] sm:max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50 bg-gradient-to-r from-background to-muted/20 flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm">
              <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Help & Support
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">
                Get help, learn about privacy, and app information
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="p-4 sm:p-6 border-b border-border/50 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11">
                <TabsTrigger value="help" className="flex items-center gap-2 text-xs sm:text-sm">
                  <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Help Center</span>
                  <span className="sm:hidden">Help</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2 text-xs sm:text-sm">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Privacy & Terms</span>
                  <span className="sm:hidden">Privacy</span>
                </TabsTrigger>
                <TabsTrigger value="info" className="flex items-center gap-2 text-xs sm:text-sm">
                  <Info className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">App Info</span>
                  <span className="sm:hidden">Info</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 p-4 sm:p-6">
              {/* Help Center Tab */}
              <TabsContent value="help" className="mt-0 space-y-6">
                {/* Quick Help */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      Quick Help
                    </CardTitle>
                    <CardDescription>
                      Find answers to common questions and get started quickly
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {helpTopics.map((topic) => (
                        <div
                          key={topic.id}
                          className="flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                        >
                          <div className={`h-10 w-10 rounded-full ${topic.bgColor} flex items-center justify-center`}>
                            <topic.icon className={`h-5 w-5 ${topic.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm sm:text-base">{topic.title}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">{topic.description}</p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Support */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Contact Support
                    </CardTitle>
                    <CardDescription>
                      Get in touch with our support team for personalized help
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {contactMethods.map((method, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 rounded-lg border border-border/50">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <method.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm sm:text-base">{method.type}</h3>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm sm:text-base">{method.value}</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              Contact
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacy & Terms Tab */}
              <TabsContent value="privacy" className="mt-0 space-y-6">
                {/* Privacy Policy */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Privacy Policy
                    </CardTitle>
                    <CardDescription>
                      Learn how we protect your privacy and handle your data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Data Collection</h4>
                      <p className="text-sm text-muted-foreground">
                        We collect only the information necessary to provide our messaging service. 
                        This includes your account information, messages, and usage data.
                      </p>
                      
                      <h4 className="font-semibold">Data Protection</h4>
                      <p className="text-sm text-muted-foreground">
                        Your messages are encrypted end-to-end and we use industry-standard 
                        security measures to protect your data.
                      </p>
                      
                      <h4 className="font-semibold">Data Usage</h4>
                      <p className="text-sm text-muted-foreground">
                        We use your data to provide and improve our services, ensure security, 
                        and comply with legal obligations.
                      </p>
                    </div>
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Read Full Privacy Policy
                    </Button>
                  </CardContent>
                </Card>

                {/* Terms of Service */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Terms of Service
                    </CardTitle>
                    <CardDescription>
                      Our terms and conditions for using Nex Chat
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Acceptable Use</h4>
                      <p className="text-sm text-muted-foreground">
                        You agree to use Nex Chat responsibly and not to violate any laws or 
                        harm others through the platform.
                      </p>
                      
                      <h4 className="font-semibold">Account Responsibility</h4>
                      <p className="text-sm text-muted-foreground">
                        You are responsible for maintaining the security of your account and 
                        for all activities that occur under your account.
                      </p>
                      
                      <h4 className="font-semibold">Service Availability</h4>
                      <p className="text-sm text-muted-foreground">
                        We strive to provide reliable service but cannot guarantee uninterrupted 
                        availability due to maintenance or technical issues.
                      </p>
                    </div>
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Read Full Terms of Service
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* App Info Tab */}
              <TabsContent value="info" className="mt-0 space-y-6">
                {/* App Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      App Information
                    </CardTitle>
                    <CardDescription>
                      Details about Nex Chat and its features
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <MessageSquare className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">Nex Chat</h3>
                            <p className="text-sm text-muted-foreground">Modern messaging for everyone</p>
                          </div>
                        </div>
                        <Badge variant="secondary">v1.0.0</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg border border-border/50">
                          <h4 className="font-semibold mb-2">Version</h4>
                          <p className="text-sm text-muted-foreground">1.0.0 (Build 100)</p>
                        </div>
                        <div className="p-4 rounded-lg border border-border/50">
                          <h4 className="font-semibold mb-2">Release Date</h4>
                          <p className="text-sm text-muted-foreground">December 2024</p>
                        </div>
                        <div className="p-4 rounded-lg border border-border/50">
                          <h4 className="font-semibold mb-2">Platform</h4>
                          <p className="text-sm text-muted-foreground">Web Application</p>
                        </div>
                        <div className="p-4 rounded-lg border border-border/50">
                          <h4 className="font-semibold mb-2">Technology</h4>
                          <p className="text-sm text-muted-foreground">Next.js & Firebase</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      Features
                    </CardTitle>
                    <CardDescription>
                      What makes Nex Chat special
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Real-time Messaging</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Users className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Group Chats</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Lock className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">End-to-End Encryption</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Download className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">File Sharing</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Smartphone className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Mobile Responsive</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Globe className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Multi-language Support</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      Contact Information
                    </CardTitle>
                    <CardDescription>
                      Get in touch with the Nex Chat team
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                        <Mail className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">contact@nexchat.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                        <Phone className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Address</p>
                          <p className="text-sm text-muted-foreground">123 Chat Street, Tech City, TC 12345</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 