import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';
import {useNavigate} from 'react-router';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 * Automatically loads the next page when the user scrolls near the bottom.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  resourcesClassName?: string;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink, hasNextPage, nextPageUrl, state}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div>
            <PreviousLink>
              {isLoading ? 'Loading...' : <span>↑ Load previous</span>}
            </PreviousLink>
            {resourcesClassName ? (
              <div className={resourcesClassName}>{resourcesMarkup}</div>
            ) : (
              resourcesMarkup
            )}
            {hasNextPage && (
              <InfiniteScrollTrigger
                nextPageUrl={nextPageUrl}
                isLoading={isLoading}
                state={state}
              />
            )}
          </div>
        );
      }}
    </Pagination>
  );
}

function InfiniteScrollTrigger({
  nextPageUrl,
  isLoading,
  state,
}: {
  nextPageUrl: string;
  isLoading: boolean;
  state: unknown;
}) {
  const navigate = useNavigate();
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const loadingRef = React.useRef(false);

  React.useEffect(() => {
    loadingRef.current = isLoading;
  }, [isLoading]);

  React.useEffect(() => {
    const element = triggerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current) {
          navigate(nextPageUrl, {
            replace: true,
            preventScrollReset: true,
            state,
          });
        }
      },
      {rootMargin: '200px'},
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [nextPageUrl, navigate, state]);

  return (
    <div ref={triggerRef} className="flex justify-center py-8">
      {isLoading && (
        <div className="text-white/50 text-body">Loading...</div>
      )}
    </div>
  );
}
