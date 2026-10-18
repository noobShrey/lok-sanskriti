import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const CLOUD_NAME = "rswb4gwb";
const UPLOAD_PRESET = "lok_preset";

const uploadForm = document.getElementById("upload-form");
const statusMessage = document.getElementById("status-message");
const submitBtn = document.getElementById("submit-btn");

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  statusMessage.textContent = "कृपया प्रतीक्षा करें, अपलोड हो रहा है...";
  statusMessage.style.color = "#8c2d19";

  const title = document.getElementById("song-title").value.trim();
  const category = document.getElementById("song-category").value;
  const dialect = document.getElementById("song-dialect").value;
  const lyrics = document.getElementById("song-lyrics").value.trim();
  const meaning = document.getElementById("song-meaning").value.trim();
  const audioUrl = document.getElementById("song-audio").value.trim();
  const imageFile = document.getElementById("song-image").files[0];

  let imageUrl = "";

  try {
    if (imageFile) {
      statusMessage.textContent = "फ़ोटो अपलोड हो रही है...";
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", UPLOAD_PRESET);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData
        }
      );

      const cloudinaryData = await cloudinaryRes.json();
      if (!cloudinaryRes.ok) {
        throw new Error(cloudinaryData.error?.message || "चित्र अपलोड विफल रहा");
      }
      imageUrl = cloudinaryData.secure_url;
    }

    statusMessage.textContent = "डेटाबेस में सहेजा जा रहा है...";
    await addDoc(collection(db, "songs"), {
      title,
      category,
      dialect,
      lyrics,
      meaning,
      audioUrl,
      imageUrl,
      createdAt: new Date().toISOString()
    });

    statusMessage.textContent = "गीत सफलतापूर्वक अपलोड हो गया!";
    statusMessage.style.color = "green";
    uploadForm.reset();
  } catch (error) {
    console.error("error:", error);
    statusMessage.textContent = "त्रुटि: " + error.message;
    statusMessage.style.color = "red";
  } finally {
    submitBtn.disabled = false;
  }
});
