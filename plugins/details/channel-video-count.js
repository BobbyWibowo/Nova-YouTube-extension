_plugins_conteiner.push({
   name: 'Show channel videos count',
   id: 'show-channel-videos-count',
   depends_on_pages: 'watch, channel',
   run_on_transition: true,
   opt_section: 'details',
   opt_api_key_warn: true,
   desc: 'Total number of videos on channel',
   _runtime: user_settings => {

      const
         CACHE_PREFIX = 'channel-video-count:',
         SELECTOR_ID = 'video_count',
         isChannelId = id => id && /UC([a-z0-9-_]{22})$/i.test(id);

      // watch page
      YDOM.HTMLElement.wait('#upload-info #channel-name a[href]')
         .then(link => {
            // console.debug('watch page');
            YDOM.HTMLElement.wait('#upload-info #owner-sub-count:not([hidden]):not(:empty)')
               .then(el => insertChannelStatistic({
                  'html_container': el,
                  'channel_id': link.href.split('/').pop()
               }));
         });

      // channel page
      YDOM.HTMLElement.wait('#channel-header #subscriber-count:not(:empty)')
         .then(el => {
            // console.debug('channel page');
            insertChannelStatistic({ 'html_container': el, 'channel_id': getChannelId() });

            function getChannelId() {
               return [
                  location.pathname.split('/')[2],
                  document.querySelector('meta[itemprop="channelId"][content]'),
                  document.querySelector('link[itemprop="url"][href]'),
                  ...document.querySelectorAll('meta[content]'),
                  ...document.querySelectorAll('link[href]')
               ]
                  .map(i => i?.href || i?.content)
                  .find(i => isChannelId(i?.split('/').pop()));
            }
         });

      function insertChannelStatistic({ html_container, channel_id }) {
         // console.debug('insertChannelStatistic:', ...arguments);

         if (!channel_id || !isChannelId(channel_id)) return;
         // if (!channel_id || !isChannelId(channel_id)) {
         //    console.debug('location.href', location.href);
         //    insertToHTML(''); // erase html
         //    return console.error('channel_id is invalid', channel_id);
         // }
         // cached
         const storage = sessionStorage.getItem(CACHE_PREFIX + channel_id);

         if (storage) {
            insertToHTML({ 'set_text': storage, 'html_container': html_container });

         } else {
            YDOM.request.API({
               request: 'channels',
               params: { 'id': channel_id, 'part': 'statistics' },
               api_key: user_settings['custom-api-key']
            })
               .then(res => {
                  res?.items?.forEach(item => {
                     const videoCount = item.statistics.videoCount;
                     insertToHTML({ 'set_text': videoCount, 'html_container': html_container });
                     // save cache in tabs
                     sessionStorage.setItem(CACHE_PREFIX + channel_id, videoCount);
                  });
               });
         }

         function insertToHTML({ set_text, html_container }) {
            // console.debug('insertToHTML', ...arguments);
            const boxHTML = document.getElementById(SELECTOR_ID) || (function () {
               html_container.insertAdjacentHTML("beforeend",
                  '<span class="date style-scope ytd-video-secondary-info-renderer" style="margin-right: 5px;">'
                  + ` • <span id="${SELECTOR_ID}">${set_text}</span> videos</span>`);
               return document.getElementById(SELECTOR_ID);
            })();
            boxHTML.textContent = set_text;
         }

      }

   }
});
