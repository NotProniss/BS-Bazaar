import React from 'react';

function Footer() {
  return (
    <footer 
      className={
        `w-full text-center fixed bottom-0 left-0 z-50 border-t p-1 ` +
        (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'bg-gray-900 text-white border-gray-800' : 'bg-gray-200 text-gray-700 border-gray-300')
      }
    >
      <div>&copy; Proniss 2025</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        bs-bazaar.com is not officially affiliated with, endorsed by, or partnered with Fen Research Ltd
      </div>
    </footer>
  );
}

export default Footer;
