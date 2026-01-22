

//  DELETE EMPLOYEE (CONFIRM & DO DELETE) 
let employeeToDeleteId = null;

function ofclick(id) {
  employeeToDeleteId = id;
  const modalEl = document.getElementById("deleteModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

// Actual delete function called when user confirms
async function deleteEmployeeConfirmed() {
  if (!employeeToDeleteId) return;

  try {
    const res = await fetch(`http://localhost:3000/employees/${employeeToDeleteId}`, {
      method: "DELETE",
    });

    // handle non-2xx status
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Server responded ${res.status}: ${text}`);
    }

    // Hide modal
    const modalEl = document.getElementById("deleteModal");
    const instance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    instance.hide();

    // reset and refresh list
    employeeToDeleteId = null;
    await getEmployees();
   
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Delete failed: " + err.message);
  }
}

// Wire the confirm button (run after DOM is ready)
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener("click", deleteEmployeeConfirmed);
}

