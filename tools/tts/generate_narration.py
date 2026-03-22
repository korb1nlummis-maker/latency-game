"""
LATENCY — Full Game Narration Generator
Generates voice narration for ALL story nodes + cutscene slides using Chatterbox TTS.
Saves as MP3 files organized by source file.

Usage:
    python generate_narration.py [--resume] [--cutscenes-only] [--stories-only]

Output structure:
    D:/Latency/assets/narration/
    ├── story/
    │   ├── shared/
    │   │   ├── prologue/
    │   │   │   ├── node_001.mp3
    │   │   │   └── ...
    │   ├── origins/
    │   │   ├── human/
    │   │   │   ├── human_001.mp3
    │   │   │   └── ...
    │   └── ...
    └── cutscenes/
        ├── origin_human/
        │   ├── slide_00.mp3
        │   └── ...
        └── ...
"""

import os, sys, json, re, time, glob

# Add FFmpeg DLLs
os.add_dll_directory(r'D:\Latency\tools\tts\ffmpeg-shared\ffmpeg-master-latest-win64-gpl-shared\bin')

# Patch perth watermarker
import perth
perth.PerthImplicitWatermarker = perth.DummyWatermarker

from chatterbox.tts import ChatterboxTTS
import torch
import soundfile as sf
import subprocess

VOICE_REF = r'D:\Latency\tools\tts\my_voice.mp3'
OUTPUT_BASE = r'D:\Latency\assets\narration'
STORY_DIR = r'D:\Latency\story'
CUTSCENE_FILES = [
    r'D:\Latency\js\data\cutscenes-origins-1.js',
    r'D:\Latency\js\data\cutscenes-origins-2.js',
]
FFMPEG = r'C:\Users\lummi\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe'
PROGRESS_FILE = r'D:\Latency\tools\tts\generation_progress.json'

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r') as f:
            return json.load(f)
    return {"completed": []}

def save_progress(progress):
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f)

def wav_to_mp3(wav_path, mp3_path):
    """Convert WAV to MP3 at 96kbps (good quality, smaller files)."""
    subprocess.run(
        [FFMPEG, '-y', '-i', wav_path, '-b:a', '96k', '-ac', '1', mp3_path],
        capture_output=True
    )
    if os.path.exists(wav_path):
        os.remove(wav_path)

def extract_story_texts():
    """Extract all node texts from story JSON files."""
    nodes = []
    for root, dirs, files in os.walk(STORY_DIR):
        for fname in sorted(files):
            if not fname.endswith('.json'):
                continue
            fpath = os.path.join(root, fname)
            rel = os.path.relpath(fpath, STORY_DIR).replace('\\', '/')

            with open(fpath, 'r', encoding='utf-8') as f:
                try:
                    data = json.load(f)
                except:
                    continue

            file_nodes = data.get('nodes', {})
            for node_key, node in file_nodes.items():
                text_arr = node.get('text', [])
                if not text_arr:
                    continue

                # Join all text paragraphs
                full_text = ' '.join(text_arr) if isinstance(text_arr, list) else str(text_arr)
                full_text = full_text.strip()

                if not full_text or len(full_text) < 10:
                    continue

                # Clean text for TTS
                full_text = re.sub(r'\{[^}]+\}', '', full_text)  # Remove template vars
                full_text = full_text.replace('—', ', ').replace('–', ', ')
                full_text = re.sub(r'\s+', ' ', full_text).strip()

                # Output path: story/shared/prologue/node_001.mp3
                dir_part = os.path.splitext(rel)[0]  # shared/prologue
                out_dir = os.path.join(OUTPUT_BASE, 'story', dir_part)
                out_file = node_key + '.mp3'
                out_path = os.path.join(out_dir, out_file)

                nodes.append({
                    'id': f'story/{dir_part}/{node_key}',
                    'text': full_text,
                    'out_dir': out_dir,
                    'out_path': out_path,
                })

    return nodes

def extract_cutscene_texts():
    """Extract slide texts from cutscene JS files."""
    slides = []

    for js_file in CUTSCENE_FILES:
        if not os.path.exists(js_file):
            continue

        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find all cutscene IDs and their slides
        # Pattern: origin_RACE ... slides: [ ... ]
        # Use regex to find text: 'some text' in slide objects

        # Find cutscene keys
        cutscene_pattern = r"CutsceneData\['(origin_\w+)'\]"
        for match in re.finditer(cutscene_pattern, content):
            cutscene_id = match.group(1)
            start_pos = match.start()

            # Find all text: '...' entries after this cutscene declaration
            # Look for the slides array
            slides_start = content.find('slides:', start_pos)
            if slides_start == -1:
                continue

            # Find the next CutsceneData declaration or end of file
            next_cutscene = content.find("CutsceneData['", start_pos + 10)
            if next_cutscene == -1:
                next_cutscene = len(content)

            section = content[slides_start:next_cutscene]

            # Find all text: '...' in this section
            text_pattern = r"text:\s*'((?:[^'\\]|\\.)*)'"
            slide_idx = 0
            for text_match in re.finditer(text_pattern, section):
                text = text_match.group(1)
                text = text.replace("\\'", "'").replace("\\n", " ")
                text = re.sub(r'\s+', ' ', text).strip()

                if len(text) < 10:
                    slide_idx += 1
                    continue

                # Clean for TTS
                text = text.replace('—', ', ').replace('–', ', ')

                out_dir = os.path.join(OUTPUT_BASE, 'cutscenes', cutscene_id)
                out_file = f'slide_{slide_idx:02d}.mp3'
                out_path = os.path.join(out_dir, out_file)

                slides.append({
                    'id': f'cutscenes/{cutscene_id}/slide_{slide_idx:02d}',
                    'text': text,
                    'out_dir': out_dir,
                    'out_path': out_path,
                })
                slide_idx += 1

    return slides

def generate_all(resume=True, cutscenes_only=False, stories_only=False):
    """Generate narration for all text."""

    print("=" * 60)
    print("LATENCY NARRATION GENERATOR")
    print("=" * 60)

    # Collect all texts
    items = []
    if not cutscenes_only:
        print("Extracting story node texts...")
        story_items = extract_story_texts()
        print(f"  Found {len(story_items)} story nodes")
        items.extend(story_items)

    if not stories_only:
        print("Extracting cutscene slide texts...")
        cutscene_items = extract_cutscene_texts()
        print(f"  Found {len(cutscene_items)} cutscene slides")
        items.extend(cutscene_items)

    print(f"\nTotal items to generate: {len(items)}")

    # Load progress for resume
    progress = load_progress() if resume else {"completed": []}
    completed = set(progress["completed"])

    # Filter already done
    remaining = [i for i in items if i['id'] not in completed]
    print(f"Already completed: {len(completed)}")
    print(f"Remaining: {len(remaining)}")

    if not remaining:
        print("Nothing to generate!")
        return

    # Estimate time
    est_seconds = len(remaining) * 100  # ~100s per item on CPU
    est_hours = est_seconds / 3600
    print(f"Estimated time: {est_hours:.1f} hours")
    print()

    # Load model
    print("Loading Chatterbox model...")
    model = ChatterboxTTS.from_pretrained(device='cpu')
    print("Model loaded!\n")

    total = len(remaining)
    start_time = time.time()

    for idx, item in enumerate(remaining):
        # Create output directory
        os.makedirs(item['out_dir'], exist_ok=True)

        # Skip if file already exists
        if os.path.exists(item['out_path']):
            completed.add(item['id'])
            continue

        # Truncate very long texts (Chatterbox can struggle with >500 chars)
        text = item['text']
        if len(text) > 600:
            # Split into sentences and take what fits
            sentences = re.split(r'(?<=[.!?])\s+', text)
            text = ''
            for s in sentences:
                if len(text) + len(s) > 550:
                    break
                text += s + ' '
            text = text.strip()
            if not text:
                text = item['text'][:500]

        # Generate
        elapsed = time.time() - start_time
        rate = (idx + 1) / max(elapsed, 1)
        eta = (total - idx - 1) / max(rate, 0.001)

        print(f"[{idx+1}/{total}] {item['id'][:50]}... (ETA: {eta/3600:.1f}h)")

        try:
            wav = model.generate(text, audio_prompt_path=VOICE_REF)

            # Save as WAV first
            wav_path = item['out_path'].replace('.mp3', '.wav')
            audio_np = wav.squeeze().cpu().numpy()
            sf.write(wav_path, audio_np, model.sr)

            # Convert to MP3
            wav_to_mp3(wav_path, item['out_path'])

            # Track progress
            completed.add(item['id'])
            progress["completed"] = list(completed)

            # Save progress every 10 items
            if (idx + 1) % 10 == 0:
                save_progress(progress)
                size_mb = sum(
                    os.path.getsize(os.path.join(r, f))
                    for r, d, files in os.walk(OUTPUT_BASE)
                    for f in files
                ) / (1024 * 1024)
                print(f"  Progress saved. Total size: {size_mb:.0f} MB")

        except Exception as e:
            print(f"  ERROR: {e}")
            continue

    # Final save
    save_progress(progress)

    elapsed = time.time() - start_time
    print(f"\nDone! Generated {len(completed)} files in {elapsed/3600:.1f} hours")

if __name__ == '__main__':
    resume = '--resume' in sys.argv or True
    cutscenes_only = '--cutscenes-only' in sys.argv
    stories_only = '--stories-only' in sys.argv
    generate_all(resume, cutscenes_only, stories_only)
