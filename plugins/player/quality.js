_plugins.push({
   name: 'Video Quality',
   id: 'video-quality',
   section: 'player',
   depends_page: 'watch, embed',
   desc: 'Set prefered quality',
   _runtime: user_settings => {

      YDOM.waitFor('.html5-video-player', playerId => {
         let is_change_quality;

         const selectedQuality = user_settings['video_quality'];

         playerId.addEventListener("onStateChange", onChangeQuality.bind(this));

         function onChangeQuality(state) {
            // console.log('onStateChange', state);

            // 1- unstarted
            // 0- ended
            // 1- playing
            // 2- paused
            // 3- buffering
            // 5- video cued
            if ((1 === state || 3 === state) && !is_change_quality) {
               is_change_quality = true;

               const availableQualityLevels = playerId.getAvailableQualityLevels();
               const maxAvailableQuality = Math.max(availableQualityLevels.indexOf(selectedQuality), 0);
               let qualityToSet = availableQualityLevels[maxAvailableQuality];

               // if (!qualityToSet || playerId.getPlaybackQuality() == selectedQuality) {
               //    console.log('skip set quality');
               //    return;
               // }

               if (availableQualityLevels.indexOf(selectedQuality) === -1) {
                  console.log('no has selectedQuality "%s". Choosing instead the top-most quality available "%s"', selectedQuality, qualityToSet);
               }

               if (playerId.hasOwnProperty('setPlaybackQuality')) {
                  // console.log('use setPlaybackQuality');
                  playerId.setPlaybackQuality(qualityToSet);
               }

               // set QualityRange
               if (playerId.hasOwnProperty('setPlaybackQualityRange')) {
                  playerId.setPlaybackQualityRange(qualityToSet, qualityToSet);

               } else { // emulate clicked (in embed iframe)
                  // console.log('used emulate clicked');
                  document.querySelector(".ytp-settings-button").click(); // settings button

                  const qualityOption = document.querySelector(".ytp-panel-menu .ytp-menuitem:last-child");
                  // test is quality option
                  if (qualityOption.children[1].firstElementChild.textContent.match(/\d{3,4}[ps]/)) {
                     qualityOption.click(); // open option

                     const showQualities = document
                        .querySelector(".ytp-settings-menu")
                        .querySelector(".ytp-quality-menu .ytp-panel-menu").children;

                     showQualities[maxAvailableQuality].click(); // choosing it quality

                     //unfocused
                     document.querySelector("body").click();
                     document.querySelector("video").focus();

                     // console.log('choosing it quality', showQualities[maxAvailableQuality].innerText);
                  }
               }

               // console.log('availableQualityLevels:', JSON.stringify(availableQualityLevels));
               // console.log("try set quality:", qualityToSet);
               // console.log('set realy quality:', playerId.getPlaybackQuality());

            } else if (-1 === state || 0 === state) {
               is_change_quality = false;
            }
         }

      });

   },
   export_opt: (function () {
      return {
         'video_quality': {
            _elementType: 'select',
            label: 'Set prefered quality',
            title: 'If unavailable, set max available quality',
            options: [
               // Available 'highres','hd2880','hd2160','hd1440','hd1080','hd720','large','medium','small','tiny'
               /* beautify preserve:start */
               { label: '4320p (8k/FUHD)', value: 'highres' },
               { label: '2880p (5k/UHD)', value: 'hd2880' },
               { label: '2160p (4k/QFHD)', value: 'hd2160' },
               { label: '1440p (QHD)', value: 'hd1440' },
               { label: '1080p (FHD)', value: 'hd1080' },
               { label: '720p (HD)', value: 'hd720', selected: true },
               { label: '480p (SD)', value: 'large' },
               { label: '360p', value: 'medium' },
               { label: '240p', value: 'small' },
               { label: '144p', value: 'tiny' },
               // { label: 'Auto', value: 'auto' },
               /* beautify preserve:end */
            ]
         },
      };
   }()),
});