import '../assets/styles/Logo.css';
import { Link } from 'react-router-dom';
import LogoImg from "../assets/media/logo.png"
export default function Logo() {
  return (
    <Link to="/" className="logo">
      <div className="logo-symbol">
        <img id="logo-symbol" src={LogoImg} alt="Logo" />
      </div>
    </Link>
  );
}
