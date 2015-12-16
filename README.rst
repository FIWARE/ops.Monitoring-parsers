======================================
 FIWARE Monitoring Parsers Repository
======================================

Contains a collection of `custom parsers`__ to extended NGSI Adapter component
from `FIWARE Monitoring`_.

NGSI Adapter asynchronously processes requests that include raw monitoring data
originated by different probes, part of monitoring frameworks (such as Nagios,
for example). Adapter tries to load a valid parser named after the originating
probe, located at any of the directories specified (see
`NGSI Adapter Installation and Administration Guide`_).

__ `NGSI Adapter parsers`_


.. REFERENCES

.. _FIWARE Monitoring: https://github.com/telefonicaid/fiware-monitoring
.. _NGSI Adapter parsers: https://github.com/telefonicaid/fiware-monitoring/blob/master/doc/manuals/user/README.rst#ngsi-adapter-parsers
.. _NGSI Adapter Installation and Administration Guide: https://github.com/telefonicaid/fiware-monitoring/tree/master/doc/manuals/admin
