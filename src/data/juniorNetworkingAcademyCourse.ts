type QuizSeed = { question: string; options: string[]; correct: string; explanation: string };

type MissionSeed = {
  title: string;
  bigQuestion: string;
  concepts: string[];
  coreActivity: string;
  engineerChallenge: string;
  projectMilestone: string;
  safety: string;
  quiz: QuizSeed[];
};

export const JUNIOR_NETWORKING_COURSE_ID = 'course-junior-networking-academy-01';

const missions: MissionSeed[] = [
  {
    title: 'Welcome to Computer Networks',
    bigQuestion: 'How do devices find each other and move information?',
    concepts: [
      'A network is a group of devices that can exchange information.',
      'LAN, WLAN, WAN and the Internet describe networks at different scales.',
      'Data is broken into smaller units and moved across links toward a destination.',
      'Client/server and peer-to-peer describe different ways devices can share services.'
    ],
    coreActivity: 'Draw the path a message might take from a laptop in a classroom to a website on the Internet. Label the local device, switch or Wi-Fi access point, router/firewall, Internet connection and remote server.',
    engineerChallenge: 'Explain where latency could be added along that path and identify which parts are inside your local network versus outside it.',
    projectMilestone: 'Create a team network notebook and choose the fictional school, youth centre, gaming room or small business your final network will support.',
    safety: 'Never connect unknown equipment to a real production network without permission.',
    quiz: [
      { question: 'What is a LAN?', options: ['A local area network', 'A type of password', 'A long-distance satellite only'], correct: 'A local area network', explanation: 'A LAN connects devices within a limited area such as a home, school or office.' },
      { question: 'Which device is normally the end destination for a website request?', options: ['A web server', 'A patch panel', 'A UPS'], correct: 'A web server', explanation: 'A web server provides website content to clients.' },
      { question: 'What does latency describe?', options: ['Delay', 'Storage size', 'Cable colour'], correct: 'Delay', explanation: 'Latency is the time it takes data to travel through the network.' }
    ]
  },
  {
    title: 'Network Hardware: Meet the Equipment',
    bigQuestion: 'What does each network device actually do?',
    concepts: [
      'NICs connect end devices to a network.',
      'Switches connect devices inside a LAN and forward Ethernet frames.',
      'Routers move traffic between IP networks.',
      'Firewalls enforce security policy between networks.',
      'Access points provide Wi-Fi connectivity.',
      'Modems/ONTs connect a local network to an ISP service.',
      'Servers and NAS devices provide services and storage.'
    ],
    coreActivity: 'Match hardware cards—NIC, switch, router, firewall, access point, modem/ONT, server, NAS and PoE injector—to their jobs.',
    engineerChallenge: 'Design a small network using separate router, firewall, managed switch and access point. Explain why an all-in-one home router hides several different functions inside one box.',
    projectMilestone: 'Create the first hardware list for the final project and explain the job of every device.',
    safety: 'Treat network equipment as electrical equipment: keep liquids away and use proper shutdown/power procedures.',
    quiz: [
      { question: 'What is the main job of a switch?', options: ['Connect devices inside a LAN', 'Provide backup power', 'Convert AC to DC for a laptop only'], correct: 'Connect devices inside a LAN', explanation: 'Switches forward Ethernet frames between LAN devices.' },
      { question: 'What is the main job of a router?', options: ['Move traffic between networks', 'Hold cables in a rack', 'Print documents'], correct: 'Move traffic between networks', explanation: 'Routers choose paths between IP networks.' },
      { question: 'Which device enforces allow/deny security rules?', options: ['Firewall', 'Patch panel', 'Keystone jack'], correct: 'Firewall', explanation: 'Firewalls apply security policy to network traffic.' }
    ]
  },
  {
    title: 'Racks, Power, UPS and the Network Room',
    bigQuestion: 'How do professionals organize and protect network equipment?',
    concepts: [
      'Racks organize network, server and power equipment using rack units (U).',
      'Patch panels terminate structured cabling cleanly.',
      'Cable managers reduce strain and improve serviceability.',
      'UPS systems provide temporary battery power and power conditioning.',
      'Airflow, heat, physical access and labeling matter in network rooms.'
    ],
    coreActivity: 'Arrange a rack diagram with patch panels, cable managers, switches, firewall/router, server/NAS, UPS and PDU in sensible positions.',
    engineerChallenge: 'Identify single points of failure in a one-UPS, one-switch design and propose realistic improvements.',
    projectMilestone: 'Draw the first rack layout and power plan for the final project.',
    safety: 'Heavy racks can tip and mains power can injure. Rack mounting and electrical work require trained adult supervision.',
    quiz: [
      { question: 'What does 1U describe?', options: ['A rack-height unit', 'One user account', 'One Ethernet frame'], correct: 'A rack-height unit', explanation: 'Rack equipment height is commonly measured in rack units.' },
      { question: 'What is a UPS for?', options: ['Temporary backup power', 'Assigning IP addresses', 'Creating VLANs'], correct: 'Temporary backup power', explanation: 'A UPS can keep equipment running briefly during a power interruption.' },
      { question: 'Why label rack ports and cables?', options: ['To make troubleshooting and changes safer', 'Only for decoration', 'To increase Wi-Fi range'], correct: 'To make troubleshooting and changes safer', explanation: 'Clear labels reduce mistakes and speed up maintenance.' }
    ]
  },
  {
    title: 'Structured Cabling and Copper Ethernet',
    bigQuestion: 'How does a cable run become a reliable network link?',
    concepts: [
      'Structured cabling separates permanent building cabling from patch cords.',
      'Cat5e, Cat6 and Cat6A support different performance requirements.',
      'T568A and T568B define pair order for balanced twisted-pair terminations.',
      'Patch panels, keystone jacks and wall plates create maintainable cabling systems.',
      'Cable testers help find opens, shorts, crossed pairs and wiring faults.',
      'PoE can carry power and data over supported Ethernet cabling.'
    ],
    coreActivity: 'Identify cable, patch cord, patch panel, keystone jack, wall plate and cable tester. Trace a complete channel from switch to user device.',
    engineerChallenge: 'Compare Cat6 and Cat6A for a new building and explain why maximum cable length, interference, bend radius and termination quality matter.',
    projectMilestone: 'Create a structured-cabling plan showing telecommunications room, patch panel, outlet IDs and device locations.',
    safety: 'Do not run low-voltage cable through unsafe electrical spaces or ceilings without proper supervision and local-code awareness.',
    quiz: [
      { question: 'What does a patch panel do?', options: ['Terminates and organizes permanent cable runs', 'Routes IP packets', 'Provides Wi-Fi'], correct: 'Terminates and organizes permanent cable runs', explanation: 'Patch panels make structured cabling easier to manage.' },
      { question: 'What can a basic cable tester find?', options: ['Wiring faults', 'Website passwords', 'Cloud billing'], correct: 'Wiring faults', explanation: 'Cable testers can identify opens, shorts and miswired pairs.' },
      { question: 'What can PoE provide?', options: ['Power and data on supported Ethernet links', 'Only DNS', 'Only fiber light'], correct: 'Power and data on supported Ethernet links', explanation: 'Power over Ethernet can power devices such as access points, phones and cameras.' }
    ]
  },
  {
    title: 'Fiber Optics and High-Speed Links',
    bigQuestion: 'How does networking use light instead of electricity?',
    concepts: [
      'Fiber carries data as light through glass or plastic.',
      'Single-mode and multimode fiber are used for different distances and designs.',
      'SFP/SFP+ and other transceivers convert equipment interfaces to optical links.',
      'Common connector families include LC and SC.',
      'Fiber supports high bandwidth and is resistant to electromagnetic interference.'
    ],
    coreActivity: 'Match single-mode, multimode, LC connector, SFP module and fiber patch panel to their descriptions.',
    engineerChallenge: 'Choose between copper and fiber for a 150-metre building-to-building link and justify the choice using distance, interference, bandwidth and safety.',
    projectMilestone: 'Decide where the final design needs copper and where fiber would be better.',
    safety: 'Never look into a fiber connector. Invisible laser light can damage eyes, and broken fiber shards require careful handling.',
    quiz: [
      { question: 'What carries data through fiber?', options: ['Light', 'Compressed air', 'Magnetic tape'], correct: 'Light', explanation: 'Optical fiber carries light pulses.' },
      { question: 'Which fiber is commonly used for very long distances?', options: ['Single-mode', 'Multimode only', 'Coax only'], correct: 'Single-mode', explanation: 'Single-mode fiber is commonly used for longer-distance links.' },
      { question: 'What is an SFP used for?', options: ['A pluggable network transceiver', 'A rack battery', 'A DNS record'], correct: 'A pluggable network transceiver', explanation: 'SFP-family modules provide pluggable network interfaces such as fiber links.' }
    ]
  },
  {
    title: 'The OSI Model and TCP/IP',
    bigQuestion: 'How can layers help us understand and troubleshoot networks?',
    concepts: [
      'The OSI model separates networking into seven conceptual layers.',
      'Physical, Data Link and Network explain signals, frames and IP routing.',
      'Transport handles end-to-end communication using protocols such as TCP and UDP.',
      'Application-layer protocols provide user-facing network services.',
      'The TCP/IP model groups similar functions into fewer practical layers.'
    ],
    coreActivity: 'Place examples such as cable, Ethernet frame, IP address, TCP, DNS and HTTP onto the correct OSI layers.',
    engineerChallenge: 'Trace encapsulation from an HTTP request down through TCP, IP, Ethernet and physical transmission, then explain decapsulation at the destination.',
    projectMilestone: 'Add an OSI troubleshooting page to the team network notebook.',
    safety: 'Layer models are troubleshooting tools, not excuses to change random settings. Test one layer/problem at a time.',
    quiz: [
      { question: 'Which OSI layer is most associated with IP addressing and routing?', options: ['Layer 3 Network', 'Layer 1 Physical', 'Layer 7 Application'], correct: 'Layer 3 Network', explanation: 'IP operates at the Network layer.' },
      { question: 'Which layer uses Ethernet frames and MAC addresses?', options: ['Layer 2 Data Link', 'Layer 5 Session', 'Layer 7 Application'], correct: 'Layer 2 Data Link', explanation: 'Ethernet framing and MAC addressing belong to Layer 2.' },
      { question: 'Why use layers when troubleshooting?', options: ['They help isolate where a problem exists', 'They make cables faster', 'They replace documentation'], correct: 'They help isolate where a problem exists', explanation: 'Layer-by-layer thinking narrows the fault domain.' }
    ]
  },
  {
    title: 'Ethernet, MAC Addresses and Switching',
    bigQuestion: 'How does a switch know where to send a frame?',
    concepts: [
      'Ethernet uses frames on local-area links.',
      'Network interfaces have MAC addresses used for local delivery.',
      'Switches learn source MAC addresses and associate them with ports.',
      'Unknown destination and broadcast traffic may be flooded within a broadcast domain.',
      'Managed switches provide VLANs, monitoring and configuration features.'
    ],
    coreActivity: 'Use a simple switch table to decide which port receives each Ethernet frame.',
    engineerChallenge: 'Explain what happens when the switch does not yet know the destination MAC address and how its table changes after traffic flows.',
    projectMilestone: 'Choose managed switch capacity for the final network, including spare ports and PoE needs.',
    safety: 'Do not connect loops between switch ports on a live network unless the design and loop-prevention controls are understood.',
    quiz: [
      { question: 'What does a switch learn from incoming frames?', options: ['Source MAC addresses', 'User passwords', 'UPS battery age'], correct: 'Source MAC addresses', explanation: 'Switches learn which source MAC address was seen on each port.' },
      { question: 'What is a broadcast domain?', options: ['The set of devices that receive Layer-2 broadcasts', 'Every device on the Internet', 'Only wireless devices'], correct: 'The set of devices that receive Layer-2 broadcasts', explanation: 'Broadcast domains define the reach of local broadcasts.' },
      { question: 'Why choose a managed switch?', options: ['For features such as VLANs and monitoring', 'Because it has no configuration', 'To replace all routers'], correct: 'For features such as VLANs and monitoring', explanation: 'Managed switches expose configuration and visibility features.' }
    ]
  },
  {
    title: 'IPv4 Addressing',
    bigQuestion: 'How does an IP address identify a device and its network?',
    concepts: [
      'IPv4 addresses are 32 bits commonly written as four decimal octets.',
      'A prefix/subnet mask identifies which part represents the network.',
      'Private IPv4 ranges are intended for internal networks.',
      'A default gateway is where a host sends traffic for other networks.',
      'Hosts on the same subnet can normally communicate directly at Layer 2.'
    ],
    coreActivity: 'Classify example addresses as private, public-looking, loopback or invalid, then decide whether two hosts are in the same /24 network.',
    engineerChallenge: 'Convert selected octets between decimal and binary and explain how the prefix length changes the network/host boundary.',
    projectMilestone: 'Create the first IPv4 addressing plan for the final network.',
    safety: 'Do not scan or probe public IP addresses that you do not own or have permission to test.',
    quiz: [
      { question: 'Which is a private IPv4 address?', options: ['192.168.10.25', '8.8.8.8', '1.1.1.1'], correct: '192.168.10.25', explanation: '192.168.0.0/16 is an IPv4 private address range.' },
      { question: 'What is the default gateway used for?', options: ['Reaching other IP networks', 'Powering a rack', 'Terminating fiber'], correct: 'Reaching other IP networks', explanation: 'Hosts send off-subnet traffic to their gateway.' },
      { question: 'How many bits are in an IPv4 address?', options: ['32', '48', '128'], correct: '32', explanation: 'IPv4 addresses are 32 bits.' }
    ]
  },
  {
    title: 'Subnetting and CIDR',
    bigQuestion: 'How do we divide one address block into smaller networks?',
    concepts: [
      'CIDR prefix length tells how many address bits identify the network.',
      'Subnetting creates smaller broadcast domains and supports organization/security.',
      'Each subnet has a network range; traditional IPv4 subnets also have a broadcast address.',
      'Usable host count depends on prefix size and design.',
      'VLSM lets different subnets use different sizes.'
    ],
    coreActivity: 'Visually split a /24 into /25 and /26 networks using address-block cards.',
    engineerChallenge: 'Calculate network, broadcast and usable host ranges for several /26, /27 and /28 examples, then use VLSM for departments of different sizes.',
    projectMilestone: 'Subnet the final network for the required departments or device groups.',
    safety: 'Document subnets before configuration so duplicate/overlapping address plans do not create outages.',
    quiz: [
      { question: 'What does /24 mean in IPv4 CIDR?', options: ['24 network-prefix bits', '24 devices exactly', '24 routers'], correct: '24 network-prefix bits', explanation: 'The slash number is the prefix length.' },
      { question: 'Why subnet a network?', options: ['To divide address space and broadcast domains', 'To increase cable length', 'To charge a UPS'], correct: 'To divide address space and broadcast domains', explanation: 'Subnetting creates smaller logical networks.' },
      { question: 'What does VLSM allow?', options: ['Different subnet sizes', 'Only one subnet size', 'No IP addresses'], correct: 'Different subnet sizes', explanation: 'Variable Length Subnet Masking supports different prefix sizes within an address plan.' }
    ]
  },
  {
    title: 'DHCP, DNS, ARP and ICMP',
    bigQuestion: 'Which background services make a network feel automatic?',
    concepts: [
      'DHCP can assign IP configuration automatically.',
      'DNS maps names to IP addresses and other records.',
      'ARP helps IPv4 hosts map local IP addresses to MAC addresses.',
      'ICMP supports control/error messages and tools such as ping.',
      'A device may have working Ethernet but still fail because DHCP or DNS is broken.'
    ],
    coreActivity: 'Put DHCP Discover, Offer, Request and Acknowledge in order, then match DNS, ARP and ICMP to their jobs.',
    engineerChallenge: 'Trace what a client does from startup through DHCP, gateway ARP, DNS lookup and ping.',
    projectMilestone: 'Decide where DHCP and DNS services will live in the final design.',
    safety: 'Only run packet captures on networks and traffic you are authorized to inspect.',
    quiz: [
      { question: 'What does DHCP usually provide?', options: ['Automatic IP configuration', 'Rack power', 'Fiber cleaning'], correct: 'Automatic IP configuration', explanation: 'DHCP can assign address, mask, gateway and DNS information.' },
      { question: 'What does DNS do?', options: ['Maps names and records', 'Charges batteries', 'Builds Ethernet cables'], correct: 'Maps names and records', explanation: 'DNS helps clients resolve names such as websites to addresses.' },
      { question: 'What tool commonly uses ICMP Echo?', options: ['ping', 'A crimp tool', 'A patch panel'], correct: 'ping', explanation: 'Ping commonly uses ICMP Echo Request and Reply.' }
    ]
  },
  {
    title: 'Routing and the Default Gateway',
    bigQuestion: 'How does traffic move between different IP networks?',
    concepts: [
      'Routers use routing tables to choose a next hop or outgoing interface.',
      'A default route handles destinations without a more specific route.',
      'Static routes are configured manually.',
      'Dynamic routing protocols exchange reachability information automatically.',
      'Traceroute helps reveal Layer-3 hops along a path.'
    ],
    coreActivity: 'Read a simplified routing table and choose the route for several destination IPs.',
    engineerChallenge: 'Apply longest-prefix-match reasoning and compare static routing with dynamic routing for a growing network.',
    projectMilestone: 'Add gateway and routing decisions to the final logical diagram.',
    safety: 'Route changes can disconnect entire networks. Plan, record and test them carefully.',
    quiz: [
      { question: 'What does a routing table contain?', options: ['Paths to IP networks', 'Cable pin colours only', 'Battery runtime only'], correct: 'Paths to IP networks', explanation: 'Routing tables guide Layer-3 forwarding.' },
      { question: 'What is a default route?', options: ['A catch-all route for destinations without a more specific match', 'The first Ethernet cable', 'A DNS password'], correct: 'A catch-all route for destinations without a more specific match', explanation: 'Default routes are used when no more-specific route exists.' },
      { question: 'What can traceroute show?', options: ['Layer-3 hops along a path', 'Rack temperature only', 'Cable category only'], correct: 'Layer-3 hops along a path', explanation: 'Traceroute reveals routers/hops toward a destination.' }
    ]
  },
  {
    title: 'VLANs, Trunks and Inter-VLAN Routing',
    bigQuestion: 'How can one physical switch support multiple separate networks?',
    concepts: [
      'VLANs create separate Layer-2 broadcast domains on managed switches.',
      'Access ports normally carry one VLAN for end devices.',
      'Trunk links can carry multiple tagged VLANs between network devices.',
      'Devices in different VLANs need Layer-3 routing to communicate.',
      'Segmentation can improve organization, performance and security.'
    ],
    coreActivity: 'Assign Admin, Teachers, Students, CCTV and Guest devices to VLANs and choose which switch ports are access versus trunk.',
    engineerChallenge: 'Create VLAN IDs, subnets and inter-VLAN firewall rules for the final project.',
    projectMilestone: 'Complete the VLAN and segmentation plan.',
    safety: 'Do not assume VLANs alone are a complete security control; Layer-3 policy still matters.',
    quiz: [
      { question: 'What does a VLAN create?', options: ['A separate Layer-2 broadcast domain', 'A new UPS battery', 'A longer fiber cable'], correct: 'A separate Layer-2 broadcast domain', explanation: 'VLANs logically separate switched networks.' },
      { question: 'What is a trunk used for?', options: ['Carry multiple VLANs between devices', 'Charge laptops', 'Resolve DNS'], correct: 'Carry multiple VLANs between devices', explanation: '802.1Q trunks commonly carry tagged VLAN traffic.' },
      { question: 'What is needed between different VLANs?', options: ['Layer-3 routing', 'A wall plate only', 'No networking device'], correct: 'Layer-3 routing', explanation: 'Inter-VLAN communication requires routing.' }
    ]
  },
  {
    title: 'Wi-Fi, Radio and Wireless Design',
    bigQuestion: 'Why does good Wi-Fi require planning?',
    concepts: [
      'Access points bridge wireless clients into a network.',
      '2.4 GHz, 5 GHz and 6 GHz have different coverage and spectrum characteristics.',
      'Channels, interference, obstacles and client density affect performance.',
      'SSIDs identify wireless networks; security commonly uses WPA2/WPA3.',
      'Guest networks should normally be separated from trusted internal devices.'
    ],
    coreActivity: 'Choose good AP locations on a floor plan and compare which band is likely to fit different coverage/performance needs.',
    engineerChallenge: 'Create a channel/coverage plan and explain roaming, capacity and why signal strength alone does not guarantee good performance.',
    projectMilestone: 'Add AP locations, SSIDs, guest segmentation and security settings to the final design.',
    safety: 'Do not attempt to access wireless networks without permission or capture other people’s traffic.',
    quiz: [
      { question: 'What does an access point provide?', options: ['Wireless network connectivity', 'UPS power only', 'Fiber termination only'], correct: 'Wireless network connectivity', explanation: 'APs connect wireless clients to the network.' },
      { question: 'Why can Wi-Fi performance be poor with a strong signal?', options: ['Interference or congestion can still exist', 'Strong signal always means perfect performance', 'DNS cannot work on Wi-Fi'], correct: 'Interference or congestion can still exist', explanation: 'Signal strength is only one part of wireless performance.' },
      { question: 'What should guest Wi-Fi normally have?', options: ['Separation from trusted internal systems', 'Full admin access', 'The same credentials as every server'], correct: 'Separation from trusted internal systems', explanation: 'Guest traffic should generally be segmented and restricted.' }
    ]
  },
  {
    title: 'Servers, Storage, Virtualization and Cloud',
    bigQuestion: 'What services live behind the network?',
    concepts: [
      'A server is a system providing a service to other systems.',
      'Common server roles include web, file, DNS, DHCP, authentication, database and application services.',
      'NAS provides file-oriented storage over a network; SAN is a storage-network concept used in larger environments.',
      'Virtual machines let multiple isolated systems share physical hardware.',
      'Cloud networking connects virtual networks, services and remote users.'
    ],
    coreActivity: 'Match server roles to user needs and decide which services must stay available if the Internet connection fails.',
    engineerChallenge: 'Compare a physical server, VM and cloud-hosted service for cost, availability, management and network dependency.',
    projectMilestone: 'Add server/service placement and storage requirements to the final design.',
    safety: 'Servers may contain sensitive data. Access should be limited to authorized users and services.',
    quiz: [
      { question: 'What makes a computer a server?', options: ['It provides a service to clients', 'It is always physically large', 'It must have a monitor'], correct: 'It provides a service to clients', explanation: 'Server describes a role/service, not simply physical size.' },
      { question: 'What does a DNS server provide?', options: ['Name resolution records', 'Rack power', 'Cable testing'], correct: 'Name resolution records', explanation: 'DNS servers answer queries about names and records.' },
      { question: 'What is a virtual machine?', options: ['A software-defined computer environment running on a host', 'A fiber connector', 'A Wi-Fi channel'], correct: 'A software-defined computer environment running on a host', explanation: 'VMs emulate computer systems using virtualization.' }
    ]
  },
  {
    title: 'Firewalls, NAT, VPNs and Network Security',
    bigQuestion: 'How do we control what traffic is allowed?',
    concepts: [
      'Firewalls inspect traffic and apply security policy.',
      'Stateful firewalls track connection state.',
      'NAT/PAT can translate internal addresses when traffic crosses network boundaries.',
      'VPNs create protected tunnels across untrusted networks.',
      'Least privilege, MFA, patching and segmentation reduce risk.',
      'Security also includes physical protection and good documentation.'
    ],
    coreActivity: 'Review simplified firewall rules and decide whether traffic should be allowed, denied or require more information.',
    engineerChallenge: 'Write a small rule set for Admin, Students, Guest, Servers and CCTV using least privilege and explain rule order.',
    projectMilestone: 'Create the firewall, NAT/VPN and security policy for the final network.',
    safety: 'Security labs must stay inside authorized lab systems. Do not test attacks against real networks or services.',
    quiz: [
      { question: 'What is least privilege?', options: ['Give only the access needed', 'Give everyone administrator access', 'Disable all passwords'], correct: 'Give only the access needed', explanation: 'Least privilege limits unnecessary access.' },
      { question: 'What can a VPN provide?', options: ['A protected tunnel across an untrusted network', 'A new rack', 'A cable category'], correct: 'A protected tunnel across an untrusted network', explanation: 'VPNs protect traffic across other networks.' },
      { question: 'What does a stateful firewall track?', options: ['Connection state', 'Only cable colours', 'UPS runtime only'], correct: 'Connection state', explanation: 'Stateful inspection understands whether packets belong to established flows.' }
    ]
  },
  {
    title: 'Monitoring, Logs and Network Operations',
    bigQuestion: 'How do technicians know when a network is healthy?',
    concepts: [
      'Monitoring tracks availability, performance and capacity.',
      'Logs record events that help explain changes and faults.',
      'SNMP is a common management/monitoring protocol concept.',
      'Uptime, interface utilization, latency, packet loss and error counters are useful indicators.',
      'Asset inventories, port maps, configuration backups and change logs reduce operational risk.'
    ],
    coreActivity: 'Read a simplified monitoring dashboard and decide which alerts need investigation first.',
    engineerChallenge: 'Create a small monitoring plan: device, metric, threshold, alert and response owner.',
    projectMilestone: 'Add monitoring, inventory, backup and maintenance procedures to the final project.',
    safety: 'Monitoring data may reveal device names, addresses and internal structure; treat it as operational information.',
    quiz: [
      { question: 'Why keep configuration backups?', options: ['To recover more quickly after failure or bad changes', 'To improve cable shielding', 'To assign MAC addresses'], correct: 'To recover more quickly after failure or bad changes', explanation: 'Known-good backups support recovery.' },
      { question: 'What does interface utilization describe?', options: ['How much link capacity is being used', 'How tall a rack is', 'How many passwords exist'], correct: 'How much link capacity is being used', explanation: 'Utilization helps reveal congestion and capacity needs.' },
      { question: 'Why keep a change log?', options: ['To know what changed and when', 'To increase Wi-Fi power', 'To replace a firewall'], correct: 'To know what changed and when', explanation: 'Change history is valuable during troubleshooting.' }
    ]
  },
  {
    title: 'Troubleshooting Like a Network Technician',
    bigQuestion: 'How do we diagnose problems without guessing?',
    concepts: [
      'Start by defining the symptom and scope.',
      'Check physical/link status before changing complex settings.',
      'Use IP configuration, ping, traceroute and DNS lookup tools to collect evidence.',
      'Change one thing at a time and record the result.',
      'The OSI model helps choose the next test.',
      'A good fix includes documenting the root cause and verification.'
    ],
    coreActivity: 'Diagnose several broken-network scenarios: unplugged cable, wrong VLAN, missing DHCP, bad gateway, DNS failure and firewall block.',
    engineerChallenge: 'Build a decision tree that separates Layer 1, Layer 2, Layer 3 and application/service failures.',
    projectMilestone: 'Write the final network test plan and troubleshooting checklist.',
    safety: 'Do not “fix” a shared production system without authorization, backups and a rollback plan.',
    quiz: [
      { question: 'What should troubleshooting begin with?', options: ['Define the symptom and scope', 'Change many settings at once', 'Replace every device'], correct: 'Define the symptom and scope', explanation: 'A clear problem statement prevents random changes.' },
      { question: 'If there is no link light, which area should you check first?', options: ['Physical/link layer', 'DNS records', 'Cloud billing'], correct: 'Physical/link layer', explanation: 'No link suggests cabling, port, interface or power problems.' },
      { question: 'Why change one thing at a time?', options: ['So you know what affected the result', 'To make repairs slower', 'Because switches require it'], correct: 'So you know what affected the result', explanation: 'Controlled changes preserve evidence.' }
    ]
  },
  {
    title: 'Network Design and Documentation',
    bigQuestion: 'How do we turn requirements into a network that can be built and maintained?',
    concepts: [
      'Good design starts with users, devices, applications, locations, security and growth requirements.',
      'Physical diagrams show equipment and cabling; logical diagrams show networks, VLANs and traffic paths.',
      'Capacity planning considers ports, bandwidth, PoE power, wireless clients and future growth.',
      'Redundancy reduces single points of failure but adds cost and complexity.',
      'Documentation includes diagrams, IP plans, rack layouts, port maps, labels and inventories.'
    ],
    coreActivity: 'Review a fictional customer brief and choose the required network components, locations and documentation.',
    engineerChallenge: 'Identify single points of failure and propose two levels of design: budget and resilient.',
    projectMilestone: 'Complete physical and logical diagrams, bill of materials, rack plan, cable schedule and IP/VLAN plan.',
    safety: 'Never place passwords or other secrets directly onto ordinary diagrams or classroom worksheets.',
    quiz: [
      { question: 'What does a logical network diagram emphasize?', options: ['Networks, VLANs and traffic paths', 'Only furniture placement', 'UPS battery chemistry only'], correct: 'Networks, VLANs and traffic paths', explanation: 'Logical diagrams focus on how communication is organized.' },
      { question: 'What is a single point of failure?', options: ['One failure that can stop an important service', 'Any spare cable', 'A VLAN name'], correct: 'One failure that can stop an important service', explanation: 'Identifying single points of failure supports resilience planning.' },
      { question: 'Why plan spare switch ports?', options: ['For growth and replacements', 'To reduce IP address length', 'To create DNS records'], correct: 'For growth and replacements', explanation: 'Capacity planning should include realistic future needs.' }
    ]
  },
  {
    title: 'Build, Configure and Test the Network',
    bigQuestion: 'Can we turn the design into a working network?',
    concepts: [
      'Implementation should follow an approved diagram and change plan.',
      'Build in stages: physical links, switching/VLANs, IP/routing, services, security, then applications.',
      'Each stage should be tested before moving on.',
      'A test plan proves requirements rather than relying on “it seems to work.”',
      'Configuration backups and rollback plans matter before major changes.'
    ],
    coreActivity: 'Build or simulate the final network in stages and record pass/fail results for connectivity, DHCP, DNS, routing, VLAN isolation and Wi-Fi.',
    engineerChallenge: 'Add at least one controlled fault, diagnose it using evidence, fix it and document the root cause.',
    projectMilestone: 'Produce a tested final network or simulator file plus completed test evidence.',
    safety: 'Only use lab or approved devices. Keep experimental changes away from school/business production networks.',
    quiz: [
      { question: 'Why test in stages?', options: ['To catch problems close to where they were introduced', 'Because routers cannot be tested', 'To avoid documentation'], correct: 'To catch problems close to where they were introduced', explanation: 'Stage-by-stage tests reduce the fault domain.' },
      { question: 'What should a test plan contain?', options: ['Expected result and actual result', 'Only device prices', 'Only passwords'], correct: 'Expected result and actual result', explanation: 'Tests should prove whether requirements are met.' },
      { question: 'Why keep a rollback plan?', options: ['To return to a known-good state if a change fails', 'To increase wireless range', 'To calculate CIDR'], correct: 'To return to a known-good state if a change fails', explanation: 'Rollback planning reduces change risk.' }
    ]
  },
  {
    title: 'Network Operations Centre Challenge',
    bigQuestion: 'Can you operate and troubleshoot a network under pressure?',
    concepts: [
      'NOC teams prioritize incidents by impact and urgency.',
      'Good incident notes separate observations from guesses.',
      'Communication matters during outages.',
      'Restoring service and finding root cause are related but different goals.',
      'Post-incident review turns failures into improvements.'
    ],
    coreActivity: 'Work through a timed incident scenario using alerts, user reports, link status, IP information and logs to identify the likely fault.',
    engineerChallenge: 'Create a short incident timeline, root-cause statement, corrective action and prevention recommendation.',
    projectMilestone: 'Complete the final NOC challenge and prepare the final presentation/demo.',
    safety: 'Stay calm, protect evidence and never hide mistakes during incident response.',
    quiz: [
      { question: 'What should determine incident priority?', options: ['Impact and urgency', 'Who shouts loudest', 'Cable colour'], correct: 'Impact and urgency', explanation: 'Priority should reflect how serious and time-sensitive the incident is.' },
      { question: 'What is a root cause?', options: ['The underlying reason the incident occurred', 'The first person who noticed it', 'Any warning light'], correct: 'The underlying reason the incident occurred', explanation: 'Root-cause analysis looks beyond symptoms.' },
      { question: 'Why run a post-incident review?', options: ['To improve systems and processes', 'To blame the youngest technician', 'To delete logs'], correct: 'To improve systems and processes', explanation: 'A review should identify lessons and preventive actions.' }
    ]
  },
  {
    title: 'Final Network Engineer Demo Day',
    bigQuestion: 'Can you explain, defend and demonstrate your network design?',
    concepts: [
      'A strong technical presentation connects requirements to design decisions.',
      'Engineers should be able to explain tradeoffs, risks and test evidence.',
      'Documentation is part of the product.',
      'Career pathways include support, cabling, NOC, networking, systems, cybersecurity, cloud and data-centre roles.'
    ],
    coreActivity: 'Present the physical diagram, logical diagram, rack/cabling plan, hardware list, IP/VLAN plan, Wi-Fi plan, security plan and test results.',
    engineerChallenge: 'Answer change-request questions from the instructor: more users, failed switch, new building, guest isolation or Internet outage.',
    projectMilestone: 'Submit the final portfolio and demonstrate the network or simulator to the class.',
    safety: 'Give credit to teammates, protect sensitive configuration information and explain what was simulated versus physically built.',
    quiz: [
      { question: 'What should a technical design presentation explain?', options: ['Why design choices meet requirements', 'Only the team name', 'Only device colours'], correct: 'Why design choices meet requirements', explanation: 'Design decisions should trace back to requirements and evidence.' },
      { question: 'What belongs in the final portfolio?', options: ['Diagrams, plans, configurations/test evidence and reflection', 'Passwords', 'Private user data'], correct: 'Diagrams, plans, configurations/test evidence and reflection', explanation: 'A portfolio should show technical work without exposing secrets.' },
      { question: 'Which is a networking career path?', options: ['NOC technician', 'Network engineer', 'Both NOC technician and network engineer'], correct: 'Both NOC technician and network engineer', explanation: 'Networking skills lead to many IT career pathways.' }
    ]
  }
];

function lessonMarkdown(m: MissionSeed, missionNumber: number, part: 1 | 2 | 3): string {
  const track = missionNumber <= 6 ? 'Foundation' : missionNumber <= 13 ? 'Network Core' : missionNumber <= 17 ? 'Secure & Operate' : 'Design & Capstone';
  const common = [
    `# ${m.title}`,
    '',
    `**Mission ${missionNumber} • ${track} • Ages 12–17**`,
    '',
    `> ${m.bigQuestion}`,
    ''
  ];

  if (part === 1) {
    return common.concat([
      '## Learn the idea',
      ...m.concepts.map(x => '- ' + x),
      '',
      '## Core Path — ages 12–14',
      'Focus on pictures, physical equipment, guided calculations and explaining the idea in your own words.',
      '',
      '## Engineer Challenge — ages 15–17',
      'Go deeper into calculations, packet flow, design choices, configuration logic and troubleshooting evidence.',
      '',
      '## Safety & professional habit',
      m.safety
    ]).join('\n');
  }

  if (part === 2) {
    return common.concat([
      '## Interactive Lab',
      m.coreActivity,
      '',
      'The interactive challenge below gives immediate feedback. Complete it before moving on.',
      '',
      '## Engineer Challenge',
      m.engineerChallenge,
      '',
      '## Explain your evidence',
      'Do not only give an answer. Explain what evidence or networking rule supports your choice.'
    ]).join('\n');
  }

  return common.concat([
    '## Build the final network',
    m.projectMilestone,
    '',
    '## Technician workflow',
    '1. **PLAN** — What must work when we finish?',
    '2. **BUILD / CONFIGURE** — Make one controlled change at a time.',
    '3. **TEST** — Record expected and actual results.',
    '4. **DOCUMENT** — Update diagrams, labels and notes.',
    '5. **RISK CHECK** — What could fail and what is our backup?',
    '',
    '## Team roles',
    '- **Network Designer** — diagrams, addressing and design decisions.',
    '- **Network Technician** — hardware, cabling and configuration work.',
    '- **Network Tester / Security Lead** — tests, documentation, security and troubleshooting.',
    '',
    'Rotate roles during the course so everyone practices each responsibility.'
  ]).join('\n');
}

function quizQuestion(mission: number, index: number, quizId: string, q: QuizSeed) {
  return {
    id: `jna-q-${mission}-${index + 1}`,
    quizId,
    questionText: q.question,
    questionType: 'multiple_choice',
    options: q.options,
    correctAnswer: q.correct,
    explanation: q.explanation,
    orderNumber: index + 1
  };
}

function lessonDownloads(missionNumber: number, lessonIndex: number) {
  if (lessonIndex !== 2) return [];
  const resources: Array<{ name: string; url: string; size: string; type: string }> = [];
  const add = (name: string, file: string) => resources.push({
    name,
    url: `/junior-networking/resources/${file}`,
    size: 'Printable',
    type: 'SVG worksheet'
  });

  if (missionNumber === 2) add('Network Hardware Inventory', 'hardware-inventory.svg');
  if (missionNumber === 3) add('Rack Layout Planner', 'rack-layout.svg');
  if (missionNumber === 4) add('Structured Cabling Schedule', 'cable-schedule.svg');
  if ([8,9,12].includes(missionNumber)) add('IP, Subnet & VLAN Plan', 'ip-vlan-plan.svg');
  if ([13,15].includes(missionNumber)) add('Wi-Fi & Security Plan', 'wireless-security-plan.svg');
  if (missionNumber === 17) add('Network Troubleshooting Report', 'troubleshooting-report.svg');
  if ([18,19,20].includes(missionNumber)) add('Final Network Design Checklist', 'final-design-checklist.svg');
  return resources;
}

function missionImages(missionNumber: number, lessonIndex: number) {
  const n = String(missionNumber).padStart(2, '0');
  const images = [`/junior-networking/images/mission-${n}-cover.svg`];
  if (lessonIndex === 0) {
    images.push(`/junior-networking/images/mission-${n}-diagram.svg`);
    if (missionNumber === 2) images.push('/junior-networking/images/hardware-glossary.svg');
    if (missionNumber === 6) images.push('/junior-networking/images/osi-model-poster.svg');
    if (missionNumber === 17) images.push('/junior-networking/images/troubleshooting-ladder.svg');
  }
  return images;
}

export function ensureJuniorNetworkingAcademyCourse(db: any): boolean {
  if (!db || !Array.isArray(db.courses) || !Array.isArray(db.publishingLogs)) return false;
  const marker = 'junior-networking-course-seed-v1';
  if (db.publishingLogs.some((log: any) => log.id === marker)) return false;
  if (db.courses.some((course: any) => course.id === JUNIOR_NETWORKING_COURSE_ID)) return false;

  const createdAt = '2026-09-23T18:45:00.000Z';
  const course = {
    id: JUNIOR_NETWORKING_COURSE_ID,
    slug: 'v79-junior-networking-academy',
    title: 'V79 Junior Networking Academy: Build, Connect & Troubleshoot Networks',
    shortDescription: 'A visual, interactive introduction to real computer networking for ages 12–17, from racks and cabling to VLANs, routing, Wi-Fi, security and troubleshooting.',
    fullDescription: 'A 20-mission practical networking programme for learners ages 12–17. Students learn the physical network first—racks, UPS systems, structured cabling, fiber, switches, routers, firewalls, access points and servers—then progress through the OSI model, Ethernet, IPv4, subnetting, DHCP/DNS, routing, VLANs, Wi-Fi, virtualization, security, monitoring and troubleshooting. Every mission includes visuals, a short video, an interactive browser lab, a Core Path for ages 12–14 and an Engineer Challenge for ages 15–17. The capstone asks teams to design, document, build or simulate, secure, test and present a complete small network.',
    category: 'General',
    difficultyLevel: 'Intermediate',
    instructor: 'V79 Academy',
    courseVersion: '1.0.0',
    thumbnail: '/junior-networking/images/mission-01-cover.svg',
    estimatedDuration: '20 weeks',
    prerequisites: [
      'Ages 12–17',
      'Comfort using a computer',
      'Basic arithmetic',
      'No previous networking experience required',
      'Adult supervision for physical cabling, racks, electrical equipment and fiber handling'
    ],
    learningObjectives: [
      'Identify common network hardware and explain each device’s function',
      'Explain the OSI and TCP/IP models and use them during troubleshooting',
      'Understand Ethernet, MAC addressing, IPv4, subnetting, DHCP, DNS, ARP and ICMP',
      'Explain routing, VLANs, trunks and inter-VLAN communication',
      'Design secure Wi-Fi, firewall, NAT and VPN solutions at an introductory level',
      'Plan racks, UPS systems, structured copper cabling, fiber and PoE',
      'Understand common server, storage, virtualization and cloud-networking concepts',
      'Use network troubleshooting tools and a repeatable troubleshooting process',
      'Create physical/logical diagrams, IP plans, port maps, risk plans and test evidence',
      'Design, build or simulate, test and present a complete small network'
    ],
    learning_objectives: [
      'Identify common network hardware and explain each device’s function',
      'Explain the OSI and TCP/IP models and use them during troubleshooting',
      'Understand Ethernet, MAC addressing, IPv4, subnetting, DHCP, DNS, ARP and ICMP',
      'Explain routing, VLANs, trunks and inter-VLAN communication',
      'Design secure Wi-Fi, firewall, NAT and VPN solutions at an introductory level',
      'Plan racks, UPS systems, structured copper cabling, fiber and PoE',
      'Understand common server, storage, virtualization and cloud-networking concepts',
      'Use network troubleshooting tools and a repeatable troubleshooting process',
      'Create physical/logical diagrams, IP plans, port maps, risk plans and test evidence',
      'Design, build or simulate, test and present a complete small network'
    ],
    status: 'Draft',
    pricingType: 'subscription',
    price: 0,
    createdAt,
    updatedAt: createdAt
  };

  db.courses.push(course);

  missions.forEach((mission, missionIndex) => {
    const missionNumber = missionIndex + 1;
    const moduleId = `jna-mod-${missionNumber}`;
    db.modules.push({
      id: moduleId,
      courseId: JUNIOR_NETWORKING_COURSE_ID,
      title: `Mission ${missionNumber}: ${mission.title}`,
      description: mission.bigQuestion,
      orderNumber: missionNumber
    });

    [
      { title: `Learn: ${mission.title}`, part: 1 as const, time: '25 mins' },
      { title: `Interactive Lab: Mission ${missionNumber}`, part: 2 as const, time: '30 mins' },
      { title: `Build & Engineer Challenge: Mission ${missionNumber}`, part: 3 as const, time: '35 mins' }
    ].forEach((spec, lessonIndex) => {
      db.lessons.push({
        id: `jna-les-${missionNumber}-${lessonIndex + 1}`,
        moduleId,
        courseId: JUNIOR_NETWORKING_COURSE_ID,
        title: spec.title,
        description: lessonIndex === 0 ? mission.bigQuestion : lessonIndex === 1 ? 'Practice the networking concept in an interactive lab with immediate feedback.' : 'Apply the mission to the final network design and complete the age-appropriate engineer extension.',
        learningObjectives: lessonIndex === 1
          ? ['Apply the mission concept in an interactive scenario', 'Explain why the answer is correct', 'Use networking evidence rather than guessing']
          : ['Explain the mission concept', 'Apply it in a practical network design', 'Work safely and document changes'],
        learning_objectives: lessonIndex === 1
          ? ['Apply the mission concept in an interactive scenario', 'Explain why the answer is correct', 'Use networking evidence rather than guessing']
          : ['Explain the mission concept', 'Apply it in a practical network design', 'Work safely and document changes'],
        estimatedTime: spec.time,
        lessonContent: lessonMarkdown(mission, missionNumber, spec.part),
        videoUrl: lessonIndex === 0 ? `/junior-networking/media/mission-${String(missionNumber).padStart(2, '0')}-intro.mp4` : '',
        audioUrl: '',
        imageUrls: missionImages(missionNumber, lessonIndex),
        downloads: lessonDownloads(missionNumber, lessonIndex),
        exercisePrompt: lessonIndex === 0 ? mission.coreActivity : lessonIndex === 1 ? mission.engineerChallenge : mission.projectMilestone,
        orderNumber: lessonIndex + 1
      });
    });

    const quizId = `jna-quiz-${missionNumber}`;
    db.quizzes.push({
      id: quizId,
      lessonId: `jna-les-${missionNumber}-3`,
      title: `Mission ${missionNumber} Network Check`,
      passingScore: 67,
      questions: mission.quiz.map((q, index) => quizQuestion(missionNumber, index, quizId, q))
    });

    if ([4, 9, 15, 18, 19, 20].includes(missionNumber)) {
      db.assignments.push({
        id: `jna-assign-${missionNumber}`,
        courseId: JUNIOR_NETWORKING_COURSE_ID,
        moduleId,
        lessonId: `jna-les-${missionNumber}-3`,
        title: missionNumber === 20 ? 'Final Network Engineer Portfolio & Demo' : `Mission ${missionNumber} Network Project Milestone`,
        description: mission.projectMilestone,
        maxPoints: missionNumber === 20 ? 200 : 100,
        submissionType: 'text',
        required: true,
        createdAt,
        updatedAt: createdAt
      });
    }
  });

  db.publishingLogs.push({
    id: marker,
    courseId: JUNIOR_NETWORKING_COURSE_ID,
    courseTitle: course.title,
    event: 'Course Seeded',
    fromStatus: 'None',
    toStatus: 'Draft',
    performedBy: 'Admin',
    timestamp: createdAt,
    details: 'Added the 20-mission V79 Junior Networking Academy for ages 12–17.'
  });

  return true;
}
