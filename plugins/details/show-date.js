// for test
// https://www.youtube.com/watch?v=jfKfPfyJRdk - live now
// https://www.youtube.com/watch?v=c9Ft3LqNmrE - live ended
// https://www.youtube.com/watch?v=OBt8J5TVfEY - premiere ended

window.nova_plugins.push({
   id: 'video-date-format',
   // title: 'Displaying date format',
   title: 'Date format display',
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
   run_on_pages: 'watch, -mobile',
   // restart_on_location_change: true,
   section: 'details',
   opt_api_key_warn: true,
   _runtime: user_settings => {

      // alt - https://greasyfork.org/en/scripts/424068-youtube-exact-upload

      const
         CACHE_PREFIX = 'nova-video-date:',
         DATE_SELECTOR_ID = 'nova-video-published-date';

      NOVA.runOnPageLoad(async () => {
         if (NOVA.currentPage == 'watch') {
            await NOVA.waitUntil(() => typeof movie_player === 'object', 1000); // 1sec

            NOVA.waitSelector('#title h1', { destroy_after_page_leaving: true })
               .then(el => setVideoDate(el));
         }
      });

      function setVideoDate(container = required()) {
         // console.debug('setVideoDate:', ...arguments);
         const videoId = NOVA.queryURL.get('v') || movie_player.getVideoData().video_id;

         // // has in cache
         if (storage = sessionStorage.getItem(CACHE_PREFIX + videoId)) {
            return insertToHTML({ 'text': storage, 'container': container });
         }
         // // from local
         // else if (videoDate = document.body.querySelector('ytd-watch-flexy')?.playerData?.microformat?.playerMicroformatRenderer.publishDate ||
         //    NOVA.seachInObjectBy.key({
         //       'obj': (document.body.querySelector('ytd-watch-flexy')?.playerData
         //          || document.body.querySelector('ytd-app')?.__data?.data?.response
         //          || document.body.querySelector('ytd-app')?.data?.response
         //          || window.ytInitialData
         //       ),
         //       'keys': 'publishDate',
         //       match_fn: null,
         //    })?.data) {
         //    videoDate = videoDate.simpleText || videoDate;
         //    insertToHTML({ 'text': videoDate, 'container': container });
         //    // save cache in tabs
         //    sessionStorage.setItem(CACHE_PREFIX + videoId, videoDate);
         // }
         // from API
         // else {
         NOVA.request.API({
            request: 'videos',
            params: {
               'id': videoId,
               'part': 'snippet,liveStreamingDetails'
                  + (user_settings.video_view_count ? ',statistics' : '')
            },
            api_key: user_settings['user-api-key'],
         })
            .then(res => {
               if (res?.error) return alert(`Error [${res.code}]: ${res.reason}\n` + res.error);

               // ex - https://developers.google.com/youtube/v3/docs/videos/list?apix_params=%7B%22part%22%3A%5B%22snippet%22%5D%2C%22id%22%3A%5B%22jfKfPfyJRdk%22%5D%7D
               res?.items?.forEach(item => {
                  // "liveStreamingDetails": {
                  //    "actualStartTime": "2022-07-12T15:59:30Z",
                  //    "scheduledStartTime": "2022-07-12T16:00:00Z",
                  //    "concurrentViewers": "25194",
                  //    "activeLiveChatId": ""
                  //  }
                  // "statistics": {
                  //    "viewCount": "313303291",
                  //    "likeCount": "2376859",
                  //    "favoriteCount": "0",
                  //    "commentCount": "0"
                  //  }

                  let innerHTML = user_settings.video_view_count
                     // ? new Intl.NumberFormat().format(item.statistics.viewCount) + ' • '
                     ? NOVA.prettyRoundInt(item.statistics.viewCount) + ' • '
                     : '';

                  if (item.snippet.publishedAt) {
                     const publishedDate = new Date(item.snippet.publishedAt);

                     innerHTML += (user_settings.video_date_format == 'ago')
                        ? `${NOVA.formatTimeOut.ago(publishedDate)} ago`
                        : NOVA.dateformat.apply(publishedDate, [user_settings.video_date_format]);
                  }

                  if (item.liveStreamingDetails) {
                     const
                        ACTIVE_LIVE_START = 'Active Livestream since ',
                        // ENDED_STREAM_START = `${document.body.querySelector('ytd-watch-flexy')?.playerData.videoDetails.isLiveContent ? 'Livestream' : 'Premiere'} from `,
                        ENDED_STREAM_START = `${movie_player.getVideoData().isLive ? 'Livestream' : 'Premiere'} from `,
                        DATETIME_UNTIL_PATTERN = ' until ';

                     if (item.liveStreamingDetails.actualStartTime && item.liveStreamingDetails.actualEndTime) {
                        const
                           timeStart = new Date(item.liveStreamingDetails.actualStartTime),
                           timeEnd = new Date(item.liveStreamingDetails.actualEndTime);

                        innerHTML += ENDED_STREAM_START
                           + NOVA.dateformat.apply(timeStart, [user_settings.video_date_format]);

                        innerHTML += DATETIME_UNTIL_PATTERN
                           + NOVA.dateformat.apply(timeEnd, [
                              timeStart.getDay() === timeEnd.getDay() // start date and end date are the same
                                 ? user_settings.video_date_format.split(' at ')[1] // remove "date" if not diff
                                 : user_settings.video_date_format
                           ]);
                     }
                     else if (item.liveStreamingDetails.scheduledStartTime) {
                        innerHTML += ACTIVE_LIVE_START
                           + NOVA.dateformat.apply(new Date(item.liveStreamingDetails.scheduledStartTime), [user_settings.video_date_format]);
                     }
                  }

                  // else {
                  //    return console.warn('API is change', item);
                  // }

                  if (innerHTML) {
                     insertToHTML({ 'text': innerHTML, 'container': container });
                     // save cache in tabs
                     sessionStorage.setItem(CACHE_PREFIX + videoId, innerHTML);
                  }
               });
            });
         // }

         function insertToHTML({ text = '', container = required() }) {
            // console.debug('insertToHTML', ...arguments);
            if (!(container instanceof HTMLElement)) return console.error('container not HTMLElement:', container);

            (document.getElementById(DATE_SELECTOR_ID) || (function () {
               container.insertAdjacentHTML('afterend',
                  `<span id="${DATE_SELECTOR_ID}" class="style-scope yt-formatted-string bold" style="font-size: 1.35rem; line-height: 2rem; font-weight:400;">${text}</span>`);
               return document.getElementById(DATE_SELECTOR_ID);
            })())
               // .textContent = new Date(text).format(user_settings.video_date_format);
               // .textContent = NOVA.dateformat.apply(new Date(text), [user_settings.video_date_format]);
               .textContent = text;
         }

         // simple
         // Date.prototype.format = function (format = 'YYYY/MM/DD') {
         // function NOVA.dateformat(format = 'YYYY/MM/DD') {
         //    return format
         //       .replace('YYYY', this.getFullYear())
         //       .replace('MMM', ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][(this.getMonth() + 1)]) // Attention! before "MM"
         //       .replace('MM', (this.getMonth() + 1).toString().padStart(2, '0'))
         //       .replace('DD', this.getDate().toString().padStart(2, '0'))
         //       .replace('D', this.getDate());
         // };
      }

   },
   options: {
      video_view_count: {
         _tagName: 'input',
         // label: 'Show view count',
         label: 'Show number of views',
         // 'label:zh': '',
         // 'label:ja': '',
         // 'label:ko': '',
         // 'label:vi': '',
         // 'label:id': '',
         // 'label:es': '',
         // 'label:pt': '',
         // 'label:fr': '',
         // 'label:it': '',
         // 'label:tr': '',
         // 'label:de': '',
         // 'label:pl': '',
         // 'label:ua': '',
         type: 'checkbox',
         // title: '',
      },
      video_date_format: {
         _tagName: 'select',
         label: 'Date pattern',
         // 'label:zh': '',
         // 'label:ja': '',
         // 'label:ko': '',
         // 'label:vi': '',
         // 'label:id': '',
         // 'label:es': '',
         // 'label:pt': '',
         // 'label:fr': '',
         // 'label:it': '',
         // 'label:tr': '',
         // 'label:de': '',
         // 'label:pl': '',
         // 'label:ua': '',
         options: [
            { label: 'ago', value: 'ago' },
            // { label: 'MMMM D, Y', value: 'MMMM D, YYYY' },
            { label: 'January 20, 1999', value: 'MMMM D, YYYY' },
            // { label: 'D MMM Y', value: 'D MMM YYYY' },
            { label: '20 Jan 1999', value: 'D MMM YYYY' },
            // { label: 'D MMM at Y H:mm:ss', value: 'D MMM YYYY at H:mm:ss', selected: true },
            { label: '20 Jan 1999 at 23:00:00', value: 'D MMM YYYY at H:mm:ss', selected: true },
            // { label: 'DDD DD/MM/YYYY', value: 'DDD DD/MM/YYYY H:mm:ss' },
            { label: 'Mon 30/01/1999 23:00:00', value: 'DDD DD/MM/YYYY H:mm:ss' },
            // { label: 'DDDD DD/MM/YYYY', value: 'DDDD DD/MM/YYYY H:mm:ss' },
            { label: 'Monday 30/01/1999 23:00:00', value: 'DDDD DD/MM/YYYY H:mm:ss' },
            // { label: 'Y/MM/DD', value: 'YYYY/MM/DD' },
            { label: '1999/01/20', value: 'YYYY/MM/DD' },
            // { label: 'Y-MM-D', value: 'YYYY-MM-D' },
            { label: '1999-01-20', value: 'YYYY-MM-D' },
            // { label: 'Y.MM.D', value: 'YYYY.MM.D' },
            { label: '1999.01.20', value: 'YYYY.MM.D' },
            // { label: 'MM/DD/Y', value: 'MM/DD/YYYY' },
            { label: '01/20/1999', value: 'MM/DD/YYYY' },
            // { label: 'MM/DD/Y at H:mm:ss', value: 'MM/DD/YYYY at H:mm:ss' },
            { label: '01/20/1999 at 23:00:00', value: 'MM/DD/YYYY at H:mm:ss' },
            // { label: 'MM-D-Y', value: 'MM-D-YYYY' },
            { label: '01-20-1999', value: 'MM-D-YYYY' },
            // { label: 'MM-D-Y at H:mm:ss', value: 'MM-D-YYYY at H:mm:ss' },
            { label: '01-20-1999 at 23:00:00', value: 'MM-D-YYYY at H:mm:ss' },
            // { label: 'MM.D.Y', value: 'MM.D.YYYY' },
            { label: '01.20.1999', value: 'MM.D.YYYY' },
            // { label: 'MM.D.Y at H:mm:ss', value: 'MM.D.YYYY at H:mm:ss' },
            { label: '01.20.1999 at 23:00:00', value: 'MM.D.YYYY at H:mm:ss' },
         ],
      },
   }
});