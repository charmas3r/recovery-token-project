import {useEffect, useState} from 'react';

export default function StudioPage() {
  const [Studio, setStudio] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    Promise.all([
      import('sanity'),
      import('../sanity.config'),
    ]).then(([{Studio: SanityStudio}, {default: config}]) => {
      setStudio(() =>
        function EmbeddedStudio() {
          return <SanityStudio config={config} />;
        },
      );
    });
  }, []);

  if (!Studio) {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          position: 'fixed',
          top: 0,
          left: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#101112',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        Loading Studio...
      </div>
    );
  }

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'auto',
      }}
    >
      <Studio />
    </div>
  );
}

export function meta() {
  return [
    {title: 'Recovery Token Store — Studio'},
    {name: 'robots', content: 'noindex, nofollow'},
  ];
}
