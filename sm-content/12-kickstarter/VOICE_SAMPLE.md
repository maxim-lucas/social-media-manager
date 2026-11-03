# Recording a voice sample for cloning

A voice clone copies **everything** in the sample: the voice, but also the room, the hiss, the echo and the
phone's distance. Cleaning afterwards helps (`tools/prepare_sample.py`, DeepFilterNet3), but nothing beats a
clean recording. Ten minutes of setup is worth more than any filter.

## The room

- A **small room full of soft things**: a bedroom, or best, a walk-in closet with clothes. Soft surfaces kill
  echo. Avoid the kitchen, the bathroom and empty rooms: hard walls give the hollow "room" sound.
- **Turn off** fans, air conditioning, heating blowers, the dehumidifier; close the window; step away from the
  fridge. Put phones and computers on silent. That steady "air" noise is what the first sample carried.

## The microphone

- Best: a **headset or wired earbuds with a mic**, or a clip-on lavalier. Next best: the phone itself.
- Phone: **15–20 cm from your mouth** (a hand's width), slightly **below or to the side** so the P's and B's
  don't pop. The first sample was recorded far from the mic (very quiet: −44 dB average), so the room was
  almost as loud as the voice.
- **Don't hold the phone**: set it on a stack of books. Hands rubbing the case end up in the clone.

## The settings

- iPhone: Settings → Apps → Voice Memos → Audio Quality → **Lossless**. Android: the recorder's highest
  quality (WAV if offered).
- Send the **original file** (AirDrop, cable, Drive, email attachment). Not WhatsApp or Messenger: they
  re-compress the audio.

## The recording

1. Press record and stay **silent for 3 seconds**: the room on its own lets the cleaner learn the noise.
2. Speak **30–60 seconds**, calm and steady, like explaining PriceBack to a friend across the table: normal
   volume, no whispering, no shouting, no laughing. French or English both work; for the US-accent take the
   accent comes from a separate voice, only your timbre is taken from the sample.
3. Keep pauses short, drink a little water first (fewer mouth clicks), and don't move around.
4. Listen back with earphones: if you hear the room, a hum or an echo, fix it and record again.

Save it as `audio/voice-sample.*` (git-ignored, never committed: it is personal data).
