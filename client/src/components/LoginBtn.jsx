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
// Define custom styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  backdropFilter: "blur(8px)",
  backgroundColor: "rgba(0, 0, 0, 0.6)", // Dark overlay
  "& .MuiPaper-root": {
    background:
      "linear-gradient(45deg, rgba(0, 0, 0, 0.9), rgba(33, 150, 243, 0.7))", // Blue and black gradient
    borderRadius: 12,
    width: "380px", // Smaller width
    padding: theme.spacing(2),
    boxShadow: theme.shadows[10],
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  color: "#ffffff",
  fontFamily: "sans-serif",
  fontSize: "1.5rem", // Smaller title size
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: theme.spacing(2),
  textTransform: "uppercase",
  textShadow: "2px 2px 5px rgba(0, 0, 0, 0.6)", // Text shadow for better contrast
}));

const JoinButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText("#2196F3"),
  backgroundColor: "#2196F3",
  borderRadius: "8px",
  padding: theme.spacing(1, 2),
  fontSize: "0.875rem", // Smaller button text size
  minWidth: "100px", // Consistent button width
  "&:hover": {
    backgroundColor: "#1976D2", // Darker blue on hover
  },
  transition: "background-color 0.3s ease",
}));

const CancelButton = styled(Button)(({ theme }) => ({
  color: "rgb(5, 4, 28)",
  backgroundColor: "#A4A3C2",
  borderRadius: "8px",
  padding: theme.spacing(1, 2),
  fontSize: "0.875rem", // Smaller button text size
  minWidth: "100px", // Consistent button width
  "&:hover": {
    backgroundColor: "#828197", // Darker shade for cancel button
  },
  transition: "background-color 0.3s ease",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    color: "#ffffff", // White text inside the input
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Transparent input background
    borderRadius: theme.shape.borderRadius,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#ffffff", // Bright white label when focused
  },
  "& .MuiInputLabel-root": {
    color: "#ffffff", // White label
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#ffffff", // White border for inputs
    },
    "&:hover fieldset": {
      borderColor: "#2196F3", // Blue border on hover
    },
    "&.Mui-focused fieldset": {
      borderColor: "#2196F3", // Blue border when focused
    },
  },
  "& input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 100px rgba(255, 255, 255, 0.1) inset",
    WebkitTextFillColor: "#ffffff",
    transition: "background-color 5000s ease-in-out 0s",
  },
  marginBottom: theme.spacing(2),
}));

export default function AlertDialog() {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [alertMessage, setAlertMessage] = React.useState(null);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setAlertMessage("Please fill up all the details to login");
        return;
      }
      const formData = {
        email: email,
        password: password,
      };
      const response = await getLoggedIn(formData);
      if (response.status == 401) {
        setAlertMessage(response.data.error);
        return;
      }
      if (response.status == 402) {
        setAlertMessage(response.data.error);
        return;
      }
      window.location.href = `${import.meta.env.VITE_CLIENT_LINK}`;
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="login-btn-container">
      <button
        id="logout-btn"
        className="log-in-out-btns"
        onClick={handleClickOpen}
      >
        Login
      </button>
      <StyledDialog
        open={open}
        onClose={handleClose}
        aria-labelledby="login-dialog-title"
        aria-describedby="login-dialog-description"
      >
        {alertMessage && (
          <Alert
            variant="filled"
            severity="warning"
            style={{
              color: "Orange", // Text color to black
              width: "fit-content", // Fit content width
              height: "5.6rem",
            }}
          >
            {alertMessage}
          </Alert>
        )}
        <StyledDialogTitle id="login-dialog-title">
          Welcome to Beatyx..
        </StyledDialogTitle>
        <DialogContent>
          <StyledTextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            autoFocus
          />
          <StyledTextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <CancelButton onClick={handleClose} color="primary">
            Cancel
          </CancelButton>
          <JoinButton onClick={handleLogin}>Login To Beatyx</JoinButton>
        </DialogActions>
      </StyledDialog>
    </div>
  );
}
