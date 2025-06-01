import axios from "axios";

export async function getSignUp(FormData) {
  try {
    const config = {
      method: "post",
      url: `${import.meta.env.VITE_SERVER_LINK}/auth/signup`,
      data: FormData,
    };
    const response = await axios(config);
    if (response.status == 201) {
      window.localStorage.setItem("authToken", response.data.authtoken);
      return true;
    }
  } catch (error) {
    return false;
  }
}
export async function getLoggedIn(FormData) {
  try {
    const config = {
      method: "post",
      url: `${import.meta.env.VITE_SERVER_LINK}/auth/login`,
      data: FormData,
    };
    const response = await axios(config);
    if (response.status == 200) {
      window.localStorage.setItem("authToken", response.data.authtoken);
      return response.data;
    }
  } catch (error) {
    return error.response;
  }
}

export async function getTopTracksIndia() {
  try {
    const response = await axios({
      url: `${import.meta.env.VITE_SERVER_LINK}/home/api/getTopTracksIndia`,
      method: "GET",
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getTopTracksGlobal() {
  try {
    const response = await axios({
      url: `${import.meta.env.VITE_SERVER_LINK}/home/api/getTopTracksGlobal`,
      method: "GET",
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getArtistInfo(id) {
  try {
    const response = await axios({
      url: `${import.meta.env.VITE_SERVER_LINK}/artist/api/getArtistInfo/${id}`,
      method: "GET",
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching artist data for id ${id}: ${error.message}`
    );
  }
}

export async function getAudioLink(id, isPlaylist, index, currPlaylistId, queueId) {
  try{
    if(isPlaylist){
      await updatePlayerQueue(index, currPlaylistId, queueId);
    }
    const response = await axios({
      url: `${import.meta.env.VITE_SERVER_LINK}/player/api/getAudioLink/${id}`,
      method: "GET",
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching audio link of id: ${id}: ${error.message}`
    );
  }
}

export async function getSearchResult(query, type) {
  try {
    const response = await axios({
      url: `${import.meta.env.VITE_SERVER_LINK}/search/api/getSearchResult?q=${query}&type=${type}`,
      method: "GET",
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching search results for query ${query}: ${error.message}`
    );
  }
}

export async function getPlaylistInfo(id) {
  try {
    const response = await axios({
      url: `${import.meta.env.VITE_SERVER_LINK}/playlist/api/getPlaylistInfo/${id}`,
      method: "GET",
    });
    window.sessionStorage.setItem("currPlaylistId", response.data.currPlaylistId);
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching playlist data for id ${id}: ${error.message}`
    );
  }
}

export async function getAlbumInfo(id) {
  try {
    const response = await axios({
      url: `${import.meta.env.VITE_SERVER_LINK}/album/api/getAlbumInfo/${id}`,
      method: "GET",
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching album data for id ${id}: ${error.message}`
    );
  }
}

export async function updatePlayerQueue(index, currPlaylistId, queueId) {
  try {
    const response = await axios({
      url: `${import.meta.env.VITE_SERVER_LINK}/player/api/updatePlayerQueue`,
      method: "PUT",
      data: {
        index: index,
        currPlaylistId: currPlaylistId,
        queueId: queueId,
      },
    });
    window.sessionStorage.setItem("queueId", response.data.queueId);
    return response.data;
  } catch (error) {
    throw new Error(
      `Error updating player queue: ${error.message}`
    );
  }
}

export async function getNextAudioLink(queueId) {
  try {
    const response = await axios({
      url: `${import.meta.env.VITE_SERVER_LINK}/player/api/getNextAudioLink/${queueId}`,
      method: "GET",
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching next audio link: ${error.message}`
    );
  }
}

export async function getPreviousAudioLink(queueId) {
  try {
    const response = await axios({
      url: `${import.meta.env.VITE_SERVER_LINK}/player/api/getPreviousAudioLink/${queueId}`,
      method: "GET",
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching previous audio link: ${error.message}`
    );
  }
}








// old
export async function getUserTopArtists(number) {
  try {
    return await fetchData(
      `${protocol}://${host}${port}/api/getUserTopArtists?number=${number}`,
      "GET",
      `Failed to fetch top artists for user with number ${number}`
    );
  } catch (error) {
    throw new Error(
      `Error fetching top artists for user with number ${number}: ${error.message}`
    );
  }
}

export async function getUserInfo() {
  try {
    return await fetchData(
      `${protocol}://${host}${port}/api/getUserInfo`,
      "GET",
      "Failed to fetch user info"
    );
  } catch (error) {
    throw new Error(`Error fetching user info: ${error.message}`);
  }
}


