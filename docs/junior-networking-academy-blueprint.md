# V79 Junior Networking Academy — Curriculum & Delivery Blueprint

**Course:** V79 Junior Networking Academy: Build, Connect & Troubleshoot Networks  
**Audience:** Ages 12–17  
**Length:** 20 missions / approximately 20 weeks  
**Default access:** Subscription (administrator may change to Free or set/change pricing before or after launch)

## Course promise

Learners should finish able to look at a small real-world network and explain:

- what the major hardware does;
- how copper and fiber links are organized;
- how Ethernet frames and IP packets move;
- how IPv4, subnets, gateways, DHCP and DNS work together;
- how switches, routers, VLANs and wireless networks are designed;
- how firewalls, NAT and VPNs protect/connect networks;
- how servers and cloud/virtual systems depend on networking;
- how to monitor and troubleshoot a network systematically; and
- how to design, document, test and present a small network.

The course is an **advanced introduction**, not a vendor certification boot camp. Concepts should transfer between Cisco, Aruba, Ubiquiti, MikroTik, Fortinet, pfSense, Windows, Linux and other environments.

## Two challenge paths

### Core Path — ages 12–14
- more diagrams and physical demonstrations;
- guided addressing/subnetting;
- simplified routing and firewall logic;
- instructor-supported tools;
- explanation in plain language.

### Engineer Challenge — ages 15–17
- binary/CIDR calculations;
- VLSM;
- more detailed packet-flow reasoning;
- routing-table interpretation;
- VLAN/trunk/inter-VLAN logic;
- firewall-rule design;
- packet-capture interpretation;
- stronger documentation expectations.

Both paths follow the same mission theme.

## Team format

Recommended practical teams: **three learners**.

Rotate roles:

1. **Network Designer**
   - requirements;
   - diagrams;
   - IP/VLAN plans;
   - design decisions.

2. **Network Technician**
   - hardware;
   - cabling;
   - simulator/device configuration;
   - implementation.

3. **Network Tester / Security Lead**
   - test evidence;
   - security checks;
   - fault finding;
   - documentation.

Every learner should experience each role during the programme.

## Technician method

Repeat in every practical lesson:

**PLAN → BUILD/CONFIGURE → TEST → DOCUMENT → RISK CHECK**

Students should learn early that a change is not complete until it has been tested and documented.

## 20-mission sequence

1. Welcome to Computer Networks
2. Network Hardware: Meet the Equipment
3. Racks, Power, UPS and the Network Room
4. Structured Cabling and Copper Ethernet
5. Fiber Optics and High-Speed Links
6. The OSI Model and TCP/IP
7. Ethernet, MAC Addresses and Switching
8. IPv4 Addressing
9. Subnetting and CIDR
10. DHCP, DNS, ARP and ICMP
11. Routing and the Default Gateway
12. VLANs, Trunks and Inter-VLAN Routing
13. Wi-Fi, Radio and Wireless Design
14. Servers, Storage, Virtualization and Cloud
15. Firewalls, NAT, VPNs and Network Security
16. Monitoring, Logs and Network Operations
17. Troubleshooting Like a Network Technician
18. Network Design and Documentation
19. Build, Configure and Test the Network
20. Final Network Engineer Demo Day

## Interactive learning

Every mission contains a browser-based **Interactive Network Lab** with immediate feedback.

Examples:
- identify device functions;
- build a rack;
- trace structured cabling;
- choose copper vs fiber;
- sort OSI concepts;
- interpret a switch MAC table;
- classify IPv4 addresses;
- split a subnet;
- order DHCP/DNS/ARP steps;
- read a routing table;
- assign VLANs;
- plan Wi-Fi;
- match server roles;
- review firewall rules;
- interpret monitoring clues;
- diagnose faults;
- choose design components;
- execute a pre-deployment test;
- respond to a NOC incident.

## Physical/simulation labs

Where equipment is available, use both **real hardware and simulation**.

Suggested physical lab kit:
- small managed switches;
- router/firewall appliance or safe lab router;
- Wi-Fi access points;
- old server/mini PC or virtualization host;
- rack/cabinet demonstration;
- patch panel;
- Cat6 cable;
- patch cords;
- keystone jacks;
- wall plates;
- cable tester;
- crimp/termination tools under supervision;
- SFP modules and fiber patch leads for demonstration;
- UPS;
- labels and cable-management accessories.

Simulation may be used where real devices are unavailable. Keep the curriculum vendor-neutral.

## Safety boundaries

Students may only work on **lab or explicitly authorized networks**.

Important rules:
- never connect experimental devices to a production network without permission;
- never scan/probe networks or public IPs without authorization;
- packet captures must use approved lab traffic;
- do not look into fiber connectors;
- fiber shards require careful handling;
- rack mounting and mains electrical work require adult supervision;
- do not place passwords/secrets in ordinary diagrams or worksheets;
- configuration changes require a plan, backup/rollback where appropriate, and test evidence.

## Capstone: Build the Network

Scenario example:

> A new V79 learning centre needs a reliable network for administration, teachers, students, guests, CCTV, printers, servers and Internet access.

Teams produce:

- requirements;
- physical network diagram;
- logical network diagram;
- hardware list / bill of materials;
- rack layout;
- UPS and power plan;
- structured cabling plan;
- cable/outlet labels;
- IP addressing plan;
- subnet plan;
- VLAN plan;
- routing/gateway plan;
- Wi-Fi coverage and SSID plan;
- server/service plan;
- firewall/security plan;
- monitoring plan;
- risk register;
- test plan;
- troubleshooting record;
- final demo/presentation.

The final product may be a physical lab, a network simulator project, or a hybrid.

## Project milestones

Formal submissions occur at:
- **Mission 4:** structured cabling plan;
- **Mission 9:** subnet/address plan;
- **Mission 15:** security/firewall plan;
- **Mission 18:** complete network design pack;
- **Mission 19:** tested implementation/simulation;
- **Mission 20:** final portfolio and demo.

## Media package

Every mission includes:
- one 16:9 mission cover;
- one concept diagram;
- one narrated short intro video;
- WebVTT captions;
- transcript;
- interactive browser lab.

The production Docker build generates all 20 videos and fails if any video/caption/transcript is missing.

## Pricing controls

The V79 Course Builder should permit an administrator to:
- set a course to **Free**;
- set it to **Subscription**;
- enter/update the USD price;
- make those changes before launch;
- make those changes after launch;
- synchronize live pricing changes to the existing website course entry;
- keep an audit record of pricing changes.

A Free course normalizes price to 0.
