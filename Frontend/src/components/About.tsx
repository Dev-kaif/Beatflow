"use client";

import {
  Github,
  Linkedin,
  User,
  Server,
  Database,
  Cloud,
  Code,
  Link,
  Music,
} from "lucide-react";
import { motion, type Variants } from "motion/react";

// --- Animation Variants (re-used for consistency) ---
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// --- Data for the page ---
const techStack = {
  frontend: [
    "React",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "Tailwind CSS",
    "HTML5",
    "CSS",
  ],
  backend: ["Node.js", "Express.js", "Nest.js", "Python Fast API"],
  database: ["MongoDB", "PostgreSQL", "Prisma ORM", "Neo4j"],
  realtime: ["Web Sockets"],
  devops: ["Nginx", "CI/CD", "AWS", "Git/Github"],
  ai: ["Langchain", "Rag", "LangGraph"],
};

const socialLinks = [
  {
    name: "Portfolio",
    url: "https://www.mohammadkaif.tech",
    icon: <User className="h-5 w-5" />,
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/mohammadkaif123",
    icon: <Linkedin className="h-5 w-5" />,
  },
  {
    name: "GitHub",
    url: "https://github.com/Dev-kaif",
    icon: <Github className="h-5 w-5" />,
  },
];

// --- Main About Page Component ---
export default function AboutPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="pt-24 pb-24">
        <motion.section
          className="px-4 sm:px-6 lg:px-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* --- Page Header --- */}
          <motion.div
            className="mx-auto max-w-4xl text-center"
            variants={fadeUp}
          >
            <h1 className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">
              About Beatflow
            </h1>
            <p className="text-muted-foreground mt-6 text-lg">
              Welcome to Beatflow, where the future of sound is created. Our
              mission is to provide creators, filmmakers, and developers with a
              revolutionary tool to generate unique, professional-quality music
              with a single prompt.
            </p>
            <p className="text-muted-foreground mt-4 text-lg">
              This cutting-edge platform was brought to life by a dedicated and
              passionate developer who believes in building practical, impactful
              software.
            </p>
          </motion.div>

          {/* --- Developer Profile Section --- */}
          <motion.div className="mx-auto mt-20 max-w-4xl" variants={fadeUp}>
            <div className="bg-card text-card-foreground overflow-hidden rounded-xl border shadow-lg">
              <div className="p-8 sm:p-12">
                <div className="flex flex-col items-center gap-8 sm:flex-row">
                  {/* Profile Image - Placeholder */}
                  <div className="flex-shrink-0">
                    <img
                      src="https://placehold.co/128x128/f97316/ffffff?text=MK"
                      alt="Mohammad Kaif"
                      width={128}
                      height={128}
                      className="border-primary rounded-full border-4 object-cover"
                    />
                  </div>
                  {/* Developer Info */}
                  <div className="text-center sm:text-left">
                    <h2 className="text-3xl font-bold">Meet the Developer</h2>
                    <p className="text-primary mt-1 text-xl font-semibold">
                      Mohammad Kaif
                    </p>
                    <p className="text-muted-foreground mt-4">
                      As a Computer Science student at Mumbai University,
                      Mohammad combines his academic knowledge with hands-on
                      experience in modern web technologies. He has a strong
                      interest in applied AI, automation, and building
                      real-world solutions through code. His approach is defined
                      by a commitment to debugging, building, and shipping
                      high-quality software.
                    </p>
                  </div>
                </div>

                {/* --- Tech Stack Section --- */}
                <div className="mt-12">
                  <h3 className="text-center text-2xl font-bold">
                    Technology Stack
                  </h3>
                  <p className="text-muted-foreground mt-2 mb-8 text-center">
                    This platform was built using a modern tech stack for
                    performance, scalability, and a great user experience.
                  </p>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Frontend */}
                    <div className="bg-background/50 rounded-lg border p-4">
                      <div className="mb-3 flex items-center">
                        <Code className="text-primary mr-2 h-5 w-5" />
                        <h4 className="font-semibold">Frontend</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {techStack.frontend.map((tech) => (
                          <span
                            key={tech}
                            className="bg-secondary text-secondary-foreground inline-block rounded-md px-2 py-1 text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* Backend */}
                    <div className="bg-background/50 rounded-lg border p-4">
                      <div className="mb-3 flex items-center">
                        <Server className="text-primary mr-2 h-5 w-5" />
                        <h4 className="font-semibold">Backend & Real-time</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[...techStack.backend, ...techStack.realtime].map(
                          (tech) => (
                            <span
                              key={tech}
                              className="bg-secondary text-secondary-foreground inline-block rounded-md px-2 py-1 text-xs font-medium"
                            >
                              {tech}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                    {/* Database */}
                    <div className="bg-background/50 rounded-lg border p-4">
                      <div className="mb-3 flex items-center">
                        <Database className="text-primary mr-2 h-5 w-5" />
                        <h4 className="font-semibold">Database</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {techStack.database.map((tech) => (
                          <span
                            key={tech}
                            className="bg-secondary text-secondary-foreground inline-block rounded-md px-2 py-1 text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* DevOps & Cloud */}
                    <div className="bg-background/50 rounded-lg border p-4">
                      <div className="mb-3 flex items-center">
                        <Cloud className="text-primary mr-2 h-5 w-5" />
                        <h4 className="font-semibold">DevOps & Cloud</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {techStack.devops.map((tech) => (
                          <span
                            key={tech}
                            className="bg-secondary text-secondary-foreground inline-block rounded-md px-2 py-1 text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* AI */}
                    <div className="bg-background/50 rounded-lg border p-4">
                      <div className="mb-3 flex items-center">
                        <Code className="text-primary mr-2 h-5 w-5" />
                        <h4 className="font-semibold">AI</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {techStack.ai.map((tech) => (
                          <span
                            key={tech}
                            className="bg-secondary text-secondary-foreground inline-block rounded-md px-2 py-1 text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- Connect Section --- */}
                <div className="mt-12 text-center">
                  <h3 className="text-2xl font-bold">Connect with Mohammad</h3>
                  <div className="mt-6 flex items-center justify-center gap-4">
                    {socialLinks.map((link) => (
                      <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary hover:bg-secondary rounded-full p-2 transition-colors"
                      >
                        {link.icon}
                        <span className="sr-only">{link.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>
      </main>

      {/* You would typically have a shared Footer component here */}
      {/* <Footer /> */}
    </div>
  );
}
