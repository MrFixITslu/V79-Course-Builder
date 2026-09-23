import React, { useMemo, useState } from 'react';
import { CheckCircle2, CircleHelp, RotateCcw, Router, ShieldCheck, Trophy, XCircle } from 'lucide-react';

type Challenge = {
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
};

type Lab = {
  title: string;
  scenario: string;
  challenges: Challenge[];
};

const labs: Lab[] = [
  {
    title: 'Trace the Packet',
    scenario: 'A student laptop opens a website hosted outside the school. Follow the path without skipping the local network.',
    challenges: [
      { prompt: 'What usually connects the laptop to the local network first?', options: ['Switch or Wi-Fi access point', 'Remote web server', 'UPS'], answer: 'Switch or Wi-Fi access point', explanation: 'The client first reaches its local LAN through Ethernet or Wi-Fi.' },
      { prompt: 'Which device sends traffic toward other IP networks?', options: ['Router/default gateway', 'Patch panel', 'Keystone jack'], answer: 'Router/default gateway', explanation: 'The default gateway forwards off-subnet traffic.' },
      { prompt: 'Which measurement describes network delay?', options: ['Latency', 'Rack units', 'Storage capacity'], answer: 'Latency', explanation: 'Latency measures delay between sending and receiving data.' }
    ]
  },
  {
    title: 'Hardware Match',
    scenario: 'You are unpacking equipment for a new computer lab. Match the job to the right device.',
    challenges: [
      { prompt: 'Connect 24 wired PCs inside one LAN.', options: ['Switch', 'UPS', 'Firewall rule'], answer: 'Switch', explanation: 'A switch provides local Ethernet connectivity.' },
      { prompt: 'Enforce traffic policy between trusted and untrusted networks.', options: ['Firewall', 'Patch panel', 'Access point stand'], answer: 'Firewall', explanation: 'A firewall applies security policy to traffic.' },
      { prompt: 'Provide Wi-Fi to student devices.', options: ['Access point', 'Rack PDU only', 'DNS record'], answer: 'Access point', explanation: 'An AP connects wireless clients into the network.' }
    ]
  },
  {
    title: 'Rack Builder',
    scenario: 'Your rack must be organized, powered and easy to service.',
    challenges: [
      { prompt: 'Where should permanent building cables normally terminate?', options: ['Patch panel', 'Router WAN port directly', 'UPS battery terminals'], answer: 'Patch panel', explanation: 'Structured cabling terminates cleanly on patch panels.' },
      { prompt: 'What keeps equipment alive briefly during a power outage?', options: ['UPS', 'VLAN', 'DNS'], answer: 'UPS', explanation: 'A UPS provides battery-backed power for a limited time.' },
      { prompt: 'Why leave clear labels?', options: ['Reduce mistakes during maintenance', 'Increase bandwidth', 'Create IP addresses'], answer: 'Reduce mistakes during maintenance', explanation: 'Labels make changes and troubleshooting safer.' }
    ]
  },
  {
    title: 'Copper Cabling Detective',
    scenario: 'One classroom link is unreliable. Check the structured-cabling path.',
    challenges: [
      { prompt: 'Which tool checks opens, shorts and pair wiring?', options: ['Cable tester', 'Traceroute', 'Web browser'], answer: 'Cable tester', explanation: 'A cable tester checks physical wiring continuity and pair mapping.' },
      { prompt: 'Which component belongs at the wall outlet?', options: ['Keystone jack', 'Core router', 'UPS'], answer: 'Keystone jack', explanation: 'Horizontal cabling commonly terminates at a keystone jack in a wall plate.' },
      { prompt: 'What can PoE carry on supported Ethernet?', options: ['Power and data', 'Only DNS', 'Only light'], answer: 'Power and data', explanation: 'PoE can power devices such as APs and cameras while carrying data.' }
    ]
  },
  {
    title: 'Fiber Link Choice',
    scenario: 'Two buildings are 150 metres apart and electrical interference is a concern.',
    challenges: [
      { prompt: 'Which medium is the better starting choice?', options: ['Fiber optic cable', 'Short copper patch cord', 'USB cable'], answer: 'Fiber optic cable', explanation: 'Fiber supports longer links and is resistant to electromagnetic interference.' },
      { prompt: 'Which component plugs into a network device to provide an optical interface?', options: ['SFP-family transceiver', 'UPS battery', 'Patch label'], answer: 'SFP-family transceiver', explanation: 'Pluggable transceivers provide optical network interfaces.' },
      { prompt: 'What is the safest fiber habit?', options: ['Never look into the connector', 'Look for visible light with your eye', 'Touch broken strands'], answer: 'Never look into the connector', explanation: 'Optical transmitters can be unsafe to view directly, even when light is invisible.' }
    ]
  },
  {
    title: 'OSI Layer Sorter',
    scenario: 'A web request travels down the stack before leaving the laptop.',
    challenges: [
      { prompt: 'Ethernet frame and MAC address belong mainly to which OSI layer?', options: ['Layer 2 Data Link', 'Layer 3 Network', 'Layer 7 Application'], answer: 'Layer 2 Data Link', explanation: 'Ethernet framing and MAC addressing are Layer 2 concepts.' },
      { prompt: 'IP routing belongs mainly to which layer?', options: ['Layer 3 Network', 'Layer 1 Physical', 'Layer 6 Presentation'], answer: 'Layer 3 Network', explanation: 'IP addresses and routing are Layer 3.' },
      { prompt: 'DNS and HTTP are most closely associated with which layer?', options: ['Layer 7 Application', 'Layer 2 Data Link', 'Layer 1 Physical'], answer: 'Layer 7 Application', explanation: 'These protocols provide application-facing network services.' }
    ]
  },
  {
    title: 'Switch Table Challenge',
    scenario: 'A managed switch is learning which MAC address lives on each port.',
    challenges: [
      { prompt: 'What does the switch learn from an incoming frame?', options: ['Source MAC and incoming port', 'Destination password', 'DNS server battery'], answer: 'Source MAC and incoming port', explanation: 'Switches learn source MAC addresses from received frames.' },
      { prompt: 'If the destination MAC is unknown, what may the switch do?', options: ['Flood within the VLAN', 'Send it to every Internet router', 'Turn off the UPS'], answer: 'Flood within the VLAN', explanation: 'Unknown unicast traffic is commonly flooded within the broadcast domain.' },
      { prompt: 'What feature logically separates Layer-2 broadcast domains?', options: ['VLAN', 'Rack rail', 'Cable label'], answer: 'VLAN', explanation: 'VLANs create separate logical Layer-2 networks.' }
    ]
  },
  {
    title: 'IPv4 Address Detective',
    scenario: 'You are checking workstation addressing in a school LAN.',
    challenges: [
      { prompt: 'Which address is private IPv4?', options: ['10.20.30.40', '8.8.8.8', '1.1.1.1'], answer: '10.20.30.40', explanation: '10.0.0.0/8 is private IPv4 space.' },
      { prompt: 'A host needs to reach another subnet. What does it use?', options: ['Default gateway', 'Patch panel label', 'UPS runtime'], answer: 'Default gateway', explanation: 'The gateway forwards traffic to other IP networks.' },
      { prompt: 'How many bits are in IPv4?', options: ['32', '48', '128'], answer: '32', explanation: 'IPv4 uses 32-bit addresses.' }
    ]
  },
  {
    title: 'Subnet Split',
    scenario: 'You have 192.168.50.0/24 and need smaller networks.',
    challenges: [
      { prompt: 'What does /24 mean?', options: ['24 prefix bits', '24 devices maximum', '24 switches'], answer: '24 prefix bits', explanation: 'CIDR slash notation gives the network prefix length.' },
      { prompt: 'Splitting a /24 into two equal subnets creates which prefix?', options: ['/25', '/23', '/32'], answer: '/25', explanation: 'Borrowing one host bit creates two /25 networks.' },
      { prompt: 'Why use smaller subnets?', options: ['Organize and reduce broadcast domains', 'Increase cable length', 'Charge a UPS'], answer: 'Organize and reduce broadcast domains', explanation: 'Subnetting supports logical organization and segmentation.' }
    ]
  },
  {
    title: 'Background Services',
    scenario: 'A laptop boots, receives network settings, then opens portal.v79.local.',
    challenges: [
      { prompt: 'Which service can assign its IP settings automatically?', options: ['DHCP', 'DNS', 'NTP rack rail'], answer: 'DHCP', explanation: 'DHCP can provide address, mask, gateway and DNS information.' },
      { prompt: 'Which service resolves portal.v79.local to an IP address?', options: ['DNS', 'UPS', 'PoE'], answer: 'DNS', explanation: 'DNS resolves names and other records.' },
      { prompt: 'Which protocol helps IPv4 map a local IP to a MAC address?', options: ['ARP', 'HTTP', 'SSH only'], answer: 'ARP', explanation: 'ARP resolves local IPv4 addresses to Layer-2 MAC addresses.' }
    ]
  },
  {
    title: 'Routing Table Reader',
    scenario: 'A router has multiple routes and must choose the best match.',
    challenges: [
      { prompt: 'What happens if a more-specific route matches a destination?', options: ['Use the more-specific route', 'Always use the default route', 'Broadcast the packet'], answer: 'Use the more-specific route', explanation: 'Routers prefer the longest matching prefix.' },
      { prompt: 'What does 0.0.0.0/0 represent?', options: ['IPv4 default route', 'Loopback only', 'One VLAN trunk'], answer: 'IPv4 default route', explanation: '0.0.0.0/0 matches any IPv4 destination when no more-specific route exists.' },
      { prompt: 'Which tool can show Layer-3 hops?', options: ['traceroute/tracert', 'Cable crimper', 'Rack ruler'], answer: 'traceroute/tracert', explanation: 'Traceroute reveals hops toward a destination.' }
    ]
  },
  {
    title: 'VLAN Planner',
    scenario: 'Admin, Students, CCTV and Guests share the same switches but should not share one broadcast domain.',
    challenges: [
      { prompt: 'Which feature separates these groups at Layer 2?', options: ['VLANs', 'UPS outlets', 'Cable colours only'], answer: 'VLANs', explanation: 'VLANs create separate Layer-2 broadcast domains.' },
      { prompt: 'What port type normally connects one end-user VLAN device?', options: ['Access port', 'Trunk port carrying every VLAN by default', 'WAN fiber only'], answer: 'Access port', explanation: 'Access ports typically place an endpoint into one VLAN.' },
      { prompt: 'What is required for VLAN 10 to communicate with VLAN 20?', options: ['Layer-3 routing', 'A longer patch cable', 'A second DNS name only'], answer: 'Layer-3 routing', explanation: 'Communication between VLANs crosses a Layer-3 device or interface.' }
    ]
  },
  {
    title: 'Wi-Fi Planner',
    scenario: 'A youth centre needs reliable Wi-Fi in classrooms, office space and an outdoor patio.',
    challenges: [
      { prompt: 'What is the best reason to place APs carefully?', options: ['Coverage, capacity and interference', 'To shorten IP addresses', 'To replace firewalls'], answer: 'Coverage, capacity and interference', explanation: 'Wireless design balances signal, client density and interference.' },
      { prompt: 'Should guest Wi-Fi normally reach internal administration systems?', options: ['No, segment and restrict it', 'Yes, always', 'Only because it is wireless'], answer: 'No, segment and restrict it', explanation: 'Guest networks should be isolated from trusted systems.' },
      { prompt: 'Can strong signal still have poor performance?', options: ['Yes, congestion/interference can still exist', 'No, never', 'Only on fiber'], answer: 'Yes, congestion/interference can still exist', explanation: 'RSSI alone does not guarantee capacity or quality.' }
    ]
  },
  {
    title: 'Server Role Match',
    scenario: 'Your network needs websites, shared files, address assignment and login services.',
    challenges: [
      { prompt: 'Which server role provides IP configuration to clients?', options: ['DHCP server', 'Web server', 'Print server'], answer: 'DHCP server', explanation: 'DHCP provides network configuration automatically.' },
      { prompt: 'Which role serves website content?', options: ['Web server', 'UPS', 'Patch panel'], answer: 'Web server', explanation: 'Web servers answer HTTP/HTTPS requests.' },
      { prompt: 'What is a VM?', options: ['A software-defined computer environment on a host', 'A fiber connector', 'A VLAN cable'], answer: 'A software-defined computer environment on a host', explanation: 'Virtual machines emulate independent computer systems.' }
    ]
  },
  {
    title: 'Firewall Rule Lab',
    scenario: 'Students need web access. Guests need Internet only. CCTV should talk only to its recorder and approved admin stations.',
    challenges: [
      { prompt: 'Which principle gives users only necessary access?', options: ['Least privilege', 'Allow everything', 'Disable logging'], answer: 'Least privilege', explanation: 'Least privilege reduces unnecessary exposure.' },
      { prompt: 'Should Guest Wi-Fi be allowed to reach internal file servers?', options: ['Deny by default', 'Allow by default', 'Only if the guest knows the VLAN number'], answer: 'Deny by default', explanation: 'Guest networks should generally not reach internal services.' },
      { prompt: 'What does a stateful firewall remember?', options: ['Connection state', 'Cable pair colours', 'Rack dimensions'], answer: 'Connection state', explanation: 'Stateful firewalls track sessions/flows to make better policy decisions.' }
    ]
  },
  {
    title: 'Monitoring Dashboard',
    scenario: 'The dashboard shows one switch port at 99% utilization, rising errors and high packet loss.',
    challenges: [
      { prompt: 'What should you investigate first?', options: ['That interface and its traffic/link health', 'The rack paint colour', 'Every password'], answer: 'That interface and its traffic/link health', explanation: 'High utilization/errors/loss on one interface is strong evidence around that link.' },
      { prompt: 'Why keep configuration backups?', options: ['Recover after failure or bad change', 'Increase Wi-Fi range', 'Create MAC addresses'], answer: 'Recover after failure or bad change', explanation: 'Known-good configs reduce recovery time.' },
      { prompt: 'What does a change log help answer?', options: ['What changed and when', 'Which cable is longest only', 'How many DNS names exist'], answer: 'What changed and when', explanation: 'Change history is valuable incident evidence.' }
    ]
  },
  {
    title: 'Troubleshooting Ladder',
    scenario: 'A PC cannot open a website. Work from evidence instead of guessing.',
    challenges: [
      { prompt: 'There is no link light. What should you check first?', options: ['Cable/port/NIC/power', 'DNS record', 'Cloud server price'], answer: 'Cable/port/NIC/power', explanation: 'No Layer-1/2 link points to a physical/interface problem first.' },
      { prompt: 'The PC can ping 8.8.8.8 but not open example.com. What is a likely next check?', options: ['DNS', 'UPS battery', 'Patch-panel rack units'], answer: 'DNS', explanation: 'IP reachability works, so name resolution is a strong next hypothesis.' },
      { prompt: 'Why change one setting at a time?', options: ['Preserve evidence of what fixed or broke the issue', 'Because switches only allow one command', 'To make the outage longer'], answer: 'Preserve evidence of what fixed or broke the issue', explanation: 'Controlled changes make troubleshooting repeatable.' }
    ]
  },
  {
    title: 'Design Review',
    scenario: 'A new learning centre needs staff, student, guest, CCTV, printers, servers and Wi-Fi with room to grow.',
    challenges: [
      { prompt: 'What should design start with?', options: ['Requirements', 'A random switch model', 'A cable colour'], answer: 'Requirements', explanation: 'Requirements drive architecture and equipment choices.' },
      { prompt: 'Which document shows VLANs, subnets and traffic paths?', options: ['Logical diagram', 'Furniture plan only', 'Battery warranty'], answer: 'Logical diagram', explanation: 'Logical diagrams show network structure and communication.' },
      { prompt: 'Why plan spare switch ports?', options: ['Growth and replacement flexibility', 'To reduce subnet masks', 'To create logs'], answer: 'Growth and replacement flexibility', explanation: 'Capacity planning should include future needs.' }
    ]
  },
  {
    title: 'Pre-Deployment Test',
    scenario: 'Your simulated network is nearly ready. Prove it works before Demo Day.',
    challenges: [
      { prompt: 'What should happen before application testing?', options: ['Verify physical/link and core network connectivity', 'Delete the diagram', 'Change all VLAN IDs'], answer: 'Verify physical/link and core network connectivity', explanation: 'Layered staged testing catches problems early.' },
      { prompt: 'What should each test record?', options: ['Expected result and actual result', 'Only the team name', 'A password'], answer: 'Expected result and actual result', explanation: 'Evidence shows whether the requirement passed.' },
      { prompt: 'What does a rollback plan provide?', options: ['A known way back if a change fails', 'More bandwidth automatically', 'A larger subnet'], answer: 'A known way back if a change fails', explanation: 'Rollback reduces implementation risk.' }
    ]
  },
  {
    title: 'NOC Incident & Engineer Demo',
    scenario: 'Users report an outage just before Demo Day. Diagnose the incident from evidence, then defend the final network design to the instructor.',
    challenges: [
      { prompt: 'What should the incident team do first?', options: ['Confirm impact and scope', 'Blame a teammate', 'Delete logs'], answer: 'Confirm impact and scope', explanation: 'Scope tells you who and what is affected and guides priority.' },
      { prompt: 'What is the strongest answer to “Why this switch?”', options: ['It meets port, speed, PoE, management and growth requirements', 'I liked the colour', 'It was first in a list'], answer: 'It meets port, speed, PoE, management and growth requirements', explanation: 'Engineering choices should map to requirements.' },
      { prompt: 'What proves the network works?', options: ['Documented test evidence', 'A confident guess', 'The rack looks neat'], answer: 'Documented test evidence', explanation: 'Testing turns design claims into evidence.' }
    ]
  }
];

export function NetworkingLab({ missionNumber }: { missionNumber: number }) {
  const lab = labs[missionNumber - 1];
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const score = useMemo(() => {
    if (!lab) return 0;
    return lab.challenges.reduce((total, q, index) => total + (checked[index] && answers[index] === q.answer ? 1 : 0), 0);
  }, [lab, answers, checked]);

  if (!lab) return null;

  const finished = lab.challenges.every((_, index) => checked[index]);

  function reset() {
    setAnswers({});
    setChecked({});
  }

  return (
    <section className="rounded-3xl border border-cyan-200 bg-gradient-to-br from-slate-950 to-slate-900 p-5 sm:p-6 text-white shadow-lg space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-black uppercase tracking-widest">
            <Router size={16} /> Interactive Network Lab
          </div>
          <h2 className="mt-2 text-xl font-black">{lab.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300 max-w-3xl">{lab.scenario}</p>
        </div>
        <div className="rounded-xl border border-cyan-700/50 bg-cyan-950/50 px-3 py-2 text-xs font-bold text-cyan-200">
          Mission {missionNumber} • {score}/{lab.challenges.length}
        </div>
      </div>

      <div className="space-y-4">
        {lab.challenges.map((challenge, index) => {
          const selected = answers[index] || '';
          const isChecked = Boolean(checked[index]);
          const correct = isChecked && selected === challenge.answer;
          return (
            <article key={index} className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
              <div className="flex gap-2">
                <CircleHelp className="mt-0.5 shrink-0 text-cyan-300" size={18} />
                <p className="font-bold text-sm">{challenge.prompt}</p>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {challenge.options.map(option => (
                  <button
                    key={option}
                    type="button"
                    disabled={isChecked}
                    onClick={() => setAnswers(current => ({ ...current, [index]: option }))}
                    className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition-all ${selected === option ? 'border-cyan-300 bg-cyan-950 text-cyan-100' : 'border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500'} disabled:cursor-default`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {!isChecked ? (
                <button
                  type="button"
                  disabled={!selected}
                  onClick={() => setChecked(current => ({ ...current, [index]: true }))}
                  className="mt-3 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-black text-slate-950 disabled:opacity-40"
                >
                  Check answer
                </button>
              ) : (
                <div className={`mt-3 rounded-xl border p-3 text-xs ${correct ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-100' : 'border-rose-500/50 bg-rose-950/40 text-rose-100'}`}>
                  <p className="font-black flex items-center gap-2">
                    {correct ? <CheckCircle2 size={16}/> : <XCircle size={16}/>}
                    {correct ? 'Correct' : `Not quite — correct answer: ${challenge.answer}`}
                  </p>
                  <p className="mt-1 leading-relaxed opacity-90">{challenge.explanation}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {finished && (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-950/30 p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-black flex items-center gap-2 text-amber-200"><Trophy size={18}/> Lab complete: {score}/{lab.challenges.length}</p>
            <p className="mt-1 text-xs text-amber-100/80">
              {score === lab.challenges.length ? 'Strong work. Explain one answer aloud before moving on.' : 'Review the explanations and try again until you can explain the reasoning.'}
            </p>
          </div>
          <button type="button" onClick={reset} className="rounded-xl border border-amber-400/50 px-3 py-2 text-xs font-bold text-amber-100">
            <RotateCcw size={14} className="inline mr-1"/> Reset lab
          </button>
        </div>
      )}

      <div className="flex gap-2 rounded-xl bg-slate-800/70 p-3 text-[11px] text-slate-300">
        <ShieldCheck size={15} className="shrink-0 text-cyan-300"/>
        These labs are defensive learning simulations. Only test or configure real networks when you have permission.
      </div>
    </section>
  );
}
