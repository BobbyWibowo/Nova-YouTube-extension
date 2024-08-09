console.debug('init optionsBilder.js');

// alt1 - https://github.com/colejd/guify
// alt2 - https://github.com/timtnleeProject/skeletons
// alt3 - https://github.com/efemkay/obsidian-modular-css-layout

window.nova_plugins = [];

const Opt = {
   // DEBUG: true,

   // https://gist.github.com/wpsmith/7604842
   lang_code: window.navigator.language.substring(0, 2),
   // lang_code = 'zh',
   // lang_code = 'ja',
   // lang_code = 'ko',
   // lang_code = 'id',
   // lang_code = 'es',
   // lang_code = 'pt',
   // lang_code = 'fr',
   // lang_code = 'it',
   // lang_code = 'tr',
   // lang_code = 'de',
   // lang_code = 'pl',
   // lang_code = 'ua',

   UI: {
      pluginsContainer: '#plugins',

      // outerHTML: node => node.outerHTML || new XMLSerializer().serializeToString(node),
   },

   pluginChecker(plugin) {
      const isValid = plugin?.id // required
         && plugin.title
         && plugin.run_on_pages?.split(',').length
         && plugin._runtime && typeof plugin._runtime === 'function'
         // optional
         && (!plugin.section || plugin.section?.split(' ').length === 1)
         && (!plugin.restart_on_location_change || 'boolean' === typeof plugin.restart_on_location_change)
         && (!plugin.opt_api_key_warn || 'boolean' === typeof plugin.opt_api_key_warn)
         && (!plugin.options || 'object' === typeof plugin.options)
         && (!plugin.desc || 'string' === typeof plugin.desc);

      if (!isValid) {
         console.error('plugin invalid:\n', {
            id: plugin.id,
            run_on_pages: plugin.run_on_pages?.split(',').length,
            section: plugin.section?.split(' ').length === 1 || undefined,
            restart_on_location_change: 'boolean' === typeof plugin.restart_on_location_change || undefined,
            opt_api_key_warn: 'boolean' === typeof plugin.opt_api_key_warn || undefined,
            desc: 'string' === typeof plugin.desc || undefined,
            options: 'object' === typeof plugin.options || undefined,
            _runtime: 'function' === typeof plugin._runtime,
         });
      }
      return isValid;
   },

   generate: {

      load(plugins_list) {
         this.log('list nova_plugins:', plugins_list);

         plugins_list
            // sort by id
            // .sort((a, b) => {
            //    if (a.id < b.id) return -1;
            //    else if (a.id > b.id) return 1;
            //    return 0; // names must be equal
            // })
            // sort by title
            // .sort((a, b) => {
            //    const nameA = a.title.toUpperCase(); // ignore upper and lowercase
            //    const nameB = b.title.toUpperCase(); // ignore upper and lowercase
            //    if (nameA < nameB) return -1;
            //    else if (nameA > nameB) return 1;
            //    // names must be equal
            //    return 0;
            // })
            // sort by (number)
            // .sort((a, b) => a.sort - b.sort)
            .forEach(plugin => {
               try {
                  if (!this.pluginChecker(plugin)) throw new Error('pluginInvalid!');
                  this.log('plugin load:', plugin.id);

                  // localize
                  if (title_local = plugin['title:' + this.lang_code]) {
                     plugin.title = title_local;
                     delete plugin[title_local];
                  }
                  if (desc_local = plugin['desc:' + this.lang_code]) {
                     plugin.desc = desc_local;
                     delete plugin[desc_local];
                  }
                  // localize

                  const li = document.createElement('li');
                  li.className = 'item';
                  li.innerHTML =
                     `<div class="info" ${plugin.desc ? ` tooltip="${plugin.desc.replace(/"/g, "'")}" flow="up"` : ''}>
                        <label for="${plugin.id}">${plugin.title}</label>
                        <a href="https://github.com/raingart/Nova-YouTube-extension/wiki/plugins#${plugin.id}" target="_blank" title="${i18n('opt_title_help_link')}">?</a>
                        ${plugin.opt_api_key_warn ? `<b tooltip="${i18n('opt_api_key_warn')}" flow="left"><span style="font-size: inherit;">⚠️</span></b>` : ''}
                     </div>
                     <div class="opt">
                        <input type="checkbox" name="${plugin.id}" id="${plugin.id}" />
                     </div>`;
                  if (plugin.hasOwnProperty('plugins-conflict')) {
                     li.querySelector('input').setAttribute('plugins-conflict', plugin['plugins-conflict']);
                  }

                  if (plugin.options) {
                     li.append(
                        document.createElement('li')
                           .appendChild(this.generate.options.apply(this, [plugin.options, plugin.id]))
                     );
                  }

                  let p = this.UI.pluginsContainer;
                  if (targetSection = `> #${plugin?.section?.toString().toLowerCase()}`) {
                     p += (plugin.section && document.body.querySelector(p + targetSection)) ? targetSection : '> #other';
                  }

                  document.body.querySelector(p).append(li); // append to section tab

               } catch (error) {
                  console.error('Error plugin generate:\n', error.stack + '\n', plugin);
                  alert('Error plugin generate\n' + plugin?.id);
               }
            });
      },

      options(obj, id) {
         // console.debug('', ...arguments);
         const exportHTML = document.createElement('ul');
         exportHTML.setAttribute('data-dependent', `{"${id}":[true]}`);

         for (const name in obj) {
            const property = obj[name];
            this.log('property', property);

            if (!property._tagName) {
               console.error('_tagName is missing in:', property, obj);
               continue;
            }
            if (!property.label && property._tagName != 'datalist') {
               console.error('label is missing in:', property, obj);
               continue;
            }

            if (property.type?.toLowerCase() == 'radio') {
               if (!property.hasOwnProperty('name')) {
                  console.error('radio element missing "name":', property, obj);
                  continue;
               }
            }

            const exportContainer = document.createElement('li');
            const exportProperty = document.createElement(property._tagName);

            if (property.type?.toLowerCase() == 'radio') {
               if (!property.hasOwnProperty('value')) {
                  property.value = name;
               }
            }
            else {
               property.name = name;
            }

            property.id = name;

            delete property._tagName;

            if (property['data-dependent']) {
               // exportContainer.setAttribute('data-dependent', '{\"'+ id +'\":[true]}');
               exportContainer.setAttribute('data-dependent', JSON.stringify(property['data-dependent']));
               delete property['data-dependent'];
            }

            // localize
            if (property.title) {
               // empty local property
               if (property.hasOwnProperty('title:' + this.lang_code) && !property['title:' + this.lang_code].length) {
                  console.warn(`property title(${this.lang_code}) is empty:`, property.title);
               }

               exportContainer.setAttribute('tooltip', property['title:' + this.lang_code] || property.title);
               delete property.title;
               delete property['title:' + this.lang_code];
            }
            if (label_local = property['label:' + this.lang_code]) {
               property.label = label_local;
               delete property[label_local];
            }
            // localize

            // if (property.title) {
            //    exportContainer.setAttribute('tooltip', property.title);
            //    delete property.title;
            // }

            Object.entries(property)
               .forEach(([attr, value]) => {
                  this.log('property [%s=%s]', attr, JSON.stringify(value));
                  switch (attr) {
                     case 'options':
                        if (!Array.isArray(value) || !value.length) {
                           console.error('select has invalid options(need array):', value);
                        }
                        value.forEach(option => {
                           const tagOption = document.createElement('option');
                           switch (typeof option) {
                              case 'object':
                                 tagOption.value = option.value;
                                 // localize
                                 if (option.hasOwnProperty('label:' + this.lang_code)) {
                                    option.label = option['label:' + this.lang_code];
                                    delete option['label:' + this.lang_code];
                                 }
                                 tagOption.textContent = option.label;
                                 if (option.hasOwnProperty('selected')) tagOption.selected = true;
                                 break;

                              case 'string':
                                 tagOption.value = option;
                                 // if (option.length === 1) option = option.toLocaleUpperCase(); // upperCase letter hotkeys
                                 tagOption.textContent = option;
                                 break;

                              case 'number':
                                 tagOption.value = option;
                                 tagOption.textContent = option;
                                 break;

                              default:
                                 console.error('invalid option item type: %s(%s)', option, typeof option);
                           }
                           exportProperty.append(tagOption);
                        });
                        break;

                     case 'label':
                        const label = document.createElement(attr);
                        label.textContent = value;
                        label.htmlFor = (property.type?.toLowerCase() == 'radio') ? name : property.name;
                        exportContainer.append(label);
                        // exportContainer.insertAdjacentHTML('beforeend", NOVA.createSafeHTML('<label>' + value + '</label>');
                        // exportContainer.insertAdjacentHTML('beforeend", NOVA.createSafeHTML('<label>' + value + '</label>'));
                        break;

                     case 'type':
                        if (value == 'number') exportProperty.required = true;
                     // break; <-- need remove!

                     default:
                        exportProperty.setAttribute(attr, value); // value:string. For safe
                     // exportProperty[attr] = value; // apply value:function. Like - onchange: function () {
                  };
               });

            exportContainer.append(exportProperty);
            exportHTML.append(exportContainer);
         }
         return exportHTML;
      },

   },

   // tab selector
   openTab(tabId, reload_page) {
      // console.debug('openTab', ...arguments);
      if (reload_page) {
         // const url = location.pathname;
         // url.searchParams.set('tab', tabId);
         // document.location = url.href;
         document.location = location.pathname + '?tabs=' + tabId;
      }
      else {
         document.getElementById(tabId).checked = true;
      }
   },

   eventListener() {
      // tab selector
      if (tabId = new URLSearchParams(location.search).get('tabs')) Opt.openTab(tabId);
      // appearance map
      document.body.querySelectorAll('.appearance > *')
         .forEach(mapZone => {
            // group is empty
            if (document.body.querySelector(this.UI.pluginsContainer + `>#${mapZone.id}:empty`)) {
               mapZone.classList.add('empty');
            }
            else {
               // add click event
               mapZone.addEventListener('click', () => {
                  // show mapZone, hide other section
                  switchClass({
                     'remove_to_selector': `${this.UI.pluginsContainer} > *`,
                     'add_to_selector': `${this.UI.pluginsContainer} > #${mapZone.id}`,
                     'class_name': 'active',
                  });
                  // unset collapse state in all section title
                  switchClass({
                     'remove_to_selector': `${this.UI.pluginsContainer} > *`,
                     'class_name': 'collapse',
                  });
                  // expand collapsed section
                  switchClass({
                     'remove_to_selector': `${this.UI.pluginsContainer} li.item`,
                     'class_name': 'hide',
                  });
                  this.openTab('tab-plugins');
               });
            }
         });

      // link show_all_plugins
      document.getElementById('show_all_plugins')
         .addEventListener('click', () => {
            // show all section
            switchClass({
               'remove_to_selector': `${this.UI.pluginsContainer} > *`,
               'add_to_selector': `${this.UI.pluginsContainer} > *`,
               'class_name': 'active'
            });
            // unset collapse state in all section title
            switchClass({
               'remove_to_selector': `${this.UI.pluginsContainer} > *`,
               'class_name': 'collapse'
            });
            // expand collapsed section
            switchClass({
               'remove_to_selector': `${this.UI.pluginsContainer} li.item`,
               'class_name': 'hide'
            });
            // clear searchInput
            // if (search = document.body.querySelector('form input[type=search]')) {
            //    searchInput.value = '';
            //    searchInput.dispatchEvent(new Event('change'));
            // }
            this.openTab('tab-plugins');
         });

      // group spoiler
      // if (document.body.clientWidth < 350) { // check in popup
      document.body.querySelectorAll(this.UI.pluginsContainer + '> ul')
         .forEach(ul => ul.addEventListener('click', ({ target }) => {
            target.classList.toggle('collapse')
            target.querySelectorAll('li.item').forEach(li => li.classList.toggle('hide'));
         }));
      // }

      // reload page after localization change
      document.addEventListener('submit', evt => {
         if (evt.target?.lang_code.value != Opt.lang_code) Opt.openTab('tab-plugins', 'reload_page');
      });

      // search bar
      const searchInput = document.body.querySelector('form input[type=search]');
      ['change', 'keyup'].forEach(evt => {
         searchInput
            .addEventListener(evt, function () {
               searchFilterHTML({
                  'keyword': this.value,
                  'filter_selectors': `${Opt.UI.pluginsContainer} li.item`,
                  'highlight_selector': 'label',
                  // 'highlight_class': 'nova-mark-text',
               });
            });
         document.getElementById('search_clear')
            .addEventListener('click', () => {
               searchInput.value = '';
               searchInput.dispatchEvent(new Event('change')); // run searchFilterHTML
            });
      });

      function searchFilterHTML({
         keyword = required(),
         filter_selectors = required(),
         highlight_selector,
         highlight_class,
      }) {
         // console.debug('searchFilterHTML:', ...arguments);
         keyword = keyword.toString().toLowerCase();

         document.body.querySelectorAll(filter_selectors)
            .forEach(item => {
               const
                  text = item.textContent,
                  // text = item.getAttribute('tooltip'),
                  hasText = text?.toLowerCase().includes(keyword),
                  highlight = el => {
                     if (el.innerHTML.includes('<mark ')) {
                        // el.innerHTML = el.textContent
                        el.innerHTML = el.innerHTML
                           .replace(/<\/?mark[^>]*>/g, ''); // clear highlight tags
                     }
                     item.style.display = hasText ? '' : 'none'; // hide el out of search
                     if (hasText && keyword) {
                        highlightTerm({
                           'target': el,
                           'keyword': keyword,
                           'highlightClass': highlight_class,
                        });
                     }
                  };

               (highlight_selector ? item.querySelectorAll(highlight_selector) : [item])
                  .forEach(highlight);
            });

         function highlightTerm({ target = required(), keyword = required(), highlightClass }) {
            // console.debug('highlightTerm:', ...arguments);
            const
               // content = target.innerHTML,
               content = target.textContent,
               pattern = new RegExp('(>[^<.]*)?(' + keyword + ')([^<.]*)?', 'gi'),
               highlightStyle = highlightClass ? `class="${highlightClass}"` : 'style="background-color:#afafaf"',
               replaceWith = `$1<mark ${highlightStyle}>$2</mark>$3`,
               marked = content.replaceAll(pattern, replaceWith);

            return (target.innerHTML = marked) !== content;
         }
      }

      function switchClass({
         remove_to_selector,
         add_to_selector,
         class_name = required(),
      }) {
         // console.debug('switchClass:', ...arguments);
         // hide all
         if (remove_to_selector) {
            document.body.querySelectorAll(remove_to_selector).forEach(i => i.classList.remove(class_name));
         }
         // target show
         if (add_to_selector) {
            document.body.querySelectorAll(add_to_selector).forEach(i => i.classList.add(class_name));
         }
      }
   },

   init() {
      this.generate.load.apply(this, [window.nova_plugins]);
      this.eventListener();
   },

   log() {
      if (this.DEBUG && arguments.length) {
         console.groupCollapsed(...arguments);
         console.trace();
         console.groupEnd();
      }
   },
};

document.addEventListener('settings-sync', () => {
   Opt.init();
   // load settings
   Storage.getParams(settings => {
      if (settings?.lang_code) Opt.lang_code = settings.lang_code; // locale predefinitions
      PopulateForm.init();
      // remove api warn if has api
      if (settings && settings['user-api-key']) {
         document.body.querySelectorAll('.info b').forEach(el => el.remove());
      }
      pluginConflictDisable();
   }, storageMethod);

   function pluginConflictDisable() {
      const attributeName = 'plugins-conflict';
      document.body.querySelectorAll(`[${attributeName}]`)
         .forEach(targetEl => {
            // console.debug('targetEl', targetEl);
            const rules = targetEl.getAttribute(attributeName).split(',').map(i => i.trim());
            // const rules = JSON.parse(targetEl.getAttribute(attributeName).toString());
            targetEl.addEventListener('change', () => {
               for (const parrentName of rules) {
                  // console.debug('parrentName', parrentName);
                  document.getElementsByName(parrentName)
                     .forEach(subtargetEl => {
                        if (targetEl.checked) subtargetEl.checked = false;
                        subtargetEl.disabled = targetEl.checked;

                        const
                           DISABLE_BLIND_MARK_CLASS = 'disable-blind',
                           rootEl = subtargetEl.closest('.item');

                        if (subtargetEl.disabled) rootEl.classList.add(DISABLE_BLIND_MARK_CLASS); // mark
                        else rootEl.classList.remove(DISABLE_BLIND_MARK_CLASS); // unmark

                        rootEl.querySelector('.info')
                           .setAttribute('tooltip', subtargetEl.disabled ? `conflict wich [${parrentName}]` : '')
                        // checkbox style
                        subtargetEl.style.setProperty('--text-on-press', subtargetEl.disabled ? '"✕"' : null);
                        subtargetEl.style.setProperty('--text-off', subtargetEl.disabled ? '"🔺"' : null);
                        const color = subtargetEl.disabled
                           // ? '#e85717'
                           ? 'red'
                           // ? 'darkorange'
                           : null;
                        subtargetEl.style.setProperty('--checked-bg', color);
                        subtargetEl.style.setProperty('color', color);
                        // subtargetEl.style.backgroundColor = color
                        // console.debug('', targetEl, targetEl.checked, subtargetEl.checked);
                     });
               }
            });
         });
   }
}, { capture: true, once: true });
