import './globals.css';
import Sidebar from '../components/Sidebar';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const KpiStats = dynamic(() => import('../components/KpiStats'), { ssr: false });

export const metadata = {
  title: 'LINE Bot MCP UI',
  description: 'Minimal UI to call MCP tools',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div className="container">
          {/* Live KPI overview */}
          <KpiStats />

          {/* Main 2‑pane layout */}
          <div className="layout">
            <aside className="sidebar">
              <Suspense fallback={<div className="muted">Loading...</div>}>
                <Sidebar />
              </Suspense>
            </aside>
            <Suspense fallback={<section className="card"><div className="section">Loading...</div></section>}>
              {children}
            </Suspense>
          </div>
        </div>
      </body>
    </html>
  );
}
