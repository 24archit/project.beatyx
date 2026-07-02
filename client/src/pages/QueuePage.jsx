import { useEffect } from "react";
import { QueueList } from "../components/QueueList";
import { Helmet } from "react-helmet-async";
import "../assets/styles/PlaylistMainInfo.css";

export default function QueuePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-container" style={{ paddingBottom: "6rem", minHeight: "100vh" }}>
      <Helmet>
        <title>Queue - Beatyx</title>
      </Helmet>

      <div
        className="mainInfo-1"
        style={{ background: "linear-gradient(135deg, #2c0e5a, #0b143a)" }}
      >
        <div className="name-stat-1" style={{ alignItems: "flex-start", textAlign: "left" }}>
          <p style={{ fontSize: "0.9rem", fontWeight: "700", textTransform: "uppercase" }}>
            Play Next
          </p>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 6rem)",
              fontWeight: "900",
              margin: "0.5rem 0",
              lineHeight: "1",
            }}
          >
            Queue
          </h1>
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <QueueList />
      </div>
    </div>
  );
}
