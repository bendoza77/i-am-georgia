import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const Home = lazy(() => import('../pages/Home/Home'));
const Destinations = lazy(() => import('../pages/Destinations/Destinations'));
const Tours = lazy(() => import('../pages/Tours/Tours'));
const Gallery = lazy(() => import('../pages/Gallery/Gallery'));
const About = lazy(() => import('../pages/About/About'));
const Blog = lazy(() => import('../pages/Blog/Blog'));
const Contact = lazy(() => import('../pages/Contact/Contact'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Admin (separate shell, lazy-loaded)
const AdminLayout = lazy(() => import('../pages/Admin/AdminLayout'));
const Dashboard = lazy(() => import('../pages/Admin/Dashboard'));
const HotelsAdmin = lazy(() => import('../pages/Admin/HotelsAdmin'));
const HotelEditor = lazy(() => import('../pages/Admin/HotelEditor'));
const AdminSettings = lazy(() => import('../pages/Admin/AdminSettings'));

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin suite */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="hotels" element={<HotelsAdmin />} />
        <Route path="hotels/new" element={<HotelEditor />} />
        <Route path="hotels/:id" element={<HotelEditor />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}
