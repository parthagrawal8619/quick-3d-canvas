# MISSION: MARS — Build Plan

## Experience
- Replace the placeholder with a full-screen interactive 3D mission experience.
- Open with a short skippable boot sequence, then reveal a rotating Mars, stars, atmosphere, and orbiting spacecraft.
- Use a fixed aerospace control interface with mission status, navigation, and responsive mobile controls.

## Core interactions
- Start Mission transitions into mission control; Explore Mars opens the interactive globe.
- Rotate and zoom Mars, select six named landmarks, view details, focus the camera, and reset the view.
- Switch to a Mars surface scene with a driveable ARES-01 rover, research base, telemetry, scanning effect, and time-of-day control.
- Include mission objectives, resources, science discoveries, live events, telemetry charts, and an emergency simulation with response states.

## Visual direction
- Cinematic NASA-inspired space photography feel: near-black space, oxidized Mars red, warm amber highlights, restrained signal green, fine grid lines, and condensed technical typography.
- Keep the 3D scene dominant; use compact panels rather than generic dashboard cards or excessive glass effects.

## Technical details
- Build with React Three Fiber and Drei on a client-only home route.
- Use compact CC0 Kenney rover and spacecraft models plus procedural Mars textures, terrain, stars, particles, markers, and effects.
- Keep one active 3D scene at a time, cap pixel density, instance repeated geometry, and support reduced motion.
- Add complete page metadata and verify desktop/mobile rendering, controls, and runtime health.
