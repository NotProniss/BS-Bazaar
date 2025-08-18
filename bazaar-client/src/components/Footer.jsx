import React from 'react';

function Footer() {
  const darkMode = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  return (
    <footer 
      className="w-full text-center fixed bottom-0 left-0 z-30 border-t p-1"
      style={{
        background: darkMode 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)'
          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderTopColor: darkMode ? '#D4AF37' : '#B8860B',
        borderTopWidth: '2px',
        color: darkMode ? '#F5E6A3' : '#6B4E3D'
      }}
    >
      <div style={{ color: darkMode ? '#D4AF37' : '#B8860B', fontWeight: 'bold' }}>
        &copy; Proniss 2025
      </div>
      <div 
        className="text-xs mt-1"
        style={{ color: darkMode ? 'rgba(245, 230, 163, 0.7)' : 'rgba(107, 78, 61, 0.7)' }}
      >
        bs-bazaar.com is not officially affiliated with, endorsed by, or partnered with Fen Research Ltd
      </div>
    </footer>
  );
}

export default Footer;
