/**
 * Recovery Glossary Page
 *
 * A knowledge base of 30 recovery terms organized by category.
 * Targets featured snippets for queries like "what is a sobriety coin"
 * and "AA chip meaning".
 */

import {useState, useMemo} from 'react';
import {Link, useLoaderData} from 'react-router';
import type {MetaFunction} from 'react-router';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {JsonLd} from '~/components/seo/JsonLd';
import {ResourcesNav} from '~/components/resources/ResourcesNav';
import {GlossarySearch} from '~/components/resources/GlossarySearch';
import {CategoryPills} from '~/components/resources/CategoryPills';
import {AlphabetNav} from '~/components/resources/AlphabetNav';
import {GlossaryTermCard} from '~/components/resources/GlossaryTermCard';
import {Button} from '~/components/ui/Button';
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
} from '~/components/ui/Animations';
import {
  GLOSSARY_TERMS,
  GLOSSARY_CATEGORIES,
  type GlossaryCategory,
  type GlossaryTerm,
} from '~/data/glossary-terms';

export const meta: MetaFunction = () => {
  return [
    {title: 'Recovery Glossary — Recovery Token Store'},
    {
      name: 'description',
      content:
        'Learn the meaning of sobriety coins, AA chips, clean time, and 30+ recovery terms. A comprehensive glossary for anyone on the recovery journey.',
    },
  ];
};

export async function loader() {
  return {
    terms: GLOSSARY_TERMS,
    categories: GLOSSARY_CATEGORIES,
  };
}

export default function GlossaryPage() {
  const {terms, categories} = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] =
    useState<GlossaryCategory | null>(null);

  // Filter terms based on search and category
  const filteredTerms = useMemo(() => {
    let result = terms as GlossaryTerm[];
    if (activeCategory) {
      result = result.filter((t) => t.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q),
      );
    }
    return result;
  }, [terms, searchQuery, activeCategory]);

  // Group filtered terms by first letter (numbers grouped under #)
  const groupedTerms = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    for (const term of filteredTerms) {
      const firstChar = term.name[0].toUpperCase();
      const letter = /[A-Z]/.test(firstChar) ? firstChar : '#';
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(term);
    }
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === '#') return -1;
      if (b === '#') return 1;
      return a.localeCompare(b);
    });
  }, [filteredTerms]);

  // Active letters for alphabet nav
  const activeLetters = useMemo(
    () => new Set(groupedTerms.map(([letter]) => letter)),
    [groupedTerms],
  );

  // Schema.org structured data
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'Recovery Glossary',
    description:
      'A comprehensive glossary of recovery and sobriety terms, including definitions for sobriety coins, AA chips, clean time, and more.',
    url: 'https://recoverytokenstore.com/resources/glossary',
    hasDefinedTerm: (terms as GlossaryTerm[]).map((term) => ({
      '@type': 'DefinedTerm',
      name: term.name,
      description: term.definition,
      inDefinedTermSet: 'https://recoverytokenstore.com/resources/glossary',
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://recoverytokenstore.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Resources',
        item: 'https://recoverytokenstore.com/resources',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Glossary',
        item: 'https://recoverytokenstore.com/resources/glossary',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={jsonLdData} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Header Section */}
      <section className="bg-surface py-12 md:py-16">
        <div className="container-standard">
          <Breadcrumbs
            items={[
              {label: 'Resources', href: '/resources/glossary'},
              {label: 'Glossary'},
            ]}
            className="mb-6"
          />

          <ResourcesNav />

          <FadeUp className="mt-10 max-w-2xl">
            <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
              Knowledge Base
            </span>
            <h1 className="font-display text-hero text-primary leading-tight mb-4">
              Recovery Glossary
            </h1>
            <p className="text-body-lg text-secondary">
              A comprehensive guide to the terms, traditions, and symbols of
              the recovery community. Whether you&apos;re new to recovery or
              supporting someone on their journey, this glossary is here to help.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-black/5 py-4">
        <div className="container-standard space-y-4">
          <div className="grid md:grid-cols-[1fr_auto] gap-4 items-start">
            <GlossarySearch value={searchQuery} onChange={setSearchQuery} />
          </div>
          <CategoryPills
            categories={categories as GlossaryCategory[]}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>
      </section>

      {/* Alphabet Nav */}
      <section className="py-4 border-b border-black/5">
        <div className="container-standard">
          <AlphabetNav activeLetters={activeLetters} />
        </div>
      </section>

      {/* Terms List */}
      <section className="py-12 md:py-16">
        <div className="container-standard">
          {groupedTerms.length > 0 ? (
            <div className="space-y-12">
              {groupedTerms.map(([letter, letterTerms]) => (
                <div key={letter} id={`letter-${letter}`}>
                  <FadeUp>
                    <h2 className="font-display text-2xl font-bold text-primary mb-6 pb-2 border-b border-black/10">
                      {letter}
                    </h2>
                  </FadeUp>
                  <StaggerContainer
                    className="grid gap-4 md:grid-cols-2"
                    staggerDelay={0.05}
                  >
                    {letterTerms.map((term) => (
                      <StaggerItem key={term.id}>
                        <GlossaryTermCard term={term} />
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <FadeUp className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-display text-xl font-bold text-primary mb-2">
                No matching terms
              </h3>
              <p className="text-body text-secondary max-w-md mx-auto">
                We couldn&apos;t find any terms matching your search. Try a
                different keyword or clear your filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory(null);
                }}
                className="mt-6 text-accent font-medium hover:text-accent/80 transition-colors"
              >
                Clear all filters
              </button>
            </FadeUp>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 md:py-20 bg-surface">
        <div className="container-standard text-center">
          <FadeUp>
            <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
              Explore More
            </span>
            <h2 className="font-display text-section text-primary mb-4">
              Continue Your Journey
            </h2>
            <p className="text-body-lg text-secondary max-w-xl mx-auto mb-8">
              Discover how many milestones you&apos;ve achieved or find the
              perfect token to celebrate your progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/resources/milestone-calculator">
                <Button variant="primary" size="lg">
                  Try the Milestone Calculator
                </Button>
              </Link>
              <Link to="/collections">
                <Button variant="secondary" size="lg">
                  Shop Recovery Tokens
                </Button>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
