export const shareContent = (urlPath, title) => {
  if (!urlPath) return;
  const url = urlPath.startsWith("http") ? urlPath : `${window.location.origin}${urlPath}`;
  if (navigator.share) {
    navigator.share({ title: title || "Beatyx", url }).catch((err) => {
      console.error("Share failed", err);
    });
  } else {
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  }
};

export const shareTrack = (trackId, trackName) => {
  shareContent(`/track/${trackId}`, trackName || "Beatyx Track");
};
