#!/usr/bin/env python3
"""Generate the 16 V79 Junior AI Academy narrated mission intros.

Requires: python3, ffmpeg, espeak, DejaVu Sans font.
The videos are generated during the production Docker build so the curriculum
keeps deterministic, reviewable source instead of opaque checked-in binaries.
"""

from __future__ import annotations
import os
import shutil
import subprocess
import tempfile
import textwrap
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "junior-ai" / "media"
FONT = "/usr/share/fonts/ttf-dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/ttf-dejavu/DejaVuSans-Bold.ttf"

MISSIONS = [
    ("Welcome to the World of AI", "AI can be helpful, creative, and wrong.", "Meet your team and decide how humans and AI should work together."),
    ("Prompt Power", "Clear instructions help AI understand what you want.", "Use MAGIC, then check and improve your prompt."),
    ("Safe, Smart & Ethical AI", "Protect private information and use AI honestly.", "Use STOP Before You Prompt and build your team safety plan."),
    ("Become a Fact Detective", "AI can sound confident even when it is mistaken.", "Ask who says it, find evidence, and check if it is current."),
    ("AI Everywhere", "AI skills can support many different careers.", "Choose who your project will help and why it matters."),
    ("AI Image Studio", "Strong image prompts use subject, action, place, style, mood and details.", "Create a visual that fits your audience without misleading them."),
    ("Story & Writing Lab", "AI can brainstorm, but your team chooses, edits and adds meaning.", "Create a story or script in your own voice."),
    ("AI Audio Studio", "Good audio needs a clear message, good timing and permission.", "Create or plan an audio piece and test the sound before final recording."),
    ("AI Video Studio", "A storyboard helps your team plan before production.", "Turn your idea into a short, clear and honest video."),
    ("Presentation Power", "One main idea per slide helps people follow your message.", "Build a short presentation and rehearse it as a team."),
    ("Content Creator & Promotion Lab", "Promotion should get attention without tricking people.", "Create a truthful message, call to action and content for your audience."),
    ("AI Workflow Wizard", "A workflow connects the steps from idea to finished product.", "Map your tools, owners, checks and dependencies."),
    ("AI Problem Solver", "Understand the real problem before you build the solution.", "Test your project with another team and use feedback to improve."),
    ("Young AI Entrepreneur", "Useful projects create value for a real audience.", "Explain what your team offers, who it helps and why they would care."),
    ("Final Production Sprint", "Finishing means checking quality, safety, risks and deadlines.", "Complete the product, close important risks and rehearse the demo."),
    ("AI Creator Showcase & Portfolio", "A showcase explains the product, process, teamwork and learning.", "Present your final product, give credit and reflect on what you would improve."),
]

PALETTES = [
    ("4f46e5","8b5cf6"),("7c3aed","ec4899"),("0f766e","22c55e"),("0369a1","06b6d4"),
    ("b45309","f59e0b"),("be185d","f472b6"),("7e22ce","a855f7"),("0e7490","14b8a6"),
    ("1d4ed8","60a5fa"),("4338ca","818cf8"),("c2410c","fb923c"),("0f766e","2dd4bf"),
    ("15803d","4ade80"),("a16207","facc15"),("b91c1c","fb7185"),("6d28d9","c084fc"),
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

def make_segment(work: Path, mission: int, label: str, title: str, body: str, c1: str, wav: Path, output: Path) -> float:
    title_file = work / f"title-{label}.txt"
    body_file = work / f"body-{label}.txt"
    title_file.write_text(wrap(title, 25), encoding="utf-8")
    body_file.write_text(wrap(body, 48), encoding="utf-8")
    duration = wav_seconds(wav) + 0.45
    vf = (
        f"drawtext=fontfile={FONT_BOLD}:text='V79 JUNIOR AI  •  MISSION {mission:02d}':fontcolor=white@0.92:fontsize=18:x=28:y=22,"
        f"drawtext=fontfile={FONT_BOLD}:text='{label.upper()}':fontcolor=white@0.86:fontsize=17:x=28:y=60,"
        f"drawtext=fontfile={FONT_BOLD}:textfile='{ffmpeg_escape(title_file)}':fontcolor=white:fontsize=34:line_spacing=4:x=28:y=98,"
        f"drawtext=fontfile={FONT}:textfile='{ffmpeg_escape(body_file)}':fontcolor=white:fontsize=20:line_spacing=4:x=28:y=182,"
        "fade=t=in:st=0:d=0.2,fade=t=out:st=" + f"{max(0.2,duration-0.25):.2f}" + ":d=0.2,format=yuv420p"
    )
    run([
        "ffmpeg","-y",
        "-f","lavfi","-i",f"color=c=0x{c1}:s=640x360:r=12",
        "-i",str(wav),
        "-t",f"{duration:.2f}",
        "-vf",vf,
        "-c:v","libx264","-preset","veryfast","-b:v","90k","-maxrate","120k","-bufsize","180k",
        "-c:a","aac","-b:a","32k","-ac","1","-ar","22050",
        "-shortest",str(output)
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

def generate_mission(index: int, title: str, key: str, challenge: str) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / f"mission-{index:02d}-intro.mp4"
    c1,_ = PALETTES[index-1]
    slides = [
        ("Welcome", title, f"Mission {index}. {title}."),
        ("Big Idea", "Today's Big Idea", key),
        ("Team Skill", "Work as a Studio Team", "Plan together. Give everyone a job. Check your risks. Use CALM when you disagree."),
        ("Challenge", "Your Mission", challenge),
    ]
    with tempfile.TemporaryDirectory(prefix=f"jai-{index:02d}-") as td:
        work = Path(td)
        segments: list[Path] = []
        cues: list[tuple[float,float,str]] = []
        cursor = 0.0
        for number,(label,slide_title,body) in enumerate(slides,1):
            narration = f"{label}. {slide_title}. {body}"
            wav = work / f"{number}.wav"
            seg = work / f"{number}.mp4"
            run(["espeak","-s","185","-p","50","-a","155","-w",str(wav),narration])
            duration = make_segment(work,index,f"{number}-{label}",slide_title,body,c1,wav,seg)
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
    if not Path(FONT).exists() or not Path(FONT_BOLD).exists():
        raise SystemExit("DejaVu Sans fonts were not found.")
    for i,(title,key,challenge) in enumerate(MISSIONS,1):
        generate_mission(i,title,key,challenge)
    print(f"Generated {len(MISSIONS)} Junior AI Academy videos in {OUT}")
