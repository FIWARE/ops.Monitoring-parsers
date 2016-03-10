======================================
 Monasca Persister data points parser
======================================

This parser processes monitoring data from `Monasca Persister`_ formatted as
**data points** that should look like this:

.. code::

    {
      "creation_time": number,      // = metric.timestamp in seconds
      "metric": {
        "timestamp": number,        // = metric.timestamp in milliseconds
        "name": "str",              // = metric.name, UTF8-encoded
        "value": ...,               // = metric.value
        "value_meta": {             // = metric.value_meta with stringified values
          "<key#1>": "str",
          "<key#2>": "str",
          ...
          "properties": "{\"key\": value}"
        },
        "dimensions": {
          "<name#1>": "str",        // = metric.dimensions[#1]
          "<name#2>": "str",        // = metric.dimensions[#2]
          ...
          "<name#N>": "str",        // = metric.dimensions[#N]
        }
      },
      "meta": {
        "tenantId": "str",          // = metric.meta.tenantId
        "region": "str"             // = metric.meta.region
      }
    }


Those data points are mapped to NGSI Entities according to the following:

.. list-table:: **Entity Type = 'region'
                  (Id taken from 'region' meta item)**
   :widths: 30 20 15 20 15
   :header-rows: 1

   * - Ceilometer metric
     - Ceilometer meta
     - Monasca measurement
     - Monasca value_meta
     - NGSI attributes
   * - region.allocated_ip
     - | name
       | location
       | latitude
       | longitude
       | ram_allocation_ratio
       | cpu_allocation_ratio
     - region.allocated_ip
     - |
       |
       | *[none, depending on configuration]* (\*)
     - ipAvailable
   * - region.pool_ip
     - | name
       | location
       | latitude
       | longitude
       | ram_allocation_ratio
       | cpu_allocation_ratio
     - region.pool_ip
     - |
       | location
       | latitude
       | longitude
       | ram_allocation_ratio
       | cpu_allocation_ratio
     - | ipTot
       | location
       | latitude
       | longitude
       | ram_allocation_ratio
       | cpu_allocation_ratio
   * - region.used_ip
     - | name
       | location
       | latitude
       | longitude
       | ram_allocation_ratio
       | cpu_allocation_ratio
     - region.used_ip
     - |
       |
       | *[none, depending on configuration]* (\*)
     - ipUsed

(*)
Available metadata items are configured at `monasca_field_definitions.yaml`
file.

|

.. list-table:: **Entity Type = 'image'
                  (Id taken from 'resource_id' dimension)**
   :widths: 30 20 15 20 15
   :header-rows: 1

   * - Ceilometer metric
     - Ceilometer meta
     - Monasca measurement
     - Monasca value_meta
     - NGSI attributes
   * - image
     - | size
       | status
       | name
       | properties: {nid}
     - image
     - | size
       | status
       | name
       | properties: {nid}
     - | size
       | status
       | name
       | catalogue_ge_id

**Note:**
`nid` is a custom metadata property of images.

|

.. list-table:: **Entity Type = 'host_service'
                  (Id taken from 'region' meta item and 'component' dimension)**
   :widths: 30 20 15 20 15
   :header-rows: 1

   * - Ceilometer metric
     - Ceilometer meta
     - Monasca measurement
     - Monasca value_meta
     - NGSI attributes
   * - processes.process_pid_count
     - *[none]*
     - *= metric*
     - *[none]*
     - *component* (\*)

(*)
A 'component' dimension will identify the exact process (e.g. `nova-api`) part
of an OpenStack service (given by the 'service' dimension, e.g. `nova`).

|

.. list-table:: **Entity Type = 'host'
                  (Id taken from 'region' meta item and 'resource_id' dimension)**
   :widths: 30 20 15 20 15
   :header-rows: 1

   * - Ceilometer metric
     - Ceilometer meta
     - Monasca measurement
     - Monasca value_meta
     - NGSI attributes
   * - compute.node.cpu.percent
     - *[none]*
     - *= metric*
     - *[none]*
     - cpuPct
   * - compute.node.cpu.now
     - *[none]*
     - *= metric*
     - *[none]*
     - cpuNow
   * - compute.node.cpu.tot
     - *[none]*
     - *= metric*
     - *[none]*
     - cpuTot
   * - compute.node.disk.now
     - *[none]*
     - *= metric*
     - *[none]*
     - diskNow
   * - compute.node.disk.tot
     - *[none]*
     - *= metric*
     - *[none]*
     - diskTot
   * - compute.node.ram.now
     - *[none]*
     - *= metric*
     - *[none]*
     - ramNow
   * - compute.node.ram.tot
     - *[none]*
     - *= metric*
     - *[none]*
     - ramTot

|

.. list-table:: **Entity Type = 'vm'
                  (Id taken from 'region' meta item and 'resource_id' dimension)**
   :widths: 30 20 15 20 15
   :header-rows: 1

   * - Ceilometer metric
     - Ceilometer meta
     - Monasca measurement
     - Monasca value_meta
     - NGSI attributes
   * - instance
     - | name
       | host
       | status
       | instance_type
       | image_ref
       | properties: {nid}
       |
       |
     - *= metric*
     - | name
       | host
       | status
       | instance_type
       | image_ref
       | properties: {nid}
       |
       |
     - | name
       | host_id
       | status
       | flavor
       | image
       | catalogue_ge_id
       | user_id (\*)
       | tenant_id (\*)

(*)
Taken from 'user_id' and 'project_id' dimensions, respectively.


.. REFERENCES

.. _Monasca Persister: https://github.com/telefonicaid/monasca-persister/
