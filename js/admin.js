// ========================================
// ELEMENTS
// ========================================

const loginPage = document.getElementById("loginPage");
const dashboard = document.getElementById("dashboard");

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");

const teacherEmail = document.getElementById("teacherEmail");

const totalMessages = document.getElementById("totalMessages");
const newMessages = document.getElementById("newMessages");
const visitorCount = document.getElementById("visitorCount");

const messagesContainer = document.getElementById("messagesContainer");
const loading = document.getElementById("loading");
const emptyMessages = document.getElementById("emptyMessages");
const refreshBtn = document.getElementById("refreshBtn");

// Navigation
const dashboardNav = document.getElementById("dashboardNav");
const messagesNav = document.getElementById("messagesNav");
const activitiesNav = document.getElementById("activitiesNav");
const galleryNav = document.getElementById("galleryNav");

// Sections
const dashboardSection = document.getElementById("dashboardSection");
const messagesSection = document.getElementById("messagesSection");
const activitiesSection = document.getElementById("activitiesSection");
const gallerySection = document.getElementById("gallerySection");

// Activities
const addActivityBtn = document.getElementById("addActivityBtn");
const activityFormBox = document.getElementById("activityFormBox");
const cancelActivityBtn = document.getElementById("cancelActivityBtn");
const activityForm = document.getElementById("activityForm");
const activitiesContainer = document.getElementById("activitiesContainer");

// ========================================
// CHECK LOGIN
// ========================================

async function checkUser() {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (user) {
    showDashboard(user);
  } else {
    showLogin();
  }
}

// ========================================
// SHOW LOGIN
// ========================================

function showLogin() {
  loginPage.classList.remove("hidden");
  dashboard.classList.add("hidden");
}

// ========================================
// SHOW DASHBOARD
// ========================================

function showDashboard(user) {
  loginPage.classList.add("hidden");
  dashboard.classList.remove("hidden");

  teacherEmail.textContent = user.email;

  showSection(dashboardSection, dashboardNav);

  loadMessages();
}

// ========================================
// LOGIN
// ========================================

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();

  const password = document.getElementById("loginPassword").value;

  loginError.textContent = "";

  const button = loginForm.querySelector("button");

  button.disabled = true;
  button.textContent = "Logging in...";

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error(error);

    loginError.textContent = "Invalid email or password.";

    button.disabled = false;
    button.textContent = "Login";

    return;
  }

  loginForm.reset();

  button.disabled = false;
  button.textContent = "Login";

  showDashboard(data.user);
});

// ========================================
// LOGOUT
// ========================================

logoutBtn.addEventListener("click", async function () {
  await supabaseClient.auth.signOut();

  showLogin();
});

// ========================================
// NAVIGATION
// ========================================

function showSection(section, activeNav) {

  // Hide all sections
  dashboardSection.classList.add("hidden");
  messagesSection.classList.add("hidden");
  activitiesSection.classList.add("hidden");

  if (achievementsSection) {
    achievementsSection.classList.add("hidden");
  }

  if (gallerySection) {
    gallerySection.classList.add("hidden");
  }


  // Remove active class
  document
    .querySelectorAll(".nav-item")
    .forEach(function (button) {

      button.classList.remove("active");

    });


  // Show selected section
  section.classList.remove("hidden");


  // Active navigation button
  if (activeNav) {
    activeNav.classList.add("active");
  }

}
// Dashboard
dashboardNav.addEventListener("click", function () {
  showSection(dashboardSection, dashboardNav);
});

// Messages
messagesNav.addEventListener("click", function () {
  showSection(messagesSection, messagesNav);

  loadMessages();
});

// Activities
activitiesNav.addEventListener("click", function () {
  showSection(activitiesSection, activitiesNav);


  loadActivities();
});

/* =====================================
   GALLERY NAVIGATION
===================================== */

if (galleryNav && gallerySection) {

  galleryNav.addEventListener("click", function () {

    showSection(
      gallerySection,
      galleryNav
    );

    loadGallery();

  });

}
// ========================================
// LOAD MESSAGES
// ========================================

async function loadMessages() {
  loading.classList.remove("hidden");

  emptyMessages.classList.add("hidden");

  messagesContainer.innerHTML = "";

  const { data, error } = await supabaseClient
    .from("messages")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  loading.classList.add("hidden");

  if (error) {
    console.error(error);

    messagesContainer.innerHTML = `
            <p style="color:red;">
                Unable to load messages.
            </p>
        `;

    return;
  }

  updateStats(data);

  if (!data || data.length === 0) {
    emptyMessages.classList.remove("hidden");

    return;
  }

  data.forEach(function (message) {
    createMessageCard(message);
  });
}

// ========================================
// UPDATE STATS
// ========================================

function updateStats(messages) {
  totalMessages.textContent = messages.length;

  const newCount = messages.filter(function (message) {
    return message.status === "new";
  }).length;

  newMessages.textContent = newCount;

  const uniqueVisitors = new Set(
    messages.map(function (message) {
      return message.email;
    }),
  );

  visitorCount.textContent = uniqueVisitors.size;
}

// ========================================
// CREATE MESSAGE CARD
// ========================================

function createMessageCard(message) {
  const card = document.createElement("div");

  card.className = "message-card";

  const firstLetter = message.name.charAt(0).toUpperCase();

  const date = new Date(message.created_at).toLocaleString();

  const statusClass = message.status === "new" ? "status-new" : "status-read";

  const statusText = message.status === "new" ? "NEW" : "READ";

  card.innerHTML = `

        <div class="message-top">

            <div class="sender-info">

                <div class="sender-avatar">
                    ${firstLetter}
                </div>

                <div>

                    <h3>
                        ${escapeHTML(message.name)}

                        <span class="status ${statusClass}">
                            ${statusText}
                        </span>

                    </h3>

                    <a href="mailto:${escapeHTML(message.email)}">
                        ${escapeHTML(message.email)}
                    </a>

                </div>

            </div>


            <div class="message-date">
                ${date}
            </div>

        </div>


        <div class="message-body">
            ${escapeHTML(message.message)}
        </div>


        <div class="message-actions">

            ${
              message.status === "new"
                ? `
                        <button
                            class="action-btn read-btn"
                            onclick="markAsRead(${message.id})"
                        >
                            ✓ Mark as Read
                        </button>
                    `
                : ""
            }


            <a
                class="action-btn email-btn"
                href="mailto:${escapeHTML(message.email)}"
            >
                ✉ Reply
            </a>


            <button
                class="action-btn delete-btn"
                onclick="deleteMessage(${message.id})"
            >
                🗑 Delete
            </button>

        </div>

    `;

  messagesContainer.appendChild(card);
}

// ========================================
// MARK MESSAGE AS READ
// ========================================

async function markAsRead(id) {
  const { error } = await supabaseClient
    .from("messages")
    .update({
      status: "read",
    })
    .eq("id", id);

  if (error) {
    console.error(error);

    alert("Unable to update message.");

    return;
  }

  loadMessages();
}

// ========================================
// DELETE MESSAGE
// ========================================

async function deleteMessage(id) {
  const confirmDelete = confirm(
    "Are you sure you want to delete this message?",
  );

  if (!confirmDelete) {
    return;
  }

  const { error } = await supabaseClient.from("messages").delete().eq("id", id);

  if (error) {
    console.error(error);

    alert("Unable to delete message.");

    return;
  }

  loadMessages();
}

// ========================================
// REFRESH MESSAGES
// ========================================

refreshBtn.addEventListener("click", loadMessages);

// ========================================
// LOAD ACTIVITIES
// ========================================

async function loadActivities() {
  activitiesContainer.innerHTML = "<p>Loading activities...</p>";

  const { data, error } = await supabaseClient
    .from("activities")
    .select("*")
    .order("activity_date", {
      ascending: false,
    });

  if (error) {
    console.error(error);

    activitiesContainer.innerHTML = `
            <p style="color:red;">
                Unable to load activities.
            </p>
        `;

    return;
  }

  activitiesContainer.innerHTML = "";

  if (!data || data.length === 0) {
    activitiesContainer.innerHTML = `

            <div class="empty">

                <div class="empty-icon">
                    📝
                </div>

                <h3>
                    No Activities Yet
                </h3>

                <p>
                    Add your first teaching activity.
                </p>

            </div>

        `;

    return;
  }

  data.forEach(function (activity) {
    createActivityCard(activity);
  });
}

// ========================================
// ADD ACTIVITY BUTTON
// ========================================

addActivityBtn.addEventListener("click", function () {
  activityFormBox.classList.remove("hidden");
});

// ========================================
// CANCEL ACTIVITY
// ========================================

cancelActivityBtn.addEventListener("click", function () {
  activityForm.reset();

  activityFormBox.classList.add("hidden");
});

// ========================================
// ADD ACTIVITY
// ========================================

activityForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const title = document.getElementById("activityTitle").value.trim();

  const date = document.getElementById("activityDate").value;

  const description = document
    .getElementById("activityDescription")
    .value.trim();

  const imageFile = document.getElementById("activityImage").files[0];

  if (!title || !description || !imageFile) {
    alert("Please fill all fields and select an image.");

    return;
  }

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    alert("Please login again.");

    return;
  }

  const button = activityForm.querySelector("button[type='submit']");

  button.disabled = true;
  button.textContent = "Uploading...";

  // File name
  const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;

  // Upload image
  const { error: uploadError } = await supabaseClient.storage
    .from("teacher-images")
    .upload(fileName, imageFile);

  if (uploadError) {
    console.error(uploadError);

    alert("Image upload failed.");

    button.disabled = false;
    button.textContent = "Add Activity";

    return;
  }

  // Public URL
  const { data: imageData } = supabaseClient.storage
    .from("teacher-images")
    .getPublicUrl(fileName);

  const imageUrl = imageData.publicUrl;

  // Save activity
  const { error } = await supabaseClient.from("activities").insert([
    {
      title: title,
      description: description,
      activity_date: date || null,
      image_url: imageUrl,
      user_id: user.id,
    },
  ]);

  if (error) {
    console.error(error);

    alert("Activity could not be saved.");

    button.disabled = false;
    button.textContent = "Add Activity";

    return;
  }

  alert("Activity added successfully!");

  activityForm.reset();

  activityFormBox.classList.add("hidden");

  button.disabled = false;

  button.textContent = "Add Activity";

  loadActivities();
});

// ========================================
// CREATE ACTIVITY CARD
// ========================================

function createActivityCard(activity) {
  const card = document.createElement("div");

  card.className = "activity-admin-card";

  const date = activity.activity_date
    ? new Date(activity.activity_date).toLocaleDateString()
    : "No date";

  card.innerHTML = `

        <img
            src="${escapeHTML(activity.image_url)}"
            class="activity-admin-image"
            alt="${escapeHTML(activity.title)}"
        >


        <div class="activity-admin-content">

            <h3>
                ${escapeHTML(activity.title)}
            </h3>


            <div class="activity-date">
                📅 ${date}
            </div>


            <p class="activity-description">
                ${escapeHTML(activity.description)}
            </p>


            <div class="activity-actions">

                <button
                    class="action-btn delete-btn"
                    onclick="deleteActivity(${activity.id})"
                >
                    🗑 Delete
                </button>

            </div>

        </div>

    `;

  activitiesContainer.appendChild(card);
}

// ========================================
// DELETE ACTIVITY
// ========================================

async function deleteActivity(id) {
  const confirmDelete = confirm("Delete this activity?");

  if (!confirmDelete) {
    return;
  }

  const { error } = await supabaseClient
    .from("activities")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);

    alert("Activity could not be deleted.");

    return;
  }

  alert("Activity deleted successfully.");

  loadActivities();
}

// ========================================
// HTML SECURITY
// ========================================

function escapeHTML(text) {
  const div = document.createElement("div");

  div.textContent = text ?? "";

  return div.innerHTML;
}

// ========================================
// START
// ========================================

checkUser();

/* =====================================
   ACHIEVEMENTS
===================================== */

const achievementsNav = document.getElementById("achievementsNav");

const achievementsSection = document.getElementById("achievementsSection");

const addAchievementBtn = document.getElementById("addAchievementBtn");

const achievementFormBox = document.getElementById("achievementFormBox");

const cancelAchievementBtn = document.getElementById("cancelAchievementBtn");

const achievementForm = document.getElementById("achievementForm");

const achievementsContainer = document.getElementById("achievementsContainer");


/* =====================================
   OPEN ACHIEVEMENTS
===================================== */

if (achievementsNav && achievementsSection) {

  achievementsNav.addEventListener("click", () => {

    // Hide all sections
    dashboardSection.classList.add("hidden");
    messagesSection.classList.add("hidden");
    activitiesSection.classList.add("hidden");

    if (gallerySection) {
      gallerySection.classList.add("hidden");
    }

    achievementsSection.classList.add("hidden");


    // Show achievements
    achievementsSection.classList.remove("hidden");


    // Remove active from all navigation buttons
    document
      .querySelectorAll(".nav-item")
      .forEach((button) => {
        button.classList.remove("active");
      });


    // Make Achievements active
    achievementsNav.classList.add("active");


    // Load achievements
    loadAchievements();

  });

}

/* =====================================
   ADD ACHIEVEMENT BUTTON
===================================== */

if (addAchievementBtn) {
  addAchievementBtn.addEventListener("click", () => {
    achievementFormBox.classList.remove("hidden");
  });
}

/* =====================================
   CANCEL ACHIEVEMENT
===================================== */

if (cancelAchievementBtn) {
  cancelAchievementBtn.addEventListener("click", () => {
    achievementForm.reset();

    achievementFormBox.classList.add("hidden");
  });
}

/* =====================================
   ADD ACHIEVEMENT
===================================== */

if (achievementForm) {
  achievementForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      alert("Please login first.");

      return;
    }

    const title = document.getElementById("achievementTitle").value.trim();

    const date = document.getElementById("achievementDate").value;

    const description = document
      .getElementById("achievementDescription")
      .value.trim();

    const imageFile = document.getElementById("achievementImage").files[0];

    if (!title || !date || !description) {
      alert("Please fill all required fields.");

      return;
    }

    const submitButton = achievementForm.querySelector("button[type='submit']");

    submitButton.disabled = true;

    submitButton.textContent = "Saving...";

    try {
      let imageUrl = null;

      /* =====================================
           UPLOAD IMAGE
        ===================================== */

      if (imageFile) {
        const fileExtension = imageFile.name.split(".").pop();

        const fileName = `achievement-${Date.now()}.${fileExtension}`;

        const filePath = `achievements/${fileName}`;

        const { error: uploadError } = await supabaseClient.storage
          .from("teacher-images")
          .upload(filePath, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabaseClient.storage
          .from("teacher-images")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      /* =====================================
           SAVE DATABASE RECORD
        ===================================== */

      const { error } = await supabaseClient.from("achievements").insert([
        {
          title: title,
          description: description,
          achievement_date: date,
          image_url: imageUrl,
          user_id: user.id,
        },
      ]);

      if (error) {
        throw error;
      }

      alert("Achievement added successfully!");

      achievementForm.reset();

      achievementFormBox.classList.add("hidden");

      loadAchievements();
    } catch (error) {
      console.error("Achievement error:", error);

      alert("Achievement could not be added.");
    } finally {
      submitButton.disabled = false;

      submitButton.textContent = "Save Achievement";
    }
  });
}

/* =====================================
   LOAD ACHIEVEMENTS
===================================== */

async function loadAchievements() {
  if (!achievementsContainer) {
    return;
  }

  achievementsContainer.innerHTML = `
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

    achievementsContainer.innerHTML = `
      <div class="activity-loading">
        Unable to load achievements.
      </div>
    `;

    return;
  }

  if (!data || data.length === 0) {
    achievementsContainer.innerHTML = `
      <div class="activity-loading">
        No achievements available yet.
      </div>
    `;

    return;
  }

  achievementsContainer.innerHTML = "";

  data.forEach((achievement) => {
    createAchievementCard(achievement);
  });
}

/* =====================================
   CREATE ACHIEVEMENT CARD
===================================== */

function createAchievementCard(achievement) {
  const card = document.createElement("div");

  card.className = "admin-achievement-card";

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

    <div class="admin-achievement-content">

      <div class="activity-date">
        ${formattedDate}
      </div>

      <h3>
        ${escapeHTML(achievement.title)}
      </h3>

      <p>
        ${escapeHTML(achievement.description)}
      </p>

      <button
        class="delete-achievement-btn"
        data-id="${achievement.id}"
      >
        Delete
      </button>

    </div>

  `;

  achievementsContainer.appendChild(card);

  const deleteButton = card.querySelector(".delete-achievement-btn");

  deleteButton.addEventListener("click", () => {
    deleteAchievement(achievement.id, achievement.image_url);
  });
}

/* =====================================
   DELETE ACHIEVEMENT
===================================== */

async function deleteAchievement(id, imageUrl) {
  const confirmDelete = confirm(
    "Are you sure you want to delete this achievement?",
  );

  if (!confirmDelete) {
    return;
  }

  try {
    /* Delete database record */

    const { error } = await supabaseClient
      .from("achievements")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    /* Delete image from storage */

    if (imageUrl) {
      const marker = "/teacher-images/";

      const index = imageUrl.indexOf(marker);

      if (index !== -1) {
        const filePath = imageUrl.substring(index + marker.length);

        await supabaseClient.storage.from("teacher-images").remove([filePath]);
      }
    }

    alert("Achievement deleted successfully!");

    loadAchievements();
  } catch (error) {
    console.error("Delete achievement error:", error);

    alert("Achievement could not be deleted.");
  }
}

/* =====================================
   GALLERY
===================================== */

const addGalleryBtn = document.getElementById("addGalleryBtn");

const galleryFormBox = document.getElementById("galleryFormBox");

const cancelGalleryBtn = document.getElementById("cancelGalleryBtn");

const galleryForm = document.getElementById("galleryForm");

const adminGalleryContainer = document.getElementById("adminGalleryContainer");

/* =====================================
   ADD GALLERY BUTTON
===================================== */

if (addGalleryBtn) {
  addGalleryBtn.addEventListener("click", function () {
    galleryFormBox.classList.remove("hidden");
  });
}

/* =====================================
   CANCEL GALLERY
===================================== */

if (cancelGalleryBtn) {
  cancelGalleryBtn.addEventListener("click", function () {
    galleryForm.reset();

    galleryFormBox.classList.add("hidden");
  });
}

/* =====================================
   ADD GALLERY PHOTO
===================================== */

if (galleryForm) {
  galleryForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      alert("Please login first.");

      return;
    }

    const title = document.getElementById("galleryTitle").value.trim();

    const imageFile = document.getElementById("galleryImage").files[0];

    if (!imageFile) {
      alert("Please select a photo.");

      return;
    }

    const button = galleryForm.querySelector("button[type='submit']");

    button.disabled = true;

    button.textContent = "Uploading...";

    try {
      /* ===============================
           FILE NAME
        =============================== */

      const extension = imageFile.name.split(".").pop().toLowerCase();

      const fileName = `gallery-${Date.now()}.${extension}`;

      const filePath = `gallery/${fileName}`;

      /* ===============================
           UPLOAD IMAGE
        =============================== */

      const { error: uploadError } = await supabaseClient.storage
        .from("teacher-images")
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error("Gallery upload error:", uploadError);

        alert("Image upload failed.");

        return;
      }

      /* ===============================
           GET PUBLIC URL
        =============================== */

      const { data: imageData } = supabaseClient.storage
        .from("teacher-images")
        .getPublicUrl(filePath);

      const imageUrl = imageData.publicUrl;

      /* ===============================
           SAVE DATABASE
        =============================== */

      const { error: databaseError } = await supabaseClient
        .from("gallery")
        .insert([
          {
            title: title || null,
            image_url: imageUrl,
            user_id: user.id,
          },
        ]);

      if (databaseError) {
        console.error("Gallery database error:", databaseError);

        alert("Photo could not be saved.");

        return;
      }

      alert("Photo added successfully!");

      galleryForm.reset();

      galleryFormBox.classList.add("hidden");

      loadGallery();
    } catch (error) {
      console.error("Gallery error:", error);

      alert("Something went wrong.");
    } finally {
      button.disabled = false;

      button.textContent = "Upload Photo";
    }
  });
}

/* =====================================
   LOAD GALLERY
===================================== */

async function loadGallery() {
  if (!adminGalleryContainer) {
    return;
  }

  adminGalleryContainer.innerHTML = `
    <div class="activity-loading">
      Loading gallery...
    </div>
  `;

  const { data, error } = await supabaseClient
    .from("gallery")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Gallery loading error:", error);

    adminGalleryContainer.innerHTML = `
      <div class="activity-loading">
        Unable to load gallery.
      </div>
    `;

    return;
  }

  if (!data || data.length === 0) {
    adminGalleryContainer.innerHTML = `
      <div class="activity-loading">
        No gallery photos available yet.
      </div>
    `;

    return;
  }

  adminGalleryContainer.innerHTML = "";

  data.forEach(function (photo) {
    createGalleryCard(photo);
  });
}

/* =====================================
   CREATE GALLERY CARD
===================================== */

function createGalleryCard(photo) {
  const card = document.createElement("div");

  card.className = "admin-gallery-card";

  card.innerHTML = `

    <img
      src="${escapeHTML(photo.image_url)}"
      alt="${escapeHTML(photo.title || "Gallery photo")}"
    >

    <div class="admin-gallery-content">

      ${
        photo.title
          ? `
            <h3>
              ${escapeHTML(photo.title)}
            </h3>
          `
          : ""
      }

      <button
        class="delete-gallery-btn"
        data-id="${photo.id}"
        data-image="${escapeHTML(photo.image_url)}"
      >
        🗑 Delete
      </button>

    </div>

  `;

  adminGalleryContainer.appendChild(card);

  const deleteButton = card.querySelector(".delete-gallery-btn");

  deleteButton.addEventListener("click", function () {
    deleteGalleryPhoto(photo.id, photo.image_url);
  });
}

/* =====================================
   DELETE GALLERY PHOTO
===================================== */

async function deleteGalleryPhoto(id, imageUrl) {
  const confirmDelete = confirm("Are you sure you want to delete this photo?");

  if (!confirmDelete) {
    return;
  }

  try {
    /* ===============================
       DELETE DATABASE ROW
    =============================== */

    const { error: databaseError } = await supabaseClient
      .from("gallery")
      .delete()
      .eq("id", id);

    if (databaseError) {
      throw databaseError;
    }

    /* ===============================
       DELETE STORAGE FILE
    =============================== */

    if (imageUrl) {
      const marker = "/teacher-images/";

      const index = imageUrl.indexOf(marker);

      if (index !== -1) {
        const filePath = imageUrl.substring(index + marker.length);

        const { error: storageError } = await supabaseClient.storage
          .from("teacher-images")
          .remove([filePath]);

        if (storageError) {
          console.error("Storage delete error:", storageError);
        }
      }
    }

    alert("Photo deleted successfully!");

    loadGallery();
  } catch (error) {
    console.error("Delete gallery error:", error);

    alert("Photo could not be deleted.");
  }
}
