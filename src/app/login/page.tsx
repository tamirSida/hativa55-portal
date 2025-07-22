'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Button, Input } from '@/components/ui';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error } = useAuthContext();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    setIsSubmitting(true);
    try {
      await login({ email: formData.email, password: formData.password });
      router.push('/'); // Redirect to homepage on success
    } catch (err) {
      // Error is handled by the context
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-3 mb-6">
            <Image 
              src="/logo.png" 
              alt="לוגו הקהילה" 
              width={48} 
              height={48} 
              className="h-12 w-auto"
            />
            <h1 className="text-3xl font-bold text-teal-600">קהילה</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ברוכים השבים
          </h2>
          <p className="text-gray-600">
            התחברו לחשבון שלכם כדי להמשיך
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <Input
              id="email"
              name="email"
              type="email"
              label="כתובת אימייל"
              value={formData.email}
              onChange={handleChange}
              icon={faEnvelope}
              iconPosition="left"
              required
              disabled={isSubmitting}
              placeholder="your@email.com"
            />

            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="סיסמה"
                value={formData.password}
                onChange={handleChange}
                icon={faLock}
                iconPosition="left"
                required
                disabled={isSubmitting}
                placeholder="הזינו את הסיסמה שלכם"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-9 text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-5 h-5" />
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              disabled={!formData.email || !formData.password}
              className="rounded-xl"
            >
              {isSubmitting ? 'מתחבר...' : 'התחבר'}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              עדיין אין לכם חשבון?{' '}
              <Link 
                href="/register" 
                className="text-teal-600 hover:text-teal-700 font-medium hover:underline"
              >
                הרשמו כאן
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            href="/" 
            className="text-teal-600 hover:text-teal-700 text-sm hover:underline"
          >
            ← חזרה לעמוד הבית
          </Link>
        </div>
      </div>
    </div>
  );
}