import React from 'react';

function Footer() {
  return (
    <footer 
      className="w-full text-center bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 fixed bottom-0 left-0 z-50" 
      style={{
        position: 'fixed', 
        left: 0, 
        bottom: 0, 
        width: '100%', 
        borderTop: '1px solid #e5e7eb', 
        padding: '0.25rem 0'
      }}
    >
      <div>&copy; Proniss 2025</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        bs-bazaar.com is not officially affiliated with, endorsed by, or partnered with Fen Research Ltd
      </div>
    </footer>
  );
}

export default Footer;
