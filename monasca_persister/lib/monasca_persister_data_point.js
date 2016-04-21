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
 * Module that defines a parser object for Monasca Persister data points.
 *
 * @module monasca_persister_data_point
 * @see https://github.com/openstack/monasca-persister/tree/master/monasca_persister
 */


'use strict';
/* jshint curly: false, -W069 */


var util = require('util');


/**
 * Mapping between Monasca metrics and NGSI attributes
 */
var metricsMappingNGSI = {
    'region.allocated_ip': 'ipAvailable',
    'region.pool_ip': 'ipTot',
    'region.used_ip': 'ipUsed',
    'compute.node.cpu.percent': 'cpuPct',
    'compute.node.cpu.now': 'cpuNow',
    'compute.node.cpu.max': 'cpuMax',
    'compute.node.cpu.tot': 'cpuTot',
    'compute.node.ram.now': 'ramNow',
    'compute.node.ram.max': 'ramMax',
    'compute.node.ram.tot': 'ramTot',
    'compute.node.disk.now': 'diskNow',
    'compute.node.disk.max': 'diskMax',
    'compute.node.disk.tot': 'diskTot',
    'instance_type': 'flavor',
    'image_ref': 'image',
    'project_id': 'tenant_id',
    'host': 'host_id',
    'nid': 'catalogue_ge_id'
};


/**
 * Parser object (extends NGSI Adapter base parser).
 */
var parser = Object.create(null);


/**
 * Parses the request message body to extract Monasca Persister data point.
 *
 * @function parseRequest
 * @memberof parser
 * @param {Domain} reqdomain   Domain handling current request (includes context, timestamp, id, type, body & parser).
 * @returns {EntityData} An object with `data` attribute holding data point, and also `entityType` attribute.
 *
 * Data point is a JSON that should look like this: <code>
 *         {
 *           "creation_time": number,               // = metric.timestamp in seconds
 *           "metric": {
 *             "timestamp": number,                 // = metric.timestamp in milliseconds
 *             "name": "str",                       // = metric.name, UTF8-encoded
 *             "value": ...,                        // = metric.value
 *             "value_meta": {                      // = metric.value_meta with stringified values
 *               "<key#1>": "str",
 *               "<key#2>": "str",
 *               ...
 *               "properties": "{\"key\": value}"
 *             },
 *             "dimensions": {
 *               "region": "str",                   // = dimension always added to bind metric to a specific region
 *               "<name#1>": "str",                 // = metric.dimensions[#1]
 *               "<name#2>": "str",                 // = metric.dimensions[#2]
 *               ...
 *               "<name#N>": "str",                 // = metric.dimensions[#N]
 *             }
 *           },
 *           "meta": {
 *             "tenantId": "str",                   // = tenant_id if the user submitting the metric
 *             "region": "str"                      // = region that Monasca API is bound to
 *           }
 *         }
 * </code>
 */
parser.parseRequest = function (reqdomain) {
    var dataPoint = JSON.parse(reqdomain.body);

    // Get metric name, dimensions and region
    var name = dataPoint.metric['name'],
        dimensions = dataPoint.metric['dimensions'],
        region = dimensions['region'];

    // Discard region dimension not needed anymore
    delete dimensions['region'];

    // EntityType depends on the metric name and/or dimensions, and thus EntityId is formatted
    if (name.indexOf('region.') === 0) {
        reqdomain.entityType = 'region';
        reqdomain.entityId = region;
    } else if (name.indexOf('compute.node.') === 0) {
        reqdomain.entityType = 'host';
        reqdomain.entityId = util.format('%s:%s', region, dimensions['resource_id'].replace(/^(.*)_\1$/, '$1'));
    } else if (name === 'image') {
        reqdomain.entityType = 'image';
        reqdomain.entityId = util.format('%s:%s', region, dimensions['resource_id']);
    } else if (name === 'instance') {
        reqdomain.entityType = 'vm';
        reqdomain.entityId = util.format('%s:%s', region, dimensions['resource_id']);
    } else if ('component' in dimensions) {
        reqdomain.entityType = 'host_service';
        reqdomain.entityId = util.format('%s:controller:%s', region, dimensions['component']);
    } else {
        throw new Error('Data point could not be mapped to a NGSI entity (unknown metric name or dimensions)');
    }

    // Return the data point
    return { data: dataPoint, entityType: reqdomain.entityType };
};


/**
 * Parses data point to extract an object whose members are NGSI context attributes.
 *
 * @function getContextAttrs
 * @memberof parser
 * @param {EntityData} data    Object holding raw entity data and entity type.
 * @returns {Object} Context attributes.
 */
parser.getContextAttrs = function (entityData) {
    var attrs = {};

    // Dimensions and metric value metadata (if present)
    var dimensions = entityData.data.metric['dimensions'],
        valueMeta = entityData.data.metric['value_meta'],
        item;

    // Unmarshal stringified value of 'properties' metadata item
    if (valueMeta && valueMeta['properties']) {
        try {
            valueMeta['properties'] = JSON.parse(valueMeta['properties']);
        } catch (e) {
            delete valueMeta['properties'];
        }
    }

    // Initially map data point 'value' field as a NGSI attribute with the same name of the measurement (i.e. metric)
    var attrName = entityData.data.metric['name'],
        attrValue = entityData.data.metric['value'];

    // Additional attributes depending on the entityType
    if (entityData.entityType === 'region') {
        if (attrName === 'region.sanity_status') {
            attrs['sanity_status'] = valueMeta['status'];
            attrs['sanity_check_elapsed_time'] = valueMeta['elapsed_time'];
            attrs['sanity_check_timestamp'] = entityData.data.metric['timestamp'].toString();
            attrName = attrValue = null;
        } else {
            for (item in valueMeta) {
                attrs[metricsMappingNGSI[item] || item] = valueMeta[item];
            }
        }
    } else if (entityData.entityType === 'image') {
        for (item in valueMeta) {
            if (item === 'properties') {
                if (valueMeta[item].hasOwnProperty('nid')) {
                    attrs[metricsMappingNGSI['nid']] = valueMeta[item]['nid'];
                }
            } else {
                attrs[item] = valueMeta[item];
            }
        }
    } else if (entityData.entityType === 'vm') {
        for (var name in dimensions) {
            if (name.match(/user_id|project_id/)) {
                attrs[metricsMappingNGSI[name] || name] = dimensions[name];
            }
        }
        for (item in valueMeta) {
            if (item === 'properties') {
                if (valueMeta[item].hasOwnProperty('nid')) {
                    attrs[metricsMappingNGSI['nid']] = valueMeta[item]['nid'];
                }
            } else {
                attrs[metricsMappingNGSI[item] || item] = valueMeta[item];
            }
        }
    } else if (entityData.entityType === 'host_service') {
        attrName = dimensions['component'].replace('-', '_');
    }

    // Actually add the measurement as NGSI attribute, possibly applying a name transformation
    if (attrName) {
        attrName = metricsMappingNGSI[attrName] || attrName;
        attrs[attrName] = attrValue;
    }

    return attrs;
};


/**
 * Monasca Persister data point parser.
 */
exports.parser = parser;


/**
 * Metrics to NGSI mapping.
 */
exports.metricsMappingNGSI = metricsMappingNGSI;
