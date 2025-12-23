import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import { getSignUp } from "../apis/apiFunctions";
import "../assets/styles/SignUpBtn.css";

// Load site key from environment

// Define custom styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  backdropFilter: "blur(8px)",
  backgroundColor: "rgba(0, 0, 0, 0.6)", // Transparent dark overlay
  "& .MuiPaper-root": {
    background:
      "linear-gradient(45deg, rgba(7, 15, 105, 0.9), rgba(8, 44, 74, 0.7))", // Blue and black gradient
    borderRadius: 12,
    width: "480px", // Slightly wider
    padding: theme.spacing(3),
    boxShadow: theme.shadows[10],
    overflow: "hidden", // Prevent scrollbars
  },
}));

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

const SubmitButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText("#2196F3"),
  backgroundColor: "#4CAF50",
  borderRadius: "8px",
  padding: theme.spacing(1, 2),
  fontSize: "0.875rem",
  minWidth: "100px",
  "&:hover": {
    backgroundColor: "#388E3C",
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: theme.shape.borderRadius,
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.7)", // Slightly dimmed label initially
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#ffffff", // Bright white label when focused
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.6)",
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

export default function SignUpBtn() {
  const [open, setOpen] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState(null);
  const [formData, setFormData] = React.useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    recaptchaToken: "",
  });
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSignUp = async (e) => {
    e.preventDefault();
    if (!formData.displayName || !formData.email || !formData.password) {
      setAlertMessage("Please fill up all the details to join");
      return;
    }

    if (!window.grecaptcha || !window.grecaptcha.enterprise) {
      setAlertMessage("Security check failed. Please refresh.");
      return;
    }

    try {
      const token = await new Promise((resolve) => {
        window.grecaptcha.enterprise.ready(async () => {
          const t = await window.grecaptcha.enterprise.execute(
            import.meta.env.VITE_RECAPTCHA_SITE_KEY,
            { action: 'SIGNUP' }
          );
          resolve(t);
        });
      });

      const submissionData = { ...formData, recaptchaToken: token };
      
      // Store the result object returned from the updated API function
      const result = await getSignUp(submissionData);

      if (result.success) {
        window.location.href = "/";
      } else {
        // Handle specific error codes here
        if (result.status === 409) {
          setAlertMessage("User already exists! Please Log In.");
        } else if (result.status === 400) {
          setAlertMessage("Invalid details provided.");
        } else if (result.status === 500) {
          setAlertMessage("Server error. Please try again later.");
        } else {
          setAlertMessage("Signup failed. Please check your connection.");
        }
      }
    } catch (error) {
      console.error("Signup error", error);
      setAlertMessage("An unexpected error occurred.");
    }
};

  return (
    <div className="signup-btn-container">
      <button
        id="logout-btn"
        className="log-in-out-btns"
        onClick={handleClickOpen}
      >
        Sign Up
      </button>

      <StyledDialog
        open={open}
        onClose={handleClose}
        aria-labelledby="signup-dialog-title"
      >
        {alertMessage && (
          <Alert
            variant="filled"
            severity="warning"
            style={{
              color: "Orange", // Text color to black
              width: "fit-content", // Fit content width
              height: "6.9rem",
            }}
          >
            {alertMessage}
          </Alert>
        )}

        <StyledDialogTitle id="signup-dialog-title">
          Welcome to Beatyx..
        </StyledDialogTitle>
        <DialogContent>
          <StyledTextField
            label="Display Name To Show In Your Profile"
            name="displayName"
            fullWidth
            margin="normal"
            value={formData.displayName}
            onChange={handleInputChange}
            variant="outlined"
            autoFocus
          />
          <StyledTextField
            label="Email"
            name="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleInputChange}
            variant="outlined"
            type="email"
          />
          <StyledTextField
            label="Set Password"
            name="password"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleInputChange}
            variant="outlined"
            type="password"
          />
          <StyledTextField
            label="Confirm Password"
            name="confirmPassword"
            fullWidth
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            variant="outlined"
            type="password"
          />
        </DialogContent>
        <DialogActions>
          <CancelButton onClick={handleClose}>Cancel</CancelButton>
          <SubmitButton onClick={handleSignUp}>Sign Up</SubmitButton>
        </DialogActions>
      </StyledDialog>
    </div>
  );
}

