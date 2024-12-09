// for test:
// https://www.youtube.com/watch?v=FSjr2H0RDsY - empty desc
// https://www.youtube.com/watch?v=CV_BR1tfdCo - empty desc
// https://www.youtube.com/watch?v=jfKfPfyJRdk - live
// https://www.youtube.com/watch?v=skqZD0BsP6E - desc (#info) has #tags
// https://www.youtube.com/watch?v=oOaDiHHrPSI - without hash symbol

window.nova_plugins.push({
   id: 'description-dropdown',
   title: 'Dropdown description',
   // title: 'Description section in dropdown menu',
   // 'title:zh': '下拉菜单中的描述部分',
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
   section: 'details',
   // desc: '',
   'plugins-conflict': 'description-timestamps-scroll',
   // 'plugins-conflict': 'move-to-sidebar[description]',
   _runtime: user_settings => {

      // alt1 - https://greasyfork.org/en/scripts/409893-youtube-widescreen-new-design-polymer
      // alt2 - https://greasyfork.org/en/scripts/446269-youtube-sticky-show-less-button
      // alt3 - https://chromewebstore.google.com/detail/nojdofjkkahhdklccleaaeinfklmlaga
      // alt4 - https://greasyfork.org/en/scripts/428651-tabview-youtube

      // if (user_settings['video-description-expand']) return; // conflict with plugin [video-description-expand]. This plugin has a higher priority. that's why it's disabled/commented

      // bug if DESCRIPTION_SELECTOR is empty. Using CSS is impossible to fix. And through JS extra

      const
         DESCRIPTION_SELECTOR = 'html:not(:fullscreen) ytd-watch-metadata #description.ytd-watch-metadata:not([hidden]):not(:empty)',
         DATE_SELECTOR_ID = 'nova-description-date';

      NOVA.waitSelector('#masthead-container')
         .then(masthead => {

            NOVA.css.push(
               // top: min(${masthead.offsetHeight || 56}px, var(--ytd-watch-flexy-masthead-height));
               // position: ${user_settings['header-unfixed'] ? 'absolute' : 'fixed' };
               `${DESCRIPTION_SELECTOR},
               ${DESCRIPTION_SELECTOR}:before {
                  position: fixed;
                  top: ${masthead.offsetHeight || 56}px;
                  right: 0;
                  z-index: ${1 + Math.max(getComputedStyle(masthead || movie_player)['z-index'], 601)};
               }

               /* button */
               ${DESCRIPTION_SELECTOR}:not(:hover):before {
                  /* content: "info \\25B4\\25BE"; */
                  /* content: "info ▼"; */
                  content: "info ▽";
                  cursor: pointer;
                  visibility: visible;
                  /*transform: rotate(-90deg) translateX(-100%);*/
                  right: 12.5em;
                  padding: 0 8px 2px;
                  line-height: normal;
                  font-family: Roboto, Arial, sans-serif;
                  font-size: 11px;
                  color: #eee;
                  background-color: rgba(0, 0, 0, .3);
               }

               /* description section */
               ${DESCRIPTION_SELECTOR} {
                  margin: 0 1%;
                  overflow-y: auto;
                  max-height: 88vh;
                  max-width: 55%;
                  background-color: var(--yt-spec-brand-background-primary);
                  background-color: var(--yt-spec-menu-background);
                  background-color: var(--yt-spec-raised-background);
                  color: var(--yt-spec-text-primary);;
                  border: 1px solid #333;
                  ${user_settings['square-avatars'] ? 'border-radius: 0' : ''};
               }

               ${DESCRIPTION_SELECTOR}:not(:hover) {
                  visibility: collapse;
                  overflow: hidden;
               }

               /* description section hover */
               ${DESCRIPTION_SELECTOR}:hover {
                  visibility: visible !important;
               }

               /* custom scroll */
               ${DESCRIPTION_SELECTOR}::-webkit-scrollbar {
                  height: 8px;
                  width: 10px;
               }

               ${DESCRIPTION_SELECTOR}::-webkit-scrollbar-button {
                  height: 0;
                  width: 0;
               }

               ${DESCRIPTION_SELECTOR}::-webkit-scrollbar-corner {
                  background-color: transparent;
               }

               ${DESCRIPTION_SELECTOR}::-webkit-scrollbar-thumb {
                  background-color: #e1e1e1;
                  border: 0;
                  border-radius: 0;
               }

               ${DESCRIPTION_SELECTOR}::-webkit-scrollbar-track {
                  background-color: #666;
                  border: 0;
                  border-radius: 0;
               }

               ${DESCRIPTION_SELECTOR}::-webkit-scrollbar-track:hover {
                  background-color: #666;
               }`);
         });

      // expand
      NOVA.waitSelector(DESCRIPTION_SELECTOR)
         .then(descriptionEl => {
            descriptionEl.addEventListener('mouseenter', evt => {
               document.body.querySelector('#meta [collapsed] #more, [description-collapsed] #description #expand')
                  ?.click();
            });
            // }, { capture: true, once: true });
         });

      // start restoreDateLine section
      // conflict with [video-date-format] plugin
      if (!user_settings['video-date-format']) {
         NOVA.runOnPageLoad(() => (NOVA.currentPage == 'watch') && restoreDateLine());
      }

      let oldDateText;
      function restoreDateLine() {
         NOVA.waitSelector('#title h1')
            .then(container => {
               // Solution 1
               // if (videoDate = movie_player.getPlayerResponse()?.microformat?.playerMicroformatRenderer.publishDate
               //    // || NOVA.searchInObjectBy.key({
               //    //    'obj': movie_player.getPlayerResponse(),
               //    //    'key': 'publishDate',
               //    //    match_fn: null,
               //    // })?.data
               // ) {
               //    insertToHTML({ 'text': videoDate.simpleText || videoDate, 'container': container });
               // }
               // Solution 2
               // else {
               NOVA.waitSelector('ytd-watch-metadata #description.ytd-watch-metadata')
                  .then(async textDateEl => {
                     await NOVA.waitUntil(() => {
                        if ((text = [...textDateEl.querySelectorAll('span.bold.yt-formatted-string:not(:empty)')]
                           // first 3 elm. ex:
                           // [6,053 views] [Premiered] [Oct 8, 2022]
                           // [14,051 views] [] [Mar 2, 2017]
                           // [43,776] [ watching now] [] [Started streaming on Jul 12, 2022]
                           // ?.slice(0, 3) // 3 el (err skip streaming info)
                           .map(e => e.textContent)
                           // .filter(t => !t.startsWith('#')) // skip tags
                           // ?.slice(0, 3) // 3 array length
                           ?.join('').trim()
                        )
                           && text != oldDateText // new date
                        ) {
                           oldDateText = text;
                           // NOVA.formatTime.ago();
                           insertToHTML({ 'text': oldDateText, 'container': container });
                           return true;
                        }
                     }, 1000); // 1sec
                  });
               // skip tags without hash symbol
               // NOVA.waitSelector('ytd-watch-metadata #description.ytd-watch-metadata #info')
               //    .then(async textDateEl => {
               //       await NOVA.waitUntil(() => {
               //          if ((text = textDateEl.parentElement.textContent)
               //             && (text = text.split('#', 1)[0].trim()) // clear from tags
               //             && text != oldDateText // new date
               //          ) {
               //             oldDateText = text;
               //             insertToHTML({ 'text': oldDateText, 'container': container });
               //             return true;
               //          }
               //       }, 1000); // 1sec
               //    });
               // }
            });

         function insertToHTML({ text = '', container = required() }) {
            // console.debug('insertToHTML', ...arguments);
            if (!(container instanceof HTMLElement)) {
               console.error('Container is not an HTMLElement:', container);
               return;
            }

            (document.getElementById(DATE_SELECTOR_ID) || (function () {
               const el = document.createElement('span');
               el.id = DATE_SELECTOR_ID;
               el.classList.add('style-scope', 'yt-formatted-string', 'bold');
               // el.style.cssText = 'font-size: 1.35rem; line-height: 2rem; font-weight: 400;';
               Object.assign(el.style, {
                  'font-size': '1.35rem',
                  'line-height': '2rem',
                  'font-weight': 400,
               });
               container.after(el);
               // container.insertAdjacentElement('afterend', el);
               return el;
               // 62.88 % slower
               // container.insertAdjacentHTML('afterend', NOVA.createSafeHTML(
               //    `<span id="${DATE_SELECTOR_ID}" class="style-scope yt-formatted-string bold" style="font-size: 1.35rem; line-height: 2rem; font-weight:400;">${text}</span>`));
               // return document.getElementById(DATE_SELECTOR_ID);
            })())
               .textContent = text;
         }

      }

   },
});
