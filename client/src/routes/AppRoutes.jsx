import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { lazyWithReload } from './lazyWithReload';

const Home = lazyWithReload(() => import('../pages/Home/Home'));
const Destinations = lazyWithReload(() => import('../pages/Destinations/Destinations'));
const Tours = lazyWithReload(() => import('../pages/Tours/Tours'));
const Hotels = lazyWithReload(() => import('../pages/Hotels/Hotels'));
const Gallery = lazyWithReload(() => import('../pages/Gallery/Gallery'));
const About = lazyWithReload(() => import('../pages/About/About'));
const Blog = lazyWithReload(() => import('../pages/Blog/Blog'));
const Contact = lazyWithReload(() => import('../pages/Contact/Contact'));
const NotFound = lazyWithReload(() => import('../pages/NotFound'));

// Admin (separate shell, lazy-loaded)
const AdminLayout = lazyWithReload(() => import('../pages/Admin/AdminLayout'));
const Dashboard = lazyWithReload(() => import('../pages/Admin/Dashboard'));
const HotelsAdmin = lazyWithReload(() => import('../pages/Admin/HotelsAdmin'));
const HotelEditor = lazyWithReload(() => import('../pages/Admin/HotelEditor'));
const AdminSettings = lazyWithReload(() => import('../pages/Admin/AdminSettings'));

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/hotels" element={<Hotels />} />
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
