/* =====================================
   MOBILE MENU
===================================== */

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

/* =====================================
   CLOSE MOBILE MENU
===================================== */

const links = document.querySelectorAll(".nav-links a");

links.forEach((link) => {
  link.addEventListener("click", () => {
    if (navLinks) {
      navLinks.classList.remove("active");
    }
  });
});

/* =====================================
   CONTACT FORM
===================================== */

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      alert("Please fill all fields.");
      return;
    }

    const submitButton = contactForm.querySelector("button[type='submit']");

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    const { error } = await supabaseClient.from("messages").insert([
      {
        name: name,
        email: email,
        message: message,
      },
    ]);

    if (error) {
      console.error("Contact form error:", error);

      alert("Message could not be sent. Please try again.");
    } else {
      alert("Your message has been sent successfully!");

      contactForm.reset();
    }

    submitButton.disabled = false;
    submitButton.textContent = "Send Message";
  });
}

/* =====================================
   LOAD ACTIVITIES FROM SUPABASE
===================================== */

async function loadActivities() {
  const container = document.getElementById("activitiesContainer");

  if (!container) {
    console.log("Activities container not found.");
    return;
  }

  container.innerHTML = `
    <div class="activity-loading">
      Loading activities...
    </div>
  `;

  const { data, error } = await supabaseClient
    .from("activities")
    .select("*")
    .order("activity_date", { ascending: false });

  if (error) {
    console.error("Activities loading error:", error);

    container.innerHTML = `
      <div class="activity-loading">
        Unable to load activities.
      </div>
    `;

    return;
  }

  console.log("Activities loaded:", data);

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="activity-loading">
        No activities available yet.
      </div>
    `;

    return;
  }

  container.innerHTML = "";

  data.forEach((activity) => {
    createActivityCard(activity, container);
  });
}

/* =====================================
   CREATE ACTIVITY CARD
===================================== */

function createActivityCard(activity, container) {
  const item = document.createElement("div");

  item.className = "timeline-item";

  let formattedDate = "DATE";

  if (activity.activity_date) {
    const date = new Date(activity.activity_date);

    formattedDate = date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase();
  }

  item.innerHTML = `
    <div class="timeline-dot"></div>

    <div class="activity-card">

      <div class="activity-date">
        ${formattedDate}
      </div>

      <h3>
        ${escapeHTML(activity.title)}
      </h3>

      <p>
        ${escapeHTML(activity.description)}
      </p>

      ${
        activity.image_url
          ? `
            <img 
              src="${escapeHTML(activity.image_url)}"
              alt="${escapeHTML(activity.title)}"
            >
          `
          : ""
      }

    </div>
  `;

  container.appendChild(item);

  /* Add scroll reveal to dynamically created activity */
  item.classList.add("reveal");

  if (typeof observer !== "undefined") {
    observer.observe(item);
  }
}

/* =====================================
   ESCAPE HTML
===================================== */

function escapeHTML(text) {
  const div = document.createElement("div");

  div.textContent = text ?? "";

  return div.innerHTML;
}

/* =====================================
   SCROLL REVEAL
===================================== */

const revealElements = document.querySelectorAll(
  ".section-heading, .info-card, .activity-card, .achievement, .gallery-item",
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  {
    threshold: 0.15,
  },
);

revealElements.forEach((element) => {
  element.classList.add("reveal");

  observer.observe(element);
});

/* =====================================
   LOAD ACTIVITIES
===================================== */

loadActivities();

/* =====================================
   LOAD ACHIEVEMENTS
===================================== */

async function loadAchievements() {
  const container = document.getElementById("achievementsContainer");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="activity-loading">
      Loading achievements...
    </div>
  `;

  const { data, error } = await supabaseClient
    .from("achievements")
    .select("*")
    .order("achievement_date", {
      ascending: false,
    });

  if (error) {
    console.error("Achievements loading error:", error);

    container.innerHTML = `
      <div class="activity-loading">
        Unable to load achievements.
      </div>
    `;

    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="activity-loading">
        No achievements available yet.
      </div>
    `;

    return;
  }

  container.innerHTML = "";

  data.forEach((achievement) => {
    createAchievementCard(achievement, container);
  });
}

/* =====================================
   CREATE WEBSITE ACHIEVEMENT CARD
===================================== */

function createAchievementCard(achievement, container) {
  const card = document.createElement("div");

  card.className = "achievement";

  let formattedDate = "";

  if (achievement.achievement_date) {
    const date = new Date(achievement.achievement_date);

    formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  card.innerHTML = `

    ${
      achievement.image_url
        ? `
          <img
            src="${escapeHTML(achievement.image_url)}"
            alt="${escapeHTML(achievement.title)}"
          >
        `
        : ""
    }


    <div class="achievement-content">

      <div class="achievement-date">
        ${formattedDate}
      </div>


      <h3>
        ${escapeHTML(achievement.title)}
      </h3>


      <p>
        ${escapeHTML(achievement.description)}
      </p>

    </div>

  `;

  container.appendChild(card);

  card.classList.add("reveal");

  if (typeof observer !== "undefined") {
    observer.observe(card);
  }
}

/* =====================================
   LOAD ACHIEVEMENTS
===================================== */

loadAchievements();

/* =====================================
   LOAD GALLERY
===================================== */

async function loadGallery() {
  const container = document.getElementById("galleryContainer");

  // Gallery section nahi hai
  if (!container) {
    console.log("Gallery container not found.");
    return;
  }

  // Loading message
  container.innerHTML = `
    <div class="gallery-loading">
      Loading gallery...
    </div>
  `;

  // Get gallery photos from Supabase
  const { data, error } = await supabaseClient
    .from("gallery")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  // Error
  if (error) {
    console.error("Gallery loading error:", error);

    container.innerHTML = `
      <div class="gallery-loading">
        Unable to load gallery.
      </div>
    `;

    return;
  }

  console.log("Gallery loaded:", data);

  // No photos
  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="gallery-loading">
        No gallery photos available yet.
      </div>
    `;

    return;
  }

  // Clear loading
  container.innerHTML = "";

  // Create cards
  data.forEach((photo) => {
    const item = document.createElement("div");

    item.className = "gallery-item";

    item.innerHTML = `
      <img
        src="${escapeHTML(photo.image_url)}"
        alt="${escapeHTML(photo.title || "Gallery photo")}"
        loading="lazy"
      >
    `;

    container.appendChild(item);

    // Scroll animation
    item.classList.add("reveal");

    if (typeof observer !== "undefined") {
      observer.observe(item);
    }
  });
}

/* =====================================
   LOAD GALLERY
===================================== */

loadGallery();
