"use client";

import { useState, type MouseEvent, useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  type Variants,
  AnimatePresence,
  type Easing,
} from "motion/react";
import {
  Play,
  Pause,
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
  Wand2,
  PenSquare,
  Globe
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
import type { Song } from "@prisma/client";
import { getPlayUrlForLandingPage as getPlayUrl } from "@/actions/generation";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { SongCard } from "./landingSongCard";

type SongWithUrl = Song & {
  thumbnailUrl: string | null;
  categories: {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
};

type SongsWithUrl = SongWithUrl[];

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
    src: "/tab/youtuber.png",
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
    src: "/tab/filerMaker.png",
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
    src: "/tab/gamedev.png",
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
    src: "/tab/podcaster.png",
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
  songs,
}: {
  isSessionActive: boolean;
  songs: SongsWithUrl;
}) {
  const [activeTab, setActiveTab] = useState<UseCaseKey>("content-creators");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [howItWorksTab, setHowItWorksTab] = useState("simple-mode");
  const [isExpanded, setIsExpanded] = useState(false);

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
    setTimeout(() => {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  const handleUpgrade = async () => {
    if (!isSessionActive) {
      redirect("/auth/sign-in");
    }

    await authClient.checkout({
      products: [
        process.env.NEXT_PUBLIC_PRODUCT_ID_MID!,
        process.env.NEXT_PUBLIC_PRODUCT_ID_MAX!,
      ],
    });
  };

  const handleRedirect = () => {
    if (!isSessionActive) {
      redirect("/auth/sign-in");
    }
    redirect("/home");
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeSong, setActiveSong] = useState<string | null>(null); // current songId loaded in player
  const [isPlaying, setIsPlaying] = useState<boolean | null>(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loadedUrls, setLoadedUrls] = useState<Record<string, string>>({});

  const handlePlay = async (songId: string) => {
    try {
      setIsLoading(songId);

      let playUrl = loadedUrls[songId];
      if (!playUrl) {
        const fetchedUrl = await getPlayUrl(songId);
        if (!fetchedUrl) throw new Error("Failed to get play URL");
        playUrl = fetchedUrl;
        setLoadedUrls((prev) => ({ ...prev, [songId]: fetchedUrl }));
      }

      if (audioRef.current) {
        // If switching songs, set new src
        if (activeSong !== songId) {
          audioRef.current.src = playUrl;
          audioRef.current.currentTime = 0;
          setActiveSong(songId);
        }

        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Play error:", err);
      setIsPlaying(false);
    } finally {
      setIsLoading(null);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const navLinks = [
    { href: "features", label: "Features" },
    { href: "use-cases", label: "Use Cases" },
    { href: "how-it-works", label: "How it works" },
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

      <audio
        ref={audioRef}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onEnded={() => {
          setIsPlaying(null);
          setCurrentTime(0);
        }}
        onError={() => {
          console.error("Audio playback error");
          setIsPlaying(null);
          setIsLoading(null);
        }}
        preload="none"
      />

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
        <div className="relative z-50 mx-auto h-20 max-w-7xl px-4 sm:px-6 lg:px-8">
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
            <>
              <motion.div
                className="fixed inset-0 z-10 h-screen bg-black/20 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              <motion.div
                className="bg-card border-border relative z-50 border-t md:hidden"
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
            </>
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
                  <a
                    href="https://youtu.be/cRrX_xsLS1E"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full px-8 py-7 text-lg sm:w-auto"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      See How It Works
                    </Button>
                  </a>
                </motion.div>
              </motion.div>
            </motion.div>
            {songs.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                index={index}
                activeSong={activeSong}
                isPlaying={isPlaying}
                isLoading={isLoading}
                duration={duration}
                currentTime={currentTime}
                handlePlay={handlePlay}
                handlePause={handlePause}
              />
            ))}
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
              className="grid gap-12 md:grid-cols-4"
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
                {
                  icon: Globe, 
                  title: "Multi-Lingual Support",
                  description:
                    "Create music in any language. Write prompts in English, Spanish, Japanese, French, Korean and more. Your creativity has no borders.",
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
                      "relative cursor-pointer py-3 text-base data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none"
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
                          <div className="from-primary/10 to-secondary flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br p-8">
                            <Image
                              src={useCases[activeTab].src}
                              alt="Use case illustration"
                              className="h-full w-full object-contain"
                              fill={false} // don’t use fill since you already give h/w
                              width={300} // arbitrary fallback
                              height={300}
                              priority
                            />
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

        {/* --- How It Works Section --- */}
        <section
          id="how-it-works"
          className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
        >
          <motion.div
            className="mx-auto max-w-7xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            // ✅ This container will orchestrate the animations of its children
            variants={staggerContainer}
          >
            {/* This motion.div is now a child and will use the stagger effect */}
            <motion.div className="mb-20 text-center" variants={fadeUp}>
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                Create in 3 Simple Steps
              </h2>
              <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-lg">
                Our intuitive creation panel makes it easy to bring your ideas
                to life, whether you want a quick track or a fully customized
                song.
              </p>
            </motion.div>

            {/* This is the container for the Tabs component */}
            <motion.div variants={fadeUp}>
              <Tabs
                defaultValue="simple-mode"
                className="w-full"
                onValueChange={setHowItWorksTab}
              >
                <TabsList className="relative mx-auto mb-12 grid h-auto w-full max-w-md grid-cols-2">
                  <TabsTrigger value="simple-mode" className="py-3 text-base">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Simple Mode
                  </TabsTrigger>
                  <TabsTrigger value="custom-mode" className="py-3 text-base">
                    <PenSquare className="mr-2 h-5 w-5" />
                    Custom Mode
                  </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={howItWorksTab}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <TabsContent value="simple-mode" className="mt-0">
                      <Card className="bg-card/50 mx-auto max-w-3xl">
                        <CardHeader>
                          <CardTitle>1. Describe Your Music</CardTitle>
                          <CardDescription>
                            Just type what you&apos;re imagining. The more
                            descriptive, the better!
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6 pt-0">
                          <div className="space-y-2">
                            <Label htmlFor="simple-prompt">Your Prompt</Label>
                            <Input
                              id="simple-prompt"
                              placeholder="Epic cinematic score for a space battle..."
                              className="py-6 text-base"
                              readOnly
                            />
                          </div>
                          <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <Label htmlFor="instrumental-mode">
                                Instrumental Only
                              </Label>
                              <p className="text-muted-foreground text-sm">
                                No lyrics, just the music.
                              </p>
                            </div>
                            <Switch
                              id="instrumental-mode"
                              defaultChecked={true}
                              aria-readonly
                            />
                          </div>
                          <Button className="animated-gradient w-full bg-gradient-to-r from-orange-500 to-pink-500 py-6 text-lg text-white">
                            <Wand2 className="mr-2 h-5 w-5" />
                            Generate Your Track
                          </Button>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="custom-mode" className="mt-0">
                      <Card className="bg-card/50 mx-auto max-w-4xl">
                        <CardHeader>
                          <CardTitle>Full Creative Control</CardTitle>
                          <CardDescription>
                            Write your own lyrics or have our AI write them for
                            you, then define the perfect style.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                            {/* Left Side: Lyrics */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold">
                                1. Add Your Lyrics
                              </h3>
                              <Tabs
                                defaultValue="auto-lyrics"
                                className="w-full"
                              >
                                <TabsList className="grid w-full grid-cols-2">
                                  <TabsTrigger value="auto-lyrics">
                                    Auto
                                  </TabsTrigger>
                                  <TabsTrigger value="write-lyrics">
                                    Write
                                  </TabsTrigger>
                                </TabsList>
                                <TabsContent
                                  value="auto-lyrics"
                                  className="mt-4"
                                >
                                  <Label htmlFor="auto-lyrics-prompt">
                                    Describe the song&apos;s story
                                  </Label>
                                  <Textarea
                                    placeholder="A song about a lone traveler watching a sunrise..."
                                    id="auto-lyrics-prompt"
                                    className="mt-2"
                                    readOnly
                                  />
                                </TabsContent>
                                <TabsContent
                                  value="write-lyrics"
                                  className="mt-4"
                                >
                                  <Label htmlFor="write-lyrics-input">
                                    Write your own lyrics
                                  </Label>
                                  <Textarea
                                    placeholder={
                                      "(Verse 1)\nIn the quiet of the dawn..."
                                    }
                                    id="write-lyrics-input"
                                    className="mt-2"
                                    readOnly
                                  />
                                </TabsContent>
                              </Tabs>
                            </div>
                            {/* Right Side: Style & Generate */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold">
                                2. Choose a Style
                              </h3>
                              <div className="space-y-2">
                                <Label>
                                  Select or describe the musical style
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="secondary">Lofi</Badge>
                                  <Badge variant="secondary">Bass Heavy</Badge>
                                  <Badge variant="secondary">Orchestral</Badge>
                                  <Badge variant="secondary">8-bit</Badge>
                                  <Badge variant="outline">Custom...</Badge>
                                </div>
                              </div>
                              <div className="pt-8">
                                <Button className="animated-gradient w-full bg-gradient-to-r from-orange-500 to-pink-500 py-6 text-lg text-white">
                                  <Wand2 className="mr-2 h-5 w-5" />
                                  Generate Your Track
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </motion.div>
          </motion.div>
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
              Start for free and pay only when you want more. No subscriptions, no hidden
              fees — just music, your way.
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
                    Try Beatflow and explore public music.
                  </CardDescription>
                  <p className="pt-4 text-4xl font-bold">$0</p>
                </CardHeader>

                <CardContent className="flex flex-grow flex-col justify-between">
                  <ul className="mb-8 space-y-4">
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      1 Free Credit (one-time)
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      Listen to unlimited Public Music (MP3)
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      Download your own creation in MP3
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      Preview Public Music (30 sec, watermarked)
                    </li>
                    <li className="flex items-center">
                      <X className="mr-2 text-red-500" />
                      High-quality WAV downloads
                    </li>
                  </ul>

                  <Button onClick={handleRedirect} variant="outline" className="w-full">
                    Start Free
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Creator Pack */}
            <motion.div variants={fadeUp}>
              <Card className="relative flex h-full flex-col border-2 border-pink-500">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                  Most Popular
                </Badge>

                <CardHeader>
                  <CardTitle>Creator Pack</CardTitle>
                  <CardDescription>
                    Full power unlocked — early-access launch offer 🚀
                  </CardDescription>

                  <div className="pt-4 flex items-end gap-2">
                    <span className="text-lg line-through text-muted-foreground">$5</span>
                    <span className="text-4xl font-bold">$3</span>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-grow flex-col justify-between">
                  <ul className="mb-8 space-y-4">
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      30 Music Generation Credits
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      Listen to all Public Music (MP3 & WAV)
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      Download your creations in High-Quality WAV
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      No watermarks on any downloads
                    </li>
                  </ul>

                  <div>
                    <Button
                      onClick={handleUpgrade}
                      className="animated-gradient w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                    >
                      Unlock 30 Credits for $3
                    </Button>
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                      ⏳ Limited-time launch pricing
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Starter Pack */}
            <motion.div variants={fadeUp}>
              <Card className="flex h-full flex-col">
                <CardHeader>
                  <CardTitle>Starter Pack</CardTitle>
                  <CardDescription>
                    Casual creators — perfect to get started 🎵
                  </CardDescription>

                  <div className="pt-4 flex items-end gap-2">
                    <span className="text-lg line-through text-muted-foreground">$3</span>
                    <span className="text-4xl font-bold">$1</span>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-grow flex-col justify-between">
                  <ul className="mb-8 space-y-4">
                    <li className="flex items-center">
                      <Check className="mr-2 text-green-500" />
                      10 Music Generation Credits
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
                      <X className="mr-2 text-red-500" />
                      Public WAV downloads
                    </li>
                  </ul>

                  <div>
                    <Button onClick={handleUpgrade} variant="outline" className="w-full">
                      Get Starter Pack for $1
                    </Button>
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                      Early supporter discount
                    </p>
                  </div>
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
                onClick={handleRedirect}
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
                    href="/About"
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
