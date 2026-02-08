/**
 * Milestone Calculator Page
 *
 * An interactive tool where users enter their sobriety date
 * and see milestones achieved/upcoming.
 * Targets "sobriety calculator" and "how many days sober am I".
 */

import {useState, useMemo} from 'react';
import {Link, useLoaderData} from 'react-router';
import type {MetaFunction} from 'react-router';
import {Calendar} from 'lucide-react';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {Button} from '~/components/ui/Button';
import {JsonLd} from '~/components/seo/JsonLd';
import {ResourcesNav} from '~/components/resources/ResourcesNav';
import {MilestoneResults} from '~/components/resources/MilestoneResults';
import {ScaleIn, motion} from '~/components/ui/Animations';
import {
  MILESTONES,
  calculateMilestones,
  type CalculationResult,
} from '~/data/milestones';

export const meta: MetaFunction = () => {
  return [
    {title: 'Sobriety Milestone Calculator — Recovery Token Store'},
    {
      name: 'description',
      content:
        'Enter your sobriety date to see how many days sober you are, milestones achieved, and what\'s coming next. Free recovery milestone calculator.',
    },
  ];
};

export async function loader() {
  return {
    milestones: MILESTONES,
  };
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function getDaysInMonth(month: number, year: number): number {
  if (!month || !year) return 31;
  return new Date(year, month, 0).getDate();
}

export default function MilestoneCalculatorPage() {
  useLoaderData<typeof loader>();
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () =>
      Array.from({length: 80}, (_, i) => currentYear - i),
    [currentYear],
  );

  const maxDays = getDaysInMonth(Number(month), Number(year));
  const days = Array.from({length: maxDays}, (_, i) => i + 1);

  function handleCalculate() {
    setError('');
    setResult(null);

    if (!month || !day || !year) {
      setError('Please select a complete date.');
      return;
    }

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
    );
    if (isNaN(date.getTime())) {
      setError('Please enter a valid date.');
      return;
    }

    if (date > new Date()) {
      setError('The sobriety date cannot be in the future.');
      return;
    }

    setResult(calculateMilestones(date));
  }

  const selectClasses =
    'w-full h-14 px-4 rounded-xl bg-surface/50 text-body text-primary transition-all duration-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-accent/20 focus:shadow-sm appearance-none cursor-pointer';

  // Schema.org structured data
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Sobriety Milestone Calculator',
    description:
      'Calculate how many days sober you are and see your recovery milestones achieved and upcoming.',
    url: 'https://recoverytokenstore.com/resources/milestone-calculator',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
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
        name: 'Milestone Calculator',
        item: 'https://recoverytokenstore.com/resources/milestone-calculator',
      },
    ],
  };

  const hasDate = month && day && year;

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={jsonLdData} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Header Section */}
      <section className="bg-surface py-12 md:py-16">
        <div className="container-standard">
          <Breadcrumbs
            items={[
              {label: 'Resources', href: '/resources'},
              {label: 'Milestone Calculator'},
            ]}
            className="mb-6"
          />

          <ResourcesNav />

          <div style={{marginTop: '2.5rem', textAlign: 'center', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto'}}>
            <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '1rem'}}>
              Recovery Tools
            </span>
            <h1 style={{fontFamily: 'var(--font-display, serif)', fontSize: '3rem', fontWeight: 700, color: '#1A202C', lineHeight: 1.1, marginBottom: '1rem'}}>
              Milestone Calculator
            </h1>
            <p style={{fontSize: '1.125rem', lineHeight: 1.6, color: '#4A5568', maxWidth: '36rem', marginLeft: 'auto', marginRight: 'auto'}}>
              Enter your sobriety date to see how far you&apos;ve come. Every
              day is an achievement worth recognizing.
            </p>
          </div>
        </div>
      </section>

      {/* Calculator Input */}
      <section className="py-12 md:py-16">
        <div className="container-standard max-w-2xl mx-auto px-4">
          <ScaleIn>
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-black/5">
              {/* Calendar icon + label */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mb-4">
                  <Calendar className="w-7 h-7 text-accent" />
                </div>
                <p className="font-display text-lg font-semibold text-primary">
                  When did your recovery journey begin?
                </p>
              </div>

              {/* Three-column date selector */}
              <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
                {/* Month */}
                <div>
                  <label
                    htmlFor="calc-month"
                    className="block text-caption font-medium text-secondary mb-2 uppercase tracking-wider"
                  >
                    Month
                  </label>
                  <div className="relative">
                    <select
                      id="calc-month"
                      value={month}
                      onChange={(e) => {
                        setMonth(e.target.value);
                        setError('');
                      }}
                      className={selectClasses}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        paddingRight: '2.5rem',
                      }}
                    >
                      <option value="">Month</option>
                      {MONTHS.map((m, i) => (
                        <option key={m} value={String(i + 1)}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Day */}
                <div>
                  <label
                    htmlFor="calc-day"
                    className="block text-caption font-medium text-secondary mb-2 uppercase tracking-wider"
                  >
                    Day
                  </label>
                  <div className="relative">
                    <select
                      id="calc-day"
                      value={day}
                      onChange={(e) => {
                        setDay(e.target.value);
                        setError('');
                      }}
                      className={selectClasses}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        paddingRight: '2.5rem',
                      }}
                    >
                      <option value="">Day</option>
                      {days.map((d) => (
                        <option key={d} value={String(d)}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Year */}
                <div>
                  <label
                    htmlFor="calc-year"
                    className="block text-caption font-medium text-secondary mb-2 uppercase tracking-wider"
                  >
                    Year
                  </label>
                  <div className="relative">
                    <select
                      id="calc-year"
                      value={year}
                      onChange={(e) => {
                        setYear(e.target.value);
                        setError('');
                      }}
                      className={selectClasses}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        paddingRight: '2.5rem',
                      }}
                    >
                      <option value="">Year</option>
                      {years.map((y) => (
                        <option key={y} value={String(y)}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-body-sm text-error mb-4 text-center">
                  {error}
                </p>
              )}

              <motion.div
                whileHover={{scale: 1.01}}
                whileTap={{scale: 0.99}}
                transition={{duration: 0.15}}
              >
                <Button
                  variant="primary"
                  size="lg"
                  className={`w-full !h-14 !text-lg !rounded-xl ${
                    hasDate
                      ? '!bg-accent !text-white'
                      : ''
                  }`}
                  onClick={handleCalculate}
                >
                  Calculate My Milestones
                </Button>
              </motion.div>

              <p className="text-caption text-secondary/50 mt-5 text-center">
                Your date is never stored or shared. This calculator runs
                entirely in your browser.
              </p>
            </div>
          </ScaleIn>
        </div>
      </section>

      {/* Results */}
      {result && (
        <section className="pb-12 md:pb-16">
          <div className="container-standard max-w-3xl mx-auto">
            <MilestoneResults result={result} />
          </div>
        </section>
      )}

      {/* Bottom CTA - Always visible */}
      <section className="py-16 md:py-20 bg-surface">
        <div style={{maxWidth: '1280px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '1.5rem', paddingRight: '1.5rem', textAlign: 'center'}}>
          <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '1rem'}}>
            Celebrate Every Milestone
          </span>
          <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.75rem', fontWeight: 700, color: '#1A202C', lineHeight: 1.3, marginBottom: '1rem'}}>
            Your Journey Deserves Recognition
          </h2>
          <p style={{fontSize: '1.125rem', lineHeight: 1.6, color: '#4A5568', maxWidth: '36rem', marginLeft: 'auto', marginRight: 'auto', marginBottom: '2rem'}}>
            Whether it&apos;s day one or year twenty-five, every step forward
            matters. Find a token that honors your progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/collections">
              <Button
                variant="primary"
                size="lg"
                className="!bg-accent !text-white"
              >
                Shop Recovery Tokens
              </Button>
            </Link>
            <Link to="/resources/glossary">
              <Button variant="secondary" size="lg">
                Explore the Glossary
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
