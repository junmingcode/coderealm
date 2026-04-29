import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import CategoryPage from './pages/CategoryPage';
import TagPage from './pages/TagPage';
import About from './pages/About';
import SearchResult from './pages/SearchResult';
import Login from './pages/Admin/Login';
import AdminLayout from './pages/Admin/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import ArticleList from './pages/Admin/ArticleList';
import ArticleEditor from './pages/Admin/ArticleEditor';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'article/:slug', element: <ArticleDetail /> },
      { path: 'category/:slug', element: <CategoryPage /> },
      { path: 'tag/:slug', element: <TagPage /> },
      { path: 'about', element: <About /> },
      { path: 'search', element: <SearchResult /> },
    ],
  },
  {
    path: '/admin/login',
    element: <Login />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'articles', element: <ArticleList /> },
      { path: 'articles/new', element: <ArticleEditor /> },
      { path: 'articles/:id/edit', element: <ArticleEditor /> },
    ],
  },
]);

export default router;
