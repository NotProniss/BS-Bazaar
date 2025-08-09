import React from 'react';
import { Helmet } from 'react-helmet';

const AdminPanel = () => (
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
    <div className="text-center py-10 bg-transparent dark:text-white text-black">
    <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
    <p>Admin features coming soon.</p>
  </div>
  </>
);

export default AdminPanel;
