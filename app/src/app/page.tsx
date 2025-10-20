"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { FlipWords } from "@/components/ui/flip-words";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Shield, Zap, Sparkles, Rocket, Target } from "lucide-react";

export default function Home() {
  const t = useTranslations();
  const flipWords = t.raw('hero.flipWords') as string[];

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to content link (mandatory for accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>

      {/* Navigation moved to GlobalHeader in root layout */}

      <main id="main-content">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20"
        >
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-secondary border border-border mb-8"
            >
              <Rocket className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground">
                {t('hero.badge')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-4xl font-bold mb-8 leading-tight"
            >
              <span className="block text-foreground">
                {t('hero.title')}
              </span>
              <div className="flex items-center justify-center gap-3 mt-3">
                <FlipWords
                  words={flipWords}
                  className="text-4xl font-bold text-primary"
                />
              </div>
              <span className="block mt-3 text-primary">
                {t('hero.titleEnd')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="mt-8 text-lg text-muted-foreground max-w-3xl mx-auto leading-normal"
            >
              {t('hero.description')}
              <span className="block mt-2 font-medium text-foreground">
                {t('hero.descriptionHighlight')}
              </span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg min-h-[44px] min-w-[44px] px-8 py-3 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                >
                  <Rocket className="w-5 h-5 mr-2" aria-hidden="true" />
                  {t('hero.ctaPrimary')}
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-border hover:bg-accent hover:text-accent-foreground min-h-[44px] min-w-[44px] px-8 py-3 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                >
                  <Target className="w-5 h-5 mr-2" aria-hidden="true" />
                  {t('hero.ctaSecondary')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-semibold mb-4 text-foreground">
              {t('features.title')}
              <span className="block mt-2 text-primary">
                {t('features.titleHighlight')}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('features.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Target,
                title: t('features.visualWorkflow.title'),
                description: t('features.visualWorkflow.description'),
                delay: 0,
              },
              {
                icon: Building2,
                title: t('features.organize.title'),
                description: t('features.organize.description'),
                delay: 0.1,
              },
              {
                icon: Sparkles,
                title: t('features.linking.title'),
                description: t('features.linking.description'),
                delay: 0.2,
              },
              {
                icon: Zap,
                title: t('features.planning.title'),
                description: t('features.planning.description'),
                delay: 0.3,
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.3, delay: feature.delay }}
                >
                  <Card className="border-2 border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
                    <CardHeader>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4"
                      >
                        <Icon className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
                      </motion.div>
                      <CardTitle className="text-xl font-semibold text-foreground">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.3 }}
          >
            <Card className="relative overflow-hidden bg-primary border-0 text-primary-foreground shadow-2xl">
              <div className="absolute inset-0 bg-grid-white/10" aria-hidden="true" />
              <CardContent className="relative py-16 text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="h-12 w-12 mx-auto mb-6 text-accent" aria-hidden="true" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-4">
                  {t('cta.title')}
                </h2>
                <p className="text-lg mb-10 text-primary-foreground/90 max-w-2xl mx-auto">
                  {t('cta.description')}
                  <span className="block mt-2 font-medium text-primary-foreground">
                    {t('cta.descriptionHighlight')}
                  </span>
                </p>
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-background text-foreground hover:bg-background/90 shadow-xl px-8 py-3 min-h-[44px] min-w-[44px] font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95"
                  >
                    <Rocket className="w-5 h-5 mr-2" aria-hidden="true" />
                    {t('cta.button')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Building2 className="h-6 w-6 text-primary" aria-hidden="true" />
              <span className="text-lg font-bold text-primary">
                {t('app.name')}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}