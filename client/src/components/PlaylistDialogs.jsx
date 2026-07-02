import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  IconButton,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyCustomPlaylists,
  createCustomPlaylist,
  addTrackToCustomPlaylist,
} from "../services/customPlaylistService";
import "../assets/styles/PlaylistDialogs.css";

export default function PlaylistDialogs() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("list"); // 'list' or 'create'
  const [trackToAdd, setTrackToAdd] = useState(null);

  // Create form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const queryClient = useQueryClient();

  const { data: playlists, isLoading } = useQuery({
    queryKey: ["myCustomPlaylists"],
    queryFn: getMyCustomPlaylists,
    enabled: open, // Only fetch when dialog is open
  });

  const createMutation = useMutation({
    mutationFn: createCustomPlaylist,
    onSuccess: (newPlaylist) => {
      queryClient.invalidateQueries({ queryKey: ["myCustomPlaylists"] });
      // If we were adding a track, add it to the newly created playlist
      if (trackToAdd) {
        addTrackMutation.mutate({ playlistId: newPlaylist._id, trackData: trackToAdd });
      } else {
        handleClose();
      }
    },
  });

  const addTrackMutation = useMutation({
    mutationFn: ({ playlistId, trackData }) => addTrackToCustomPlaylist(playlistId, trackData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCustomPlaylists"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      handleClose();
      // We could add a toast notification here
      alert("Track added to playlist!");
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Failed to add track");
    },
  });

  useEffect(() => {
    const handleOpenDialog = (e) => {
      const token = window.localStorage.getItem("authToken");
      if (!token) {
        alert("Please login to manage playlists.");
        return;
      }
      setTrackToAdd(e.detail?.trackData || null);
      setMode(e.detail?.mode || "list"); // Can force open to 'create' directly
      setOpen(true);
    };

    document.addEventListener("openPlaylistDialog", handleOpenDialog);
    return () => document.removeEventListener("openPlaylistDialog", handleOpenDialog);
  }, []);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setMode("list");
      setName("");
      setDescription("");
      setIsPublic(false);
      setTrackToAdd(null);
    }, 200); // reset after animation
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name, description, isPublic });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "var(--bg-surface-2, #160d28)",
          color: "var(--text-primary, #f1eeff)",
          border: "1px solid var(--border-subtle, rgba(255,255,255,0.06))",
          borderRadius: "var(--radius-lg, 20px)",
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {mode === "list"
          ? trackToAdd
            ? "Add to Playlist"
            : "Your Playlists"
          : "Create New Playlist"}
        <IconButton onClick={handleClose} sx={{ color: "var(--text-secondary)" }}>
          <i className="fa-solid fa-times"></i>
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: "var(--border-subtle)" }}>
        {mode === "list" && (
          <div className="pd-list-mode">
            <Button
              fullWidth
              variant="outlined"
              sx={{
                mb: 2,
                color: "var(--accent-primary)",
                borderColor: "var(--accent-border)",
                borderRadius: "var(--radius-full)",
              }}
              onClick={() => setMode("create")}
            >
              <i className="fa-solid fa-plus" style={{ marginRight: "8px" }}></i> New Playlist
            </Button>

            {isLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                <CircularProgress size={30} sx={{ color: "var(--accent-primary)" }} />
              </div>
            ) : playlists?.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
                You don&apos;t have any playlists yet.
              </p>
            ) : (
              <List sx={{ width: "100%", bgcolor: "transparent" }}>
                {playlists?.map((pl) => (
                  <ListItem
                    key={pl._id}
                    button
                    onClick={() => {
                      if (trackToAdd) {
                        addTrackMutation.mutate({ playlistId: pl._id, trackData: trackToAdd });
                      } else {
                        // If just viewing playlists, maybe navigate to it
                        window.location.href = `/playlist/${pl._id}`;
                      }
                    }}
                    sx={{
                      borderRadius: "var(--radius-md)",
                      mb: 0.5,
                      "&:hover": { bgcolor: "var(--glass-bg-hover)" },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar variant="rounded" sx={{ bgcolor: "var(--bg-surface-3)" }}>
                        <i className="fa-solid fa-music" style={{ color: "var(--text-muted)" }}></i>
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={pl.name}
                      secondary={`${pl.tracks?.length || 0} tracks`}
                      primaryTypographyProps={{ style: { fontWeight: 600 } }}
                      secondaryTypographyProps={{
                        style: { color: "var(--text-muted)", fontSize: "0.8rem" },
                      }}
                    />
                    {trackToAdd && (
                      <IconButton edge="end" size="small" sx={{ color: "var(--accent-primary)" }}>
                        <i className="fa-solid fa-plus"></i>
                      </IconButton>
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </div>
        )}

        {mode === "create" && (
          <form id="create-playlist-form" onSubmit={handleCreate} className="pd-create-mode">
            <TextField
              autoFocus
              margin="dense"
              label="Playlist Name"
              type="text"
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={inputStyles}
            />
            <TextField
              margin="dense"
              label="Description (optional)"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={inputStyles}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  sx={switchStyles}
                />
              }
              label={isPublic ? "Public (Discoverable)" : "Private"}
              sx={{ mt: 2, color: "var(--text-secondary)" }}
            />
          </form>
        )}
      </DialogContent>

      {mode === "create" && (
        <DialogActions sx={{ p: 2, borderColor: "var(--border-subtle)" }}>
          <Button onClick={() => setMode("list")} sx={{ color: "var(--text-secondary)" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-playlist-form"
            variant="contained"
            disabled={!name.trim() || createMutation.isPending}
            sx={{
              bgcolor: "var(--accent-primary)",
              color: "#fff",
              borderRadius: "var(--radius-full)",
              "&:hover": { bgcolor: "var(--accent-secondary)" },
            }}
          >
            {createMutation.isPending ? <CircularProgress size={20} color="inherit" /> : "Create"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

const inputStyles = {
  mb: 2,
  "& .MuiOutlinedInput-root": {
    color: "var(--text-primary)",
    "& fieldset": {
      borderColor: "var(--border-mid)",
      borderRadius: "var(--radius-md)",
    },
    "&:hover fieldset": {
      borderColor: "var(--accent-border)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "var(--accent-primary)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "var(--text-muted)",
    "&.Mui-focused": {
      color: "var(--accent-primary)",
    },
  },
};

const switchStyles = {
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "var(--accent-primary)",
    "&:hover": {
      backgroundColor: "rgba(168, 85, 247, 0.08)",
    },
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "var(--accent-primary)",
  },
};
