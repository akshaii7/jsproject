//  view.js

document.addEventListener("DOMContentLoaded", async function () {
  console.log("[INIT] View page loaded");

  // Get employee ID from URL (ex: view.html?id=101)
  const urlParams = new URLSearchParams(window.location.search);
  let employeeId = urlParams.get("id");

  // Fallback to localStorage (in case no ?id in URL)
  if (!employeeId) {
    employeeId = localStorage.getItem("selectedEmployeeId");
  }

  if (!employeeId) {
    alert(" Employee ID missing!");
    window.location.href = "index.html";
    return;
  }

  console.log("[INFO] Employee ID:", employeeId);

  // Optional: show loading
  document.getElementById("empName").textContent = "Loading...";

  try {
    //  Fetch your employee data (replace with your source)
  const response = await fetch("../employees.json");
 // or your API endpoint
    const employees = await response.json();

    //  Find the selected employee
    const employee = employees.find(emp => emp.id == employeeId);

    if (!employee) {
      alert("Employee not found!");
      window.location.href = "index.html";
      return;
    }

//  Fill in the details
const fullName = `${employee.firstName} ${employee.lastName}`;

//  Profile image fix
const profileImg = document.getElementById("profileImage");
profileImg.src = `http://localhost:3000/employees/${employeeId}/avatar?t=${Date.now()}`;
profileImg.onerror = function () {
  this.src = "https://via.placeholder.com/120";
};


document.getElementById("empName").textContent = fullName || "N/A";
document.getElementById("empEmail").textContent = employee.email || "N/A";
document.getElementById("empGender").textContent = employee.gender || "N/A";
document.getElementById("empDob").textContent = employee.dob || "N/A";
document.getElementById("empPhone").textContent = employee.phone || "N/A";
document.getElementById("empQualifications").textContent = employee.qualifications || "N/A";
document.getElementById("empAddress").textContent = employee.address || "N/A";
document.getElementById("empCity").textContent = employee.city || "N/A";
document.getElementById("empState").textContent = employee.state || "N/A";
document.getElementById("empCountry").textContent = employee.country || "N/A";
document.getElementById("empPin").textContent = employee.pin || "N/A";
document.getElementById("empUsername").textContent = employee.username || "N/A";
document.getElementById("empPassword").textContent = employee.password || "N/A";



  } catch (error) {
    console.error("Error loading employee:", error);
    alert("Error fetching employee data!");
  }
});

//  Close overlay function
function closeOverlay() {
  window.location.href = "index.html";
}

//  Base API URL
const API_BASE = "http://localhost:3000";






//  Open Edit Modal and Fill Data
document.getElementById("editBtn").addEventListener("click", async function () {
  const employeeId = localStorage.getItem("selectedEmployeeId");
  if (!employeeId) return alert("No employee selected!");

  try {
    const res = await fetch(`${API_BASE}/employees/${employeeId}`);
    if (!res.ok) throw new Error("Employee not found");
    const emp = await res.json();

    // Fill modal fields
    document.getElementById("editSalutation").value = emp.salutation || "";
    document.getElementById("editFirstName").value = emp.firstName || "";
    document.getElementById("editLastName").value = emp.lastName || "";
    document.getElementById("editEmail").value = emp.email || "";
    document.getElementById("editPhone").value = emp.phone || "";

    //  DOB conversion for input type="date"
    if (emp.dob) {
      const parts = emp.dob.split("-");
      if (parts.length === 3 && parts[0].length === 2) {
        // Convert DD-MM-YYYY → YYYY-MM-DD
        document.getElementById("editDOB").value = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else {
        document.getElementById("editDOB").value = emp.dob;
      }
    } else {
      document.getElementById("editDOB").value = "";
    }

    document.getElementById("editGender").value = emp.gender || "";
    document.getElementById("editQualification").value = emp.qualifications || "";
    document.getElementById("editAddress").value = emp.address || "";
    document.getElementById("editCountry").value = emp.country || "";
    document.getElementById("editState").value = emp.state || "";
    document.getElementById("editCity").value = emp.city || "";
    document.getElementById("editUsername").value = emp.username || "";
    document.getElementById("editPassword").value = emp.password || "";

    //  Show Profile Photo (from backend)
    const profileImg = document.getElementById("editProfilePreview");
    profileImg.src = `${API_BASE}/employees/${employeeId}/avatar`;
    profileImg.onerror = function () {
      this.src = "default.jpg"; // fallback image
    };
  } catch (error) {
    console.error("Error loading employee:", error);
    alert("Error loading employee data.");
  }
});

//  Handle Profile Photo Preview
const avatarInput = document.getElementById("editProfilePic");
if (avatarInput) {
  avatarInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = e => {
        document.getElementById("editProfilePreview").src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
}

// Save Edited Data
document.getElementById("editSaveBtn").addEventListener("click", async function () {
  const employeeId = localStorage.getItem("selectedEmployeeId");
  if (!employeeId) return alert("Employee ID missing!");

  // Get updated values
  const updatedData = {
    salutation: document.getElementById("editSalutation").value,
    firstName: document.getElementById("editFirstName").value,
    lastName: document.getElementById("editLastName").value,
    email: document.getElementById("editEmail").value,
    phone: document.getElementById("editPhone").value,   
    
    //  Convert YYYY-MM-DD → DD-MM-YYYY before saving
    dob: document.getElementById("editDOB").value
      ? document.getElementById("editDOB").value.split("-").reverse().join("-")
      : "",

    gender: document.getElementById("editGender").value,
    qualifications: document.getElementById("editQualification").value,
    address: document.getElementById("editAddress").value,
    country: document.getElementById("editCountry").value,
    state: document.getElementById("editState").value,
    city: document.getElementById("editCity").value,
    username: document.getElementById("editUsername").value,
    password: document.getElementById("editPassword").value,
  };

  try {
    //  1. Update employee details (PUT)
    const res = await fetch(`${API_BASE}/employees/${employeeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    if (!res.ok) {
      const error = await res.json();
      return alert("Error updating employee: " + (error.errors?.join(", ") || "Unknown error"));
    }

    //  2. Upload avatar if selected
    const file = avatarInput.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("avatar", file);

      const avatarRes = await fetch(`${API_BASE}/employees/${employeeId}/avatar`, {
        method: "POST",
        body: formData,
      });

      if (!avatarRes.ok) throw new Error("Failed to upload avatar");
    }

    alert("Employee updated successfully!");
    location.reload(); // refresh the page or update UI as needed
  } catch (error) {
    console.error("Error updating employee:", error);
    alert("Failed to save changes.");
  }

  // Close modal
  const modal = bootstrap.Modal.getInstance(document.getElementById("editModalBox"));
  modal.hide();
});










//  DELETE EMPLOYEE (CONFIRM & DO DELETE)
let employeeToDeleteId = null;

// When clicking delete button in view page
document.getElementById("deleteBtn").addEventListener("click", async function () {
  const employeeId = localStorage.getItem("selectedEmployeeId");
  if (!employeeId) return alert("Employee ID missing!");

  // Get employee info to show name in modal
  const res = await fetch("../employees.json");
  const employees = await res.json();
  const emp = employees.find(e => e.id == employeeId);

  if (!emp) return alert("Employee not found!");

  // Save id globally for delete confirmation
  employeeToDeleteId = emp.id;

  // Show name inside modal
  const deleteName = document.getElementById("deleteEmployeeName");
  deleteName.textContent = `${emp.firstName} ${emp.lastName}`;

  // Show modal
  const modalEl = document.getElementById("deleteModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
});

// Actual delete when user clicks "Delete" in modal
async function deleteEmployeeConfirmed() {
  if (!employeeToDeleteId) return;

  try {
    const res = await fetch(`http://localhost:3000/employees/${employeeToDeleteId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Server responded ${res.status}: ${text}`);
    }

    // Hide modal
    const modalEl = document.getElementById("deleteModal");
    const instance = bootstrap.Modal.getInstance(modalEl);
    instance.hide();



    // Redirect back to employee list
    window.location.href = "index.html";
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Delete failed: " + err.message);
  }
}

// Bind confirm button
document.getElementById("confirmDeleteBtn").addEventListener("click", deleteEmployeeConfirmed);

  63
  