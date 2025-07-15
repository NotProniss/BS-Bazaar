import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BACKEND_URL } from '../utils/api';
// import posthog from 'posthog-js';

function Sidebar({ 
  darkMode, 
  toggleDarkMode, 
  loggedInUser, 
  logout, 
  isAdmin 
}) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside 
      className={`fixed top-0 left-0 flex flex-col items-start gap-2 p-6 shadow-lg min-w-[220px] h-screen overflow-hidden z-40 ${darkMode ? "bg-gray-800" : "bg-white"}`} 
      style={{ borderTopRightRadius: '2rem', borderBottomRightRadius: '2rem', width: '220px', background: darkMode ? '#1f2937' : undefined }}
    >
      <h1 className={darkMode ? "text-2xl font-bold text-white" : "text-2xl font-bold text-indigo-700"} style={{ fontSize: '2.2rem' }}>
        BS Bazaar
      </h1>
      
      {/* Welcome message at the top */}
      {loggedInUser && (
        <p className={`text-sm text-center w-full ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Welcome, <strong>{loggedInUser}</strong>
        </p>
      )}
      
      {/* Subtitle */}
      <p 
        className="text-xs text-indigo-400 dark:text-indigo-300 font-semibold text-center w-full" 
        style={{letterSpacing: '0.05em'}}
      >
        Beta 0.2.1
      </p>
      
      {/* Light/Dark mode toggle */}
      <button 
        onClick={toggleDarkMode} 
        className={
          darkMode
            ? "w-full p-2 border rounded bg-gray-700 text-white pt-3 mb-4"
            : "w-full p-2 border rounded bg-gray-200 text-indigo-700 pt-3 mb-4"
        }
      >
        {darkMode ? "Light" : "Dark"} Mode
      </button>
      
      {/* Navigation tabs - match live site order and style */}
      <Link
        to="/alllistings"
        className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition ${
          isActive("/alllistings")
            ? "bg-indigo-600 text-white"
            : darkMode
              ? "bg-gray-700 text-white"
              : "bg-gray-200 text-black"
        }`}
        style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}
      >
        All Listings
      </Link>

      {loggedInUser && (
        <>
          <Link
            to="/post"
            className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition ${
              isActive("/post")
                ? "bg-indigo-600 text-white"
                : darkMode
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 text-black"
            }`}
            style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}
          >
            Post Listing
          </Link>
          <Link
            to="/mylistings"
            className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition ${
              isActive("/mylistings")
                ? "bg-indigo-600 text-white"
                : darkMode
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 text-black"
            }`}
            style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}
          >
            My Listings
          </Link>
        </>
      )}
      {/* Only one dark mode toggle button at the top. Remove duplicate. */}

      {isAdmin && (
        <Link
          to="/adminpanel"
          className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition ${
            isActive("/adminpanel")
              ? "bg-indigo-600 text-white"
              : darkMode
                ? "bg-gray-700 text-white"
                : "bg-gray-200 text-black"
          }`}
          style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}
        >
          Admin Panel
        </Link>
      )}
      
      <div className="mt-auto w-full flex flex-col gap-3 mb-16">
        {/* Login/Logout button */}
        {loggedInUser ? (
          <button 
            className="w-full bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded" 
            onClick={logout}
          >
            Logout
          </button>
        ) : (
          <a
            href={`${BACKEND_URL}/auth/discord`}
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white px-4 py-2 rounded text-center block"
          >
            Login with Discord
          </a>
        )}

        {/* External Resources header */}
        <h3 className={`text-sm font-semibold text-center mb-1 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
          External Resources
        </h3>
        
        {/* External links in 1x4 grid */}
        <div className="grid grid-cols-4 gap-0.5 mb-2">
          {/* Wrevo button */}
          <div className="relative group">
            <a
              href="https://wrevo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-0.5 rounded font-medium text-xs text-center transition flex items-center justify-center w-8 h-8"
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
              <img src={require("../assets/wrevo.png")} alt="Wrevo" title="Wrevo" className="h-3 w-auto object-contain" />
            </a>
            <div className="absolute bottom-full left-0 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              Wrevo
            </div>
          </div>
          
          {/* Trading Discord button */}
          <div className="relative group">
            <a
              href="https://discord.gg/KMSFvwFPY2"
              target="_blank"
              rel="noopener noreferrer"
              className="p-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-medium text-xs text-center hover:bg-indigo-200 dark:hover:bg-indigo-800 transition flex items-center justify-center w-8 h-8"
            >
              <span className="text-sm">⇄</span>
            </a>
            <div className="absolute bottom-full right-0 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              <div className="text-center">
                <div>oJAllen's Trading</div>
                <div>Discord</div>
              </div>
            </div>
          </div>
          
          {/* Bugs/Feedback button */}
          <div className="relative group">
            <a
              href="https://discord.gg/twZYqBSG5x"
              target="_blank"
              rel="noopener noreferrer"
              className="p-0.5 rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-medium text-xs text-center hover:bg-green-200 dark:hover:bg-green-800 transition flex items-center justify-center w-8 h-8"
            >
              <span className="text-sm">🐛</span>
            </a>
            <div className="absolute bottom-full right-0 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              <div className="text-center">
                <div>Bugs/Suggestions</div>
                <div>(My Discord)</div>
              </div>
            </div>
          </div>
          
          {/* Wiki button */}
          <div className="relative group">
            <a
              href="https://brightershoreswiki.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-0.5 rounded font-medium text-xs text-center transition flex items-center justify-center w-8 h-8"
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
              <img src={require("../assets/wiki.png")} alt="Wiki" title="Wiki" className="h-3 w-auto object-contain" />
            </a>
            <div className="absolute bottom-full right-0 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10" style={{ whiteSpace: 'nowrap' }}>
              <div className="text-center">
                <div>Brighter Shores</div>
                <div>Wiki</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
