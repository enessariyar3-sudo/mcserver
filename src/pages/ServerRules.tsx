import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Zap, 
  Ban, 
  Heart,
  MessageSquare,
  Gamepad2,
  Crown,
  AlertTriangle
} from 'lucide-react';

const ServerRules = () => {
  const navigate = useNavigate();

  const rules = [
    {
      id: 1,
      category: "General Conduct",
      icon: Users,
      color: "bg-blue-500",
      rules: [
        "Be respectful to all players and staff members",
        "No harassment, bullying, or discrimination of any kind",
        "Use appropriate language in chat - no excessive profanity",
        "No spamming in chat or flooding the server",
        "Follow staff instructions at all times"
      ]
    },
    {
      id: 2,
      category: "Gameplay Rules",
      icon: Gamepad2,
      color: "bg-green-500",
      rules: [
        "No griefing - do not destroy or modify other players' builds",
        "No stealing from other players' chests or areas",
        "PvP is only allowed in designated areas",
        "No exploiting game mechanics or bugs",
        "Ask permission before building near someone else's base"
      ]
    },
    {
      id: 3,
      category: "Chat & Communication",
      icon: MessageSquare,
      color: "bg-purple-500",
      rules: [
        "No advertising other servers or Discord channels",
        "No sharing personal information (yours or others')",
        "English only in public chat (other languages in private)",
        "No begging for items, ranks, or special treatment",
        "Use appropriate channels for different types of discussion"
      ]
    },
    {
      id: 4,
      category: "Building & Claims",
      icon: Crown,
      color: "bg-yellow-500",
      rules: [
        "Claim your land to protect your builds",
        "No building offensive or inappropriate structures",
        "Keep builds appropriate distance from spawn area",
        "No lag machines or excessive redstone contraptions",
        "Respect the server's building aesthetic guidelines"
      ]
    }
  ];

  const violations = [
    {
      level: "Warning",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      description: "First offense for minor rule violations"
    },
    {
      level: "Temporary Mute",
      color: "bg-orange-100 text-orange-800 border-orange-300",
      description: "1-24 hours for chat-related violations"
    },
    {
      level: "Temporary Ban",
      color: "bg-red-100 text-red-800 border-red-300",
      description: "1-30 days for serious violations"
    },
    {
      level: "Permanent Ban",
      color: "bg-gray-100 text-gray-800 border-gray-300",
      description: "Severe or repeated violations"
    }
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            ← Back to Home
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Server Rules & Guidelines</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Welcome to IndusNetwork! Please read and follow these rules to ensure a fun and safe environment for everyone.
            </p>
          </div>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">Important Notice</h3>
                <p className="text-yellow-700 text-sm">
                  By joining our server, you agree to follow these rules. Ignorance of the rules is not an excuse for violations. 
                  Rules may be updated at any time, so please check back regularly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rules Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {rules.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card key={section.id} className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${section.color}`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    {section.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary font-bold text-sm mt-1">•</span>
                        <span className="text-sm">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Punishment System */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Punishment System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              We use a progressive punishment system. The severity of punishment depends on the rule violated and your history.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {violations.map((violation, index) => (
                <div key={index} className={`p-4 rounded-lg border ${violation.color}`}>
                  <h4 className="font-semibold mb-2">{violation.level}</h4>
                  <p className="text-sm">{violation.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Appeal Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Appeal Process
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              If you believe you were punished unfairly, you can appeal your punishment through our support system.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                <h4 className="font-medium mb-1">Submit Ticket</h4>
                <p className="text-sm text-muted-foreground">Create a support ticket with your appeal</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                <h4 className="font-medium mb-1">Review Process</h4>
                <p className="text-sm text-muted-foreground">Staff will review your case within 24-48 hours</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                <h4 className="font-medium mb-1">Decision</h4>
                <p className="text-sm text-muted-foreground">You'll receive a response with the final decision</p>
              </div>
            </div>
            <div className="text-center pt-4">
              <Button onClick={() => navigate('/support')}>
                Submit an Appeal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">In-Game Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Use <code className="bg-secondary px-1 rounded">/help</code> for general assistance</li>
                  <li>• Use <code className="bg-secondary px-1 rounded">/report [player]</code> to report violations</li>
                  <li>• Contact online staff members directly</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">External Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Join our Discord server for community support</li>
                  <li>• Submit a ticket through our website</li>
                  <li>• Email us at support@indusnetwork.com</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServerRules;