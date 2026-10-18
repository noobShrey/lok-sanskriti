import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAcKhXcKefVOd-Dt1w-PXLxh1SZJtDB15I",
  authDomain: "lok-sanskrit.firebaseapp.com",
  projectId: "lok-sanskrit",
  storageBucket: "lok-sanskrit.firebasestorage.app",
  messagingSenderId: "256780596745",
  appId: "1:256780596745:web:b4fcf3e3c1da3730e92ad8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let allSongs = [];

async function loadSongs() {
  const container = document.getElementById("songs-container");
  container.innerHTML = "<p>डेटा लोड हो रहा है...</p>";

  try {
    const q = query(collection(db, "songs"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    allSongs = [];
    querySnapshot.forEach((docSnap) => {
      allSongs.push({ id: docSnap.id, ...docSnap.data() });
    });

    renderSongs(allSongs);
  } catch (error) {
    console.error("error loading firestore data:", error);
    container.innerHTML = "<p>डेटा लोड करने में समस्या आई। कृपया पुनः प्रयास करें।</p>";
  }
}

function renderSongs(songsList) {
  const container = document.getElementById("songs-container");
  container.innerHTML = "";

  if (songsList.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#777; margin-top:2rem;">कोई गीत या भजन नहीं मिला।</p>';
    return;
  }

  songsList.forEach((song) => {
    const card = document.createElement("article");
    card.className = "song-card";

    const audioMarkup = song.audioUrl 
      ? `<audio class="audio-player" controls preload="none">
           <source src="${song.audioUrl}" type="audio/mpeg">
           आपका ब्राउज़र ऑडियो का समर्थन नहीं करता।
         </audio>` 
      : "";

    const imageMarkup = song.imageUrl 
      ? `<a href="${song.imageUrl}" target="_blank">
           <img src="${song.imageUrl}" alt="हस्तलिखित पांडुलिपि" class="manuscript-img">
         </a>` 
      : "";

    card.innerHTML = `
      <h2>${song.title}</h2>
      <div class="badges">
        <span class="badge">${song.category}</span>
        <span class="badge">${song.dialect}</span>
      </div>
      <p class="lyrics">${song.lyrics}</p>
      ${imageMarkup}
      ${audioMarkup}
      <div class="card-footer">
        <button class="meaning-toggle" data-id="${song.id}">भावार्थ देखें / छिपाएं</button>
        <div id="meaning-${song.id}" class="meaning hidden">
          <strong>भावार्थ:</strong> ${song.meaning}
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  document.querySelectorAll(".meaning-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const el = document.getElementById(`meaning-${id}`);
      if (el) {
        el.classList.toggle("hidden");
      }
    });
  });
}

function filterSongs() {
  const queryText = document.getElementById("search-input").value.trim().toLowerCase();
  const selectedDialect = document.getElementById("dialect-filter").value;
  const selectedCategory = document.getElementById("category-filter").value;

  const filtered = allSongs.filter((song) => {
    const matchesQuery = 
      (song.title && song.title.toLowerCase().includes(queryText)) ||
      (song.lyrics && song.lyrics.toLowerCase().includes(queryText)) ||
      (song.meaning && song.meaning.toLowerCase().includes(queryText));

    const matchesDialect = (selectedDialect === "all") || (song.dialect && song.dialect.toLowerCase() === selectedDialect);
    const matchesCategory = (selectedCategory === "all") || (song.category && song.category.toLowerCase() === selectedCategory);

    return matchesQuery && matchesDialect && matchesCategory;
  });

  renderSongs(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
  loadSongs();
  document.getElementById("search-input").addEventListener("input", filterSongs);
  document.getElementById("dialect-filter").addEventListener("change", filterSongs);
  document.getElementById("category-filter").addEventListener("change", filterSongs);
});
