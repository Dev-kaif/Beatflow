"use client";

import { useState, type MouseEvent, useEffect } from "react";
import Link from "next/link";
import {
  motion,
  type Variants,
  AnimatePresence,
  type Easing,
} from "framer-motion";
import {
  Play,
  Pause,
  Music,
  Sparkles,
  Zap,
  Shield,
  Users,
  Headphones,
  Film,
  Gamepad2,
  Mic,
  Menu,
  X,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

// --- Professional Animation Variants ---
const quintEaseOut: Easing = [0.22, 1, 0.36, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: quintEaseOut },
  },
};

// Word-by-word mask reveal
export const revealWord: Variants = {
  hidden: { y: "110%" },
  visible: {
    y: "0%",
    transition: { duration: 0.7, ease: quintEaseOut },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] },
  },
};

// --- Data for the page ---
const useCases = {
  "content-creators": {
    title: "For Content Creators",
    description:
      "Elevate your videos, podcasts, and social media with unique background music that fits your brand perfectly.",
    features: [
      "YouTube & Twitch Safe",
      "Custom Podcast Intros",
      "Engaging Social Media Clips",
      "Royalty-Free Forever",
    ],
  },
  filmmakers: {
    title: "For Filmmakers",
    description:
      "Compose the perfect mood with cinematic scores and ambient tracks for your films and documentaries.",
    features: [
      "Full Cinematic Scores",
      "Tension & Emotional Themes",
      "Ambient Soundscapes",
      "Commercial Licensing Available",
    ],
  },
  "game-developers": {
    title: "For Game Developers",
    description:
      "Create immersive worlds with dynamic soundtracks and adaptive audio for your games.",
    features: [
      "Adaptive Game Soundtracks",
      "Interactive Menu Music",
      "In-Game Action Themes",
      "Seamless Ambient Loops",
    ],
  },
  podcasters: {
    title: "For Podcasters",
    description:
      "Brand your show with professional intro music, transitions, and background beds that make you stand out.",
    features: [
      "Signature Intro & Outro",
      "Custom Transition Sounds",
      "Subtle Background Ambience",
      "Branded Audio Jingles",
    ],
  },
} as const;

type UseCaseKey = keyof typeof useCases;

// --- Main Page Component ---
export default function LandingPage({
  isSessionActive,
}: {
  isSessionActive: boolean;
}) {
  const [activeTab, setActiveTab] = useState<UseCaseKey>("content-creators");
  const [isPlaying, setIsPlaying] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (
    e: MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

    const handleUpgrade = async () => {
      if(!isSessionActive){
        redirect("/auth/sign-in");
      }

      await authClient.checkout({
        products: [
          process.env.NEXT_PUBLIC_PRODUCT_ID_MID!,
          process.env.NEXT_PUBLIC_PRODUCT_ID_MAX!,
        ],
      });
    };

  const navLinks = [
    { href: "features", label: "Features" },
    { href: "use-cases", label: "Use Cases" },
    { href: "pricing", label: "Pricing" },
  ];

  const headline = "Can't find the perfect music?";
  const headlineWords = headline.split(" ");

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Add styles for gradient button hover effect */}
      <style jsx global>{`
        .animated-gradient {
          background-size: 200% auto;
          transition: background-position 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .animated-gradient:hover {
          background-position: right center;
        }
      `}</style>

      {/* --- Upgraded Navigation Bar --- */}
      <motion.nav
        className="fixed top-0 z-50 w-full transition-colors duration-300"
        animate={{
          backgroundColor: isScrolled
            ? "rgba(255, 255, 255, 0.8)"
            : "rgba(255, 255, 255, 0)",
          backdropFilter: isScrolled ? "blur(12px)" : "blur(0px)",
        }}
      >
        <div className="mx-auto h-20 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="relative flex h-full items-center justify-between border-b transition-colors duration-300"
            style={{
              borderColor: isScrolled ? "hsl(var(--border))" : "transparent",
            }}
          >
            <div className="flex items-center space-x-2">
              <Link href="hero" onClick={(e) => handleScrollTo(e, "hero")}>
                <Image
                  className="h-12 w-auto sm:h-14 lg:h-20"
                  alt="Beatflow logo"
                  src="/mainLogo.png"
                  width={200}
                  height={80}
                  priority
                />
              </Link>
            </div>

            <div className="hidden items-center space-x-8 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={`#${link.href}`}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden items-center space-x-4 md:flex">
              {isSessionActive ? (
                <Link href="/home" passHref>
                  <Button className="animated-gradient bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                    Continue to Dashboard{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/sign-in" passHref>
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/auth/sign-up" passHref>
                    <Button className="animated-gradient bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                      Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="bg-card border-border border-t md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="space-y-4 px-4 py-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={`#${link.href}`}
                    onClick={(e) => handleScrollTo(e, link.href)}
                    className="text-muted-foreground block text-lg"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-border space-y-4 border-t pt-6">
                  {isSessionActive ? (
                    <Link href="/home" passHref>
                      <Button className="animated-gradient w-full bg-gradient-to-r from-orange-500 to-pink-500 py-6 text-lg text-white">
                        Continue to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link href="/auth/sign-in" passHref>
                        <Button
                          variant="outline"
                          className="w-full py-6 text-lg"
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/auth/sign-up" passHref>
                        <Button className="animated-gradient w-full bg-gradient-to-r from-orange-500 to-pink-500 py-6 text-lg text-white">
                          Get Started Free
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* --- Main Content Wrapper --- */}
      <main id="hero" className="pt-20">
        {/* --- Hero Section --- */}
        <section className="px-4 pt-16 pb-24 sm:px-6 sm:pt-20 sm:pb-32 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <motion.div variants={fadeUp}>
                <Badge>
                  <Sparkles className="mr-2 h-4 w-4" />
                  The Future of Sound is Here
                </Badge>
              </motion.div>

              <motion.div variants={staggerContainer} className="mt-6 mb-8">
                <h1 className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
                  {headlineWords.map((word, i) => (
                    <span key={i} className="inline-block overflow-hidden">
                      <motion.span
                        variants={revealWord}
                        className="inline-block"
                      >
                        {word}&nbsp;
                      </motion.span>
                    </span>
                  ))}
                </h1>
                <div className="overflow-hidden">
                  <motion.h1
                    className="text-primary block text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
                    variants={revealWord}
                  >
                    Generate it with one prompt.
                  </motion.h1>
                </div>
              </motion.div>

              <motion.p
                className="text-muted-foreground mx-auto mb-12 max-w-3xl text-lg sm:text-xl"
                variants={fadeUp}
              >
                Stop searching. Describe the sound you imagine, and let our AI
                compose a unique, professional-quality soundtrack for your
                project in seconds.
              </motion.p>

              <motion.div
                className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                variants={fadeUp}
              >
                {isSessionActive ? (
                  <Link href="/home" passHref>
                    <Button
                      size="lg"
                      className="animated-gradient w-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-7 text-lg text-white sm:w-auto"
                    >
                      Continue to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/sign-up" passHref>
                    <Button
                      size="lg"
                      className="animated-gradient w-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-7 text-lg text-white sm:w-auto"
                    >
                      Start Creating For Free
                    </Button>
                  </Link>
                )}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full px-8 py-7 text-lg sm:w-auto"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    See How It Works
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="mx-auto mt-20 max-w-5xl"
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="text-left">
                      <h3 className="text-lg font-semibold">
                        Example Generated Track
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Prompt: &quot;Lofi hip hop beat, chill, good for
                        studying&ldquo;
                      </p>
                    </div>
                    <Button
                      size="icon"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="h-14 w-14 flex-shrink-0"
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6" />
                      )}
                    </Button>
                  </div>
                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <motion.div
                      className="bg-primary h-2"
                      initial={{ width: "0%" }}
                      animate={{ width: isPlaying ? "100%" : "0%" }}
                      transition={{ duration: 15, ease: "linear" }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* --- Features Section --- */}
        <section id="features" className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              className="mb-20 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeUp}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                From Idea to Full Track in Seconds
              </h2>
              <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-lg">
                Unleash your creativity without the technical hurdles. Our AI
                handles the complexity, so you can focus on your vision.
              </p>
            </motion.div>
            <motion.div
              className="grid gap-12 md:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {[
                {
                  icon: Zap,
                  title: "Instant Generation",
                  description:
                    "Why wait for inspiration? Describe any sound and get a high-quality, ready-to-use track in under 30 seconds.",
                },
                {
                  icon: Shield,
                  title: "Worry-Free Licensing",
                  description:
                    "Every track is 100% royalty-free. Use your music on any platform, for any project, forever. No copyright strikes.",
                },
                {
                  icon: Users,
                  title: "Infinite Styles",
                  description:
                    "Explore any genre imaginable, from cinematic orchestral scores to energetic electronic beats, all from a single prompt.",
                },
              ].map((feature) => (
                <motion.div key={feature.title} variants={fadeUp}>
                  <div className="text-center">
                    <div className="bg-primary/10 mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-lg">
                      <feature.icon className="text-primary h-8 w-8" />
                    </div>
                    <h3 className="mb-4 text-xl font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* --- Use Cases Section --- */}
        <section
          id="use-cases"
          className="bg-secondary/50 px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <motion.div
              className="mb-20 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeUp}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                The Perfect Soundtrack for Every Project
              </h2>
            </motion.div>
            <Tabs
              defaultValue="content-creators"
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as UseCaseKey)}
              className="w-full"
            >
              <TabsList className="relative mb-12 grid h-auto w-full grid-cols-2 md:grid-cols-4">
                {(Object.keys(useCases) as UseCaseKey[]).map((key) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className={
                      "relative py-3 text-base data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none"
                    }
                  >
                    {activeTab === key && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 z-0 rounded-md bg-gradient-to-r from-orange-500 to-pink-500"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className={`relative z-10 flex items-center`}>
                      {key === "content-creators" && (
                        <Headphones className="mr-2 h-5 w-5" />
                      )}
                      {key === "filmmakers" && (
                        <Film className="mr-2 h-5 w-5" />
                      )}
                      {key === "game-developers" && (
                        <Gamepad2 className="mr-2 h-5 w-5" />
                      )}
                      {key === "podcasters" && <Mic className="mr-2 h-5 w-5" />}
                      {useCases[key].title.replace("For ", "")}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <TabsContent value={activeTab} forceMount>
                    <Card className="bg-card/50 mx-auto max-w-5xl">
                      <CardContent className="p-8 sm:p-12">
                        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
                          <div>
                            <h3 className="mb-4 text-2xl font-bold">
                              {useCases[activeTab].title}
                            </h3>
                            <p className="text-muted-foreground mb-6 text-lg">
                              {useCases[activeTab].description}
                            </p>
                            <ul className="space-y-3">
                              {useCases[activeTab].features.map((feature) => (
                                <li key={feature} className="flex items-center">
                                  <div className="bg-primary mr-3 h-2 w-2 flex-shrink-0 rounded-full" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="from-primary/10 to-secondary flex aspect-square flex-col items-center justify-center rounded-lg bg-gradient-to-br p-8 text-center">
                            <Music className="text-primary mx-auto mb-4 h-20 w-20" />
                            <p className="text-lg font-semibold">
                              Your Vision, Your Sound
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </div>
        </section>

        {/* --- Pricing Section --- */}
        <section id="pricing" className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeUp}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
              Start for free and pay only when you want more. No subscriptions,
              no hidden fees—just music, your way.
            </p>
          </motion.div>

          <motion.div
            className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Free Tier */}
            <motion.div variants={fadeUp}>
              <Card className="flex h-full flex-col">
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>
                    Experiment and enjoy public tracks.
                  </CardDescription>
                  <p className="pt-4 text-4xl font-bold">$0</p>
                </CardHeader>
                <CardContent className="flex flex-grow flex-col justify-between">
                  <ul className="mb-8 space-y-4">
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />3 Credits per
                      month to create your own tracks
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      Listen to unlimited Public Music (MP3)
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      Download your own creations in full MP3
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      Preview Public Music downloads (30 sec, MP3 with
                      Watermark)
                    </li>
                    <li className="flex items-center">
                      <X className="mr-2 text-red-500" />
                      Download Public Music in High-Quality WAV
                    </li>
                  </ul>
                  <Button onClick={handleUpgrade} variant="outline" className="w-full">
                    Start Free & Create Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Creator Pack - Highlighted in middle */}
            <motion.div variants={fadeUp}>
              <Card className="relative flex h-full flex-col border-2 border-pink-500">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                  Most Popular
                </Badge>
                <CardHeader>
                  <CardTitle>Creator Pack</CardTitle>
                  <CardDescription>
                    Unlock full power to create, listen, and download without
                    limits.
                  </CardDescription>
                  <p className="pt-4 text-4xl font-bold">$7</p>
                </CardHeader>
                <CardContent className="flex flex-grow flex-col justify-between">
                  <ul className="mb-8 space-y-4">
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      30 Credits for unlimited creativity
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      Listen to all Public Music (MP3/WAV)
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      Create Your Own Music (30 Credits)
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      Download your creations in High-Quality WAV
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      No Watermarks on any downloads
                    </li>
                  </ul>
                  <Button onClick={handleUpgrade} className="animated-gradient w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                    Unlock 30 Credits & Go Pro
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Starter Pack */}
            <motion.div variants={fadeUp}>
              <Card className="flex h-full flex-col">
                <CardHeader>
                  <CardTitle>Starter Pack</CardTitle>
                  <CardDescription>
                    Perfect for casual creators who want more downloads and
                    freedom.
                  </CardDescription>
                  <p className="pt-4 text-4xl font-bold">$3</p>
                </CardHeader>
                <CardContent className="flex flex-grow flex-col justify-between">
                  <ul className="mb-8 space-y-4">
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      10 Credits to create your own tracks
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      Listen to all Public Music (MP3)
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      Download your creations in High-Quality WAV
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      No Watermark-free downloads for Public Music
                    </li>
                    <li className="flex items-center">
                      <X className="mr-2 text-red-500" />
                      Download Public Music in High-Quality WAV
                    </li>
                  </ul>
                  <Button onClick={handleUpgrade} variant="outline" className="w-full">
                    Get Starter Pack & Level Up
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* --- Final CTA Section --- */}
        <section className="py-24 sm:py-32">
          <motion.div
            className="mx-auto max-w-4xl px-4 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeUp}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Ready to Create Your Signature Sound?
            </h2>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
              Generate your first few tracks completely free. Discover the power
              of AI music generation today.
            </p>
            <motion.div className="mt-10">
              <Button
                size="lg"
                className="animated-gradient bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-7 text-lg text-white"
              >
                Sign Up and Start Creating
              </Button>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-secondary/50 border-t px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {/* Logo + Tagline */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center">
                <Link href="hero" onClick={(e) => handleScrollTo(e, "hero")}>
                  <Image
                    className="h-12 w-auto sm:h-14 lg:h-20" // responsive sizing
                    alt="Beatflow logo"
                    src="/mainLogo.png"
                    width={200} // intrinsic for Next.js optimization
                    height={80}
                    priority
                  />
                </Link>
              </div>
              <p className="text-muted-foreground mt-4 text-sm">
                The future of sound, created by you.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-semibold">Product</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <a
                    href="#features"
                    onClick={(e) => handleScrollTo(e, "features")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    onClick={(e) => handleScrollTo(e, "pricing")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-semibold">Company</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="font-semibold">Legal</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link
                    href="/Privacy"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/Terms"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="text-muted-foreground mt-12 border-t pt-8 text-center text-sm">
            © {new Date().getFullYear()} Beatflow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
