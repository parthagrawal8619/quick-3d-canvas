import { useEffect, useState } from "react";
import { Activity, AlertTriangle, ArrowRight, BatteryCharging, ChevronDown, CircleDot, Crosshair, Gauge, MapPin, Radio, RotateCcw, ScanLine, ShieldCheck, Waves } from "lucide-react";
import { Button } from "./ui/button";
import { LOCATIONS, MarsScene, type MarsLocation, type MissionView } from "./MarsScene";

const resources = [["OXYGEN", 76], ["WATER", 81], ["FOOD", 68], ["POWER", 87], ["FUEL", 54]] as const;
const events = ["Rover reached Sector 7", "Soil sample collected", "Communication signal stabilized", "New geological formation detected"];

export function MissionExperience() {
  const [intro, setIntro] = useState(true);
  const [view, setView] = useState<MissionView>("orbit");
  const [selected, setSelected] = useState<MarsLocation | null>(null);
  const [panel, setPanel] = useState<"mission" | "science" | "telemetry" | null>(null);
  const [scanning, setScanning] = useState(false);
  const [discovery, setDiscovery] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIntro(false), 4300);
    return () => window.clearTimeout(timer);
  }, []);

  const navigate = (next: MissionView, nextPanel: typeof panel = null) => {
    setSelected(null);
    setView(next);
    setPanel(nextPanel);
  };

  const runScan = () => {
    setScanning(true);
    window.setTimeout(() => { setScanning(false); setDiscovery(true); }, 1800);
  };

  return (
    <main className="mission-shell">
      <div className="scene-layer"><MarsScene view={view} selected={selected} scanning={scanning} onSelect={setSelected} /></div>
      <div className="space-noise" />

      {intro && (
        <div className="boot-screen">
          <div className="boot-sequence">
            <div className="boot-mark"><span /> M:M / ARES SYSTEMS</div>
            <p>SYSTEM INITIALIZING...</p>
            <ul>
              <li>COMMUNICATION LINK <b>ONLINE</b></li><li>MISSION CONTROL <b>ONLINE</b></li><li>MARS TELEMETRY <b>ONLINE</b></li><li>ROVER LINK <b>ONLINE</b></li>
            </ul>
            <div className="boot-bar"><i /></div>
            <strong>MISSION SYSTEMS ONLINE</strong>
          </div>
          <Button variant="ghost" className="absolute right-5 top-5" onClick={() => setIntro(false)}>Skip intro</Button>
        </div>
      )}

      <header className="mission-nav">
        <button className="brand" onClick={() => navigate("orbit")} aria-label="Return to mission overview"><span className="brand-glyph">M:</span><span>MISSION<br/><b>MARS</b></span></button>
        <nav aria-label="Mission sections">
          <button onClick={() => navigate("orbit", "mission")} className={panel === "mission" ? "active" : ""}>Mission</button>
          <button onClick={() => navigate("explorer")} className={view === "explorer" ? "active" : ""}>Explorer</button>
          <button onClick={() => navigate("surface")} className={view === "surface" ? "active" : ""}>Rover</button>
          <button onClick={() => navigate("surface", "mission")}>Base</button>
          <button onClick={() => setPanel("science")} className={panel === "science" ? "active" : ""}>Science</button>
          <button onClick={() => setPanel("telemetry")} className={panel === "telemetry" ? "active" : ""}>Telemetry</button>
        </nav>
        <div className="live-status"><span /> Live mission</div>
      </header>

      <div className="corner-marks" aria-hidden="true"><i /><i /><i /><i /></div>

      {view === "orbit" && !panel && (
        <section className="hero-copy">
          <div className="eyebrow"><span>ARES / 01</span><i /> HUMAN EXPLORATION PROGRAM</div>
          <h1>MISSION:<br/><em>MARS</em></h1>
          <p>Explore the Red Planet.<br/>Understand the unknown.<br/>Prepare humanity for the next giant leap.</p>
          <div className="hero-actions">
            <Button onClick={() => navigate("orbit", "mission")}>Start mission <ArrowRight size={14} /></Button>
            <Button variant="outline" onClick={() => navigate("explorer")}>Explore Mars <Crosshair size={14} /></Button>
          </div>
        </section>
      )}

      <aside className="mission-readout">
        <div><span>MISSION STATUS</span><b className="signal"><i /> ACTIVE</b></div>
        <div><span>MISSION DAY</span><b>SOL 184</b></div>
        <div><span>EARTH DISTANCE</span><b>127.4M KM</b></div>
      </aside>

      {view === "explorer" && (
        <div className="view-title">
          <span>ORBITAL CARTOGRAPHY / LIVE</span><h2>MARS EXPLORER</h2><p>Drag to rotate · Scroll to zoom · Select a beacon</p>
        </div>
      )}

      {view === "explorer" && !selected && (
        <aside className="location-index technical-panel">
          <div className="panel-heading"><span>01</span> Exploration targets</div>
          {LOCATIONS.map((location, i) => <button key={location.name} onClick={() => setSelected(location)}><span>{String(i + 1).padStart(2, "0")}</span>{location.name}<MapPin size={12} /></button>)}
        </aside>
      )}

      {selected && view === "explorer" && (
        <aside className="detail-panel technical-panel">
          <button className="panel-close" onClick={() => setSelected(null)} aria-label="Close location details">×</button>
          <span className="kicker">{selected.subtitle}</span><h2>{selected.name}</h2>
          <div className="stars-rating">★★★★★</div><p>{selected.detail}</p>
          <dl><div><dt>Rover</dt><dd>{selected.rover}</dd></div><div><dt>Mission status</dt><dd className="signal">Active</dd></div><div><dt>Scientific priority</dt><dd>{selected.priority}</dd></div></dl>
          <Button className="w-full" onClick={() => setSelected(selected)}>View location <Crosshair size={14} /></Button>
          <Button variant="ghost" className="mt-2 w-full" onClick={() => setSelected(null)}><RotateCcw size={13} /> Reset camera</Button>
        </aside>
      )}

      {view === "surface" && (
        <>
          <div className="view-title"><span>SURFACE OPERATIONS / JEZERO</span><h2>ARES-01</h2><p>Use WASD or arrow keys to drive</p></div>
          <aside className="rover-controls technical-panel">
            <div className="panel-heading"><span>03</span> Rover telemetry</div>
            <div className="telemetry-grid"><div><Gauge size={15}/><span>Speed</span><b>0.8 m/s</b></div><div><BatteryCharging size={15}/><span>Battery</span><b>78%</b></div><div><Radio size={15}/><span>Signal</span><b>98%</b></div><div><Waves size={15}/><span>Temp</span><b>-54°C</b></div></div>
            <Button className="w-full" onClick={runScan} disabled={scanning}>{scanning ? "Scanning sector..." : "Scan area"} <ScanLine size={14}/></Button>
            <div className="surface-actions"><Button variant="ghost" onClick={() => navigate("orbit")}>Return to base</Button><Button variant="ghost" onClick={() => navigate("explorer")}>Orbit view</Button></div>
          </aside>
        </>
      )}

      {panel === "mission" && (
        <aside className="dashboard technical-panel wide-panel">
          <button className="panel-close" onClick={() => setPanel(null)} aria-label="Close mission control">×</button>
          <div className="panel-heading"><span>02</span> Mission control</div><h2>SURFACE EXPLORATION</h2>
          <div className="stats-row"><div><span>Crew</span><b>4 / 4</b><small>Healthy</small></div><div><span>Power</span><b>87%</b><small>Nominal</small></div><div><span>Comms</span><b>98%</b><small>Linked</small></div><div><span>Temp</span><b>-63°</b><small>Surface</small></div></div>
          <div className="timeline"><div className="complete">Launch</div><div className="complete">Earth orbit</div><div className="complete">Mars transfer</div><div className="complete">Mars orbit</div><div className="current">Surface exploration</div></div>
          <div className="next-objective"><span>Next objective</span><b>SEARCH FOR WATER ICE</b><small>Mission progress · 68%</small><div><i /></div></div>
          <Button variant="danger" className="mt-5" onClick={() => setEmergency(true)}><AlertTriangle size={14}/> Simulate emergency</Button>
        </aside>
      )}

      {panel === "science" && (
        <aside className="dashboard technical-panel wide-panel">
          <button className="panel-close" onClick={() => setPanel(null)}>×</button><div className="panel-heading"><span>04</span> Science operations</div><h2>DISCOVERY LOG</h2>
          <div className="science-grid"><div><CircleDot/><span>Water ice</span><b>87% confidence</b></div><div><CircleDot/><span>Mineral deposit</span><b>73% confidence</b></div><div><CircleDot/><span>Ancient rock</span><b>Sample 04-A</b></div></div>
          <p className="science-copy">Mars may once have supported conditions suitable for life. ARES studies its geology, searches for evidence of ancient water, and prepares the way for human exploration.</p>
        </aside>
      )}

      {panel === "telemetry" && (
        <aside className="dashboard technical-panel wide-panel telemetry-panel">
          <button className="panel-close" onClick={() => setPanel(null)}>×</button><div className="panel-heading"><span>05</span> Live telemetry</div><h2>MISSION RESOURCES</h2>
          <div className="resources">{resources.map(([name, value]) => <div key={name}><span>{name}</span><div><i style={{ width: `${value}%` }}/></div><b>{value}%</b></div>)}</div>
          <div className="event-feed">{events.map((event, i) => <p key={event}><span>{`19:${42 - i * 7}`}</span>{event}</p>)}</div>
        </aside>
      )}

      {discovery && (
        <div className="modal-layer"><div className="discovery-modal"><span>NEW DISCOVERY</span><ScanLine size={30}/><h2>WATER ICE DETECTED</h2><p>Mineral signature discovered beneath the regolith.</p><div><span>Confidence</span><b>87%</b><span>Scientific importance</span><b>HIGH</b></div><Button onClick={() => setDiscovery(false)}>Add to discovery log</Button></div></div>
      )}

      {emergency && (
        <div className="modal-layer emergency-layer"><div className="emergency-modal"><AlertTriangle size={30}/><span>MISSION ALERT / 04</span><h2>{resolved ? "RESPONSE SUCCESSFUL" : "DUST STORM DETECTED"}</h2><p>{resolved ? "ARES-01 secured. Habitat systems stabilized." : "Visibility 12%. Estimated duration: 4 hours. Return rover to base."}</p>{resolved ? <Button onClick={() => { setEmergency(false); setResolved(false); }}>Resume mission</Button> : <div><Button variant="danger" onClick={() => setResolved(true)}>Initiate response</Button><Button variant="ghost" onClick={() => setEmergency(false)}>Ignore</Button></div>}</div></div>
      )}

      <div className="bottom-strip"><span>LAT 18.38°N</span><span>LON 77.58°E</span><span>LINK 98.72%</span><span>LOCAL 19:42 MTC</span><ChevronDown size={14}/></div>
    </main>
  );
}