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

/*jslint devel:true*/
/*global window, Alarm, app */

/**
 * Model class constructor.
 *
 * @public
 * @constructor
 */
var Model = function Model() {
    'use strict';

    return;
};

(function strict() { // strict mode wrapper
    'use strict';

    Model.prototype = {

        /**
         * Initializes model instance of the model.
         *
         * @public
         * @param {App} app
         */
        init: function Model_init(app) {
            var alarms = window.localStorage.getItem('alarms');

            this.app = app;
            this.alarms = alarms ? JSON.parse(alarms) : [];
            this.alarmHelper = new Alarm();
        },

        /**
         * Adds new alarm, saves it in the local storage and sets new alarm.
         * Returns alarm object.
         *
         * @public
         * @param {object} alarm alarm object
         * @returns {object|undefined} alarm object.
         */
        add: function Model_saveAlarm(alarm) {
            var alarmId = this.alarmHelper.add(alarm);

            if (alarmId) {
                alarm.id = alarmId;

                // add to session storage
                this.alarms.push(alarm);

                // add to localStorage
                this.updateStorage();
                return alarm;
            }
        },

        /**
         * Removes alarm with a given id.
         * Returns true if alarm was successfully removed, false otherwise.
         *
         * @public
         * @param {string} alarmId
         * @returns {boolean} True if alarm was successfully removed,
         * false otherwise.
         */
        remove: function Model_remove(alarmId) {
            // find alarm to remove
            var alarm = this.find('id', alarmId)[0],
                index = 0;

            // if alarm remove connected alarm
            if (alarm) {
                if (this.alarmHelper.remove(alarm)) {
                    // if alarm removed update session store
                    index = this.alarms.indexOf(alarm);
                    this.alarms.splice(index, 1);
                    // update localStorage
                    this.updateStorage();
                    return true;
                }
            }
            // error removing
            return false;
        },

        /**
         * Finds list of alarms matching values with given attribute name.
         * Returns list of alarms.
         *
         * @public
         * @param {String} attr Attribute name.
         * @param {*} value Attribute value.
         * @returns {object[]} List of alarms.
         */
        find: function Model_find(attr, value) {
            return this.alarms.filter(
                function filter(el) {
                    return el[attr] === value.toString();
                }
            );
        },

        /**
         * Saves alarms in the local storage.
         *
         * @private
         */
        updateStorage: function Model_updateStorage() {
            try {
                window.localStorage.setItem(
                    'alarms',
                    JSON.stringify(this.alarms)
                );
            } catch (e) {
                if (e.code === 22) {
                    // QuotaExceededError
                    app.ui.popup(
                        'Not enough memory to save data.' +
                            ' Please remove unnecessary files.'
                    );
                }
            }
        },

        /**
         * Returns array of all currently stored alarms.

         * @returns {object[]} List of alarms.
         */
        getAll: function Model_getAll() {
            return this.alarms;
        }

    };
}());
