import React, { useState } from 'react';
import { Calendar, Clock, User, Mail, Phone, LogOut, Users, Edit, Trash2, Save, X } from 'lucide-react';

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  createdAt: string;
}

import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'; // تأكد من استيراد useEffect

const supabaseUrl = 'https://qaiwqrdkzvyimisfblgrq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaXdxcmRrenZ5bWlzZmJsZ3JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDE0NzAsImV4cCI6MjA3MjU3NzQ3MH0.6W7sy0FjTHXtgq_fGdyNuijCztSfxvPQi5VajUIYX6k';

const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [bookings, setBookings] = useState([]); // ابدأ بمصفوفة فارغة

  useEffect(() => {
    async function fetchBookings() {
      let { data: fetchedBookings, error } = await supabase
        .from('bookings') // استبدل بـ اسم الجدول في Supabase
        .select('*');

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        setBookings(fetchedBookings);
      }
    }

    fetchBookings();
  }, []); // [] تضمن أن الدالة تعمل مرة واحدة فقط عند التحميل

  // بقية الكود الخاص بك
}
  const [activeView, setActiveView] = useState<'booking' | 'login' | 'dashboard'>('booking');
  const [editingBooking, setEditingBooking] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Booking, 'id' | 'createdAt'>>({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: ''
  });
  
  // Login state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Save bookings to localStorage
  import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qaiwqrdkzvyimisfblgrq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaXdxcmRrenZ5bWlzZmJsZ3JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDE0NzAsImV4cCI6MjA3MjU3NzQ3MH0.6W7sy0FjTHXtgq_fGdyNuijCztSfxvPQi5VajUIYX6k';

const supabase = createClient(supabaseUrl, supabaseKey);

const saveBookingsToSupabase = async (updatedBookings) => {
  const { data, error } = await supabase
    .from('bookings') // استبدل بـ اسم الجدول في Supabase
    .insert(updatedBookings);

  if (error) {
    console.error('Error saving data:', error);
  } else {
    setBookings(updatedBookings);
    console.log('Data saved successfully to Supabase!');
  }
};

  // Check for duplicate booking
  const isDuplicateBooking = (date: string, time: string, excludeId?: string) => {
    return bookings.some(booking => 
      booking.date === date && 
      booking.time === time && 
      booking.id !== excludeId
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (loginForm.username === 'admin' && loginForm.password === '12345') {
      setActiveView('dashboard');
      setLoginForm({ username: '', password: '' });
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setActiveView('booking');
    setLoginForm({ username: '', password: '' });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    // Check for duplicate booking
    if (isDuplicateBooking(bookingForm.date, bookingForm.time)) {
      setSubmitMessage('This slot is already booked. Please choose a different date or time.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Create new booking
      const newBooking: Booking = {
        id: Date.now().toString(),
        ...bookingForm,
        createdAt: new Date().toISOString()
      };

      // Add to bookings list and save to localStorage
      const updatedBookings = [...bookings, newBooking];
      saveBookingsToStorage(updatedBookings);

      setSubmitMessage('Booking submitted successfully!');
      setBookingForm({ name: '', email: '', phone: '', date: '', time: '' });

    } catch (error) {
      console.error('Error submitting booking:', error);
      setSubmitMessage('Error submitting booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking.id);
    setEditForm({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      date: booking.date,
      time: booking.time
    });
  };

  const handleSaveEdit = () => {
    if (!editingBooking) return;

    // Check for duplicate booking (excluding current booking)
    if (isDuplicateBooking(editForm.date, editForm.time, editingBooking)) {
      alert('This slot is already booked. Please choose a different date or time.');
      return;
    }

    const updatedBookings = bookings.map(booking =>
      booking.id === editingBooking
        ? { ...booking, ...editForm }
        : booking
    );
    
    saveBookingsToStorage(updatedBookings);
    setEditingBooking(null);
    setEditForm({ name: '', email: '', phone: '', date: '', time: '' });
  };

  const handleCancelEdit = () => {
    setEditingBooking(null);
    setEditForm({ name: '', email: '', phone: '', date: '', time: '' });
  };

  const handleDeleteBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
      saveBookingsToStorage(updatedBookings);
    }
  };

  // Login Page (only shown when accessing dashboard)
  if (activeView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">BookingPro</h1>
            <p className="text-gray-600">Appointment Management System</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter password"
                required
              />
            </div>
            
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {loginError}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium"
            >
              Sign In
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <div className="bg-gray-50 rounded-xl p-4">
              
              
              <button
                onClick={() => setActiveView('booking')}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 underline"
              >
                ← Back to Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Application
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">BookingPro</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <nav className="flex space-x-4">
                <button
                  onClick={() => setActiveView('booking')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeView === 'booking'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  New Booking
                </button>
                <button
                  onClick={() => setActiveView(activeView === 'dashboard' ? 'dashboard' : 'login')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeView === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Dashboard
                </button>
              </nav>
              
              {activeView === 'dashboard' && (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {activeView === 'booking' ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Book an Appointment</h2>
                <p className="text-gray-600">Fill out the form below to schedule your appointment</p>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="name"
                        value={bookingForm.name}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        value={bookingForm.email}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        id="date"
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="time"
                        id="time"
                        value={bookingForm.time}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {submitMessage && (
                  <div className={`px-4 py-3 rounded-xl text-sm ${
                    submitMessage.includes('successfully')
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {submitMessage}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Booking Appointment...
                    </span>
                  ) : (
                    'Book Appointment'
                  )}
                </button>
              </form>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 mb-2">
                  Are you an administrator?
                </p>
                <button
                  onClick={() => setActiveView('login')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
                >
                  Access Dashboard →
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Appointments Dashboard</h2>
                  <p className="text-gray-600 mt-1">
                    {bookings.length === 0 ? 'No appointments scheduled' : `${bookings.length} appointment${bookings.length !== 1 ? 's' : ''} scheduled`}
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-blue-600">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">{bookings.length}</span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {bookings.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-500 mb-2">No bookings yet</h3>
                  <p className="text-gray-400 mb-6">Start by creating your first appointment booking</p>
                  <button
                    onClick={() => setActiveView('booking')}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    Create Booking
                  </button>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking, index) => (
                      <tr 
                        key={booking.id}
                        className={`hover:bg-gray-50 transition-colors duration-150 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingBooking === booking.id ? (
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{booking.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingBooking === booking.id ? (
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{booking.email}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingBooking === booking.id ? (
                            <input
                              type="tel"
                              value={editForm.phone}
                              onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{booking.phone}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingBooking === booking.id ? (
                            <input
                              type="date"
                              value={editForm.date}
                              onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">
                                {new Date(booking.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingBooking === booking.id ? (
                            <input
                              type="time"
                              value={editForm.time}
                              onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">
                                {new Date(`2000-01-01 ${booking.time}`).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingBooking === booking.id ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={handleSaveEdit}
                                className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                              >
                                <Save className="w-3 h-3 mr-1" />
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="inline-flex items-center px-3 py-1 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditBooking(booking)}
                                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteBooking(booking.id)}
                                className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
