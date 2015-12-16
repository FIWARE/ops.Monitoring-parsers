/*
 * Copyright 2015 Telefónica I+D
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
 * Module that defines unit tests for the Monasca Persister data points parser.
 *
 * @module test_parser
 */


'use strict';


var util = require('util'),
    assert = require('assert'),
    parser = require('../../lib/monasca_persister_data_point').parser;


/* jshint multistr: true, -W069 */
suite('parser', function () {

    suiteSetup(function () {
    });

    suiteTeardown(function () {
    });

    setup(function () {
    });

    teardown(function () {
    });

    test('parse_fails_unknown_metric_dimensions', function () {
        var data = require('./sample_generic_data_point.json'),
            reqdomain = {
                body: JSON.stringify(data)
            };
        assert.throws(
            function () {
                parser.parseRequest(reqdomain);
            },
            /unknown metric name or dimensions/
        );
    });

    test('parse_ok_entity_type_host_service_data_point', function () {
        var type = 'host_service',
            data = require('./sample_' + type + '_data_point.json'),
            reqdomain = {
                body: JSON.stringify(data)
            };
        parser.parseRequest(reqdomain);
        assert.equal(reqdomain.entityType, type);
    });

    test('parse_ok_entity_id_host_service_data_point', function () {
        var type = 'host_service',
            data = require('./sample_' + type + '_data_point.json'),
            region = data.tags['_region'],
            service = data.tags['component'],
            expectedId = util.format('%s:%s', region, service),
            reqdomain = {
                body: JSON.stringify(data)
            };
        parser.parseRequest(reqdomain);
        assert.equal(reqdomain.entityId, expectedId);
    });

    test('get_context_attrs_ok_host_service_data_point', function () {
        var type = 'host_service',
            data = require('./sample_' + type + '_data_point.json'),
            attr = data.measurement,
            value = data.fields.value,
            reqdomain = {
                body: JSON.stringify(data)
            };
        var entityData = parser.parseRequest(reqdomain),
            contextAttrs = parser.getContextAttrs(entityData);
        assert(contextAttrs[attr]);
        assert.equal(contextAttrs[attr], value);
    });

});
