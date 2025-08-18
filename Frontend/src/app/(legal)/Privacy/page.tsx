/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from "next/link";
import { Music } from "lucide-react";
import ReactMarkdown from "react-markdown";

// A simple layout for the legal pages including a header and footer.
function LegalPageLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <nav className="fixed top-0 z-50 w-full border-b bg-white/95 backdrop-blur-lg">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center space-x-2">
            <Music className="text-primary h-8 w-8" />
            <span className="text-xl font-bold">Beatflow</span>
          </Link>
        </div>
      </nav>

      <main className="flex-grow pt-28 pb-16 sm:pt-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg mx-auto">
            <h1 className="mb-12 text-4xl font-bold tracking-tight">{title}</h1>
            {children}
          </div>
        </div>
      </main>

      <footer className="bg-secondary/50 border-t px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-muted-foreground mx-auto max-w-7xl text-center text-sm">
          © {new Date().getFullYear()} Beatflow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// The Markdown content for the Privacy Policy
const privacyPolicyMarkdown = `
**Last Updated: August 18, 2025**

Welcome to Beatflow ("we," "us," or "our"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services (collectively, the "Service"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the service.

### 1. Information We Collect

We may collect information about you in a variety of ways. The information we may collect on the Service includes:

**a. Personal Data:**
Personally identifiable information, such as your name, email address, and payment information (e.g., credit card details), that you voluntarily give to us when you register for the Service or when you choose to participate in various activities related to the Service, such as purchasing credits.

**b. Derivative Data:**
Information our servers automatically collect when you access the Service, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Service.

**c. User-Generated Data:**
We collect the text prompts you submit to generate music and the resulting audio files you create.

### 2. How We Use Your Information

Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:

* Create and manage your account.
* Process your transactions and deliver the services you have requested.
* Email you regarding your account or orders.
* Improve our AI models and the overall quality of the Service.
* Monitor and analyze usage and trends to improve your experience with the Service.
* Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.

### 3. Disclosure of Your Information

We do not share, sell, rent, or trade your personal information with third parties for their commercial purposes. We may share information we have collected about you in certain situations:

* **With Service Providers:** We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf, such as payment processing (e.g., Stripe) and data analysis.
* **By Law or to Protect Rights:** If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.

### 4. Data Security

We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.

### 5. Your Rights Regarding Your Information

You have the right to:

* Access the personal data we hold about you.
* Request that we correct any inaccurate personal data.
* Request that we delete your personal data.
* Withdraw consent for future processing.

To exercise these rights, please contact us at the contact information below.

### 6. Policy for Children

We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.

### 7. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.

### 8. Contact Us

If you have questions or comments about this Privacy Policy, please contact us at:

**Beatflow**
Email: [Your Contact Email]
Website: [Your Website URL]
`;

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <ReactMarkdown
        components={{
          h3: ({ node, ...props }) => (
            <h3 className="mt-8 mb-4 text-2xl font-semibold" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-primary hover:underline" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc space-y-2 pl-6" {...props} />
          ),
        }}
      >
        {privacyPolicyMarkdown}
      </ReactMarkdown>
    </LegalPageLayout>
  );
}
