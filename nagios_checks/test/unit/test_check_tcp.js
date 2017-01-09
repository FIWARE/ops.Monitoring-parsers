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
 * Module that defines unit tests for the Nagios 'check_tcp' plugin parser.
 *
 * @module test_check_tcp
 */


'use strict';


var fs = require('fs'),
    assert = require('assert'),
    parser = require('../../lib/check_tcp').parser;


suite('parser', function () {

    suiteSetup(function () {
        this.expectedAttr = 'status';
    });

    suiteTeardown(function () {
    });

    setup(function () {
    });

    teardown(function () {
    });

    test('context_attrs_include_status_ok', function () {
        var status = 'OK',
            data = fs.readFileSync('./test/unit/sample_data_check_tcp_' + status.toLowerCase() + '.txt'),
            expectedValue = status,
            reqdomain = {
                body: data.toString()
            };
        var entityData = parser.parseRequest(reqdomain),
            contextAttrs = parser.getContextAttrs(entityData);
        assert(contextAttrs[this.expectedAttr]);
        assert.equal(contextAttrs[this.expectedAttr], expectedValue);
    });

    test('context_attrs_include_status_warning', function () {
        var status = 'WARNING',
            data = fs.readFileSync('./test/unit/sample_data_check_tcp_' + status.toLowerCase() + '.txt'),
            expectedValue = status,
            reqdomain = {
                body: data.toString()
            };
        var entityData = parser.parseRequest(reqdomain),
            contextAttrs = parser.getContextAttrs(entityData);
        assert(contextAttrs[this.expectedAttr]);
        assert.equal(contextAttrs[this.expectedAttr], expectedValue);
    });

    test('context_attrs_include_status_critical', function () {
        var status = 'CRITICAL',
            data = fs.readFileSync('./test/unit/sample_data_check_tcp_' + status.toLowerCase() + '.txt'),
            expectedValue = status,
            reqdomain = {
                body: data.toString()
            };
        var entityData = parser.parseRequest(reqdomain),
            contextAttrs = parser.getContextAttrs(entityData);
        assert(contextAttrs[this.expectedAttr]);
        assert.equal(contextAttrs[this.expectedAttr], expectedValue);
    });

    test('context_attrs_include_status_no_route_to_host', function () {
        var status = 'CRITICAL',
            data = fs.readFileSync('./test/unit/sample_data_check_tcp_no_route_to_host.txt'),
            expectedValue = status,
            reqdomain = {
                body: data.toString()
            };
        var entityData = parser.parseRequest(reqdomain),
            contextAttrs = parser.getContextAttrs(entityData);
        assert(contextAttrs[this.expectedAttr]);
        assert.equal(contextAttrs[this.expectedAttr], expectedValue);
    });

});
