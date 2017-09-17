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
/*global Config, Model, Ui, tizen */

/**
 * Application class constructor.
 *
 * @public
 * @constructor
 */
var App = null;

(function strict() { // strict mode wrapper
    'use strict';

    /**
     * Creates a new application object.
     *
     * @public
     * @constructor
     */
    App = function App() {
        return;
    };

    App.prototype = {

        /**
         * Array with application dependencies.
         *
         * @private
         * @type {string[]}
         */
        requires: ['js/app.config.js', 'js/app.model.js', 'js/app.alarm.js',
            'js/app.ui.js', 'js/app.ui.templateManager.js',
            'js/app.ui.templateManager.modifiers.js'],

        /**
         * Config object.
         *
         * @private
         * @type {Config}
         */
        config: null,

        /**
         * Model object.
         *
         * @private
         * @type {Model}
         */
        model: null,

        /**
         * Ui object.
         *
         * @private
         * @type {Ui}
         */
        ui: null,

        /**
         * Application control data key.
         *
         * @private
         * @const {string}
         */
        APP_CONTROL_DATA_KEY: 'http://tizen.org/appcontrol/data/alarm_id',

        /**
         * Application control operation URI.
         *
         * @public
         * @const {string}
         */
        APP_CONTROL_OPERATION_URI:
            'http://tizen.org/appcontrol/operation/exercise',

        /**
         * Initializes application.
         *
         * @public
         * @returns {App}
         */
        init: function init() {
            // instantiate the libs
            this.config = new Config();
            this.model = new Model();
            this.ui = new Ui();

            // initialize the modules
            this.model.init(this);
            this.ui.init(this, this.getAlarmId());

            return this;
        },

        /**
         * Returns this application id.
         *
         * @public
         * @returns {number} Application id.
         */
        getId: function getId() {
            return tizen.application.getCurrentApplication().appInfo.id;
        },

        /**
         * Returns connected alarm id.
         *
         * @private
         * @returns {string} alarm id or undefined.
         */
        getAlarmId: function getAlarmId() {
            var reqAppControl = tizen
                    .application
                    .getCurrentApplication()
                    .getRequestedAppControl(),
                data = null,
                len = 0,
                alarmId = 0;

            if (reqAppControl) {
                data = reqAppControl.appControl.data;
                len = data.length - 1;

                while (len >= 0) {
                    if (data[len].key === this.APP_CONTROL_DATA_KEY) {
                        alarmId = data[len].value[0];
                        break;
                    }
                    len -= 1;
                }

                return alarmId;
            }
        },

        /**
         * Closes application.
         *
         * @public
         */
        exit: function exit() {
            tizen.application.getCurrentApplication().exit();
        },

        /**
         * Adds alarm to the storage.
         *
         * @public
         * @param {object} alarm
         * @param {function} [success] Callback function.
         * @param {function} [failure] Callback function.
         */
        addAlarm: function addAlarm(alarm, success, failure) {
            // if add was successful
            if (this.model.add(alarm)) {
                if (success instanceof Function) {
                    success();
                }
            } else { // if add fail
                console.error('problem with adding alarm');
                if (failure instanceof Function) {
                    failure();
                }
            }
        },

        /**
         * Returns all stored alarms.
         *
         * @public
         * @returns {object[]} List of alarms.
         */
        getAllAlarms: function getAllAlarms() {
            return this.model.getAll();
        },

        /**
         * Returns single alarm which match value in corresponding key.
         *
         * @param {string} attr  Attribute name.
         * @param {*} value
         * @returns {Object|undefined} alarm object.
         */
        getAlarm: function getAlarm(attr, value) {
            return this.model.find(attr, value)[0];
        },

        /**
         * Removes alarm from the storage.
         *
         * @public
         * @param {string} alarmId
         * @param {function} [success] Callback function.
         * @param {function} [failure] Callback function.
         */
        removeAlarm: function removeAlarm(alarmId, success, failure) {
            // if removed was successfully completed
            if (this.model.remove(alarmId)) {
                if (success instanceof Function) {
                    success();
                }
            } else { // if there was problem with removing alarm
                console.error('problem with removing');
                if (failure instanceof Function) {
                    failure();
                }
            }
        }

    };
}());
