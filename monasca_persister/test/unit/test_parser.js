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
            region = data.meta['region'],
            service = data.metric.dimensions['component'],
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
            expectedAttr = data.metric.dimensions['component'].replace('-', '_'),
            expectedValue = data.metric.value,
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
            region = data.meta['region'],
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
            expectedAttr = metricsMappingNGSI[data.metric.name] || data.metric.name,
            expectedValue = data.metric.value,
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
            valueMeta = data.metric['value_meta'],
            expectedAttr = metricsMappingNGSI[data.metric.name] || data.metric.name,
            expectedValue = data.metric.value,
            reqdomain = {
                body: JSON.stringify(data)
            };
        var entityData = parser.parseRequest(reqdomain),
            contextAttrs = parser.getContextAttrs(entityData);
        assert.equal(reqdomain.entityType, type);
        assert.equal(data.metric.name, metric);
        assert(contextAttrs[expectedAttr]);
        assert.equal(contextAttrs[expectedAttr], expectedValue);
        for (var item in valueMeta) {
            assert(contextAttrs[item]);
            assert.equal(contextAttrs[item], valueMeta[item]);
        }
    });

    test('parse_gets_valid_entity_type_of_data_point_image', function () {
        var type = 'image',
            data = require('./sample_data_point_' + type + '.json'),
            reqdomain = {
                body: JSON.stringify(data)
            };
        parser.parseRequest(reqdomain);
        assert.equal(reqdomain.entityType, type);
    });

    test('parse_gets_valid_entity_id_of_data_point_image', function () {
        var type = 'image',
            data = require('./sample_data_point_' + type + '.json'),
            region = data.meta['region'],
            resource = data.metric.dimensions['resource_id'],
            expectedIdPattern = util.format('%s:%s', region, resource),
            reqdomain = {
                body: JSON.stringify(data)
            };
        parser.parseRequest(reqdomain);
        assert(reqdomain.entityId.match(new RegExp(expectedIdPattern)));
    });

    test('context_attrs_include_standard_metrics_of_data_point_image', function () {
        var type = 'image',
            data = require('./sample_data_point_' + type + '.json'),
            valueMeta = data.metric['value_meta'],
            itemsMeta = ['size', 'status', 'name'],
            reqdomain = {
                body: JSON.stringify(data)
            };
        var entityData = parser.parseRequest(reqdomain),
            contextAttrs = parser.getContextAttrs(entityData);
        for (var i in itemsMeta) {
            var metricName = itemsMeta[i],
                expectedAttr = metricsMappingNGSI[metricName] || metricName,
                expectedValue = valueMeta[metricName];
            assert(contextAttrs[expectedAttr]);
            assert.equal(contextAttrs[expectedAttr], expectedValue);
        }
    });

    test('context_attrs_include_custom_catalogue_id_of_data_point_image', function () {
        var type = 'image',
            data = require('./sample_data_point_' + type + '.json'),
            valueMeta = data.metric['value_meta'],
            expectedAttr = metricsMappingNGSI['nid'],
            expectedValue = valueMeta.properties['nid'],
            reqdomain = {
                body: JSON.stringify(data)
            };
        var entityData = parser.parseRequest(reqdomain),
            contextAttrs = parser.getContextAttrs(entityData);
        assert(contextAttrs[expectedAttr]);
        assert.equal(contextAttrs[expectedAttr], expectedValue);
    });

    test('parse_gets_valid_entity_type_of_data_point_host', function () {
        var type = 'host',
            data = require('./sample_data_point_' + type + '.json'),
            reqdomain = {
                body: JSON.stringify(data)
            };
        parser.parseRequest(reqdomain);
        assert.equal(reqdomain.entityType, type);
    });

    test('parse_gets_valid_entity_id_of_data_point_host', function () {
        var type = 'host',
            data = require('./sample_data_point_' + type + '.json'),
            region = data.meta['region'],
            resource = data.metric.dimensions['resource_id'],
            expectedIdPattern = util.format('%s:%s', region, resource),
            reqdomain = {
                body: JSON.stringify(data)
            };
        parser.parseRequest(reqdomain);
        assert(reqdomain.entityId.match(new RegExp(expectedIdPattern)));
    });

    test('context_attrs_include_standard_metrics_of_data_point_host', function () {
        var type = 'host',
            data = require('./sample_data_point_' + type + '.json'),
            metrics = [
                'compute.node.cpu.percent',
                'compute.node.cpu.now',
                'compute.node.cpu.tot',
                'compute.node.ram.now',
                'compute.node.ram.tot',
                'compute.node.disk.now',
                'compute.node.disk.tot'
            ];
        for (var i in metrics) {
            data.metric.name = metrics[i];
            var metricName = metrics[i],
                expectedAttr = metricsMappingNGSI[metricName] || metricName,
                expectedValue = data.metric.value,
                reqdomain = {
                    body: JSON.stringify(data)
                };
            var entityData = parser.parseRequest(reqdomain),
                contextAttrs = parser.getContextAttrs(entityData);
            assert(contextAttrs[expectedAttr]);
            assert.equal(contextAttrs[expectedAttr], expectedValue);
        }
    });

    test('parse_gets_valid_entity_type_of_data_point_vm', function () {
        var type = 'vm',
            data = require('./sample_data_point_' + type + '.json'),
            reqdomain = {
                body: JSON.stringify(data)
            };
        parser.parseRequest(reqdomain);
        assert.equal(reqdomain.entityType, type);
    });

    test('parse_gets_valid_entity_id_of_data_point_vm', function () {
        var type = 'vm',
            data = require('./sample_data_point_' + type + '.json'),
            region = data.meta['region'],
            resource = data.metric.dimensions['resource_id'],
            expectedIdPattern = util.format('%s:%s', region, resource),
            reqdomain = {
                body: JSON.stringify(data)
            };
        parser.parseRequest(reqdomain);
        assert(reqdomain.entityId.match(new RegExp(expectedIdPattern)));
    });

    test('context_attrs_include_standard_dimensions_of_data_point_vm', function () {
        var type = 'vm',
            data = require('./sample_data_point_' + type + '.json'),
            dimensions = data.metric.dimensions,
            metrics = ['user_id', 'project_id'],
            reqdomain = {
                body: JSON.stringify(data)
            };
        var entityData = parser.parseRequest(reqdomain),
            contextAttrs = parser.getContextAttrs(entityData);
        for (var i in metrics) {
            var metricName = metrics[i],
                expectedAttr = metricsMappingNGSI[metricName] || metricName,
                expectedValue = dimensions[metricName];
            assert(contextAttrs[expectedAttr]);
            assert.equal(contextAttrs[expectedAttr], expectedValue);
        }
    });

    test('context_attrs_include_standard_metadata_of_data_point_vm', function () {
        var type = 'vm',
            data = require('./sample_data_point_' + type + '.json'),
            valueMeta = data.metric['value_meta'],
            itemsMeta = ['name', 'host', 'status', 'instance_type', 'image_ref'],
            reqdomain = {
                body: JSON.stringify(data)
            };
        var entityData = parser.parseRequest(reqdomain),
            contextAttrs = parser.getContextAttrs(entityData);
        for (var i in itemsMeta) {
            var metricName = itemsMeta[i],
                expectedAttr = metricsMappingNGSI[metricName] || metricName,
                expectedValue = valueMeta[metricName];
            assert(contextAttrs[expectedAttr]);
            assert.equal(contextAttrs[expectedAttr], expectedValue);
        }
    });

    test('context_attrs_include_custom_catalogue_id_of_data_point_vm', function () {
        var type = 'vm',
            data = require('./sample_data_point_' + type + '.json'),
            valueMeta = data.metric['value_meta'],
            expectedAttr = metricsMappingNGSI['nid'],
            expectedValue = valueMeta.properties['nid'],
            reqdomain = {
                body: JSON.stringify(data)
            };
        var entityData = parser.parseRequest(reqdomain),
            contextAttrs = parser.getContextAttrs(entityData);
        assert(contextAttrs[expectedAttr]);
        assert.equal(contextAttrs[expectedAttr], expectedValue);
    });

});