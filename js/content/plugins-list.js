const Plugins_list = {
   lib: [ 'ytc_lib.js' ],

   runOnce: [ // addEventListener
      'player/speed.js',
      'player/volume.js',
      'player/quality.js',
      'player/pause.js',
      'player/pause-tab.js',
      'player/focused.js',
      'player/pin.js',
      'player/theater-mode.js',
      'player/time-jump.js',
      // 'player/stop.js',

      'comments/filter-comments.js',

      'other/scroll-to-top.js',
      'other/dark-theme.js',
      'other/rating-bars.js',
      // 'player/30-fps.js',
      'other/normalize-video-title.js',
      'other/thumbnail-clear.js',
   ],

   runOnTransition: [
      'player/annotations.js',

      'details/expand-description.js',
      'details/channel-video-count.js',

      'comments/disable-comments.js',

      'sidebar/livechat-hide.js',

      'other/default-tab.js',
      'other/disable-trailer.js',

      'other/collapse-navigation-panel.js',
   ],
}
