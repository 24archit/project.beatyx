import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';  
import Alert from '@mui/material/Alert';
import { getSignUp } from '../apis/apiFunctions';
import '../assets/styles/SignUpBtn.css';
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";

// Load site key from environment
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
// Define custom styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  backdropFilter: 'blur(8px)',
  backgroundColor: 'rgba(0, 0, 0, 0.6)', // Transparent dark overlay
  '& .MuiPaper-root': {
    background: 'linear-gradient(45deg, rgba(7, 15, 105, 0.9), rgba(8, 44, 74, 0.7))', // Blue and black gradient
    borderRadius: 12,
    width: '480px', // Slightly wider
    padding: theme.spacing(3),
    boxShadow: theme.shadows[10],
    overflow: 'hidden', // Prevent scrollbars
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  color: '#ffffff',
  fontFamily: 'sans-serif',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  textTransform: 'uppercase',
  textShadow: '2px 2px 5px rgba(0, 0, 0, 0.6)',
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText('#2196F3'),
  backgroundColor: '#4CAF50',
  borderRadius: '8px',
  padding: theme.spacing(1, 2),
  fontSize: '0.875rem',
  minWidth: '100px',
  '&:hover': {
    backgroundColor: '#388E3C',
  },
  transition: 'background-color 0.3s ease',
}));

const CancelButton = styled(Button)(({ theme }) => ({
  color: 'rgb(5, 4, 28)',
  backgroundColor: '#A4A3C2',
  borderRadius: '8px',
  padding: theme.spacing(1, 2),
  fontSize: '0.875rem',
  minWidth: '100px',
  '&:hover': {
    backgroundColor: '#828197',
  },
  transition: 'background-color 0.3s ease',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.shape.borderRadius,
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)', // Slightly dimmed label initially
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#ffffff', // Bright white label when focused
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.6)',
    },
    '&:hover fieldset': {
      borderColor: '#2196F3',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2196F3',
    },
  },
  '& input:-webkit-autofill': {
    WebkitBoxShadow: '0 0 0 100px rgba(255, 255, 255, 0.1) inset',
    WebkitTextFillColor: '#ffffff',
    transition: 'background-color 5000s ease-in-out 0s',
  },
  marginBottom: theme.spacing(2),
}));

function  AlertDialogContent() {
  const [open, setOpen] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState(null);
  const [formData, setFormData] = React.useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    reCaptchaToken: '',
  });
  const { executeRecaptcha } = useGoogleReCaptcha();
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
    if(!formData.confirmPassword || !formData.password || !formData.email || !formData.name || !formData.username){
      setAlertMessage('Please fill up all the details to register');
      return;
    }
    if(formData.confirmPassword != formData.password){
      setAlertMessage('The passwords you entered do not match. Please check and try again.');
      return;
    }
    if (!executeRecaptcha) {
      setAlertMessage("Recaptcha not yet available, please try again later.");
      return;
    }

    try {
      const reCaptchaToken = await executeRecaptcha('signup');
      setFormData((prev) => ({ ...prev, reCaptchaToken }));
      const response = await getSignUp(formData);
      if(!response){
        setAlertMessage('You have already registered using this email. Please login..');
      }
      window.location.href = import.meta.env.VITE_CLIENT_LINK || "http://localhost:5173" ;
    } catch (error) {
      console.error('Sign-Up failed', error);
    }
  };

  return (
    <div className="signup-btn-container">
      <button id="logout-btn" className="log-in-out-btns" onClick={handleClickOpen}>
        Sign Up for Free
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
      height: "6.9rem"
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
            label="Username"
            name="username"
            fullWidth
            margin="normal"
            value={formData.username}
            onChange={handleInputChange}
            variant="outlined"
            autoFocus
          />
          <StyledTextField
            label="Name"
            name="name"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={handleInputChange}
            variant="outlined"
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
          <CancelButton onClick={handleClose}>
            Cancel
          </CancelButton>
          <SubmitButton onClick={handleSignUp}>
            Sign Up
          </SubmitButton>
        </DialogActions>
      </StyledDialog>
    </div>
  );
}
// Exported component wrapping with provider
export default function AlertDialog() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={SITE_KEY}>
      <AlertDialogContent />
    </GoogleReCaptchaProvider>
  );
}
