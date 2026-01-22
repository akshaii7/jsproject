let allEmployees = [];
let currentPage = 0;
let limit = 4;
let selectedAvatarFile = null;

// Avatar Preview for Add Employee Form
const avatarFileAdd = document.getElementById("avatarFileAdd");
const avatarPreviewAdd = document.getElementById("avatarPreviewAdd");

if (avatarFileAdd) {
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
    reader.onload = (e) => {
      avatarPreviewAdd.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

//  RENDER EMPLOYEES 

const renderEmployees = (data) => {
  const tablebody = document.getElementById("tbody");
  let rows = "";

  data.forEach((employee, index) => {
    rows += `
      <tr id="employee-${employee.id}">
        <td>${(currentPage - 1) * limit + (index + 1)}</td>
        <td>
          <img src="http://localhost:3000/employees/${employee.id}/avatar?t=${Date.now()}"
               onerror="this.src='https://via.placeholder.com/40'"
               style="width:40px;height:40px;border-radius:50%;margin-right:8px;object-fit:cover;">
          ${employee.salutation}. ${employee.firstName} ${employee.lastName}
        </td>
        <td>${employee.email}</td>
        <td>${employee.phone}</td>
        <td>${employee.gender}</td>
        <td>${employee.dob}</td>
        <td>${employee.country}</td>
        <td class="actions">
          <div class="dropdown">
            <button class="btn btn-sm btn-light" data-bs-toggle="dropdown">
              <i class="fa-solid fa-ellipsis"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow">
           
             <li><a href="#" class="dropdown-item" onclick="viewDetails('${employee.id}')">View Details</a></li>

              <li><a class="dropdown-item" href="#" onclick="openEditModal('${employee.id}')">Edit</a></li>
              <li><a class="dropdown-item text-danger" href="#" onclick="ofclick('${employee.id}')">Delete</a></li>
            </ul>
          </div>
        </td>
      </tr>
    `;
  });

  tablebody.innerHTML = rows;
};

// FETCH EMPLOYEES 
async function getEmployees() {
  try {
    const response = await fetch("http://localhost:3000/employees");
    const data = await response.json();
    allEmployees = data;
    document.getElementById("dropemployee").innerHTML=`<span>of${allEmployees.length}</span>`;
    showEmployees(1);
  } catch (error) {
    console.error("Error fetching employee data", error);
  }
}




// Handle dropdown change to update items per page
function showNumber() {
  const dropdown = document.getElementById("numberDropdown");
  limit = parseInt(dropdown.value);
  showEmployees(1); // Reset to first page when changing items per page
}

 
// Show Employees with Pagination
function showEmployees(page) {
  currentPage = page;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = allEmployees.slice(start, end);
  renderEmployees(paginatedData);
  generatePagination(allEmployees.length, currentPage);
}




function generatePagination(totalItems, currentPage) {
  const totalPages = Math.ceil(totalItems / limit);
  const pagination = document.querySelector("#paginations ul");
  pagination.innerHTML = "";

  const controls = [
    { label: "«", action: () => showEmployees(1), disabled: currentPage === 1 },
    { label: "‹", action: () => showEmployees(currentPage - 1), disabled: currentPage === 1 },
    { label: "›", action: () => showEmployees(currentPage + 1), disabled: currentPage === totalPages },
    { label: "»", action: () => showEmployees(totalPages), disabled: currentPage === totalPages },
  ];

  for (let i = 0; i < 2; i++) {
    const btn = controls[i];
    const li = document.createElement("li");
    li.className = `page-item ${btn.disabled ? "disabled" : ""}`;
    li.innerHTML = `<a class="page-link arrow" href="#">${btn.label}</a>`;
    li.onclick = () => !btn.disabled && btn.action();
    pagination.appendChild(li);
  }

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      const li = document.createElement("li");
      li.className = `page-item ${i === currentPage ? "active" : ""}`;
      li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      li.onclick = () => showEmployees(i);
      pagination.appendChild(li);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      const dots = document.createElement("li");
      dots.className = "page-item";
      dots.innerHTML = `<a class="page-link dots" href="#">...</a>`;
      pagination.appendChild(dots);
    }
  }

  for (let i = 2; i < 4; i++) {
    const btn = controls[i];
    const li = document.createElement("li");
    li.className = `page-item ${btn.disabled ? "disabled" : ""}`;
    li.innerHTML = `<a class="page-link arrow" href="#">${btn.label}</a>`;
    li.onclick = () => !btn.disabled && btn.action();
    pagination.appendChild(li);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  showEmployees(1);
});

//SAVE EMPLOYEE 
document.getElementById("savebtn").addEventListener("click", () => {
  const salutation = document.querySelector("select.form-select").value;
  const firstName = document.getElementById("firstname").value.trim();
  const lastName = document.getElementById("lastname").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("ph").value.trim();
  const dobInput = document.getElementById("age").value;
  const gender = document.querySelector('input[name="gender"]:checked')?.value || "";
  const address = document.querySelector("input[placeholder='enter address']").value.trim();
  const city = document.querySelector("input[placeholder='enter city']").value.trim();
  const state = document.querySelectorAll("select.form-select")[2].value;
  const country = document.querySelectorAll("select.form-select")[1].value;
  const pin = document.querySelector("input[placeholder='enter zip/pin']").value.trim();
  const qualifications = document.querySelector("input[placeholder='enter qualifications']").value.trim();
  const username = document.getElementById("validationCustomUsername").value.trim();
  const password = document.getElementById("inputPassword5").value.trim();

  // Validation
  if (!firstName || !lastName || !email || !phone || !dobInput || !gender || !address || !city || !state || !country || !pin || !username || !password) {
    alert("Please fill all required fields!");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email!");
    return;
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    alert("Please enter a valid 10-digit phone number!");
    return;
  }

  let formattedDOB = "";
  if (dobInput) {
    const [year, month, day] = dobInput.split("-");
    formattedDOB = `${day}-${month}-${year}`;
  }

  const employdata = {
    salutation, firstName, lastName, email, phone, dob: formattedDOB, gender,
    address, city, state, country, pin, qualifications, username, password
  };

  // Create Employee 
  fetch("http://localhost:3000/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employdata),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Employee created:", data);

      const employeeId = data.id || data.employee?.id;

      if (!employeeId) {
        alert("Employee created but ID not returned. Check backend response.");
        return;
      }

      // Function to clear the form
      function clearForm() {
        document.getElementById("firstname").value = "";
        document.getElementById("lastname").value = "";
        document.getElementById("email").value = "";
        document.getElementById("ph").value = "";
        document.getElementById("age").value = "";
        document.querySelector("input[placeholder='enter address']").value = "";
        document.querySelector("input[placeholder='enter city']").value = "";
        document.querySelector("input[placeholder='enter zip/pin']").value = "";
        document.querySelector("input[placeholder='enter qualifications']").value = "";
        document.getElementById("validationCustomUsername").value = "";
        document.getElementById("inputPassword5").value = "";

        const genderRadios = document.querySelectorAll('input[name="gender"]');
        genderRadios.forEach(radio => radio.checked = false);

        if (avatarFileAdd) avatarFileAdd.value = "";
        if (avatarPreviewAdd) avatarPreviewAdd.src = "https://via.placeholder.com/120";
        selectedAvatarFile = null;
      }

      // Upload avatar if selected
      if (selectedAvatarFile) {
        const formData = new FormData();
        formData.append("avatar", selectedAvatarFile);

        fetch(`http://localhost:3000/employees/${employeeId}/avatar`, {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((uploadData) => {
            console.log("Avatar uploaded:", uploadData);
            alert("Employee and avatar saved successfully!");
            clearForm();
            getEmployees();
          })
          .catch((err) => {
            console.error("Avatar upload failed:", err);
            alert("Employee saved but avatar upload failed!");
            clearForm();
            getEmployees();
          });
      } else {
        alert("Employee added successfully (no avatar uploaded)");
        clearForm();
        getEmployees();
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      alert("Failed to create employee!");
    });
});

// Open Edit Modal
function openEditModal(employeeId) {
  const employee = allEmployees.find(emp => emp.id === employeeId);
  if (!employee) {
    console.error("Employee not found:", employeeId);
    return;
  }

  document.getElementById('editProfilePreview').src =
    `http://localhost:3000/employees/${employeeId}/avatar?t=${Date.now()}`;

  document.getElementById('editProfilePreview').onerror = function () {
    this.src = "https://via.placeholder.com/120";
  };

  document.getElementById('editSalutation').value = employee.salutation || "";
  document.getElementById('editFirstName').value = employee.firstName || "";
  document.getElementById('editLastName').value = employee.lastName || "";
  document.getElementById('editEmail').value = employee.email || "";
  document.getElementById('editPhone').value = employee.phone || "";

// Replace the DOB handling in openEditModal with:
let dobValue = "";
if (employee.dob) {
  const parts = employee.dob.split('-');
  if (parts.length === 3) {
    // If format is DD-MM-YYYY, convert to YYYY-MM-DD for input
    if (parts[0].length === 2) {
      dobValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
    } else if (parts[0].length === 4) {
      // Already in YYYY-MM-DD format
      dobValue = employee.dob;
    }
  }
}
document.getElementById('editDOB').value = dobValue;

  document.getElementById('editQualification').value = employee.qualifications || "";
  document.getElementById('editAddress').value = employee.address || "";
  document.getElementById('editCountry').value = employee.country || "";
  document.getElementById('editState').value = employee.state || "";
  document.getElementById('editCity').value = employee.city || "";
  document.getElementById('editZip').value = employee.pin || "";
  document.getElementById('edituser').value = employee.username || "";
  document.getElementById('editpass').value = employee.password || "";
  document.getElementById('editGenderMale').checked = employee.gender === "Male";
  document.getElementById('editGenderFemale').checked = employee.gender === "Female";

  const modal = new bootstrap.Modal(document.getElementById('editModal'));
  modal.show();

  document.getElementById('editSaveBtn').onclick = () => saveEdit(employeeId);
}

// Avatar Preview for Edit
document.getElementById('editProfilePic').addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = evt => {
      document.getElementById('editProfilePreview').src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Save Edited Employee
async function saveEdit(employeeId) {
  const genderElement = document.querySelector('input[name="editGender"]:checked');

  // Format DOB from YYYY-MM-DD to DD-MM-YYYY
  let formattedDOB = "";
  const dobInput = document.getElementById('editDOB').value;
  if (dobInput) {
    const [year, month, day] = dobInput.split("-");
    formattedDOB = `${day}-${month}-${year}`;
  }

  const updatedEmployee = {
    salutation: document.getElementById('editSalutation').value.trim(),
    firstName: document.getElementById('editFirstName').value.trim(),
    lastName: document.getElementById('editLastName').value.trim(),
    email: document.getElementById('editEmail').value.trim(),
    phone: document.getElementById('editPhone').value.trim(),
    dob: formattedDOB,
    gender: genderElement ? genderElement.value : "",
    qualifications: document.getElementById('editQualification').value.trim(),
    address: document.getElementById('editAddress').value.trim(),
    country: document.getElementById('editCountry').value.trim(),
    state: document.getElementById('editState').value.trim(),
    city: document.getElementById('editCity').value.trim(),
    pin: document.getElementById('editZip').value.trim(),
    username: document.getElementById('edituser').value.trim(),
    password: document.getElementById('editpass').value.trim(),
  };

  console.log("Updating employee:", employeeId);
  console.log("Data:", updatedEmployee);

  try {
    const response = await fetch(`http://localhost:3000/employees/${employeeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEmployee)
    });

    const data = await response.json();
    console.log("Response:", response.status, data);

    if (!response.ok) {
      throw new Error(data.error || "Failed to update employee");
    }

    const avatarFile = document.getElementById('editProfilePic').files[0];
    if (avatarFile) {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      await fetch(`http://localhost:3000/employees/${employeeId}/avatar`, {
        method: "POST",
        body: formData,
      });
    }

    alert("Employee updated successfully!");

    const modalElement = document.getElementById('editModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }

    await getEmployees();
  } catch (err) {
    console.error("Error updating:", err);
    alert("Error: " + err.message);
  }
}

getEmployees();

function viewDetails(id) {
  console.log("Viewing employee ID:", id);
  // Save ID to localStorage or URL
  localStorage.setItem("selectedEmployeeId", id);
  // Redirect to view.html with query param
  window.location.href = `view.html?id=${id}`;
}
