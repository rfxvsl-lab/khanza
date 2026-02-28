/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Service from './pages/Service';
import Booking from './pages/Booking';
import Garage from './pages/Garage';
import Testimoni from './pages/Testimoni';
import Faq from './pages/Faq';

import AdminLayout from './pages/admin/AdminLayout';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Settings from './pages/admin/Settings';
import AdminServices from './pages/admin/Services';
import AdminBookings from './pages/admin/Bookings';
import AdminGarage from './pages/admin/Garage';
import AdminTestimonials from './pages/admin/Testimonials';
import AdminFaqs from './pages/admin/Faqs';
import AdminContentHome from './pages/admin/ContentHome';
import AdminNewsletters from './pages/admin/Newsletters';
import AdminVouchers from './pages/admin/Vouchers';
import AdminInvoices from './pages/admin/Invoices';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="service" element={<Service />} />
            <Route path="booking" element={<Booking />} />
            <Route path="garage" element={<Garage />} />
            <Route path="testimoni" element={<Testimoni />} />
            <Route path="faq" element={<Faq />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<Login />} />
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="content-home" element={<AdminContentHome />} />
            <Route path="settings" element={<Settings />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="garage" element={<AdminGarage />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="faqs" element={<AdminFaqs />} />
            <Route path="newsletters" element={<AdminNewsletters />} />
            <Route path="vouchers" element={<AdminVouchers />} />
            <Route path="invoices" element={<AdminInvoices />} />
            <Route path="*" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}

