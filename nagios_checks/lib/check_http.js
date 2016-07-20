/*
 * Copyright 2016 Telefónica I+D
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
 * Module that defines a parser object for Nagios 'check_http' plugin.
 *
 * Sample outputs from plugin:
 *
 * <code>
 * HTTP OK: HTTP/1.1 200 OK - 108168 bytes in 0.070 second response time |time=1.794274s;5.000000;10.000000;0.000000 size=108168B;;;0
 * HTTP WARNING: HTTP/1.1 200 OK - 108168 bytes in 5.783 second response time |time=1.783226s;1.000000;10.000000;0.000000 size=108168B;;;0
 * CRITICAL - Socket timeout after 10 seconds
 * </code>
 *
 * Context attributes to be calculated:
 *
 * - status = string describing result from check (OK|WARNING|CRITICAL)
 *
 * @module check_http
 * @see https://nagios-plugins.org/doc/man/check_http.html
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
 * Parses `check_http` raw data to extract an object whose members are NGSI context attributes.
 *
 * @function getContextAttrs
 * @memberof parser
 * @param {EntityData} data    Object holding raw entity data (output from plugin).
 * @returns {Object}           Context attributes.
 */
parser.getContextAttrs = function (entityData) {
    var attrs = { status: entityData.data.split(/[:-]/)[0].replace('HTTP', '').trim() };
    return attrs;
};


/**
 * The `check_http` parser.
 */
exports.parser = parser;
