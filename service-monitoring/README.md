Use `node service.js --port=1337` to start the service.

The Nagios plugin [check_port](https://exchange.nagios.org/directory/Plugins/Network-Protocols/*-TCP-and-UDP-(Generic)/check_port-2Epl/details) can be used to test the service: `./check_port.pl -p 1337 -h localhost -c 2 -w 1 - v`
