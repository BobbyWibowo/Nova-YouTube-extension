window.nova_plugins.push({
   id: 'pages-clear',
   // title: 'Hide garbage: annotations, endcards etc',
   // title: 'Hide HTML garbage',
   title: 'Clear pages of junk',
   'title:zh': '清除垃圾页面',
   'title:ja': 'ジャンクページをクリアする',
   // 'title:ko': '',
   // 'title:vi': '',
   // 'title:id': '',
   // 'title:es': '',
   // 'title:pt': 'Limpar páginas de lixo',
   // 'title:fr': 'Effacer les pages indésirables',
   // 'title:it': '',
   // 'title:tr': '',
   // 'title:de': 'Befreien Sie die Seiten von Müll',
   'title:pl': 'Wyczyść strony ze śmieci',
   // 'title:ua': 'Приховайте сміття: анотації, кінцеві заставки тощо',
   run_on_pages: 'results, feed, watch, embed, -mobile',
   section: 'other',
   // desc: "Turn off 'card' in https://www.youtube.com/account_playback",
   // desc: 'Remove the annoying stuff at the end of the videos',
   desc: 'Remove the annoying stuff',
   'desc:zh': '删除烦人的东西',
   'desc:ja': '煩わしいものを取り除く',
   // 'desc:ko': '',
   // 'desc:vi': '',
   // 'desc:id': '',
   // 'desc:es': '',
   // 'desc:pt': 'Remova as coisas irritantes',
   // 'desc:fr': 'Supprimez les trucs ennuyeux',
   // 'desc:it': '',
   // 'desc:tr': '',
   // 'desc:de': 'Entfernen Sie das lästige Zeug',
   'desc:pl': 'Usuń irytujące rzeczy',
   // 'desc:ua': 'Приховайте набридливий контент',
   _runtime: user_settings => {

      // alt1 - https://greasyfork.org/en/scripts/451446-youtube-embed-remove-branding
      // alt2 - https://greasyfork.org/en/scripts/462455-remove-youtube-propaganda
      // alt3 - https://greasyfork.org/en/scripts/407207-ad-free-youtube-grid
      // alt4 - https://greasyfork.org/en/scripts/480134-starburst-ads
      // alt5 - https://greasyfork.org/en/scripts/486616-youtube-search-results-cleanup
      // alt5 - https://greasyfork.org/en/scripts/488224-control-panel-for-youtube

      // hide donate"
      // '#donation-shelf',
      // 'ytm-donation-shelf-renderer-outer',

      // hide merch"
      // '#offer-module',
      // '#ticket-shelf',
      // '.ytp-drawer',
      // 'yt-alert-with-actions-renderer',
      // 'ytd-merch-shelf-renderer',
      // 'ytd-metadata-row-container-renderer>#always-shown',
      // 'ytm-compact-offer-module-renderer',

      let selectorsList = [
         // '.annotation',
         '.ytp-paid-content-overlay', // message in the bottom-left corner "Includes paid promotion"
         // channel icon in the bottom-right corner (https://www.youtube.com/watch?v=1RjnI64Rwqs)
         '.iv-branding',
         // '.iv-promo',

         '#movie_player:not(:hover) > [class^="ytp-ce-"]', // suggest video/channel for the end cards (for [player-control-below] plugin)
         // '.ytp-autohide > [class^="ytp-ce-"]', // suggest video/channel for the end cards
         '.ytp-cards-teaser-text', // "video suggestion" (title) in the top-right corner

         // mobile
         'ytm-paid-content-overlay-renderer', // message "Includes paid promotion"
      ];

      switch (NOVA.currentPage) {
         case 'embed':
            // https://stackoverflow.com/questions/52887444/hide-more-videos-within-youtube-iframe-when-stop-video
            selectorsList.push([
               (user_settings['player-quick-buttons'] && user_settings.player_buttons_custom_items?.includes('card-switch')) || '.ytp-pause-overlay', // wide-bottom block with more video list on pause embed

               '.ytp-info-panel-preview', // message "COVID-19 • Get the latest information from the WHO about coronavirus." - https://www.youtube.com/embed/47IwHxHVTxc?autoplay=1&wmode=opaque&fs=1&rel=0&autohide=1
            ]);
            break;

         default:
            selectorsList.push([
               // home page


               // results page
               'ytd-search-pyv-renderer', // fix blank space - https://www.youtube.com/results?search_query=Shubidua+-+Fed+Rock)

               '[class^="ytd-promoted-"]', // suggest site - https://www.youtube.com/results?search_query=mmersive+Simmulator
               // '.ytd-promoted-sparkles-text-search-renderer', // suggest something (I do not remember)
               // 'ytd-search-pyv-renderer ytd-promoted-video-renderer', // suggest ad-video

               'ytd-search-pyv-renderer ~ ytd-shelf-renderer', // Latest from channel / Latest posts from channel - https://www.youtube.com/results?search_query=Kiwami+game
               'ytd-video-renderer + ytd-shelf-renderer', // "People also watched" block - https://greasyfork.org/en/scripts/454513-youtube-search-results-cleaner
               // 'ytd-video-renderer + ytd-horizontal-card-list-renderer', // "People also search for" block

               // 'ytd-video-renderer + ytd-reel-shelf-renderer', // Shorts - https://www.youtube.com/results?search_query=+WE+DON%27T+HAVE+TO+TAKE+OUR+CLOTHES+OFF

               // 'ytd-promoted-sparkles-web-renderer', // Sponsored thumbs


               // watch page
               '#clarify-box', // message "COVID", "Wikipedia" link

               'ytd-watch-metadata ytd-info-panel-content-renderer', // message "USAGM is funded in whole or in part by the American government. Wikipedia", "Wikipedia" link

               '.ytd-watch-flexy.attached-message', // message "BBC World Service is a British public broadcast service. Wikipedia"

               // 'ytd-popup-container tp-yt-paper-dialog yt-mealbar-promo-renderer', // 'Ambient mode' You're watching in our more immersive ambient mode.

               'ytd-popup-container tp-yt-paper-dialog ytd-single-option-survey-renderer', // "How is YouTube today?" - Absolutely outstanding, Extremely good, Very good, Good, Not good

               '#donation-shelf ytd-donation-unavailable-renderer', // message "Sorry, you can't donate in this country or region yet." - https://www.youtube.com/watch?v=L_tg2u26tCU, https://www.youtube.com/watch?v=NGQ2Zhrkk4o

               `#subscribe-button .smartimation__border,
               #subscribe-button .smartimation__background,
               ytd-watch-metadata #actions .smartimation__border,
               ytd-watch-metadata #actions .smartimation__background`, // interaction CTAs - https://github.com/raingart/Nova-YouTube-extension/issues/125#issuecomment-1844091611

               '[class^="ytp-cultural-moment"]', // '.ytp-cultural-moment-player-content' link for "https://www.youtube.com/youtubemusic" - https://www.youtube.com/watch?v=9aofoBrFNdg

               // 'tp-yt-paper-dialog.ytd-popup-container.style-scope > .ytd-popup-container.style-scope', // message "YouTube Premium - Get YouTube without the ads". Error block unsabsrcibe popup

               'ytd-donation-unavailable-renderer, .ytd-donation-unavailable-renderer', // message "Sorry, you can't donate in this country or region yet." (https://www.youtube.com/watch?v=idx3GSL2KWs)


               // results, sidebar page
               '.sparkles-light-cta', // ad buy - https://www.youtube.com/results?search_query=Canon+Pixma+MG2520


               // home, watch page
               'ytd-feed-nudge-renderer', // message "Recommendations not quite right? When you turn on watch history, you’ll get more personalized recommendations."
            ]);

            // To above v105 https://developer.mozilla.org/en-US/docs/Web/CSS/:has
            if (CSS.supports('selector(:has(*))')) {
               selectorsList.push([
                  // '*:has(ytd-ad-slot-renderer)', // too general

                  // home page
                  'ytd-rich-item-renderer:has(ytd-ad-slot-renderer)', // Ad site

                  // results page
                  // 'ytd-item-section-renderer:has(ytd-ad-slot-renderer)', // Doesn't work. Ad buy

                  // watch page
                  // 'ytd-live-chat-frame#chat[collapsed]:has(iframe#chatframe[src="about:blank"])', // broken - https://www.youtube.com/watch?v=lSD_L-xic9o
                  '#chat[collapsed] #message', // hide chat "Live chat replay was turned off for this video.", "Chat Replay is disabled for this Premiere."

                  'ytd-popup-container:has(yt-tooltip-renderer[position-type="OPEN_POPUP_POSITION_BOTTOM"])', // hide tooltip below "join" buttob. $details-text = "Join this channel and unlock members-only perks" (https://www.youtube.com/watch?v=tBRT_RbnGOk)
               ]);
            }
      }

      if (selectorsList.length) {
         NOVA.css.push(
            selectorsList.join(',\n') + ` {
               display: none !important;
            }`);
         // NOVA.css.push({
         //    'display': 'none !important',
         // }, selectorsList.join(',\n'));
      }

   },
});
