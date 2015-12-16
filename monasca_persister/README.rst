======================================
 Monasca Persister data points parser
======================================

This parser processes monitoring data from `Monasca Persister`_ formatted as
**data points** that should look like this:

.. code:: json

    {
      "measurement": "str",     // = metric.name, UTF8-encoded
      "time": "str",            // = metric.timestamp as %Y-%m-%dT%H:%M:%S.%fZ
      "fields": {
        "value": "...",         // = metric.value
        "value_meta": "..."     // = metric.value_meta dumped as string
      },
      "tags": {
        "<name#1>": "str",      // = metric.dimensions[#1]
        "<name#2>": "str",      // = metric.dimensions[#2]
        ...
        "<name#N>": "str",      // = metric.dimensions[#N]
        "_region": "str",       // = metric.meta.region
        "_tenant_id": "str"     // = metric.meta.tenantId
      }
    }


.. REFERENCES

.. _Monasca Persister: https://github.com/openstack/monasca-persister/
