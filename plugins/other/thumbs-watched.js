window.nova_plugins.push({
   id: 'thumbnails-watched',
   title: 'Mark watched thumbnails',
   'title:zh': '标记您观看的缩略图',
   'title:ja': '視聴したサムネイルにマークを付ける',
   'title:es': 'Mark vio miniaturas',
   run_on_pages: 'all',
   section: 'other',
   // desc: 'Need to Turn on [YouTube History]',
   _runtime: user_settings => {

      // Only the outline/border works. Other selection methods do not work in chrome!

      NOVA.css.push(
         `a#thumbnail {
            outline: 1px solid var(--yt-spec-general-background-a);
         }

         a#thumbnail:visited {
            outline: 1px solid ${user_settings.thumbnails_watched_frame_color || 'red'} !important;
         }`);

      if (user_settings.thumbnails_watched_title) {
         NOVA.css.push(
            `a#video-title:visited:not(:hover),
            #description a:visited {
               color: ${user_settings.thumbnails_watched_title_color} !important;
            }`);
      }

      // add blur
      // NOVA.css.push(
      //    `a.ytp-videowall-still.ytp-suggestion-set:visited, #thumbnail:visited {
      //       transition: all 200ms ease-in-out;
      //       opacity: .4 !important;
      //       mix-blend-mode: luminosity;
      //       filter: blur(2.2px);
      //    }

      //    .watched #thumbnail:hover, #thumbnail:visited:hover {
      //       transition: ease-out;
      //       opacity: 1 !important;
      //       mix-blend-mode: normal;
      //       filter: blur(0px);
      //    }`);

   },
   options: {
      thumbnails_watched_frame_color: {
         _tagName: 'input',
         label: 'Frame color',
         'label:zh': '框架颜色',
         'label:ja': 'フレームカラー',
         'label:es': 'Color del marco',
         type: 'color',
         value: '#FF0000',
      },
      thumbnails_watched_title: {
         _tagName: 'input',
         label: 'Set title color',
         'label:zh': '您要更改标题颜色吗？',
         'label:ja': 'タイトルの色を変更しますか？',
         'label:es': 'Establecer el color del título',
         type: 'checkbox',
         // title: 'Link',
      },
      thumbnails_watched_title_color: {
         _tagName: 'input',
         label: 'Сhoose title color',
         'label:zh': '选择标题颜色',
         'label:ja': 'タイトルの色を選択',
         'label:es': 'Elija el color del título',
         type: 'color',
         value: '#ff4500',
         'data-dependent': '{"thumbnails_watched_title":"true"}',
      },
   },
});
