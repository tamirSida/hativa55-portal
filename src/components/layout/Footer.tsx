import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { href: '/about', label: 'אודות' },
      { href: '/privacy', label: 'מדיניות פרטיות' },
      { href: '/terms', label: 'תנאי שימוש' },
      { href: '/contact', label: 'צור קשר' }
    ],
    community: [
      { href: '/businesses', label: 'עסקים בקהילה' },
      { href: '/jobs', label: 'דרושים' },
      { href: '/mentors', label: 'חנכים' },
      { href: '/help', label: 'עזרה' }
    ],
    support: [
      { href: '/faq', label: 'שאלות נפוצות' },
      { href: '/guidelines', label: 'כללי הקהילה' },
      { href: '/report', label: 'דווח על בעיה' },
      { href: '/feedback', label: 'משובים' }
    ]
  };

  const socialLinks = [
    { href: '#', icon: faFacebook, label: 'Facebook' },
    { href: '#', icon: faInstagram, label: 'Instagram' },
    { href: '#', icon: faLinkedin, label: 'LinkedIn' },
    { href: '#', icon: faTwitter, label: 'Twitter' }
  ];

  return (
    <footer className={`bg-gray-900 text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="text-2xl font-bold text-white">
                קהילה
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                פלטפורמה לחיבור בין אנשי מקצוע, עסקים, משרות והזדמנויות בקהילה הישראלית.
                מקום לחלוק ידע, ליצור קשרים ולהצליח יחד.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-300">
                  <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 ml-2" />
                  <span>contact@community.co.il</span>
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 ml-2" />
                  <span>ישראל</span>
                </div>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">הפלטפורמה</h3>
              <ul className="space-y-2">
                {footerLinks.platform.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">קהילה</h3>
              <ul className="space-y-2">
                {footerLinks.community.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">תמיכה</h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © {currentYear} קהילה. כל הזכויות שמורות.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-sm text-gray-400 ml-4">עקבו אחרינו:</span>
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={social.label}
                >
                  <FontAwesomeIcon icon={social.icon} className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Language/Region */}
            <div className="flex items-center text-sm text-gray-400">
              <span>🇮🇱 ישראל - עברית</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};