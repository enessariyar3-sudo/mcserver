import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Refund Policy</h1>
            <p className="text-muted-foreground">Last Updated: October 2025</p>
          </div>

          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Please read this policy carefully before making any purchases. All sales are considered final unless they meet the specific conditions outlined below.
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent className="space-y-6 pt-6">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">1. General Refund Policy</h2>
                <p className="text-muted-foreground mb-3">
                  At IndusNetwork, we strive to provide the best gaming experience possible. However, due to the digital nature of our products and services, all purchases are generally final and non-refundable.
                </p>
                <p className="text-muted-foreground">
                  Virtual items, ranks, coins, and other digital goods are delivered instantly upon purchase and cannot be returned or exchanged once activated.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">2. Eligible Refund Cases</h2>
                <p className="text-muted-foreground mb-3">
                  Refunds may be considered under the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Technical Issues:</strong> If you experience persistent technical problems that prevent you from receiving or using your purchased items, and our support team is unable to resolve the issue within 48 hours</li>
                  <li><strong>Duplicate Charges:</strong> If you were charged multiple times for the same purchase due to a payment processing error</li>
                  <li><strong>Unauthorized Transactions:</strong> If a purchase was made without your authorization (subject to verification and fraud investigation)</li>
                  <li><strong>Service Unavailability:</strong> If the purchased service or feature becomes permanently unavailable due to server shutdown or major changes within 7 days of purchase</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">3. Non-Refundable Purchases</h2>
                <p className="text-muted-foreground mb-3">
                  The following purchases are explicitly non-refundable:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Ranks that have been used or activated</li>
                  <li>In-game currency (coins) that have been spent or transferred</li>
                  <li>Limited-time offers, seasonal items, or promotional bundles</li>
                  <li>Purchases made more than 14 days ago</li>
                  <li>Items purchased during sales or special discount events</li>
                  <li>Virtual items that have been used, consumed, or traded</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">4. Refund Request Process</h2>
                <p className="text-muted-foreground mb-3">
                  To request a refund, please follow these steps:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Contact our support team within 7 days of the purchase through our official support channels</li>
                  <li>Provide your transaction ID, username, and a detailed description of the issue</li>
                  <li>Include any relevant screenshots or evidence supporting your claim</li>
                  <li>Wait for our support team to review your request (typically within 3-5 business days)</li>
                </ol>
                <p className="text-muted-foreground mt-3">
                  Contact us at: support@indusnetwork.com or through our Discord support channel
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">5. Account Bans and Suspensions</h2>
                <p className="text-muted-foreground">
                  If your account is banned or suspended due to violation of our Terms of Service, you are not eligible for any refunds. This includes purchases made prior to the ban. We strongly encourage all players to familiarize themselves with our server rules and community guidelines.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">6. Chargeback Policy</h2>
                <p className="text-muted-foreground mb-3">
                  Filing a chargeback or payment dispute without first contacting our support team may result in:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Immediate suspension of your account</li>
                  <li>Removal of all purchased items and ranks</li>
                  <li>Permanent ban from the server</li>
                  <li>Blacklisting from future purchases</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  Please contact us first to resolve any payment issues. We are committed to finding fair solutions.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">7. Processing Time</h2>
                <p className="text-muted-foreground">
                  Approved refunds will be processed within 5-10 business days. The refund will be issued to the original payment method used for the purchase. Please note that depending on your bank or payment provider, it may take an additional 3-7 business days for the funds to appear in your account.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">8. Currency Exchange</h2>
                <p className="text-muted-foreground">
                  If a refund is approved for an international transaction, the refund amount will be based on the exchange rate at the time of the original purchase. IndusNetwork is not responsible for any currency conversion fees or differences in exchange rates.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">9. Changes to Refund Policy</h2>
                <p className="text-muted-foreground">
                  IndusNetwork reserves the right to modify this refund policy at any time. Changes will be effective immediately upon posting. We recommend reviewing this policy periodically for any updates.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-3">10. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions or concerns regarding our refund policy, please don't hesitate to reach out:
                </p>
                <ul className="list-none space-y-2 text-muted-foreground ml-4 mt-3">
                  <li><strong>Email:</strong> support@indusnetwork.com</li>
                  <li><strong>Discord:</strong> Join our official Discord server</li>
                  <li><strong>Response Time:</strong> Within 24-48 hours</li>
                </ul>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
