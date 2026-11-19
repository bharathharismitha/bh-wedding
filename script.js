
document.addEventListener("DOMContentLoaded", () => {
  const config = window.WEDDING_CONFIG || {};

  // ==========================================
  // WEDDING MUSIC - AUTOPLAY + MUTE / UNMUTE
  // ==========================================

  const music = document.getElementById("weddingMusic");
  const musicButton = document.getElementById("musicToggle");

  if (music && musicButton) {
    music.src = config.music || "assets/music.mp3";
    music.loop = true;
    music.volume = 0.65;
    music.preload = "auto";

    const savedTime = Number(
      sessionStorage.getItem("weddingMusicTime") || 0
    );

    const wasMuted =
      sessionStorage.getItem("weddingMusicMuted") === "true";

    music.muted = wasMuted;

    let userPaused = false;

    function updateMusicButton() {
      musicButton.textContent = music.muted ? "🔇" : "🔊";

      musicButton.setAttribute(
        "aria-label",
        music.muted ? "Unmute wedding music" : "Mute wedding music"
      );

      musicButton.title = music.muted
        ? "Unmute Music"
        : "Mute Music";
    }

    function startMusic() {
      if (userPaused) return;

      music.play().then(() => {
        updateMusicButton();
      }).catch(() => {
        // Browser may require a user interaction.
      });
    }

    music.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(savedTime) && savedTime > 0) {
        try {
          if (Number.isFinite(music.duration)) {
            music.currentTime = Math.min(
              savedTime,
              Math.max(0, music.duration - 0.1)
            );
          }
        } catch (error) {
          console.warn("Could not restore music position", error);
        }
      }
    });

    // Try autoplay immediately.
    startMusic();

    // Retry when the guest first interacts with the page.
    // This helps when browsers block autoplay with sound.
    function startOnInteraction() {
      if (!userPaused && music.paused) {
        startMusic();
      }
    }

    document.addEventListener("pointerdown", startOnInteraction);
    document.addEventListener("keydown", startOnInteraction);

    // Mute / unmute without stopping playback.
    musicButton.addEventListener("click", () => {
      music.muted = !music.muted;

      sessionStorage.setItem(
        "weddingMusicMuted",
        String(music.muted)
      );

      updateMusicButton();

      if (music.paused) {
        startMusic();
      }
    });

    // Remember music position between pages.
    music.addEventListener("timeupdate", () => {
      sessionStorage.setItem(
        "weddingMusicTime",
        String(music.currentTime)
      );
    });

    window.addEventListener("pagehide", () => {
      sessionStorage.setItem(
        "weddingMusicTime",
        String(music.currentTime)
      );
    });

    updateMusicButton();
  }

  // ==========================================
  // RSVP FORM - FORMSPREE ONLY
  // ==========================================

  const form = document.getElementById("rsvpForm");

  if (form) {
    const submitButton = document.getElementById("submitRSVP");
    const status = document.getElementById("rsvpStatus");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const selectedEvents = Array.from(
        form.querySelectorAll('input[name="events"]:checked')
      ).map(input => input.value);

      const selectedMeals = Array.from(
        form.querySelectorAll('input[name="meal_preference"]:checked')
      ).map(input => input.value);

      if (selectedEvents.length === 0) {
        status.textContent = "Please select at least one event.";
        status.className = "status error";
        return;
      }

      if (selectedMeals.length === 0) {
        status.textContent = "Please select your meal preference.";
        status.className = "status error";
        return;
      }

      const name = document
        .getElementById("guestName")
        .value.trim();

      const guests = Number(
        document.getElementById("guestCount").value
      );

      if (
        !name ||
        !Number.isInteger(guests) ||
        guests < 1 ||
        guests > 50
      ) {
        status.textContent =
          "Please enter a valid name and guest count.";
        status.className = "status error";
        return;
      }

      const endpoint =
        config.formspree ||
        "https://formspree.io/f/xrpqkrwa";

      const formData = new FormData();

      formData.append("name", name);
      formData.append("guests", String(guests));
      formData.append("events", selectedEvents.join(", "));
      formData.append(
        "meal_preference",
        selectedMeals.join(", ")
      );
      formData.append(
        "_subject",
        "New Bharath & Harishmitha Wedding RSVP"
      );

      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";

      status.textContent = "Sending your RSVP...";
      status.className = "status";

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Formspree submission failed");
        }

        status.textContent =
          "Thank you! Your RSVP has been submitted successfully. We can't wait to celebrate with you! ❤️";

        status.className = "status success";

        form.reset();
        document.getElementById("guestCount").value = 1;

      } catch (error) {
        console.error("RSVP error:", error);

        status.textContent =
          "Sorry, your RSVP could not be submitted. Please try again.";

        status.className = "status error";

      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Submit RSVP";
      }
    });
  }
});
