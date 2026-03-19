"""
Generate placeholder WAV files for LATENCY music system testing.
Uses only Python standard library modules (wave, struct, math).
"""

import wave
import struct
import math
import os

# Output directory
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "music")

# Track definitions: (filename, frequency_hz, description)
TRACKS = [
    ("track-01-slum-rain.wav",   220,  "A3 - low, moody tone"),
    ("track-02-neon-haze.wav",   330,  "E4 - mid-range hum"),
    ("track-03-dark-streets.wav", 440, "A4 - standard concert pitch"),
]

# Audio parameters
SAMPLE_RATE = 22050   # samples per second (lower for smaller files)
DURATION = 5          # seconds
AMPLITUDE = 16000     # max amplitude for 16-bit audio
CHANNELS = 1          # mono
SAMPLE_WIDTH = 2      # 16-bit = 2 bytes


def generate_wav(filepath, freq_hz):
    """Generate a WAV file with a sine wave at the given frequency."""
    num_samples = SAMPLE_RATE * DURATION

    with wave.open(filepath, "w") as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(SAMPLE_WIDTH)
        wf.setframerate(SAMPLE_RATE)

        for i in range(num_samples):
            # Sine wave with gentle fade-in/out to avoid clicks
            t = i / SAMPLE_RATE
            envelope = 1.0
            fade_time = 0.05  # 50ms fade
            if t < fade_time:
                envelope = t / fade_time
            elif t > (DURATION - fade_time):
                envelope = (DURATION - t) / fade_time

            sample = int(AMPLITUDE * envelope * math.sin(2.0 * math.pi * freq_hz * t))
            wf.writeframes(struct.pack("<h", sample))


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Output directory: {OUTPUT_DIR}")

    for filename, freq, desc in TRACKS:
        filepath = os.path.join(OUTPUT_DIR, filename)
        generate_wav(filepath, freq)
        size_kb = os.path.getsize(filepath) / 1024
        print(f"  Created {filename} ({freq} Hz, {desc}) - {size_kb:.1f} KB")

    print("Done. 3 placeholder WAV files generated.")


if __name__ == "__main__":
    main()
