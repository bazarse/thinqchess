"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const Notifications = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notification, setNotification] = useState({
    type: 'newsletter',
    recipients: 'all',
    subject: '',
    message: ''
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  const recipientOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'tournament', label: 'Tournament Participants' },
    { value: 'course', label: 'Course Students' },
    { value: 'subscribers', label: 'Email Subscribers' }
  ];

  const messageTemplates = {
    tournament_reminder: {
      subject: 'Tournament Reminder - ThinQ Chess',
      message: `Dear Participants,

This is a friendly reminder about the upcoming chess tournament.

Tournament Details:
- Date: [Tournament Date]
- Time: [Tournament Time]
- Venue: [Tournament Venue]

Important Instructions:
- Report 30 minutes before your scheduled time
- Bring a valid ID proof
- Follow all tournament rules and regulations

We look forward to seeing you at the tournament!

Best regards,
ThinQ Chess Academy Team`
    },
    class_update: {
      subject: 'Class Schedule Update - ThinQ Chess',
      message: `Dear Students and Parents,

We have an important update regarding your chess classes.

[Your update message here]

If you have any questions, please don't hesitate to contact us.

Best regards,
ThinQ Chess Academy Team
Phone: +91 7975820187
Email: admin@thinqchess.com`
    },
    newsletter: {
      subject: 'ThinQ Chess Newsletter - Latest Updates',
      message: `Dear Chess Enthusiasts,

Welcome to our monthly newsletter!

This Month's Highlights:
- [Highlight 1]
- [Highlight 2]
- [Highlight 3]

Upcoming Events:
- [Event 1]
- [Event 2]

Chess Tip of the Month:
[Your chess tip here]

Stay connected with us for more updates!

Best regards,
ThinQ Chess Academy Team`
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('admin-token');

      const headers = {
        'credentials': 'include'
      };

      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/admin/verify', {
        credentials: 'include',
        headers: headers
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        console.log('Notifications: Auth failed but staying on page');
        // Don't redirect - let user stay on notifications page
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Don't redirect - let user stay on notifications page
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateKey) => {
    const template = messageTemplates[templateKey];
    if (template) {
      setNotification(prev => ({
        ...prev,
        subject: template.subject,
        message: template.message,
        type: templateKey
      }));
    }
  };

  const handleSendNotification = async () => {
    if (!notification.subject || !notification.message) {
      setMessage("Subject and message are required");
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/admin/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: notification.type,
          recipient: notification.recipients,
          subject: notification.subject,
          message: notification.message,
          data: {
            sent_by: user?.email,
            sent_at: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        setMessage("Notification sent successfully!");
        setNotification({
          type: 'newsletter',
          recipients: 'all',
          subject: '',
          message: ''
        });
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Error sending notification");
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setMessage("Error sending notification");
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
      router.push('/admin');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/admin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B3AA0] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <a href="/admin/dashboard" className="text-[#2B3AA0] hover:text-[#FFB31A] mr-4">
                ← Dashboard
              </a>
              <h1 className="text-2xl font-bold text-[#2B3AA0]">Send Notifications</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#2B3AA0] mb-6">📧 Compose Notification</h2>

          <div className="space-y-6">
            {/* Quick Templates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Templates</label>
              <div className="grid md:grid-cols-3 gap-3">
                {Object.entries(messageTemplates).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => handleTemplateSelect(key)}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 capitalize">
                      {key.replace('_', ' ')}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {template.subject}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
              <select
                value={notification.recipients}
                onChange={(e) => setNotification(prev => ({ ...prev, recipients: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
              >
                {recipientOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={notification.subject}
                onChange={(e) => setNotification(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                placeholder="Enter email subject..."
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={notification.message}
                onChange={(e) => setNotification(prev => ({ ...prev, message: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0] h-64 resize-none"
                placeholder="Enter your message here..."
              />
            </div>

            {/* Send Button */}
            <div className="flex gap-4">
              <button
                onClick={handleSendNotification}
                disabled={sending}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                  sending 
                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                    : 'bg-[#2B3AA0] hover:bg-[#1e2a70] text-white'
                }`}
              >
                {sending ? "Sending..." : "📧 Send Notification"}
              </button>
              <button
                onClick={() => setNotification({
                  type: 'newsletter',
                  recipients: 'all',
                  subject: '',
                  message: ''
                })}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.includes('successfully') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Recent Notifications */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Tournament Reminder</h4>
                <p className="text-sm text-gray-600">Sent to Tournament Participants • 2 hours ago</p>
              </div>
              <span className="text-green-600 text-sm">✓ Sent</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Monthly Newsletter</h4>
                <p className="text-sm text-gray-600">Sent to All Users • 1 week ago</p>
              </div>
              <span className="text-green-600 text-sm">✓ Sent</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;
