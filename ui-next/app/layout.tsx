import './globals.css';
import Sidebar from '../components/Sidebar';

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
          <div className="layout">
            <aside className="sidebar">
              <Sidebar />
            </aside>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
