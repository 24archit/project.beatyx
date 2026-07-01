// client/src/components/ConnectSpotifySection.jsx
import "../assets/styles/ConnectSpotifySection.css"; // We will create this next
import { verifyAuth } from "@/features/auth/authService";

export default function ConnectSpotifySection() {
  const handleConnect = async () => {
    try {
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        // You might want to trigger your Login Dialog here instead of alert
        alert("🔐 Please log in or sign up to connect your Spotify account.");
        return;
      }

      const response = await verifyAuth(authToken);

      if (response.isVerified) {
        const { Capacitor } = await import("@capacitor/core");
        if (Capacitor.isNativePlatform()) {
          const { Browser } = await import("@capacitor/browser");
          const url = `${import.meta.env.VITE_SERVER_LINK}/auth/api/connectSpotify?authToken=${authToken}&appRedirect=beatyx://callback`;
          await Browser.open({ url });
        } else {
          const form = document.createElement("form");
          form.method = "POST";
          form.action = `${import.meta.env.VITE_SERVER_LINK}/auth/api/connectSpotify`;
          form.target = "_self"; // Opens in same tab

          const input = document.createElement("input");
          input.type = "hidden";
          input.name = "authToken";
          input.value = authToken;

          form.appendChild(input);
          document.body.appendChild(form);
          form.submit();
        }
      } else {
        alert("🎵 Please log in first to connect your Spotify account.");
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("⚠️ Something went wrong. Please try again.");
    }
  };

  return (
    <section className="connect-spotify-section">
      <div className="connect-spotify-content">
        <div className="connect-spotify-text">
          <h2>Unlock the Full Experience</h2>
          <p>
            Connect your Spotify account to get personalized recommendations, access your &quot;Made
            For You&quot; mixes, and sync your listening history.
          </p>
        </div>
        <button onClick={handleConnect} className="connect-spotify-cta-btn">
          <i className="fa-brands fa-spotify"></i> Connect Spotify
        </button>
      </div>
      {/* Background Graphic Element */}
      <div className="connect-spotify-bg-icon">
        <i className="fa-brands fa-spotify"></i>
      </div>
    </section>
  );
}
