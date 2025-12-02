import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Terms & Conditions</h1>
            <p className="text-muted-foreground">Last Updated: October 2025</p>
          </div>

          <Card>
            <CardContent className="space-y-6 pt-6">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using IndusNetwork Minecraft server ("the Server"), you accept and agree to be bound by the terms and conditions of this agreement. If you do not agree with any of these terms, you are prohibited from using or accessing this Server.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">2. User Conduct</h2>
                <p className="text-muted-foreground mb-3">
                  Users are expected to maintain respectful behavior at all times. The following actions are strictly prohibited:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Harassment, bullying, or discrimination of any kind</li>
                  <li>Cheating, hacking, or using unauthorized modifications</li>
                  <li>Exploiting bugs or glitches for personal gain</li>
                  <li>Spamming, advertising, or sharing inappropriate content</li>
                  <li>Impersonating staff members or other players</li>
                  <li>Attempting to compromise server security or stability</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">3. Purchases and Payments</h2>
                <p className="text-muted-foreground mb-3">
                  All purchases made on the Server are final and non-transferable unless otherwise stated in our Refund Policy. By making a purchase, you agree that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>You are authorized to use the payment method provided</li>
                  <li>All information provided is accurate and complete</li>
                  <li>Virtual items have no real-world monetary value</li>
                  <li>Purchases are for personal use only and cannot be resold</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">4. Account Responsibility</h2>
                <p className="text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account credentials. Any activity that occurs under your account is your responsibility. We reserve the right to suspend or terminate accounts that violate these terms or engage in suspicious activity.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">5. Server Rules and Moderation</h2>
                <p className="text-muted-foreground">
                  Server staff have the authority to enforce rules, issue warnings, and apply disciplinary actions including temporary or permanent bans. Staff decisions are final and appeals can be made through official support channels.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">6. Content and Intellectual Property</h2>
                <p className="text-muted-foreground">
                  All server content, including but not limited to plugins, custom builds, textures, and designs, are the intellectual property of IndusNetwork. Players retain ownership of their own creative works but grant the server a license to use, display, and modify such content as necessary for server operations.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">7. Service Availability</h2>
                <p className="text-muted-foreground">
                  We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. Scheduled maintenance, updates, or unforeseen technical issues may result in temporary downtime. No compensation will be provided for downtime unless explicitly stated.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">8. Privacy and Data Protection</h2>
                <p className="text-muted-foreground">
                  We collect and store user data necessary for server operations and player experience. This includes usernames, purchase history, and gameplay statistics. We do not sell personal information to third parties. For more details, please refer to our Privacy Policy.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">9. Modifications to Terms</h2>
                <p className="text-muted-foreground">
                  IndusNetwork reserves the right to modify these terms at any time. Users will be notified of significant changes through server announcements or email. Continued use of the server after changes indicates acceptance of the modified terms.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">10. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  IndusNetwork is not liable for any direct, indirect, incidental, or consequential damages arising from server use, including but not limited to loss of data, in-game items, or access to services. Use of the server is at your own risk.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">11. Contact Information</h2>
                <p className="text-muted-foreground">
                  For questions regarding these terms or to report violations, please contact our support team through the official support channels or email us at support@indusnetwork.com.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsConditions;
