
import React from 'react';
import { Helmet } from 'react-helmet';
import { BACKEND_URL } from '../utils/api';

const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL;

const steps = [
  {
    title: 'Browse Listings',
    icon: '🛒',
    description: (
      <>
        You can browse all listings without an account. Click <a href={`${FRONTEND_URL}/alllistings`} className="text-indigo-600 underline">here</a> or "All Listings" in the sidebar to see what other players are buying and selling.
      </>
    ),
  },
  {
    title: 'Login',
    icon: '🔑',
    description: (
      <>
        To post a listing, logging in is required. Click <a href={"/api/auth/discord"} className="text-indigo-600 underline">here</a> or the "Login with Discord" button in the sidebar to sign in. More sign in options will be added soon.
      </>
    ),
  },
  {
    title: 'Post a Listing',
    icon: '✏️',
    description: (
      <>
        After logging in, click <a href={`${FRONTEND_URL}/post`} className="text-indigo-600 underline">here</a> to create your own buy or sell offer. Fill out the form and submit.
      </>
    ),
  },
  {
    title: 'Manage Your Listings',
    icon: '🗂️',
    description: (
      <>
        Edit or delete your own posts <a href={`${FRONTEND_URL}/post`} className="text-indigo-600 underline">here</a>. Once a trade is completed, please delete the listing to keep the marketplace clean.
      </>
    ),
  },
  {
    title: 'Need Help?',
    icon: '❓',
    description: (
      <>
        Use the external links below for help and support, or join our Discord for live assistance.
      </>
    ),
  },
];

const links = [
  {
    label: 'Bazaar Discord',
    url: 'https://discord.gg/twZYqBSG5x',
    color: 'bg-indigo-600 hover:bg-indigo-700',
    desc: 'Join our Discord for live help, support, and community chat.',
  },
  {
    label: 'Trading Discord',
    url: 'https://discord.gg/twZYqBSG5x',
    color: 'bg-indigo-600 hover:bg-indigo-700',
    desc: "oJAllen's Community Trading Discord.",
  },
  {
    label: 'Wiki',
    url: 'https://brightershoreswiki.org/',
    color: 'bg-green-600 hover:bg-green-700',
    desc: 'The Brighter Shores Wiki.',
  },
  {
    label: 'Bazaar Sync Bot',
    url: 'https://discord.com/oauth2/authorize?client_id=1388662907163774996&permissions=339008&integration_type=0&scope=bot',
    color: 'bg-gray-800 hover:bg-gray-900',
    desc: 'Discord bot for your server that posts all listings into discord.',
  },
  {
    label: 'Brighter Shores',
    url: 'https://www.brightershores.com/',
    color: 'bg-blue-600 hover:bg-blue-700',
    desc: 'Official Brighter Shores website.',
  },
  {
    label: 'Wrevo',
    url: 'https://wrevo.com/',
    color: 'bg-green-600 hover:bg-green-700',
    desc: 'The Brighter Shores Wiki.',
  },
];

function GettingStarted({ darkMode }) {
  return (
    <>
      <Helmet>
        {/* PostHog tracking snippet */}
        <script>
          {`
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){
              function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){
                t.push([e].concat(Array.prototype.slice.call(arguments,0)))
              }}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",
              (r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){
                var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e
              },u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once".split(" "),n=0;n<o.length;n++)g(u,o[n]);
              e._i.push([i,s,a])
            },e.__SV=1.2)}(document,window.posthog||[]);
            posthog.init('phc_vV4HuQIzRQreNNyewhxX8q7HN63wdfccHJHxTiXSRUm', {api_host: 'https://app.posthog.com'});
          `}
        </script>
      </Helmet>
      <div className={darkMode ? 'text-white bg-gray-900 min-h-screen py-12 px-4' : 'text-gray-900 bg-white min-h-screen py-12 px-4'}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold text-center mb-4 tracking-tight">Welcome to BS Bazaar</h1>
          <p className="text-center text-lg mb-10 text-gray-500 dark:text-gray-300">Your guide to buying and selling in the Brighter Shores marketplace</p>

          <div className="space-y-8">
            {steps.map((step, idx) => (
              <div key={step.title} className="flex items-start gap-4 bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full text-3xl bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                    {step.icon}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-1">{step.title}</h2>
                  <div className="text-base text-gray-700 dark:text-gray-200">{step.description}</div>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-2xl font-bold mt-12 mb-4 text-center">Helpful Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            {links.map(link => (
              <div key={link.label} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-white px-4 py-2 rounded transition min-w-[100px] text-center font-semibold ${link.color}`}
                >
                  {link.label}
                </a>
                <span className="text-sm text-gray-700 dark:text-gray-300">{link.desc}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-base text-gray-500 dark:text-gray-300 mt-8">If you have questions or feedback, join our Discord for more info. Happy trading!</p>
        </div>
      </div>
    </>
  );
}

export default GettingStarted;
