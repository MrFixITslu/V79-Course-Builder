#!/usr/bin/env python3
"""Generate V79 Junior Networking Academy narrated mission introductions."""

from __future__ import annotations
import shutil
import subprocess
import tempfile
import textwrap
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "junior-networking" / "media"

def find_font(filename: str) -> str:
    candidates = [
        Path("/usr/share/fonts/TTF") / filename,
        Path("/usr/share/fonts/ttf-dejavu") / filename,
        Path("/usr/share/fonts/truetype/dejavu") / filename,
        Path("/usr/share/fonts/dejavu") / filename,
    ]
    for candidate in candidates:
        if candidate.exists():
            return str(candidate)
    for candidate in Path("/usr/share/fonts").rglob(filename):
        return str(candidate)
    raise SystemExit(f"Could not find required font: {filename}")

FONT = find_font("DejaVuSans.ttf")
FONT_BOLD = find_font("DejaVuSans-Bold.ttf")

MISSIONS = [
    ("Welcome to Computer Networks", "Networks connect devices so they can exchange information.", "Trace a packet from a student device to a remote server."),
    ("Network Hardware", "Switches, routers, firewalls, access points and servers have different jobs.", "Match each device to the job it performs."),
    ("Racks, Power and UPS", "Good network rooms organize equipment, power and airflow.", "Build a safe rack layout and identify single points of failure."),
    ("Structured Cabling", "Reliable Ethernet starts with planned cable paths and good terminations.", "Trace the path from switch to patch panel to wall outlet to device."),
    ("Fiber Optics", "Fiber carries data as light and is ideal for high-speed or longer links.", "Choose fiber or copper for a building-to-building connection."),
    ("OSI Model and TCP/IP", "Layers help explain what data becomes as it moves through a network.", "Place cables, frames, IP, TCP and DNS on the correct layers."),
    ("Ethernet and Switching", "Switches learn MAC addresses and forward frames inside a LAN.", "Read a switch table and decide where a frame goes."),
    ("IPv4 Addressing", "IPv4 addresses identify networks and hosts, while gateways reach other networks.", "Classify addresses and decide whether hosts are local or remote."),
    ("Subnetting and CIDR", "Subnetting divides address space into smaller logical networks.", "Split a slash twenty-four visually, then calculate smaller subnets."),
    ("DHCP DNS ARP and ICMP", "Background protocols make addressing, names and testing feel automatic.", "Follow a client from DHCP to ARP to DNS to ping."),
    ("Routing and Default Gateway", "Routers use routing tables and prefix matches to choose paths.", "Read a routing table and choose the best route."),
    ("VLANs and Trunks", "VLANs create separate Layer Two networks on shared switches.", "Separate Admin, Students, CCTV and Guests into logical networks."),
    ("Wi-Fi Design", "Wireless design balances coverage, capacity, interference and security.", "Choose access point locations, bands and guest separation."),
    ("Servers and Virtualization", "Servers provide services, and virtualization lets many systems share hardware.", "Match services to server roles and decide where they should live."),
    ("Firewalls NAT and VPNs", "Security policy controls which traffic is allowed between networks.", "Review simplified firewall rules using least privilege."),
    ("Monitoring and Operations", "Logs, metrics, backups and change records keep networks maintainable.", "Read a monitoring dashboard and prioritize the strongest evidence."),
    ("Troubleshooting", "Strong technicians test from evidence instead of guessing.", "Diagnose link, DHCP, gateway, DNS and firewall failures."),
    ("Network Design", "Requirements become diagrams, capacity plans, equipment and risk decisions.", "Turn a customer brief into a physical and logical design."),
    ("Build Configure and Test", "Implementation works best in stages with tests and rollback plans.", "Build or simulate the network and prove each requirement passes."),
    ("Network Engineer Demo Day", "Engineers explain their design, evidence, risks and tradeoffs.", "Demonstrate the final network and defend your technical choices."),
]

PALETTES = [
    ("0f172a","0891b2"),("172554","2563eb"),("312e81","7c3aed"),("134e4a","0d9488"),("164e63","06b6d4"),
    ("312e81","6366f1"),("172554","3b82f6"),("0f172a","0284c7"),("3f3f46","f59e0b"),("134e4a","14b8a6"),
    ("172554","2563eb"),("312e81","8b5cf6"),("164e63","06b6d4"),("334155","64748b"),("450a0a","dc2626"),
    ("1e293b","0f766e"),("3f3f46","ea580c"),("172554","4f46e5"),("14532d","16a34a"),("3b0764","9333ea"),
]

def run(args: list[str]) -> None:
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def require(exe: str) -> None:
    if not shutil.which(exe):
        raise SystemExit(f"Missing required executable: {exe}")

def wav_seconds(path: Path) -> float:
    with wave.open(str(path), "rb") as f:
        return f.getnframes() / float(f.getframerate())

def wrap(text: str, width: int) -> str:
    return "\n".join(textwrap.wrap(text, width=width, break_long_words=False))

def ffmpeg_escape(path: Path) -> str:
    return str(path).replace("\\", "/").replace(":", "\\:")

def make_segment(work: Path, mission: int, label: str, title: str, body: str, color: str, wav: Path, output: Path) -> float:
    title_file = work / f"title-{label}.txt"
    body_file = work / f"body-{label}.txt"
    title_file.write_text(wrap(title, 27), encoding="utf-8")
    body_file.write_text(wrap(body, 52), encoding="utf-8")
    duration = wav_seconds(wav) + 0.45
    vf = (
        f"drawtext=fontfile={FONT_BOLD}:text='V79 JUNIOR NETWORKING  •  MISSION {mission:02d}':fontcolor=white@0.92:fontsize=17:x=28:y=22,"
        f"drawtext=fontfile={FONT_BOLD}:text='{label.upper()}':fontcolor=0xa5f3fc:fontsize=17:x=28:y=58,"
        f"drawtext=fontfile={FONT_BOLD}:textfile='{ffmpeg_escape(title_file)}':fontcolor=white:fontsize=33:line_spacing=4:x=28:y=98,"
        f"drawtext=fontfile={FONT}:textfile='{ffmpeg_escape(body_file)}':fontcolor=white:fontsize=19:line_spacing=4:x=28:y=190,"
        "fade=t=in:st=0:d=0.2,fade=t=out:st=" + f"{max(0.2,duration-0.25):.2f}" + ":d=0.2,format=yuv420p"
    )
    run([
        "ffmpeg","-y","-f","lavfi","-i",f"color=c=0x{color}:s=640x360:r=12",
        "-i",str(wav),"-t",f"{duration:.2f}","-vf",vf,
        "-c:v","libx264","-preset","veryfast","-b:v","95k","-maxrate","125k","-bufsize","190k",
        "-c:a","aac","-b:a","32k","-ac","1","-ar","22050","-shortest",str(output)
    ])
    return duration

def write_vtt(path: Path, cues: list[tuple[float,float,str]]) -> None:
    def stamp(sec: float) -> str:
        ms = int(round(sec * 1000))
        h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
        return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"
    lines = ["WEBVTT", ""]
    for i,(start,end,text) in enumerate(cues,1):
        lines += [str(i), f"{stamp(start)} --> {stamp(end)}", text, ""]
    path.write_text("\n".join(lines), encoding="utf-8")

def generate(index: int, title: str, key: str, challenge: str) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / f"mission-{index:02d}-intro.mp4"
    color,_ = PALETTES[index-1]
    slides = [
        ("Mission", title, f"Mission {index}. {title}."),
        ("Big Idea", "What You Need to Understand", key),
        ("Technician Habit", "Plan • Test • Document", "Network engineers use evidence. Make one controlled change, test the result, and update the diagram or notes."),
        ("Lab", "Your Challenge", challenge),
    ]
    with tempfile.TemporaryDirectory(prefix=f"jna-{index:02d}-") as td:
        work = Path(td)
        segments: list[Path] = []
        cues: list[tuple[float,float,str]] = []
        cursor = 0.0
        for number,(label,slide_title,body) in enumerate(slides,1):
            narration = f"{label}. {slide_title}. {body}"
            wav = work / f"{number}.wav"
            seg = work / f"{number}.mp4"
            run(["espeak","-s","182","-p","49","-a","155","-w",str(wav),narration])
            duration = make_segment(work,index,f"{number}-{label}",slide_title,body,color,wav,seg)
            segments.append(seg)
            cues.append((cursor,cursor+duration,narration))
            cursor += duration

        concat = work / "concat.txt"
        concat.write_text("\n".join(f"file '{p}'" for p in segments), encoding="utf-8")
        run(["ffmpeg","-y","-f","concat","-safe","0","-i",str(concat),"-c","copy","-movflags","+faststart",str(dest)])
        write_vtt(dest.with_suffix(".vtt"), cues)
        dest.with_suffix(".txt").write_text(
            f"Mission {index}: {title}\n\n" + "\n".join(text for _,_,text in cues),
            encoding="utf-8"
        )

if __name__ == "__main__":
    require("ffmpeg")
    require("espeak")
    for i,(title,key,challenge) in enumerate(MISSIONS,1):
        generate(i,title,key,challenge)
    print(f"Generated {len(MISSIONS)} Junior Networking Academy videos in {OUT}")
