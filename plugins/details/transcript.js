window.nova_plugins.push({
   id: 'transcript',
   title: 'Show transcript',
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
   section: 'details-buttons',
   // desc: ',
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

      // alt1 - https://greasyfork.org/en/scripts/468715-youtube-script-downloader-button
      // alt2 - https://greasyfork.org/en/scripts/471805-show-youtube-transcript-by-default
      // alt3 - https://greasyfork.org/en/scripts/480993-show-transcript-by-default
      // alt4 - https://www.reddit.com/r/userscripts/comments/18pymrv/request_show_youtube_transcript_using_a_more/

      // alt1 (download) - https://greasyfork.org/en/scripts/402811-concatenate-transcript
      // alt2 (download) - https://greasyfork.org/en/scripts/5368-youtube-subtitle-downloader-v36
      // alt (copy with timestamps) - https://greasyfork.org/en/scripts/483035-youtube-transcript-copier

      const
         BTN_SELECTOR_ID = 'nova-transcript-button',
         BTN_SELECTOR = '#' + BTN_SELECTOR_ID;

      // update state on url change
      NOVA.runOnPageLoad(async () => {
         if (NOVA.currentPage != 'watch') return;

         // custom speed from [save-channel-state] plugin
         if (await NOVA.storage_obj_manager.getParam('transcript')) {
            NOVA.waitSelector(BTN_SELECTOR, { destroy_after_page_leaving: true })
               .then(btn => {
                  btn.style.display = 'flex';
                  switch (user_settings.transcript_visibility_mode) {
                     case 'button': transcriptExpand(); break;

                     case 'external':
                     // case 'external-popup':
                     //    transcriptOpenLink();
                     //    break;
                  }
               });
            return; // runOnPageLoad
         }

         switch (user_settings.transcript_visibility_mode) {
            case 'expand':
               NOVA.waitSelector('[target-id="engagement-panel-searchable-transcript"][visibility="ENGAGEMENT_PANEL_VISIBILITY_HIDDEN"]', { destroy_after_page_leaving: true })
                  .then(transcriptEl => {
                     transcriptEl.setAttribute('visibility', 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED');
                  });

               // NOVA.waitSelector('#description ytd-video-description-transcript-section-renderer button', { destroy_after_page_leaving: true })
               //    .then(btn => btn.click());
               break;

            // case 'button':
            // case 'external':
            // case 'external-popup':
            default:
               // switch btn visibility
               NOVA.waitSelector(BTN_SELECTOR, { destroy_after_page_leaving: true })
                  .then(btn => {
                     btn.style.display = document.body.querySelector('#description ytd-video-description-transcript-section-renderer button, [target-id="engagement-panel-searchable-transcript"]') ? 'flex' : 'none';
                  });
               break;
         }
      });

      // insert button
      switch (user_settings.transcript_visibility_mode) {
         case 'button':
            // NOVA.waitSelector('ytd-watch-metadata #actions ytd-menu-renderer')
            NOVA.waitSelector('ytd-watch-metadata #actions #top-level-buttons-computed')
               .then(container => {
                  insertToHTML({ 'container': container, 'position': 'beforebegin' })
                     .addEventListener('click', transcriptExpand);
               });
            break;

         case 'external':
         // case 'external-popup':
         //    //    NOVA.waitSelector('ytd-watch-metadata #owner')
         //    //       .then(container => {
         //    //          insertToHTML({ 'container': container, 'position': 'beforeEnd' })
         //    NOVA.waitSelector('ytd-watch-metadata #actions #top-level-buttons-computed')
         //       .then(container => {
         //          insertToHTML({ 'container': container, 'position': 'beforebegin' })
         //             .addEventListener('click', transcriptOpenLink);
         //          // }, { capture: true });
         //       });
         //    break;

         // // case 'expand':
         // default:
         //    NOVA.waitSelector('[target-id="engagement-panel-searchable-transcript"][visibility="ENGAGEMENT_PANEL_VISIBILITY_HIDDEN"]', { destroy_after_page_leaving: true })
         //       .then(transcriptEl => {
         //          transcriptEl.setAttribute('visibility', 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED');
         //       });

         //    // NOVA.waitSelector('#description ytd-video-description-transcript-section-renderer button', { destroy_after_page_leaving: true })
         //    //    .then(btn => btn.click());
         //    break;
      }

      function transcriptExpand() {
         // Solution 1
         if (btn = document.body.querySelector('#description ytd-video-description-transcript-section-renderer button')) {
            btn.click()
         }
         // Solution 2
         else if (transcriptEl = document.body.querySelector('[target-id="engagement-panel-searchable-transcript"][visibility="ENGAGEMENT_PANEL_VISIBILITY_HIDDEN"]')) {
            transcriptEl.setAttribute('visibility', 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED');
         }
      }

      // function transcriptOpenLink() {
      //    // https://www.youtubetranscript.com/?v=wYNvrA4Y0oA
      //    const url = 'https://www.youtubetranscript.com/' + location.search;
      //    window.open(url, '_blank', user_settings.transcript_visibility_mode == 'external-popup'
      //       ? `popup=1,toolbar=no,location=no,directories=no,status=no,menubar=no,resizable=yes,copyhistory=no`
      //       : '')
      // }

      function insertToHTML({ container = required(), position = 'beforebegin' }) {
         // console.debug('insertToHTML', ...arguments);
         if (!(container instanceof HTMLElement)) {
            console.error('Container is not an HTMLElement:', container);
            return;
         }

         return (document.getElementById(BTN_SELECTOR_ID) || (function () {
            // document.getElementById(BTN_SELECTOR_ID).style.cssText = '';
            NOVA.css.push(
               `${BTN_SELECTOR} {
                  border: 0;
                  cursor: pointer;
                  text-decoration: none;
                  font-weight: bold;
                  margin: 0 var(--ytd-subscribe-button-margin, 12px);
              }`);
            // NOVA.css.push(
            //    `${BTN_SELECTOR} {
            //       border-radius: 20px;
            //       background-color: var(--yt-spec-10-percent-layer);
            //       white-space: nowrap;
            //       font-size: var(--ytd-tab-system-font-size, 1.4rem);
            //       padding: var(--yt-button-padding);
            //       margin: auto var(--ytd-subscribe-button-margin, 12px);
            //   }`);

            // add fix compare [user_settings.details_buttons_label_hide]
            // container.insertAdjacentHTML('afterbegin', NOVA.createSafeHTML( // for ytd-menu-renderer
            container.insertAdjacentHTML(position, NOVA.createSafeHTML(
               `<button id="${BTN_SELECTOR_ID}" style="display:flex" title="Show Transcript" class="style-scope yt-formatted-string bold yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m">
                  <span class="yt-spec-button-shape-next__icon" style="height:100%">
                     <svg viewBox="0 0 24 24" height="100%" width="100%">
                        <g fill="currentColor">
                           <path d="M20 12V13C20 17.4183 16.4183 21 12 21C7.58172 21 4 17.4183 4 13V12M12 17C9.79086 17 8 15.2091 8 13V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V13C16 15.2091 14.2091 17 12 17Z" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </g>
                     </svg>
                  </span>
                  <span class="yt-spec-button-shape-next__button-text-content" style="align-self:center;">Transcript</span>
               </button>`));
            return document.getElementById(BTN_SELECTOR_ID);
         })());
      }

   },
   options: {
      transcript_visibility_mode: {
         _tagName: 'select',
         label: 'Mode',
         // 'label:zh': '模式',
         // 'label:ja': 'モード',
         // 'label:ko': '방법',
         // 'label:vi': '',
         // 'label:id': 'Mode',
         // 'label:es': 'Modo',
         // 'label:pt': 'Modo',
         // 'label:fr': 'Mode',
         // 'label:it': 'Mode',
         // 'label:tr': 'Mod',
         // 'label:de': 'Modus',
         'label:pl': 'Tryb',
         // 'label:ua': 'Режим',
         options: [
            {
               label: 'expand default section', /* value: 'expand', */ selected: true, // fill value if no "selected" mark another option
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
               label: 'add button', value: 'button',
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
               label: 'link to external', value: 'external',
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
            // {
            //    label: 'link to external (popup)', value: 'external-popup',
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
            // },
         ],
      },
   }
});
