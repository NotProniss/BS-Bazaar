import React from 'react';
import { BACKEND_URL } from '../utils/api';
import posthog from 'posthog-js';

function Sidebar({ 
  darkMode, 
  toggleDarkMode, 
  activeTab, 
  setActiveTab, 
  loggedInUser, 
  logout, 
  isAdmin 
}) {
  return (
    <aside 
      className={`fixed top-0 left-0 flex flex-col items-start gap-2 p-6 ${
        darkMode ? "bg-gray-800" : "bg-white"
      } shadow-lg min-w-[220px] h-screen overflow-hidden z-40`} 
      style={{ borderTopRightRadius: '2rem', borderBottomRightRadius: '2rem', width: '220px' }}
    >
      <h1 className="text-3xl font-bold" style={{ fontSize: '2.2rem' }}>
        BS Bazaar
      </h1>
      
      {/* Welcome message at the top */}
      {loggedInUser && (
        <p className="text-gray-700 dark:text-gray-300 text-sm text-center w-full">
          Welcome, <strong>{loggedInUser}</strong>
        </p>
      )}
      
      {/* Subtitle */}
      <p 
        className="text-xs text-indigo-400 dark:text-indigo-300 font-semibold text-center w-full" 
        style={{letterSpacing: '0.05em'}}
      >
        Beta 0.2
      </p>
      
      {/* Light/Dark mode toggle */}
      <button 
        onClick={toggleDarkMode} 
        className="w-full p-2 border rounded bg-gray-200 dark:bg-gray-700 pt-3 mb-4"
      >
        {darkMode ? "Light" : "Dark"} Mode
      </button>
      
      {/* Navigation tabs */}
      {loggedInUser && (
        <button
          className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition ${
            activeTab === "post" 
              ? "bg-indigo-600 text-white" 
              : darkMode 
                ? "bg-gray-700 text-white" 
                : "bg-gray-200 text-black"
          }`}
          onClick={() => {
            setActiveTab("post");
            posthog.capture('tab_clicked', { tab: 'post' });
          }}
        >
          Post Listing
        </button>
      )}
      
      <button
        className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition ${
          activeTab === "all" 
            ? "bg-indigo-600 text-white" 
            : darkMode 
              ? "bg-gray-700 text-white" 
              : "bg-gray-200 text-black"
        }`}
        onClick={() => {
          setActiveTab("all");
          posthog.capture('tab_clicked', { tab: 'all' });
        }}
      >
        All Listings
      </button>
      
      {loggedInUser && (
        <button
          className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition ${
            activeTab === "my" 
              ? "bg-indigo-600 text-white" 
              : darkMode 
                ? "bg-gray-700 text-white" 
                : "bg-gray-200 text-black"
          }`}
          onClick={() => {
            setActiveTab("my");
            posthog.capture('tab_clicked', { tab: 'my' });
          }}
        >
          My Listings
        </button>
      )}
      
      {isAdmin && (
        <button
          className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition ${
            activeTab === "admin" 
              ? "bg-indigo-600 text-white" 
              : darkMode 
                ? "bg-gray-700 text-white" 
                : "bg-gray-200 text-black"
          }`}
          onClick={() => setActiveTab("admin")}
        >
          Admin Panel
        </button>
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
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center mb-1">
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
