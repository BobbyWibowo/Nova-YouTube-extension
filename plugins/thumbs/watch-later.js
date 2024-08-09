// for test
// https://www.youtube.com/@Karujika/videos- many live

window.nova_plugins.push({
   id: 'thumbs-watch-later',
   title: 'Add "Watch Later" button on thumbnails (for feed page)',
   // 'title:zh': '',
   // 'title:ja': '',
   // 'title:ko': '',
   // 'title:vi': '',
   // 'title:id': '',
   // 'title:es': '',
   // 'title:pt': '',
   // 'title:fr': '',
   // 'title:it': '',
   // 'title:tr': '',
   // 'title:de': '',
   // 'title:pl': '',
   // 'title:ua': '',
   // run_on_pages: 'home, results, feed, channel, watch, -mobile',
   run_on_pages: 'feed, -mobile',
   section: 'thumbs',
   desc: 'You must be logged in',
   // 'desc:zh': '',
   // 'desc:ja': '',
   // 'desc:ko': '',
   // 'desc:vi': '',
   // 'desc:id': '',
   // 'desc:es': '',
   // 'desc:pt': '',
   // 'desc:fr': '',
   // 'desc:it': '',
   // 'desc:tr': '',
   // 'desc:de': '',
   // 'desc:pl': '',
   // 'desc:ua': '',
   _runtime: user_settings => {

      const
         SELECTOR_OVERLAY_ID_NAME = 'nova-thumb-overlay', // shared container for [thumbs-not-interested] plugin
         SELECTOR_CLASS_NAME = 'nova-thumbs-watch-later-btn',
         thumbsSelectors = [
            'ytd-rich-item-renderer', // home, channel, feed
            // 'ytd-video-renderer', // results
            // 'ytd-playlist-renderer', // results
            // 'ytd-grid-video-renderer', // feed (old)
            'ytd-compact-video-renderer', // sidepanel in watch
            'yt-append-continuation-items-action', // sidepanel append in watch
            'ytm-compact-video-renderer', // mobile /results page (ytm-rich-item-renderer)
            'ytm-item-section-renderer' // mobile /subscriptions page
         ]
            .map(i => `${i}:not(.${SELECTOR_CLASS_NAME})`)
            .join(',');

      // Solution 1 (HTML5). page update event
      document.addEventListener('scrollend', function self() {
         if (typeof self.timeout === 'number') clearTimeout(self.timeout);
         self.timeout = setTimeout(patchThumb, 50); // 50ms
      });

      // Solution 2 (API). page update event
      document.addEventListener('yt-action', evt => {
         // console.debug(evt.detail?.actionName);
         switch (evt.detail?.actionName) {
            case 'yt-append-continuation-items-action': // home, results, feed, channel, watch
            case 'ytd-update-grid-state-action': // feed, channel
            case 'yt-rich-grid-layout-refreshed': // feed
            // case 'ytd-rich-item-index-update-action': // home, channel
            case 'yt-store-grafted-ve-action': // results, watch
               // case 'ytd-update-elements-per-row-action': // feed
               // case 'yt-forward-redux-action-to-live-chat-iframe': // watch test

               // universal
               // case 'ytd-update-active-endpoint-action':
               // case 'yt-window-scrolled':
               // case 'yt-service-request': // results, watch

               // console.debug(evt.detail?.actionName); // flltered
               patchThumb();
               break;
         }
      });

      // button style
      NOVA.css.push(
         `#${SELECTOR_OVERLAY_ID_NAME} {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 999;
         }
         button.${SELECTOR_CLASS_NAME} {
            border: 0;
            cursor: pointer;
            height: 1.3em;
            font-size: 2em;
            background-color: transparent;
            background-color: var(--yt-spec-static-overlay-background-heavy);
            color: var(--yt-spec-static-overlay-text-primary);
         }`);

      function renderButton(thumb = required()) {
         const btn = document.createElement('button');
         btn.className = SELECTOR_CLASS_NAME;
         // // btn.textContent = '⏱';
         // // btn.textContent = '🕓';
         // btn.innerHTML = NOVA.createSafeHTML(
         //    `<svg viewBox="0 0 24 24" height="100%" width="100%">
         //       <g fill="currentColor">
         //          <path d="M14.97 16.95 10 13.87V7h2v5.76l4.03 2.49-1.06 1.7zM12 3c-4.96 0-9 4.04-9 9s4.04 9 9 9 9-4.04 9-9-4.04-9-9-9m0-1c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
         //       </g>
         //    </svg>`);
         // fix - This document requires 'TrustedHTML' assignment.
         btn.append((function createSvgIcon() {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('height', '100%');
            svg.setAttribute('width', '100%');

            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('fill', 'currentColor');

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M14.97 16.95 10 13.87V7h2v5.76l4.03 2.49-1.06 1.7zM12 3c-4.96 0-9 4.04-9 9s4.04 9 9 9 9-4.04 9-9-4.04-9-9-9m0-1c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z');

            g.append(path);
            svg.append(g);

            return svg;
         })());

         btn.title = 'Watch Later';
         // btn.style.cssText = '';
         // Object.assign(btn.style, {
         //    border: 0,
         //    cursor: 'pointer',
         //    // scale: .7,
         //    position: 'absolute',
         //    top: 0,
         //    left: 0,
         //    height: '30px',
         //    'z-index': 999,
         //    'background-color': 'transparent',
         // });
         btn.addEventListener('click', async evt => {
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();

            if (menu = thumb.querySelector('#menu button')) {
               menu.click();
               await NOVA.waitSelector('#menu [menu-active]', { container: thumb, destroy_after_page_leaving: true });
               // click by original "watch later" menu item
               if (menuItemEl = document.body.querySelector('tp-yt-iron-dropdown [role="menuitem"]:has(path[d^="M14.97"])')) {
                  menuItemEl.style.backgroundColor = 'red';
                  // await NOVA.delay(500);
                  // if(confirm('click to mark red item?')) {
                  await menuItemEl.click();
                  // }
                  menuItemEl.style.removeProperty('backgroundColor');
               }
               document.body.click(); // close menu
               // menu.click();
            }
         });
         return btn;
      }

      function patchThumb() {
         switch (NOVA.currentPage) {
            // case 'home':
            // case 'results':
            case 'feed':
               // case 'channel':
               // case 'watch':
               document.body.querySelectorAll(thumbsSelectors)
                  .forEach(thumb => {
                     thumb.classList.add(SELECTOR_CLASS_NAME);

                     if (container = thumb.querySelector('a#thumbnail.ytd-thumbnail')) {
                        // if (user_settings['thumbs-not-interested']) {
                        //    NOVA.waitSelector(`#${SELECTOR_OVERLAY_ID_NAME}`, { 'container': container })
                        //       .then(container => {
                        //          container.append(renderButton(thumb));
                        //       });
                        // }
                        // else {
                        const div = document.createElement('div');
                        div.id = SELECTOR_OVERLAY_ID_NAME;
                        div.append(renderButton(thumb));
                        container.append(div);
                     }
                     // }
                     // if (vidId = NOVA.queryURL.get('v', thumb.href)) {
                     // }
                  });
               break;

            // default:
            //    break;
         }
      }

   },
});
