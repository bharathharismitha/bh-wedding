document.addEventListener("DOMContentLoaded", () => {

  const config = window.WEDDING_CONFIG || {};

  /* ============================
     WEDDING MUSIC
  ============================ */

  const music = document.getElementById("weddingMusic");
  const musicButton = document.getElementById("musicToggle");

  if (music && musicButton) {

    music.src = config.music || "assets/music.mp3";
    music.volume = 0.65;

    const savedTime = Number(
      sessionStorage.getItem("weddingMusicTime") || 0
    );

    const wantsMusic =
      sessionStorage.getItem("weddingMusicEnabled") === "true";

    function updateMusicButton() {
      if (music.paused) {
        musicButton.textContent = "♫";
        musicButton.setAttribute(
          "aria-label",
          "Play wedding music"
        );
        musicButton.title = "Play Music";
      } else {
        musicButton.textContent = "❚❚";
        musicButton.setAttribute(
          "aria-label",
          "Pause wedding music"
        );
        musicButton.title = "Pause Music";
      }
    }

    function playMusic() {
      return music.play()
        .then(() => {
          sessionStorage.setItem(
            "weddingMusicEnabled",
            "true"
          );
          updateMusicButton();
        })
        .catch(() => {
          updateMusicButton();
        });
    }

    music.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(savedTime) && savedTime > 0) {
        try {
          music.currentTime = Math.min(
            savedTime,
            Math.max(0, music.duration - 0.1)
          );
        } catch (error) {
          console.log("Music position unavailable");
        }
      }

      if (wantsMusic) {
        playMusic();
      }
    });

    musicButton.addEventListener("click", () => {

      if (music.paused) {
        playMusic();
      } else {
        music.pause();

        sessionStorage.setItem(
          "weddingMusicEnabled",
          "false"
        );

        updateMusicButton();
      }
    });

    music.addEventListener("play", updateMusicButton);
    music.addEventListener("pause", updateMusicButton);

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

  /* ============================
     RSVP FORM - FORMSPREE
  ============================ */

  const form = document.getElementById("rsvpForm");

  if (form) {

    const submitButton =
      document.getElementById("submitRSVP");

    const status =
      document.getElementById("rsvpStatus");

    form.addEventListener("submit", async (event) => {

      event.preventDefault();

      const selectedEvents = Array.from(
        form.querySelectorAll(
          'input[name="events"]:checked'
        )
      ).map(input => input.value);

      const selectedMeals = Array.from(
        form.querySelectorAll(
          'input[name="meal_preference"]:checked'
        )
      ).map(input => input.value);

      if (selectedEvents.length === 0) {
        status.textContent =
          "Please select at least one event.";
        status.className = "status error";
        return;
      }

      if (selectedMeals.length === 0) {
        status.textContent =
          "Please select your meal preference.";
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

      const endpoint = config.formspree;

      if (!endpoint) {
        status.textContent =
          "RSVP service is not configured.";
        status.className = "status error";
        return;
      }

      const formData = new FormData();

      formData.append("name", name);
      formData.append("guests", String(guests));

      formData.append(
        "events",
        selectedEvents.join(", ")
      );

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
          throw new Error("Submission failed");
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