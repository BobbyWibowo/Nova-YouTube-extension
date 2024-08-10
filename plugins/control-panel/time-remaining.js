window.nova_plugins.push({
   id: 'time-remaining',
   title: 'Remaining time',
   'title:zh': '剩余时间',
   'title:ja': '余日',
   // 'title:ko': '남은 시간',
   // 'title:vi': '',
   // 'title:id': 'Waktu yang tersisa',
   // 'title:es': 'Tiempo restante',
   // 'title:pt': 'Tempo restante',
   // 'title:fr': 'Temps restant',
   // 'title:it': 'Tempo rimanente',
   // 'title:tr': 'Kalan süre',
   // 'title:de': 'Verbleibende Zeit',
   'title:pl': 'Pozostały czas',
   // 'title:ua': 'Час, що залишився',
   run_on_pages: 'watch, embed, -mobile',
   section: 'control-panel',
   desc: 'Remaining time until the end of the video',
   'desc:zh': '距离视频结束的剩余时间',
   'desc:ja': 'ビデオの終わりまでの残り時間',
   // 'desc:ko': '영상 끝까지 남은 시간',
   // 'desc:vi': '',
   // 'desc:id': 'Sisa waktu sampai akhir video',
   // 'desc:es': 'Tiempo restante hasta el final del video',
   // 'desc:pt': 'Tempo restante até o final do vídeo',
   // 'desc:fr': "Temps restant jusqu'à la fin de la vidéo",
   // 'desc:it': 'Tempo rimanente fino alla fine del video',
   // 'desc:tr': 'Videonun sonuna kalan süre',
   // 'desc:de': 'Verbleibende Zeit bis zum Ende des Videos',
   'desc:pl': 'Czas pozostały do końca filmu',
   // 'desc:ua': 'Час, що залишився до кінця відео',
   _runtime: user_settings => {

      // alt1 - https://greasyfork.org/en/scripts/432706-youtube-speeder
      // alt2 - https://greasyfork.org/en/scripts/368389-youtube-time-remaining
      // alt3 - https://greasyfork.org/en/scripts/19120-youtube-remaining-time
      // alt4 - https://greasyfork.org/en/scripts/38090-add-youtube-video-progress
      // alt5 - https://greasyfork.org/en/scripts/477119-youtube-remaining-time
      // alt6 - https://greasyfork.org/en/scripts/485321-youtube-end-time-display
      // alt7 - https://greasyfork.org/en/scripts/489800-youtube-video-length-based-on-its-speed

      const SELECTOR_ID = 'nova-player-time-remaining';

      // NOVA.waitSelector('.ytp-time-duration, ytm-time-display .time-display-content, .player-controls-bottom .ytm-time-display .time-display-content')

      let selectorOutAfter;
      switch (user_settings.time_remaining_position) {
         case 'description': selectorOutAfter = '#title h1'; break;
         // case 'player':
         default: selectorOutAfter = '.ytp-time-duration, ytm-time-display .time-display-content'; break;
      }

      NOVA.waitSelector(selectorOutAfter)
         .then(container => {

            NOVA.waitSelector('video')
               .then(video => {
                  video.addEventListener('timeupdate', setRemaining.bind(video));
                  video.addEventListener('ratechange', setRemaining.bind(video));
                  // clear text
                  // BUG - "suspend" blinking text in google drive player
                  // ['suspend', 'ended'].forEach(evt => {
                  //    video.addEventListener(evt, () => insertToHTML({ 'container': container }));
                  // });
                  video.addEventListener('ended', () => insertToHTML({ 'container': container }));
                  document.addEventListener('yt-navigate-finish', () => insertToHTML({ 'container': container }));
               });

            function setRemaining() {
               if (isNaN(this.duration)
                  || movie_player.getVideoData().isLive // stream. Doesn't work in embed
                  || (NOVA.currentPage == 'embed' && document.URL.includes('live_stream'))
                  || document.visibilityState == 'hidden' // tab inactive
                  || ((user_settings.time_remaining_position != 'description') && movie_player.classList.contains('ytp-autohide'))
               ) return;

               const
                  currentTime = Math.trunc(this.currentTime),
                  duration = Math.trunc(this.duration),
                  delta_ = duration - currentTime, // tiny optimization
                  getPercent = percentage_type_left => {
                     const
                        floatRound = pt => (this.duration > 3600)
                           ? pt.toFixed(2) // >1 hour
                           : (this.duration > 1500)
                              ? pt.toFixed(1) // >25 minutes
                              : Math.round(pt),
                        calcPercentage = percentage_type_left
                           ? delta_ * 100 / duration
                           : currentTime * 100 / duration;

                     return floatRound(calcPercentage) + '%';
                  };

               const text = user_settings.time_remaining_format
                  .replace(/\{(rate|left|done|duration)(\^|%)?\}/g, pattern => {
                     switch (pattern) {
                        case '{rate}': return this.playbackRate === 1 ? '' : this.playbackRate; break;
                        case '{left}': return '-' + NOVA.formatTimeOut.HMS.digit(delta_); break;
                        case '{left^}': return '-' + NOVA.formatTimeOut.HMS.digit(delta_ / this.playbackRate); break;
                        case '{left%}': return '-' + getPercent('left'); break;
                        case '{done}': return NOVA.formatTimeOut.HMS.digit(currentTime); break;
                        case '{done^}': return NOVA.formatTimeOut.HMS.digit(currentTime / this.playbackRate); break;
                        case '{done%}': return getPercent(); break;
                        case '{duration}': return NOVA.formatTimeOut.HMS.digit(duration); break;
                        case '{duration^}': return NOVA.formatTimeOut.HMS.digit(duration / this.playbackRate); break;
                        // default: console.debug('skiped:', partPattern); break;
                     }
                  });

               if (text) insertToHTML({ 'text': text, 'container': container });
            }

            function insertToHTML({ text = '', container = required() }) {
               // console.debug('insertToHTML', ...arguments);
               if (!(container instanceof HTMLElement)) return console.error('container not HTMLElement:', container);

               (document.getElementById(SELECTOR_ID) || (function () {
                  const el = document.createElement('span');
                  el.id = SELECTOR_ID;
                  container.after(el);
                  // container.insertAdjacentElement('afterend', el);
                  return el;
                  // 62.88 % slower
                  // container.insertAdjacentHTML('afterend', NOVA.createSafeHTML(`&nbsp;<span id="${SELECTOR_ID}">${text}</span>`));
                  // return document.getElementById(SELECTOR_ID);
               })())
                  .textContent = ' ' + text;
            }

         });

   },
   options: {
      // Solution 1 (input + datalist)
      time_remaining_format: {
         _tagName: 'input',
         label: 'Time pattern',
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
         // type: 'url',
         type: 'text',
         list: 'time_remaining_format_help_list',
         // pattern: "",
         // title: 'Clear input to show hints',
         title: '[^] - correction current playback speed',
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
         placeholder: '{done%}/{duration^} ({rate})',
         minlength: 4,
         maxlength: 100,
         // value: '',
         required: true,
      },
      time_remaining_format_help_list: {
         _tagName: 'datalist',
         options: [
            // ready-made examples
            { label: '0:10/0:44 (1.75)', value: '{done}/{duration} ({rate})' },
            { label: '0:05/0:25 (23%)', value: '{done^}/{duration^} ({done%})' },
            { label: '-0:34/0:44 (1.75)', value: '{left}/{duration} ({rate})' },
            { label: '-0:19/0:25 -77%', value: '{left^}/{duration^} {left%}' },
            // all available parts
            { label: '1.75', value: '{rate}' },
            { label: '-0:34', value: '{left}' },
            { label: '-0:19', value: '{left^}' },
            { label: '-77%', value: '{left%}' },
            { label: '0:10', value: '{done}' },
            { label: '0:05', value: '{done^}' },
            { label: '23%', value: '{done%}' },
            { label: '0:44', value: '{duration}' },
            { label: '0:25', value: '{duration^}' },
         ],
      },
      // Solution 2 (list + input)
      // time_remaining_format1: {
      //    _tagName: 'select',
      //    label: 'Time pattern',
      //    // 'label:zh': '',
      //    // 'label:ja': '',
      //    // 'label:ko': '',
      //    // 'label:vi': '',
      //    // 'label:id': '',
      //    // 'label:es': '',
      //    // 'label:pt': '',
      //    // 'label:fr': '',
      //    // 'label:it': '',
      //    // 'label:tr': '',
      //    // 'label:de': '',
      //    // 'label:pl': '',
      //    // 'label:ua': '',
      //    title: '[^] - correction current playback speed',
      //    // 'title:zh': '',
      //    // 'title:ja': '',
      //    // 'title:ko': '',
      //    // 'title:vi': '',
      //    // 'title:id': '',
      //    // 'title:es': '',
      //    // 'title:pt': '',
      //    // 'title:fr': '',
      //    // 'title:it': '',
      //    // 'title:tr': '',
      //    // 'title:de': '',
      //    // 'title:pl': '',
      //    // 'title:ua': '',
      //    options: [
      //       {
      //          label: '{left^}', value: '{left^}', selected: true,
      //          // 'label:zh': '',
      //          // 'label:ja': '',
      //          // 'label:ko': '',
      //          // 'label:vi': '',
      //          // 'label:id': '',
      //          // 'label:es': '',
      //          // 'label:pt': '',
      //          // 'label:fr': '',
      //          // 'label:it': '',
      //          // 'label:tr': '',
      //          // 'label:de': '',
      //          // 'label:pl': '',
      //          // 'label:ua': '',
      //       },
      //       {
      //          label: '{left^} ({done%})', value: '{left^} ({done%})',
      //          // 'label:zh': '',
      //          // 'label:ja': '',
      //          // 'label:ko': '',
      //          // 'label:vi': '',
      //          // 'label:id': '',
      //          // 'label:es': '',
      //          // 'label:pt': '',
      //          // 'label:fr': '',
      //          // 'label:it': '',
      //          // 'label:tr': '',
      //          // 'label:de': '',
      //          // 'label:pl': '',
      //          // 'label:ua': '',
      //       },
      //       {
      //          label: '{left^} ({left%})', value: '{left^} ({left%})',
      //          // 'label:zh': '',
      //          // 'label:ja': '',
      //          // 'label:ko': '',
      //          // 'label:vi': '',
      //          // 'label:id': '',
      //          // 'label:es': '',
      //          // 'label:pt': '',
      //          // 'label:fr': '',
      //          // 'label:it': '',
      //          // 'label:tr': '',
      //          // 'label:de': '',
      //          // 'label:pl': '',
      //          // 'label:ua': '',
      //       },
      //       {
      //          label: '{left}/{left^} ({done%})', value: '{left}/{left^} ({done%})',
      //          // 'label:zh': '',
      //          // 'label:ja': '',
      //          // 'label:ko': '',
      //          // 'label:vi': '',
      //          // 'label:id': '',
      //          // 'label:es': '',
      //          // 'label:pt': '',
      //          // 'label:fr': '',
      //          // 'label:it': '',
      //          // 'label:tr': '',
      //          // 'label:de': '',
      //          // 'label:pl': '',
      //          // 'label:ua': '',
      //       },
      //       {
      //          label: '{left}', value: '{left}',
      //          // 'label:zh': '',
      //          // 'label:ja': '',
      //          // 'label:ko': '',
      //          // 'label:vi': '',
      //          // 'label:id': '',
      //          // 'label:es': '',
      //          // 'label:pt': '',
      //          // 'label:fr': '',
      //          // 'label:it': '',
      //          // 'label:tr': '',
      //          // 'label:de': '',
      //          // 'label:pl': '',
      //          // 'label:ua': '',
      //       },
      //       {
      //          label: '{left%}', value: '{left%}',
      //          // 'label:zh': '',
      //          // 'label:ja': '',
      //          // 'label:ko': '',
      //          // 'label:vi': '',
      //          // 'label:id': '',
      //          // 'label:es': '',
      //          // 'label:pt': '',
      //          // 'label:fr': '',
      //          // 'label:it': '',
      //          // 'label:tr': '',
      //          // 'label:de': '',
      //          // 'label:pl': '',
      //          // 'label:ua': '',
      //       },
      //       {
      //          label: '{done%}', value: '{done%}',
      //          // 'label:zh': '',
      //          // 'label:ja': '',
      //          // 'label:ko': '',
      //          // 'label:vi': '',
      //          // 'label:id': '',
      //          // 'label:es': '',
      //          // 'label:pt': '',
      //          // 'label:fr': '',
      //          // 'label:it': '',
      //          // 'label:tr': '',
      //          // 'label:de': '',
      //          // 'label:pl': '',
      //          // 'label:ua': '',
      //       },
      //       {
      //          label: '{done^}/{left^}', value: '{done^}/{left^}',
      //          // 'label:zh': '',
      //          // 'label:ja': '',
      //          // 'label:ko': '',
      //          // 'label:vi': '',
      //          // 'label:id': '',
      //          // 'label:es': '',
      //          // 'label:pt': '',
      //          // 'label:fr': '',
      //          // 'label:it': '',
      //          // 'label:tr': '',
      //          // 'label:de': '',
      //          // 'label:pl': '',
      //          // 'label:ua': '',
      //       },
      //       {
      //          label: '{done^}/{duration^}', value: '{done^}/{duration^}',
      //          // 'label:zh': '',
      //          // 'label:ja': '',
      //          // 'label:ko': '',
      //          // 'label:vi': '',
      //          // 'label:id': '',
      //          // 'label:es': '',
      //          // 'label:pt': '',
      //          // 'label:fr': '',
      //          // 'label:it': '',
      //          // 'label:tr': '',
      //          // 'label:de': '',
      //          // 'label:pl': '',
      //          // 'label:ua': '',
      //       },
      //       {
      //          label: '{left^}/{duration^}', value: '{left^}/{duration^}',
      //          // 'label:zh': '',
      //          // 'label:ja': '',
      //          // 'label:ko': '',
      //          // 'label:vi': '',
      //          // 'label:id': '',
      //          // 'label:es': '',
      //          // 'label:pt': '',
      //          // 'label:fr': '',
      //          // 'label:it': '',
      //          // 'label:tr': '',
      //          // 'label:de': '',
      //          // 'label:pl': '',
      //          // 'label:ua': '',
      //       },
      //       {
      //          label: '{left^}/{duration^} ({done%})', value: '{left^}/{duration^} ({done%})',
      //          // 'label:zh': '',
      //          // 'label:ja': '',
      //          // 'label:ko': '',
      //          // 'label:vi': '',
      //          // 'label:id': '',
      //          // 'label:es': '',
      //          // 'label:pt': '',
      //          // 'label:fr': '',
      //          // 'label:it': '',
      //          // 'label:tr': '',
      //          // 'label:de': '',
      //          // 'label:pl': '',
      //          // 'label:ua': '',
      //       },
      //       {
      //          label: '{left}/{left^} {rate}', value: '{left}/{left^} ({done%}) {rate}',
      //          // 'label:zh': '',
      //          // 'label:ja': '',
      //          // 'label:ko': '',
      //          // 'label:vi': '',
      //          // 'label:id': '',
      //          // 'label:es': '',
      //          // 'label:pt': '',
      //          // 'label:fr': '',
      //          // 'label:it': '',
      //          // 'label:tr': '',
      //          // 'label:de': '',
      //          // 'label:pl': '',
      //          // 'label:ua': '',
      //       },
      //    ],
      // },
      time_remaining_position: {
         _tagName: 'select',
         label: 'Render section',
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
            {
               label: 'player', value: 'player', selected: true,
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
            },
            {
               label: 'description', value: 'description',
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
            },
         ],
      },
   }
});
