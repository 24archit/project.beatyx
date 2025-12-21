import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import { getLoggedIn } from "../apis/apiFunctions";
import "../assets/styles/LoginBtn.css";


const StyledDialog = styled(Dialog)(({ theme }) => ({
  backdropFilter: "blur(8px)",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  "& .MuiPaper-root": {
    background: "linear-gradient(45deg, rgba(0, 0, 0, 0.9), rgba(33,150,243,0.7))",
    borderRadius: 12,
    width: "380px",
    padding: theme.spacing(2),
    boxShadow: theme.shadows[10],
  },
}));

// ... (Keep other styled components: StyledDialogTitle, JoinButton, CancelButton, StyledTextField) ...
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  color: "#ffffff",
  fontFamily: "sans-serif",
  fontSize: "1.5rem",
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: theme.spacing(2),
  textTransform: "uppercase",
  textShadow: "2px 2px 5px rgba(0, 0, 0, 0.6)",
}));
const JoinButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText("#2196F3"),
  backgroundColor: "#2196F3",
  borderRadius: "8px",
  padding: theme.spacing(1, 2),
  fontSize: "0.875rem",
  minWidth: "100px",
  "&:hover": {
    backgroundColor: "#1976D2",
  },
  transition: "background-color 0.3s ease",
}));
const CancelButton = styled(Button)(({ theme }) => ({
  color: "rgb(5, 4, 28)",
  backgroundColor: "#A4A3C2",
  borderRadius: "8px",
  padding: theme.spacing(1, 2),
  fontSize: "0.875rem",
  minWidth: "100px",
  "&:hover": {
    backgroundColor: "#828197",
  },
  transition: "background-color 0.3s ease",
}));
const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    color: "#ffffff",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: theme.shape.borderRadius,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#ffffff",
  },
  "& .MuiInputLabel-root": {
    color: "#ffffff",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#ffffff",
    },
    "&:hover fieldset": {
      borderColor: "#2196F3",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#2196F3",
    },
  },
  "& input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 100px rgba(255, 255, 255, 0.1) inset",
    WebkitTextFillColor: "#ffffff",
    transition: "background-color 5000s ease-in-out 0s",
  },
  marginBottom: theme.spacing(2),
}));

export default function LoginBtn() {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [alertMessage, setAlertMessage] = React.useState(null);
  
  // REMOVE: const { executeRecaptcha } = useGoogleReCaptcha();

  const handleClickOpen = (e) => {
    setOpen(true);
    e.target.blur();
  };

  const handleClose = (e) => {
    setOpen(false);
    e.target.blur();
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setAlertMessage("Please fill up all the details to login");
      return;
    }

    // CHECK IF ENTERPRISE SCRIPT LOADED
    if (!window.grecaptcha || !window.grecaptcha.enterprise) {
      setAlertMessage("Security check failed to load. Please refresh.");
      return;
    }

    try {
      // EXECUTE ENTERPRISE TOKEN GENERATION
      // Wrap in Promise because .ready() callback is async
      const token = await new Promise((resolve) => {
        window.grecaptcha.enterprise.ready(async () => {
          const t = await window.grecaptcha.enterprise.execute(
            import.meta.env.VITE_RECAPTCHA_SITE_KEY,
            { action: 'LOGIN' }
          );
          resolve(t);
        });
      });

      const formData = { email, password, recaptchaToken: token };
      const response = await getLoggedIn(formData);

      if (response.status === 401 || response.status === 402) {
        setAlertMessage(response.data.error);
        return;
      } 

      window.location.href = import.meta.env.VITE_CLIENT_LINK;

    } catch (error) {
      console.error("Login failed", error);
      setAlertMessage("Login error, please try again.");
    }
  };

  return (
    <div className="login-btn-container">
      <button id="logout-btn" className="log-in-out-btns" onClick={handleClickOpen}>
        Login
      </button>

      <StyledDialog open={open} onClose={handleClose}>
        {alertMessage && (
          <Alert variant="filled" severity="warning" style={{ width: '100%', marginBottom: 16 }}>
            {alertMessage}
          </Alert>
        )}

        <StyledDialogTitle>Welcome to Beatyx</StyledDialogTitle>

        <DialogContent>
          <StyledTextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <StyledTextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <CancelButton onClick={handleClose}>Cancel</CancelButton>
          <JoinButton onClick={handleLogin}>Login To Beatyx</JoinButton>
        </DialogActions>
      </StyledDialog>
    </div>
  );
}