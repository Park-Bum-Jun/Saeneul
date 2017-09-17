/*
 * Copyright (c) 2012 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*jslint devel: true, regexp: true*/
/*global $, app, document, history, TemplateManager, window, tau*/

/**
 * UI class constructor.
 *
 * @public
 * @constructor
 */
function Ui() {
    'use strict';

    return;
}

(function strict() { // strict mode wrapper
    'use strict';

    Ui.prototype = {

        /**
         * Template manager object.
         *
         * @public
         * @type {templateManager}
         */
        templateManager: null,

        /**
         * UI module initialization.
         *
         * @param {App} app
         * @param {number} alarmId
         * @public
         */
        init: function UI_init(app, alarmId) {
            this.app = app;
            this.currentAlarm = (alarmId !== undefined &&
                this.app.getAlarm('id', alarmId)) || null;
            this.templateManager = new TemplateManager();
            $(document).ready(this.domInit.bind(this));

            // init inner objects
            this.home.context = this;
            this.new_alarm.context = this;
            this.notification.context = this;
        },

        /**
         * When DOM is ready, initializes it.
         *
         * @private
         */
        domInit: function UI_domInit() {
            this.templateManager.loadToCache(
                [
                    'alarm',
                    'alarmNotification'
                ],
                this.initPages.bind(this)
            );
            // Disable text selection
            $.mobile.tizen.disableSelection(document);
        },

        /**
         * Appends pages to the body and initializes them.
         *
         * @private
         */
        initPages: function UI_initPages() {

            this.home.init();
            this.new_alarm.init();
            this.notification.init();

            window.addEventListener('tizenhwkey', function onTizenHwKey(e) {
                var activePageId = tau.activePage.id;

                if (e.keyName === 'back') {
                    if (activePageId === 'home') {
                        app.exit();
                    } else if (activePageId === 'notification') {
                        app.exit();
                    } else if (activePageId === 'new_alarm') {
                        tau.changePage('#home');
                    } else {
                        history.back();
                    }
                }
            });

            $('input[type=checkbox]').change(function onChange() {
                $('#name').blur();
            });

            if (this.currentAlarm) {
                // app run from alarm
                tau.changePage('#notification', 'pop', false, true);
            } else {
                tau.changePage('#home', 'pop', false, true);
            }
        },

        /**
         * Contains methods related to the home page.
         *
         * @public
         * @type {object}
         */
        home: {

            /**
             * Initializes home page.
             *
             * @public
             */
            init: function UI_home_init() {
                this.addEvents();
                this.beforeShow();
            },

            /**
             * Handles pagebeforeshow event on the home page.
             *
             * @private
             */
            beforeShow: function beforeShow() {
                var self = this;

                this.displayList();
                $('.removeAlarm').on('click', function onClick() {
                    var alarmId = $(this).data('alarmid');
                    app.ui.popup('Are you sure?', {
                        'No': function onClickedNo() {
                            $('#popup').popup('close');
                        },
                        'Yes': function onClickedYes() {
                            self.context.app.removeAlarm(
                                alarmId,
                                self.removeElement.bind(self, alarmId)
                            );
                            $('#popup').popup('close');
                        }
                    });
                });
            },

            /**
             * Binds events to the home page.
             *
             * @public
             */
            addEvents: function addEvents() {
                $('#home').on('pagebeforeshow', this.beforeShow.bind(this));
            },

            /**
             * Removes alarm from list.
             *
             * @private
             * @param {number} alarmId alarmId of the element to remove.
             */
            removeElement: function removeElement(alarmId) {
                var i = 0,
                    data = 0,
                    alarmList = document.getElementById('alarms_list'),
                    alarms = alarmList.children;

                for (i = 0; i < alarms.length; i += 1) {
                    data = alarms[i].getAttribute('data-alarmid');
                    if (parseInt(data, 10) === parseInt(alarmId, 10)) {
                        alarmList.removeChild(alarms[i]);
                    }
                }
            },

            /**
             * Builds alarms HTML list and adds it to page.
             *
             * @private
             * @param {object[]} [alarms] alarms list.
             */
            displayList: function displayList(alarms) {
                var len = 0,
                    list = '',
                    alarm = null,
                    alarmList = document.getElementById('alarms_list');

                alarms = alarms || this.context.app.getAllAlarms();
                len = alarms.length - 1;
                while (len >= 0) {
                    alarm = $.extend({}, alarms[len]); // copy object
                    alarm.daysText = alarm.days.join(', ');
                    list += this.context.templateManager.get(
                        'alarm',
                        alarm
                    );
                    len -= 1;
                }
                alarmList.innerHTML = list;
                tau.engine.createWidgets(alarmList);
                tau.widget.Listview(alarmList).refresh();
            }

        },

        /**
         * Contains methods related to the new alarm page.
         *
         * @public
         * @type {object}
         */
        new_alarm: {

            /**
             * Initializes new alarm page.
             *
             * @public
             */
            init: function init() {
                this.addEvents();
            },

            /**
             * Binds events to new alarm page.
             *
             * @private
             */
            addEvents: function addEvents() {
                var numberOfChecked = 0,
                    isName = false,
                    toggleSaveButton = function toggleSaveButton() {
                        var $button = $('#add-alarm-btn');

                        if (numberOfChecked && isName) {
                            $button.removeClass('ui-disabled');
                        } else {
                            $button.addClass('ui-disabled');
                        }
                    };

                function padZero(number) {
                    number = number.toString();
                    if (number.length === 1) {
                        return '0' + number;
                    }
                    return number;
                }

                $('#new_alarm').on('pagebeforeshow', function beforeShow() {
                    var checked = false,
                        len = 0,
                        date = new Date(),
                        startTime = padZero(date.getHours()) + ':' +
                            padZero(date.getMinutes());

                    // clear everything
                    numberOfChecked = 0;
                    isName = false;
                    $('#name').val('');
                    $('#comment').val('');
                    $('#startTime').val(startTime);
                    checked = $('#newAlarmDays input:checkbox:checked');
                    len = checked.length - 1;
                    while (len >= 0) {
                        $(checked[len]).attr('checked', false);
                        len -= 1;
                    }
                    toggleSaveButton();
                });

                // bind buttons
                $('#add-alarm-btn').on('click', function onClick() {
                    var alarm = {},
                        days = [],
                        len = 0;

                    days = $('#newAlarmDays input:checkbox:checked');
                    len = days.length - 1;
                    alarm.days = [];
                    while (len >= 0) {
                        alarm.days.unshift($(days[len]).data('day'));
                        len -= 1;
                    }

                    alarm.name = $('#name').val().trim();
                    alarm.startTime = $('#startTime').val();
                    alarm.comment = $('#comment').val().trim();

                    this.app.addAlarm(alarm, function goToHome() {
                        tau.changePage('#home');
                    });

                }.bind(this.context));

                $('#add-alarm-cancel-btn').on('click', function onClick() {
                    history.back();
                });

                $('#name').on('input', function onInput() {
                    isName = ($(this).val().trim().length > 0);
                    toggleSaveButton();
                });

                $('#newAlarmDays input[type=checkbox]')
                    .on('change', function onChange() {
                        numberOfChecked = $(
                            '#newAlarmDays input[type=checkbox]:checked'
                        ).size();
                        toggleSaveButton();
                    });
            }

        },

        /**
         * Contains methods related to the notification page.
         *
         * @public
         * @type {object}
         */
        notification: {

            /**
             * Initializes notification page.
             *
             * @public
             */
            init: function init() {
                this.addEvents();
            },

            /**
             * Binds events to notification page.
             *
             * @private
             */
            addEvents: function addEvents() {
                $('#notification').on('pagebeforeshow', function beforeShow() {
                    var alarm = null,
                        html = '';

                    // copy object
                    alarm = $.extend({}, this.context.currentAlarm);
                    html = this.context.templateManager.get(
                        'alarmNotification',
                        alarm
                    );
                    $('.notificationContainer').html(html);
                }.bind(this));

                $('.exit').on('click', function onClick() {
                    app.exit();
                });
            }

        }

    };

    /**
     * Creates and displays popup widget.
     *
     * @public
     * @param {string} text Text information.
     * @param {object} buttons Buttons template object.
     */
    Ui.prototype.popup = function showPopup(text, buttons) {
        var i = 0,
            popupNumber = Object.keys(buttons).length,
            popup = document.getElementById('popup'),
            popupButtons = $('#popupButtons'),
            popupText = document.getElementById('popupText'),
            tauPopup = tau.widget.Popup(popup),
            buttonsCount = 0;

        // if buttons template wasn't add, use default template
        if (!buttons) {
            buttons = {
                'OK': function ok() {
                    tauPopup.close();
                }
            };
        }

        // clear popup
        popupButtons.empty();

        popup.className = popup.className.replace(/\bcenter_basic.*?\b/g, '');
        popup.classList.add('center_basic_' + popupNumber + 'btn');

        // adds buttons to popup HTML element
        for (i in buttons) {
            if (buttons.hasOwnProperty(i)) {
                buttonsCount += 1;
                if (buttons[i]) {
                    $('<a/>').text(i).attr({
                        'data-inline': 'true'
                    }).addClass('ui-btn').bind('click', buttons[i]).appendTo(
                        popupButtons
                    );
                }
            }
        }
        if (buttonsCount === 2) {
            popupButtons.addClass('ui-grid-col-2');
        } else {
            popupButtons.removeClass('ui-grid-col-2');
        }
        // adds text to popup HTML element
        popupText.innerHTML = '<p>' + text + '</p>';

        tau.engine.createWidgets(popup);
        tau.widget.Popup(popup).open();
    };

}());
