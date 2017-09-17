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
/*global tizen, app */

/**
 * Alarm class.
 *
 * @public
 * @constructor
 */
var Alarm = function Alarm() {
    'use strict';

    return;
};

(function strict() { // strict mode wrapper
    'use strict';

    Alarm.prototype = {

        /**
         * Creates new system alarm connected with alarm.
         * Returns alarm id.
         *
         * @public
         * @param {object} alarm
         * @returns {number} Alarm id.
         */
        add: function addAlarm(alarm) {
            var alarmdata = {},
                date = '',
                appControl = {};

            try {
                // change datetimepicker returned object into Date type object
                date = this.datapickerValue2Date(alarm.startTime);
                // create new Alarm object
                alarmdata = new tizen.AlarmAbsolute(date, alarm.days);
                // create ApplicationControl object
                appControl = new tizen.ApplicationControl(
                    app.APP_CONTROL_OPERATION_URI
                );

                // add new alarm and connect it with appControl object
                tizen.alarm.add(alarmdata, app.getId(), appControl);
            } catch (e) {
                console.error(e);
            } finally {
                return alarmdata.id;
            }
        },

        /**
         * Removes system alarm connected to alarm.
         * Returns true if alarm was successfully removed false otherwise.
         *
         * @public
         * @param {object} alarm
         * @returns {boolean} True if alarm was successfully removed false
         * otherwise.
         */
        remove: function removeAlarm(alarm) {
            try {
                tizen.alarm.remove(alarm.id);
            } catch (e) {
                console.error(e);
                return false;
            }
            return true;
        },

        /**
         * Changes the specified hour string (hh:mm format) into the Date
         * object.
         * Returns date object.
         *
         * @private
         * @param {string} value
         * @returns {Date} Date object.
         */
        datapickerValue2Date: function datapickerValue2Date(value) {
            var date = new Date(),
                time = value.split(':');

            date.setHours(parseInt(time[0], 10));
            date.setMinutes(parseInt(time[1], 10));
            date.setSeconds(0);
            return date;
        }
    };
}());
