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
    base = require('../../lib/monasca_persister_data_point'),
    metricsMappingNGSI = base.metricsMappingNGSI,
    parser = base.parser;


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
        var data = require('./sample_data_point_generic.json'),
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

    test('parse_gets_valid_entity_type_of_data_point_host_service', function () {
        var type = 'host_service',
            data = require('./sample_data_point_' + type + '.json'),
            reqdomain = {
                body: JSON.stringify(data)
            };
        parser.parseRequest(reqdomain);
        assert.equal(reqdomain.entityType, type);
    });

    test('parse_gets_valid_entity_id_of_data_point_host_service', function () {
        var type = 'host_service',
            data = require('./sample_data_point_' + type + '.json'),
            region = data.tags['_region'],
            service = data.tags['component'],
            expectedIdPattern = util.format('%s:.*:%s', region, service),
            reqdomain = {
                body: JSON.stringify(data)
            };
        parser.parseRequest(reqdomain);
        assert(reqdomain.entityId.match(new RegExp(expectedIdPattern)));
    });

    test('context_attrs_include_service_status_of_data_point_host_service', function () {
        var type = 'host_service',
            data = require('./sample_data_point_' + type + '.json'),
            expectedAttr = data.tags.component.replace('-', '_'),
            expectedValue = data.fields['value'],
            reqdomain = {
                body: JSON.stringify(data)
            };
        var entityData = parser.parseRequest(reqdomain),
            contextAttrs = parser.getContextAttrs(entityData);
        assert(contextAttrs[expectedAttr]);
        assert.equal(contextAttrs[expectedAttr], expectedValue);
    });

    test('parse_gets_valid_entity_type_of_data_point_region', function () {
        var type = 'region',
            data = require('./sample_data_point_' + type + '.json'),
            reqdomain = {
                body: JSON.stringify(data)
            };
        parser.parseRequest(reqdomain);
        assert.equal(reqdomain.entityType, type);
    });

    test('parse_gets_valid_entity_id_of_data_point_region', function () {
        var type = 'region',
            data = require('./sample_data_point_' + type + '.json'),
            region = data.tags['_region'],
            expectedId = region,
            reqdomain = {
                body: JSON.stringify(data)
            };
        parser.parseRequest(reqdomain);
        assert.equal(reqdomain.entityId, expectedId);
    });

    test('context_attrs_include_measurement_of_data_point_region', function () {
        var type = 'region',
            data = require('./sample_data_point_' + type + '.json'),
            expectedAttr = metricsMappingNGSI[data.measurement] || data.measurement,
            expectedValue = data.fields['value'],
            reqdomain = {
                body: JSON.stringify(data)
            };
        var entityData = parser.parseRequest(reqdomain),
            contextAttrs = parser.getContextAttrs(entityData);
        assert(contextAttrs[expectedAttr]);
        assert.equal(contextAttrs[expectedAttr], expectedValue);
    });

    test('context_attrs_include_metadata_of_data_point_region_pool_ip', function () {
        var type = 'region',
            metric = 'region.pool_ip',
            data = require('./sample_data_point_' + metric.replace('.', '_') + '.json'),
            meta = JSON.parse(data.fields['value_meta']),
            expectedAttr = metricsMappingNGSI[data.measurement] || data.measurement,
            expectedValue = data.fields['value'],
            reqdomain = {
                body: JSON.stringify(data)
            };
        var entityData = parser.parseRequest(reqdomain),
            contextAttrs = parser.getContextAttrs(entityData);
        assert.equal(reqdomain.entityType, type);
        assert.equal(data.measurement, metric);
        assert(contextAttrs[expectedAttr]);
        assert.equal(contextAttrs[expectedAttr], expectedValue);
        for (var name in meta) {
            assert(contextAttrs[name]);
            assert.equal(contextAttrs[name], meta[name]);
        }
    });

});
