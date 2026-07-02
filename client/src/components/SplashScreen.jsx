import "../assets/styles/SplashScreen.css";
import LogoImg from "/logo.png";

export default function SplashScreen() {
  return (
    <div className="splash-overlay" aria-label="Loading Beatyx" role="status">
      {/* Ambient orbs */}
      <div className="splash-orb splash-orb--1" />
      <div className="splash-orb splash-orb--2" />
      <div className="splash-orb splash-orb--3" />

      <div className="splash-content">
        {/* Logo with pulse ring */}
        <div className="splash-logo-wrapper">
          <div className="splash-pulse-ring" />
          <div className="splash-pulse-ring splash-pulse-ring--delay" />
          <div className="splash-logo-glow" />
          <img src={LogoImg} alt="Beatyx" className="splash-logo" draggable={false} />
        </div>

        {/* Audio waveform bars */}
        <div className="splash-wave" aria-hidden="true">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="splash-wave-bar" style={{ "--i": i }} />
          ))}
        </div>

        <p className="splash-tagline">Loading your music…This takes just 10-20 seconds</p>
      </div>
    </div>
  );
}
