import './globals.css';

export const metadata = {
  title: 'EcoTrack — Carbon Footprint Awareness Platform',
  description: 'Track, understand, and reduce your carbon footprint with AI-powered insights, gamified challenges, and real-time analytics. Built for India.',
  keywords: 'carbon footprint, sustainability, eco, green living, India, climate change',
  openGraph: {
    title: 'EcoTrack — Carbon Footprint Awareness Platform',
    description: 'AI-powered carbon footprint tracker with personalized suggestions and green challenges.',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>" />
      </head>
      <body>
        <div className="bg-animated" aria-hidden="true">
          <div className="bg-blob bg-blob-1" />
          <div className="bg-blob bg-blob-2" />
          <div className="bg-blob bg-blob-3" />
        </div>
        <div className="bg-grid" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
