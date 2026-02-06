/**
 * MilestoneResults - Results container with stat counters, achieved list, next milestone
 */

import {Link} from 'react-router';
import {ArrowRight} from 'lucide-react';
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
  CountUp,
} from '~/components/ui/Animations';
import {MilestoneCard} from './MilestoneCard';
import {ShareResults} from './ShareResults';
import type {CalculationResult} from '~/data/milestones';

interface MilestoneResultsProps {
  result: CalculationResult;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function MilestoneResults({result}: MilestoneResultsProps) {
  const {totalDays, years, months, days, achieved, next} = result;

  return (
    <div className="space-y-12">
      {/* Summary Stats */}
      <FadeUp>
        <StaggerContainer
          className="grid grid-cols-3 gap-4 md:gap-8"
          staggerDelay={0.15}
        >
          <StaggerItem>
            <div className="text-center bg-white rounded-2xl p-6 shadow-sm border border-black/5">
              <div className="font-display text-3xl md:text-4xl font-bold text-accent">
                <CountUp end={totalDays} duration={2} />
              </div>
              <p className="text-body-sm text-secondary mt-1">Days</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="text-center bg-white rounded-2xl p-6 shadow-sm border border-black/5">
              <div className="font-display text-3xl md:text-4xl font-bold text-accent">
                <CountUp end={months + years * 12} duration={1.5} />
              </div>
              <p className="text-body-sm text-secondary mt-1">Months</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="text-center bg-white rounded-2xl p-6 shadow-sm border border-black/5">
              <div className="font-display text-3xl md:text-4xl font-bold text-accent">
                <CountUp end={years} duration={1} />
              </div>
              <p className="text-body-sm text-secondary mt-1">Years</p>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </FadeUp>

      {/* Achieved Milestones */}
      {achieved.length > 0 && (
        <div>
          <FadeUp>
            <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
              Milestones Achieved
            </span>
            <h2 className="font-display text-subsection text-primary mb-6">
              Look How Far You&apos;ve Come
            </h2>
          </FadeUp>
          <StaggerContainer
            className="grid gap-4 md:grid-cols-2"
            staggerDelay={0.05}
          >
            {achieved.map(({milestone, dateAchieved}) => (
              <StaggerItem key={milestone.id}>
                <MilestoneCard
                  emoji={milestone.emoji}
                  label={milestone.label}
                  description={milestone.description}
                  dateLabel={`Achieved ${formatDate(dateAchieved)}`}
                  shopLink={milestone.shopLink}
                  variant="achieved"
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      )}

      {/* Next Milestone */}
      {next && (
        <FadeUp>
          <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
            Coming Up Next
          </span>
          <h2 className="font-display text-subsection text-primary mb-6">
            Your Next Milestone
          </h2>
          <MilestoneCard
            emoji={next.milestone.emoji}
            label={next.milestone.label}
            description={next.milestone.description}
            dateLabel={`${next.daysRemaining} day${next.daysRemaining !== 1 ? 's' : ''} away — ${formatDate(next.targetDate)}`}
            shopLink={next.milestone.shopLink}
            variant="next"
          />
          <p className="text-body text-secondary mt-4 text-center">
            Keep going — you&apos;re doing incredible work. Every single day
            matters.
          </p>
        </FadeUp>
      )}

      {/* All milestones passed */}
      {!next && achieved.length > 0 && (
        <FadeUp className="text-center py-8">
          <div className="text-5xl mb-4">🌟</div>
          <h2 className="font-display text-subsection text-primary mb-2">
            You&apos;ve Reached Every Milestone
          </h2>
          <p className="text-body text-secondary max-w-md mx-auto">
            Your recovery journey is truly extraordinary. You are an
            inspiration to everyone around you.
          </p>
        </FadeUp>
      )}

      {/* Share Section */}
      <FadeUp className="text-center pt-4">
        <p className="text-body-sm text-secondary mb-4">
          Proud of your progress? Share it.
        </p>
        <ShareResults
          totalDays={totalDays}
          years={years}
          months={months}
          days={days}
        />
      </FadeUp>

      {/* Shop CTA */}
      <FadeUp className="text-center pt-4">
        <Link
          to="/collections"
          className="inline-flex items-center gap-2 text-accent font-semibold hover:text-accent/80 transition-colors group"
        >
          Celebrate with a recovery token
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </FadeUp>
    </div>
  );
}
