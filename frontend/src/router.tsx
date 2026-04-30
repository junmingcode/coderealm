import { createBrowserRouter } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';
import Loading from './components/Loading';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const TagPage = lazy(() => import('./pages/TagPage'));
const About = lazy(() => import('./pages/About'));
const SearchResult = lazy(() => import('./pages/SearchResult'));
const Login = lazy(() => import('./pages/Admin/Login'));
const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/Admin/Dashboard'));
const ArticleList = lazy(() => import('./pages/Admin/ArticleList'));
const ArticleEditor = lazy(() => import('./pages/Admin/ArticleEditor'));

function LazyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <LazyWrapper>
            <Home />
          </LazyWrapper>
        ),
      },
      {
        path: 'article/:slug',
        element: (
          <LazyWrapper>
            <ArticleDetail />
          </LazyWrapper>
        ),
      },
      {
        path: 'category/:slug',
        element: (
          <LazyWrapper>
            <CategoryPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'tag/:slug',
        element: (
          <LazyWrapper>
            <TagPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'about',
        element: (
          <LazyWrapper>
            <About />
          </LazyWrapper>
        ),
      },
      {
        path: 'search',
        element: (
          <LazyWrapper>
            <SearchResult />
          </LazyWrapper>
        ),
      },
    ],
  },
  {
    path: '/admin/login',
    element: (
      <LazyWrapper>
        <Login />
      </LazyWrapper>
    ),
  },
  {
    path: '/admin',
    element: (
      <LazyWrapper>
        <AdminLayout />
      </LazyWrapper>
    ),
    children: [
      {
        index: true,
        element: (
          <LazyWrapper>
            <Dashboard />
          </LazyWrapper>
        ),
      },
      {
        path: 'articles',
        element: (
          <LazyWrapper>
            <ArticleList />
          </LazyWrapper>
        ),
      },
      {
        path: 'articles/new',
        element: (
          <LazyWrapper>
            <ArticleEditor />
          </LazyWrapper>
        ),
      },
      {
        path: 'articles/:id/edit',
        element: (
          <LazyWrapper>
            <ArticleEditor />
          </LazyWrapper>
        ),
      },
    ],
  },
]);

export default router;
