// for test:
// thanks button
// https://www.youtube.com/watch?v=b7zBJNmdImo
// https://www.youtube.com/watch?v=muxq5sQVdlc
// https://www.youtube.com/watch?v=Pf8YTpp7B2I
// https://www.youtube.com/watch?v=uvNkdAggUGU
// https://www.youtube.com/watch?v=Eb7al22iNPc

window.nova_plugins.push({
   id: 'player-hide-elements',
   title: 'Hide some player buttons/elements',
   // 'title:zh': '',
   // 'title:ja': '',
   // 'title:ko': '',
   // 'title:id': '',
   // 'title:es': '',
   // 'title:pt': '',
   // 'title:fr': '',
   // 'title:it': '',
   // 'title:tr': '',
   // 'title:de': '',
   // 'title:pl': '',
   // 'title:ua': '',
   run_on_pages: 'watch, embed, -mobile',
   section: 'player',
   // desc: '',
   _runtime: user_settings => {

      // alt - https://greasyfork.org/en/scripts/463204-youtube-player-controls-edited

      const SELECTORS = {
         // 'country_code': '#masthead #country-code',
         // 'voice_search_button': '#masthead #voice-search-button',
         // player ends
         // alt - https://greasyfork.org/en/scripts/466195-remove-youtube-video-end-screen-thumbnails
         'videowall_endscreen': '#movie_player .videowall-endscreen',
         'card_endscreen': '#movie_player [class^="ytp-ce-"]',
         // player control left
         'prev_button': '#movie_player .ytp-chrome-bottom .ytp-prev-button',
         'play_button': '#movie_player .ytp-chrome-bottom .ytp-play-button',
         'next_button': '#movie_player .ytp-chrome-bottom .ytp-next-button',
         'volume_area': '#movie_player .ytp-chrome-bottom .ytp-volume-area',
         'time_display': '#movie_player .ytp-chrome-bottom .ytp-time-display'
            + (user_settings['time-remaining'] ? ' span > span:not([id])' : ''),
         'chapter_container': '#movie_player .ytp-chrome-bottom .ytp-chapter-container', // duplicate "player_indicator_chapter_default_container_hide" [player-indicator] plugin
         // player control right
         'autonav_toggle_button': '#movie_player .ytp-chrome-bottom button.ytp-button[data-tooltip-target-id="ytp-autonav-toggle-button"]',
         'subtitles_button': '#movie_player .ytp-chrome-bottom button.ytp-subtitles-button',
         'settings_button': '#movie_player .ytp-chrome-bottom button.ytp-settings-button',
         'size_button': '#movie_player .ytp-chrome-bottom button.ytp-size-button',
         'miniplayer_button': '#movie_player .ytp-chrome-bottom button.ytp-miniplayer-button',
         'logo_button': '#movie_player .ytp-chrome-bottom .yt-uix-sessionlink',
         'fullscreen_button': '#movie_player .ytp-chrome-bottom button.ytp-fullscreen-button',
      };

      const toArray = a => Array.isArray(a) ? a : [a];
      // function checkIsList(el, idx, array) {
      //    if (data = SELECTORS[el]) {
      //       list.push(data);
      //       return true;
      //    }
      // }

      let list = [];

      toArray(user_settings.player_hide_elements)
         .forEach(el => (data = SELECTORS[el]) && list.push(data));

      // final
      // if (toArray(user_settings.player_hide_elements).every(checkIsList) && list.length) {
      // if ((list = toArray(user_settings.player_hide_elements).map(el => SELECTORS[el]).filter(Boolean)) && list.length) {
      if (list.length) {
         NOVA.css.push(
            list.join(',\n') + ` {
               display: none !important;
            }`);
         // NOVA.css.push({
         //    'display': 'none !important',
         // }, list.join(',\n'));
      }

   },
   options: {
      // player_hide_elements_items: {
      player_hide_elements: {
         _tagName: 'select',
         label: 'Items',
         // 'label:zh': '',
         // 'label:ja': '',
         // 'label:ko': '',
         // 'label:id': '',
         // 'label:es': '',
         // 'label:pt': '',
         // 'label:fr': '',
         // 'label:it': '',
         // 'label:tr': '',
         // 'label:de': '',
         // 'label:pl': '',
         // 'label:ua': '',
         title: '[Ctrl+Click] to select several',
         'title:zh': '[Ctrl+Click] 选择多个',
         'title:ja': '「Ctrl+Click」して、いくつかを選択します',
         'title:ko': '[Ctrl+Click] 여러 선택',
         'title:id': '[Ctrl+Klik] untuk memilih beberapa',
         'title:es': '[Ctrl+Click] para seleccionar varias',
         'title:pt': '[Ctrl+Click] para selecionar vários',
         'title:fr': '[Ctrl+Click] pour sélectionner plusieurs',
         'title:it': '[Ctrl+Clic] per selezionarne diversi',
         // 'title:tr': 'Birkaç tane seçmek için [Ctrl+Tıkla]',
         'title:de': '[Ctrl+Click] um mehrere auszuwählen',
         'title:pl': 'Ctrl+kliknięcie, aby zaznaczyć kilka',
         'title:ua': '[Ctrl+Click] щоб обрати декілька',
         multiple: null, // don't use - selected: true
         required: true, // don't use - selected: true
         size: 10, // = options.length
         options: [
            // {
            //    label: 'header: country_code', value: 'country_code',
            //    // 'label:zh': '',
            //    // 'label:ja': '',
            //    // 'label:ko': '',
            //    // 'label:id': '',
            //    // 'label:es': '',
            //    // 'label:pt': '',
            //    // 'label:fr': '',
            //    // 'label:it': '',
            //    // 'label:tr': '',
            //    // 'label:de': '',
            //    // 'label:pl': '',
            //    // 'label:ua': '',
            // },
            // {
            //    label: 'header: voice_search', value: 'voice_search_button',
            //    // 'label:zh': '',
            //    // 'label:ja': '',
            //    // 'label:ko': '',
            //    // 'label:id': '',
            //    // 'label:es': '',
            //    // 'label:pt': '',
            //    // 'label:fr': '',
            //    // 'label:it': '',
            //    // 'label:tr': '',
            //    // 'label:de': '',
            //    // 'label:pl': '',
            //    // 'label:ua': '',
            // },
            {
               label: 'videowall (thumbs)', value: 'videowall_endscreen',
               // 'label:zh': '',
               // 'label:ja': '',
               // 'label:ko': '',
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
               label: 'card', value: 'card_endscreen',
               // 'label:zh': '',
               // 'label:ja': '',
               // 'label:ko': '',
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
               label: 'prev', value: 'prev_button',
               // 'label:zh': '',
               // 'label:ja': '',
               // 'label:ko': '',
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
               label: 'play', value: 'play_button',
               // 'label:zh': '',
               // 'label:ja': '',
               // 'label:ko': '',
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
               label: 'next', value: 'next_button',
               // 'label:zh': '',
               // 'label:ja': '',
               // 'label:ko': '',
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
               label: 'volume', value: 'volume_area',
               // 'label:zh': '',
               // 'label:ja': '',
               // 'label:ko': '',
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
               label: 'time', value: 'time_display',
               // 'label:zh': '',
               // 'label:ja': '',
               // 'label:ko': '',
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
               label: 'chapter', value: 'chapter_container',
               // 'label:zh': '',
               // 'label:ja': '',
               // 'label:ko': '',
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
               label: 'autonav toggle', value: 'autonav_toggle_button',
               // 'label:zh': '',
               // 'label:ja': '',
               // 'label:ko': '',
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
               label: 'subtitles', value: 'subtitles_button',
               // 'label:zh': '',
               // 'label:ja': '',
               // 'label:ko': '',
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
               label: 'settings', value: 'settings_button',
               // 'label:zh': '',
               // 'label:ja': '',
               // 'label:ko': '',
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
               label: 'size', value: 'size_button',
               // 'label:zh': '',
               // 'label:ja': '',
               // 'label:ko': '',
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
               label: 'miniplayer', value: 'miniplayer_button',
               // 'label:zh': '',
               // 'label:ja': '',
               // 'label:ko': '',
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
               label: 'logo (embed)', value: 'logo_button',
               // 'label:zh': '',
               // 'label:ja': '',
               // 'label:ko': '',
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
               label: 'fullscreen', value: 'fullscreen_button',
               // 'label:zh': '',
               // 'label:ja': '',
               // 'label:ko': '',
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
