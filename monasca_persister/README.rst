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
          "region": "str",          // = dimension always added to bind metric to a specific region
          "<name#1>": "str",        // = metric.dimensions[#1]
          "<name#2>": "str",        // = metric.dimensions[#2]
          ...
          "<name#N>": "str",        // = metric.dimensions[#N]
        }
      },
      "meta": {
        "tenantId": "str",          // = tenant_id if the user submitting the metric
        "region": "str"             // = region that Monasca API is bound to
      }
    }


Those data points are mapped to NGSI Entities according to the following:

.. list-table:: **Entity Type = 'region'
                  (Id taken from 'region' meta item)**
   :widths: 20 20 15 20 25
   :header-rows: 1

   * - Ceilometer metric
     - Ceilometer meta
     - Monasca measurement
     - Monasca value_meta
     - NGSI attributes
   * - region.pool_ip
     - | name
       | location
       | latitude
       | longitude
       | ram_allocation_ratio
       | cpu_allocation_ratio
       | *component*\_version
     - region.pool_ip
     - |
       | location
       | latitude
       | longitude
       | ram_allocation_ratio
       | cpu_allocation_ratio
       | *component*\_version
     - | ipTot
       | location
       | latitude
       | longitude
       | ram_allocation_ratio
       | cpu_allocation_ratio
       | *component*\_version [1]
   * - region.used_ip
     - | name
       | location
       | latitude
       | longitude
       | ram_allocation_ratio
       | cpu_allocation_ratio
       | *component*\_version
     - region.used_ip
     - |
       |
       | *(none, depending on configuration)* [2]
     - ipUsed
   * - region.allocated_ip
     - | name
       | location
       | latitude
       | longitude
       | ram_allocation_ratio
       | cpu_allocation_ratio
       | *component*\_version
     - region.allocated_ip
     - |
       |
       | *(none, depending on configuration)* [2]
     - ipAvailable

**[1]** Here 'component' refers to any of the `OpenStack projects`_, and value
of '*component*\_version' will denote the exact version being installed on the
node (please note version numbers may not coincide with `OpenStack releases`_).

**[2]** Metadata items are configured at `monasca_field_definitions.yaml`_
file.

|

.. list-table:: **Entity Type = 'image'
                  (Id taken from 'resource_id' dimension)**
   :widths: 20 20 15 20 25
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
       | properties: *nid*
     - image
     - | size
       | status
       | name
       | properties: *nid*
     - | size
       | status
       | name
       | catalogue_ge_id

**Note:**
``nid`` is a custom metadata property of images.

|

.. list-table:: **Entity Type = 'host_service'
                  (Id taken from 'region' meta item and 'component' dimension)**
   :widths: 20 20 15 20 25
   :header-rows: 1

   * - Ceilometer metric
     - Ceilometer meta
     - Monasca measurement
     - Monasca value_meta
     - NGSI attributes
   * - processes.process_pid_count
     - *none*
     - *= metric*
     - *none*
     - *component* [\*]

**[\*]**
The 'component' dimension will identify the exact process (for instance,
``nova-api``) being part of an OpenStack service (given by the 'service'
dimension, for instance ``nova``).

|

.. list-table:: **Entity Type = 'host'
                  (Id taken from 'region' meta item and 'resource_id' dimension)**
   :widths: 20 20 15 20 25
   :header-rows: 1

   * - Ceilometer metric
     - Ceilometer meta
     - Monasca measurement
     - Monasca value_meta
     - NGSI attributes
   * - compute.node.cpu.percent
     - *none*
     - *= metric*
     - *none*
     - cpuPct
   * - compute.node.cpu.now
     - *none*
     - *= metric*
     - *none*
     - cpuNow
   * - compute.node.cpu.max
     - *none*
     - *= metric*
     - *none*
     - cpuMax
   * - compute.node.cpu.tot
     - *none*
     - *= metric*
     - *none*
     - cpuTot
   * - compute.node.disk.now
     - *none*
     - *= metric*
     - *none*
     - diskNow
   * - compute.node.disk.max
     - *none*
     - *= metric*
     - *none*
     - diskMax
   * - compute.node.disk.tot
     - *none*
     - *= metric*
     - *none*
     - diskTot
   * - compute.node.ram.now
     - *none*
     - *= metric*
     - *none*
     - ramNow
   * - compute.node.ram.max
     - *none*
     - *= metric*
     - *none*
     - ramMax
   * - compute.node.ram.tot
     - *none*
     - *= metric*
     - *none*
     - ramTot

|

.. list-table:: **Entity Type = 'vm'
                  (Id taken from 'region' meta item and 'resource_id' dimension)**
   :widths: 20 20 15 20 25
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
       | properties: *nid*
       |
       |
     - *= metric*
     - | name
       | host
       | status
       | instance_type
       | image_ref
       | properties: *nid*
       |
       |
     - | name
       | host_id
       | status
       | flavor
       | image
       | catalogue_ge_id
       | user_id [\*]
       | tenant_id [\*]
   * - cpu_util
     - *= instance meta*
     - *= metric*
     - *= ceilometer*
     - | cpuLoadPct
   * - memory
     - *= instance meta*
     - *= metric*
     - *= ceilometer*
     - | ramTot
   * - memory.usage
     - *= instance meta*
     - *= metric*
     - *= ceilometer*
     - | ramUsed
   * - disk.capacity
     - *= instance meta*
     - *= metric*
     - *= ceilometer*
     - | diskTot
   * - disk.usage
     - *= instance meta*
     - *= metric*
     - *= ceilometer*
     - | diskUsed

**[\*]** Taken from 'user_id' and 'project_id' dimensions, respectively.


.. REFERENCES

.. _Monasca Persister: https://github.com/telefonicaid/monasca-persister/
.. _monasca_field_definitions.yaml: https://github.com/telefonicaid/monasca-ceilometer/blob/fiware/etc/ceilometer/monasca_field_definitions.yaml
.. _OpenStack projects: http://governance.openstack.org/reference/projects/index.html
.. _OpenStack releases: https://wiki.openstack.org/wiki/Releases
