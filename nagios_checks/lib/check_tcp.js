/*
 * Copyright 2017 FIWARE Foundation, e.V.
 * All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */


/**
 * Module that defines a parser object for Nagios 'check_tcp' plugin.
 *
 * Sample outputs from plugin:
 *
 * <code>
 * TCP OK - 0.000 second response time on port 80|time=0.000222s;;;0.000000;10.000000
 * TCP WARNING - 0.057 second response time on port 5666|time=0.056678s;0.003000;;0.000000;10.000000
 * TCP CRITICAL - 0.057 second response time on port 5666|time=0.056597s;;0.003000;0.000000;10.000000
 * No route to host
 * </code>
 *
 * Context attributes to be calculated:
 *
 * - status = string describing result from check (OK|WARNING|CRITICAL)
 *
 * @module check_tcp
 * @see https://nagios-plugins.org/doc/man/check_tcp.html
 */


'use strict';


/**
 * Parser object (extends NGSI Adapter base parser).
 */
var parser = Object.create(null);


/**
 * Parses the request message body to extract plugin output.
 *
 * @function parseRequest
 * @memberof parser
 * @param {Domain} reqdomain   Domain handling current request (includes context, timestamp, id, type, body & parser).
 * @returns {EntityData}       An object with `data` attribute holding raw plugin data.
 */
parser.parseRequest = function (reqdomain) {
    var entityData = { data: reqdomain.body.split('\n')[0] };

    return entityData;
};


/**
 * Parses `check_tcp` raw data to extract an object whose members are NGSI context attributes.
 *
 * @function getContextAttrs
 * @memberof parser
 * @param {EntityData} data    Object holding raw entity data (output from plugin).
 * @returns {Object}           Context attributes.
 */
parser.getContextAttrs = function (entityData) {
    var data = entityData.data.split(/-/)[0].replace('TCP', '').trim();

    if ( data !== 'OK' && data !== 'WARNING' && data !== 'CRITICAL' ) {
        data = 'CRITICAL';
    }

    var attrs = { status: data };

    return attrs;
};


/**
 * The `check_tcp` parser.
 */
exports.parser = parser;
