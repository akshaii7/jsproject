(() => {
  let selectedAvatarFile = null;

  const avatarFileAdd = document.getElementById("avatarFileAdd");
  const avatarPreviewAdd = document.getElementById("avatarPreviewAdd");
  const saveBtn = document.getElementById("savebtn");

  const employee = { id: 1 }; // dynamic employee ID

  // Load existing avatar on page load
  loadExistingAvatar();

  function loadExistingAvatar() {
    avatarPreviewAdd.src = `http://localhost:3000/employees/${employee.id}/avatar?t=${Date.now()}`;
    avatarPreviewAdd.onerror = () => {
      avatarPreviewAdd.src = ""; // Clear if no avatar exists
    };
  }

  avatarFileAdd.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file!");
      this.value = "";
      return;
    }

    selectedAvatarFile = file;

    const reader = new FileReader();
    reader.onload = (e) => (avatarPreviewAdd.src = e.target.result);
    reader.readAsDataURL(file);
  });

  saveBtn.addEventListener("click", async () => {
    if (!selectedAvatarFile) return alert("Select an image first!");

    const formData = new FormData();
    formData.append("avatar", selectedAvatarFile);

    try {
      const response = await fetch(`http://localhost:3000/employees/${employee.id}/avatar`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        alert("Image uploaded successfully!");
        // Reload the avatar from server
        loadExistingAvatar();
        selectedAvatarFile = null;
        avatarFileAdd.value = "";
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + err.message);
    }
  });
})();