/* eslint-disable @typescript-eslint/no-unused-vars */
import { Music } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

// A simple layout for the legal pages including a header and footer.
// In a real app, you would import this from a shared components folder.
function LegalPageLayout({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <nav className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-lg border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Music className="text-primary h-8 w-8" />
            <span className="text-xl font-bold">Beatflow</span>
          </Link>
        </div>
      </nav>
      
      <main className="pt-28 sm:pt-32 pb-16 flex-grow">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg mx-auto">
            <h1 className="text-4xl font-bold tracking-tight mb-12">{title}</h1>
            {children}
          </div>
        </div>
      </main>

      <footer className="bg-secondary/50 border-t px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Beatflow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}


// The Markdown content for the Terms of Service
const termsOfServiceMarkdown = `
**Last Updated: August 18, 2025**

Please read these Terms of Service ("Terms") carefully before using the Beatflow website and services (the "Service") operated by Beatflow ("us", "we", or "our").

Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who wish to access or use the Service. By accessing or using the Service, you agree to be bound by these Terms.

### 1. Accounts

When you create an account with us, you guarantee that you are above the age of 13, and that the information you provide us is accurate, complete, and current at all times. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.

### 2. Music Generation and Credits

The Service allows you to generate musical compositions ("Tracks") based on text prompts you provide. This is facilitated through a credit system.

* **Free Credits:** We may provide you with a limited number of free credits each month. These credits are for use on the Service and have no cash value.
* **Purchased Credits:** You may purchase additional credits through one-time payments. Purchased credits do not expire.

### 3. Licensing of Generated Tracks

The rights you have to the Tracks you generate depend on the type of credit used to create them.

**a. Personal License (Using Free Credits):**
Tracks generated using free monthly credits are granted a **Personal License**. This means:
* You **may** use the Tracks for personal, non-commercial purposes (e.g., personal listening, non-monetized social media posts to friends, school projects).
* You **may not** use the Tracks in any way that generates revenue or for any business purpose. This includes, but is not limited to, monetized YouTube videos, podcasts with ads, commercial advertisements, or use in a product for sale.
* Tracks generated with free credits may contain an audio watermark.

**b. Commercial License (Using Purchased Credits):**
Tracks generated using credits you have purchased are granted a **Full Commercial License**. This means:
* You are granted a perpetual, worldwide, non-exclusive, royalty-free license to use the Tracks for any commercial purpose.
* This includes use in monetized content on platforms like YouTube and Twitch, in podcasts, independent films, video games, and advertisements.
* Tracks will be available for download in high-fidelity formats (e.g., WAV) and will not contain an audio watermark.

**c. Restrictions on All Licenses:**
You may not:
* Claim ownership or authorship of the Tracks.
* Register the Tracks with any content identification system (e.g., YouTube Content ID).
* Resell, license, or distribute the Tracks as standalone audio files.

### 4. User Conduct

You agree not to use the Service to:
* Generate content that is unlawful, harmful, defamatory, obscene, or hateful.
* Infringe upon the intellectual property rights of others.
* Transmit any viruses, malware, or other malicious code.

### 5. Termination

We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.

### 6. Limitation of Liability

In no event shall Beatflow, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.

### 7. Governing Law

These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.

### 8. Changes

We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect.

### 9. Contact Us

If you have any questions about these Terms, please contact us at:
Email: [Your Contact Email]
`;

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service">
      <ReactMarkdown
        components={{
          h3: ({node, ...props}) => <h3 className="text-2xl font-semibold mt-8 mb-4" {...props} />,
          a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />,
          p: ({node, ...props}) => <p className="leading-relaxed" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-2" {...props} />,
        }}
      >
        {termsOfServiceMarkdown}
      </ReactMarkdown>
    </LegalPageLayout>
  );
}
