import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Header />
      <main className="flex-1 fade-in" style={{ maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%', padding: '0 1.5rem' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
