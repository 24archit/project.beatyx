import "../assets/styles/SearchBar.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const makeSearchBarFocused = () => {
  const searchInput = document.getElementById("nav-input-bar");
  if (searchInput) {
    searchInput.focus();
  }
};
export default function SearchBar() {
  const navigate = useNavigate();
  // Create a ref for the input field
  const [searchParams, setSearchParams] = useState({
    type: "track,artist,album,playlist,show,episode",
    query: "",
  });

  const handelInputChange = (event) => {
    setSearchParams((currData) => {
      return { ...currData, [event.target.name]: event.target.value };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    navigate(`/search?q=${searchParams.query}&type=${searchParams.type}`);
    const searchInput = document.getElementById("nav-input-bar");
    if (searchInput) {
      searchInput.blur();
    }
  };

  return (
    <div className="search-bar-container">
      <form className="nav-search-bar" id="search-form" onSubmit={handleSubmit}>
        <select
          id="nav-select-category"
          name="type"
          onChange={handelInputChange}
          value={searchParams.type}
        >
          <option
            className="type"
            value="track,artist,album,playlist,show,episode"
          >
            All Categories
          </option>
          <option className="type" value="track">
            Songs
          </option>
          <option className="type" value="artist">
            Artists
          </option>
          <option className="type" value="album">
            Albums
          </option>
          <option className="type" value="playlist">
            Playlists
          </option>
        </select>
        <input
          id="nav-input-bar"
          type="text"
          placeholder="Search to match your mood..."
          value={searchParams.query}
          size="37"
          maxLength="90"
          minLength="1"
          spellCheck="false"
          name="query"
          required
          onChange={handelInputChange}
        />
        <button id="nav-search-button">
          <i className="fas fa-search"></i>
        </button>
      </form>
    </div>
  );
}
