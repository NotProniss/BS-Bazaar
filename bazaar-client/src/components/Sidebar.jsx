import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// import posthog from 'posthog-js';

function Sidebar({ 
  darkMode, 
  toggleDarkMode, 
  loggedInUser, 
  logout, 
  isAdmin,
  closeSidebar
}) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  // Helper to handle navigation clicks - always close sidebar when clicking nav items
  const handleNavClick = () => {
    closeSidebar();
  };

  // Helper function for navigation link styling
  const getNavLinkStyles = (path) => {
    const isActiveLink = isActive(path);
    
    if (isActiveLink) {
      return {
        background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
        color: '#1a1a2e',
        boxShadow: '0 4px 8px rgba(212, 175, 55, 0.4)',
        transform: 'translateX(2px)'
      };
    }
    
    return {
      background: darkMode 
        ? 'linear-gradient(135deg, rgba(42, 42, 62, 0.6) 0%, rgba(26, 26, 46, 0.6) 100%)'
        : 'linear-gradient(135deg, rgba(245, 230, 163, 0.3) 0%, rgba(248, 249, 250, 0.8) 100%)',
      color: darkMode ? '#F5E6A3' : '#6B4E3D',
      border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'}`,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    };
  };

  return (
      <aside 
        className={`h-screen flex flex-col items-start gap-2 p-6 shadow-lg min-w-[220px] overflow-hidden`} 
        style={{ 
          borderTopRightRadius: '2rem', 
          borderBottomRightRadius: '2rem', 
          width: '220px', 
          boxShadow: '0 0 8px 2px #FFD700', // glowing gold shadow
          border: '2px solid #FFD700', // thin gold border
          background: darkMode
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        }}
    >
      {/* Close button - now visible on all screen sizes */}
      <button
        onClick={handleNavClick}
        className="self-end mb-2 p-1 rounded-md hover:bg-opacity-20 transition-colors"
        style={{ 
          color: darkMode ? '#D4AF37' : '#B8860B',
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = darkMode ? 'rgba(212, 175, 55, 0.1)' : 'rgba(184, 134, 11, 0.1)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        aria-label="Close sidebar"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      {/* Logo and Title */}
      <div className="flex flex-col items-center w-full mb-4">
        <img 
          src="/logo192.png" 
          alt="BS Bazaar Logo" 
          className="w-16 h-16 mb-2"
          style={{ filter: darkMode ? 'none' : 'brightness(0.9)' }}
        />
        <h1 
          className="text-xl font-bold text-center"
          style={{ 
            fontSize: '1.8rem',
            color: darkMode ? '#D4AF37' : '#B8860B',
            textShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.1)',
            fontFamily: 'serif'
          }}
        >
          BS Bazaar
        </h1>
      </div>
      
      {/* Welcome message at the top */}
      {loggedInUser && (
        <p 
          className="text-sm text-center w-full mb-2"
          style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}
        >
          Welcome, <strong style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}>{loggedInUser}</strong>
        </p>
      )}
      
      {/* Subtitle */}
      <p 
        className="text-xs font-semibold text-center w-full mb-4" 
        style={{
          letterSpacing: '0.05em',
          color: darkMode ? '#D4AF37' : '#B8860B'
        }}
      >
        Beta 0.2.4
      </p>
      
      {/* Light/Dark mode toggle */}
      <button 
        onClick={toggleDarkMode} 
        className="w-full p-3 border rounded-lg font-semibold transition-all duration-300 mb-4"
        style={{
          background: darkMode 
            ? 'linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)' 
            : 'linear-gradient(135deg, #F5E6A3 0%, #D4AF37 100%)',
          color: darkMode ? '#D4AF37' : '#1a1a2e',
          border: darkMode ? '1px solid #D4AF37' : '1px solid #B8860B',
          boxShadow: darkMode 
            ? '0 4px 8px rgba(212, 175, 55, 0.2)' 
            : '0 4px 8px rgba(184, 134, 11, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = darkMode 
            ? '0 6px 12px rgba(212, 175, 55, 0.3)' 
            : '0 6px 12px rgba(184, 134, 11, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = darkMode 
            ? '0 4px 8px rgba(212, 175, 55, 0.2)' 
            : '0 4px 8px rgba(184, 134, 11, 0.3)';
        }}
      >
        {darkMode ? "☀️ Light" : "🌙 Dark"} Mode
      </button>
      
      {/* Navigation tabs - match live site order and style */}
      <Link
        to="/gettingstarted"
        onClick={handleNavClick}
        className="w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 mb-2"
        style={{
          fontSize: '1.1rem',
          ...getNavLinkStyles("/gettingstarted")
        }}
        onMouseEnter={(e) => {
          if (!isActive("/gettingstarted")) {
            e.target.style.transform = 'translateX(4px)';
            e.target.style.boxShadow = darkMode 
              ? '0 4px 8px rgba(212, 175, 55, 0.2)' 
              : '0 4px 8px rgba(184, 134, 11, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive("/gettingstarted")) {
            e.target.style.transform = 'translateX(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }
        }}
      >
        Getting Started
      </Link>
      {loggedInUser && (
        <>
          <Link
            to="/post"
            onClick={handleNavClick}
            className="w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 mb-2"
            style={{
              fontSize: '1.1rem',
              ...getNavLinkStyles("/post")
            }}
            onMouseEnter={(e) => {
              if (!isActive("/post")) {
                e.target.style.transform = 'translateX(4px)';
                e.target.style.boxShadow = darkMode 
                  ? '0 4px 8px rgba(212, 175, 55, 0.2)' 
                  : '0 4px 8px rgba(184, 134, 11, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive("/post")) {
                e.target.style.transform = 'translateX(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            Post Listing
          </Link>
        </>
      )}
      <Link
        to="/alllistings"
        onClick={handleNavClick}
        className="w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 mb-2"
        style={{
          fontSize: '1.1rem',
          ...getNavLinkStyles("/alllistings")
        }}
        onMouseEnter={(e) => {
          if (!isActive("/alllistings")) {
            e.target.style.transform = 'translateX(4px)';
            e.target.style.boxShadow = darkMode 
              ? '0 4px 8px rgba(212, 175, 55, 0.2)' 
              : '0 4px 8px rgba(184, 134, 11, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive("/alllistings")) {
            e.target.style.transform = 'translateX(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }
        }}
      >
        All Listings
      </Link>
      {loggedInUser && (
        <>
          <Link
            to="/mylistings"
            onClick={handleNavClick}
            className="w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 mb-2"
            style={{
              fontSize: '1.1rem',
              ...getNavLinkStyles("/mylistings")
            }}
            onMouseEnter={(e) => {
              if (!isActive("/mylistings")) {
                e.target.style.transform = 'translateX(4px)';
                e.target.style.boxShadow = darkMode 
                  ? '0 4px 8px rgba(212, 175, 55, 0.2)' 
                  : '0 4px 8px rgba(184, 134, 11, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive("/mylistings")) {
                e.target.style.transform = 'translateX(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            My Listings
          </Link>
        </>
      )}
      {/* Only one dark mode toggle button at the top. Remove duplicate. */}

      {loggedInUser && isAdmin && (
        <Link
          to="/adminpanel"
          onClick={handleNavClick}
          className="w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 mb-2"
          style={{
            fontSize: '1.1rem',
            ...getNavLinkStyles("/adminpanel"),
            background: isActive("/adminpanel") 
              ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)'
              : darkMode 
                ? 'linear-gradient(135deg, rgba(42, 42, 62, 0.6) 0%, rgba(26, 26, 46, 0.6) 100%)'
                : 'linear-gradient(135deg, rgba(245, 230, 163, 0.3) 0%, rgba(248, 249, 250, 0.8) 100%)',
            border: `1px solid ${darkMode ? '#D4AF37' : '#B8860B'}`,
            boxShadow: isActive("/adminpanel") 
              ? '0 4px 8px rgba(212, 175, 55, 0.4)'
              : '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            if (!isActive("/adminpanel")) {
              e.target.style.transform = 'translateX(4px)';
              e.target.style.boxShadow = '0 4px 8px rgba(212, 175, 55, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive("/adminpanel")) {
              e.target.style.transform = 'translateX(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }
          }}
        >
          👑 Admin Panel
        </Link>
      )}
      
         <div className="flex flex-col h-full w-full pb-8">
           <div className="flex-grow"></div>
        {/* Login/Logout button */}
        {loggedInUser ? (
          <button 
            className="w-full px-4 py-3 rounded-lg font-semibold transition-all duration-300 mb-4"
            style={{
              background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
              color: 'white',
              border: '1px solid #dc3545',
              boxShadow: '0 4px 8px rgba(220, 53, 69, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 12px rgba(220, 53, 69, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.3)';
            }}
            onClick={() => {
              logout();
              handleNavClick();
            }}
          >
            🚪 Logout
          </button>
        ) : (
          <a
            href={"/api/auth/discord"}
            onClick={handleNavClick}
            className="w-full px-4 py-3 rounded-lg font-semibold transition-all duration-300 text-center block mb-4"
            style={{
              background: 'linear-gradient(135deg, #5865F2 0%, #4752C4 100%)',
              color: 'white',
              textDecoration: 'none',
              border: '1px solid #5865F2',
              boxShadow: '0 4px 8px rgba(88, 101, 242, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 12px rgba(88, 101, 242, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 8px rgba(88, 101, 242, 0.3)';
            }}
          >
            🎮 Login with Discord
          </a>
        )}

        {/* External Resources header */}
        <h3 
          className="text-sm font-semibold text-center mb-3"
          style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}
        >
          External Resources
        </h3>
        {/* External links in 2x4 grid, no overlap */}
        <div className="grid grid-cols-3 grid-rows-2 gap-2 mb-2">
          {/* Wrevo button */}
          <div className="relative group flex items-center justify-center">
            <a
              href="https://wrevo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded font-medium text-xs text-center transition flex items-center justify-center w-10 h-10"
              style={{ 
                backgroundColor: '#009688',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#00796b';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#009688';
              }}
            >
              <img src={require("../assets/wrevo.png")} alt="Wrevo" title="Wrevo" className="h-4 w-4 object-contain" />
            </a>
            <div className="absolute bottom-full left-0 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              Wrevo
            </div>
          </div>
          {/* Official Brighter Shores button */}
          <div className="relative group flex items-center justify-center">
            <a
              href="https://www.brightershores.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-medium text-xs text-center hover:bg-indigo-200 dark:hover:bg-indigo-800 transition flex items-center justify-center w-10 h-10"
            >
              <span className="text-xl" role="img" aria-label="Globe">🌐</span>
            </a>
            <div className="absolute bottom-full right-0 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              <div className="text-center">
                <div>Official Brighter</div>
                <div>Shores Site</div>
              </div>
            </div>
          </div>
          {/* Bazaar Sync Discord bot */}
          <div className="relative group flex items-center justify-center">
            <a
              href="https://discord.com/oauth2/authorize?client_id=1388662907163774996&permissions=339008&integration_type=0&scope=bot"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-medium text-xs text-center hover:bg-indigo-200 dark:hover:bg-indigo-800 transition flex items-center justify-center w-10 h-10"
            >
              <span className="text-xl" role="img" aria-label="Robot">🤖</span>
            </a>
            <div className="absolute bottom-full right-0 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              <div className="text-center">
                <div>Bazaar Sync</div>
                <div>Discord Bot</div>
              </div>
            </div>
          </div>
          {/* Trading Discord button */}
          <div className="relative group flex items-center justify-center">
            <a
              href="https://discord.gg/KMSFvwFPY2"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-medium text-xs text-center hover:bg-indigo-200 dark:hover:bg-indigo-800 transition flex items-center justify-center w-10 h-10"
            >
              <span className="text-base">⇄</span>
            </a>
            <div className="absolute bottom-full right-0 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              <div className="text-center">
                <div>oJAllen's Trading</div>
                <div>Discord</div>
              </div>
            </div>
          </div>
          {/* Bugs/Feedback button */}
          <div className="relative group flex items-center justify-center">
            <a
              href="https://discord.gg/twZYqBSG5x"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-medium text-xs text-center hover:bg-green-200 dark:hover:bg-green-800 transition flex items-center justify-center w-10 h-10"
            >
              <span className="text-base">🐛</span>
            </a>
            <div className="absolute bottom-full right-0 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              <div className="text-center">
                <div>Bugs/Suggestions</div>
                <div>(My Discord)</div>
              </div>
            </div>
          </div>
          {/* Wiki button */}
          <div className="relative group flex items-center justify-center">
            <a
              href="https://brightershoreswiki.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded font-medium text-xs text-center transition flex items-center justify-center w-10 h-10"
              style={{ 
                backgroundColor: '#6b7280',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#6b7280';
              }}
            >
              <img src={require("../assets/wiki.png")} alt="Wiki" title="Wiki" className="h-4 w-4 object-contain" />
            </a>
            <div className="absolute bottom-full right-0 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10" style={{ whiteSpace: 'nowrap' }}>
              <div className="text-center">
                <div>Brighter Shores</div>
                <div>Wiki</div>
              </div>
            </div>
          </div>
          {/* Empty cells for 2x4 grid symmetry */}
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
