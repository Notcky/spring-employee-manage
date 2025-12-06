const API_URL = '/api/employees';

// REVENIM LA ASTA: Credentiale Base64 pentru 'admin:parola123'.
// Aceasta este trimisă în header pentru a autoriza acțiunile POST/PUT/DELETE.
const ADMIN_AUTH_HEADER = 'Basic YWRtaW46cGFyb2xhMTIz';

// NOU: SIMULARE ROL PENTRU FRONTEND
// SCHIMBĂ ACEASTĂ CONSTANTĂ PENTRU DEMONSTRAȚIE:
// - 'ADMIN' (pentru a vedea butoanele și formularul)
// - 'USER' (pentru a vedea doar tabelul)
const CURRENT_USER_ROLE = 'ADMIN';

document.addEventListener('DOMContentLoaded', loadEmployees);

// Functie ajutatoare pentru a verifica permisiunea de modificare
function shouldShowAdminActions() {
    return CURRENT_USER_ROLE === 'ADMIN';
}

// --- 1. Functia de Afisare a Alertelor ---
function showAlert(message, type) {
    const container = document.getElementById('alertContainer');
    container.innerHTML = '';

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    container.appendChild(alertDiv);

    // Face mesajul sa dispara dupa 4 secunde
    setTimeout(() => {
        alertDiv.classList.add('fade-out');
        setTimeout(() => alertDiv.remove(), 500);
    }, 4000);
}

// --- 2. Incarca lista de angajati ---
function loadEmployees() {
    fetch(API_URL)
        .then(res => res.json())
        .then(employees => {
            const tableBody = document.getElementById('employeeTableBody');
            tableBody.innerHTML = '';

            // NOU: Controlam vizibilitatea formularului (Adaugă/Editează)
            const formCard = document.querySelector('.card');
            if (shouldShowAdminActions()) {
                formCard.style.display = 'block'; // Arata formularul pentru ADMIN
            } else {
                formCard.style.display = 'none'; // Ascunde formularul pentru USER
            }

            employees.forEach(emp => {
                // Generam butoanele doar daca utilizatorul e ADMIN
                const actionButtons = shouldShowAdminActions() ? `
                    <button class="btn-edit" onclick="startEdit(${emp.id}, '${emp.name.replace(/'/g, "\\'")}', '${emp.email}', '${emp.jobTitle}')">Editează</button>
                    <button class="btn-delete" onclick="deleteEmployee(${emp.id})">Șterge</button>
                ` : 'Vizualizare'; // Afisam un mesaj simplu pentru USER

                const row = `
                    <tr>
                        <td>${emp.id}</td>
                        <td>${emp.name}</td>
                        <td>${emp.email}</td>
                        <td>${emp.jobTitle}</td>
                        <td>${emp.externalApiData || '-'}</td>
                        <td>
                            ${actionButtons}
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => showAlert('Eroare la încărcarea angajaților.', 'danger'));
}

// --- 3. Gestionarea Formularului (Adaugare SAU Modificare) ---
document.getElementById('employeeForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Verificare rol
    if (!shouldShowAdminActions()) {
        showAlert('Nu aveți permisiuni de Administrator pentru a modifica datele.', 'danger');
        return;
    }

    const id = document.getElementById('employeeId').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const jobTitle = document.getElementById('jobTitle').value;

    const employeeData = { name, email, jobTitle };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': ADMIN_AUTH_HEADER // Autentificare Basic
        },
        body: JSON.stringify(employeeData)
    })
        .then(response => {
            // GESTIONAREA EROARE 401/403 (Backend-ul a refuzat cererea, deși Frontend-ul a încercat să o trimită)
            if (response.status === 401 || response.status === 403) {
                showAlert('Acces refuzat! Autentificarea ca Administrator a eșuat.', 'danger');
                throw new Error("Unauthorized/Forbidden");
            }

            // GESTIONAREA VALIDARII
            if (!response.ok) {
                return response.json().then(errorData => {
                    const firstErrorKey = Object.keys(errorData)[0];
                    const errorMessage = errorData[firstErrorKey];
                    showAlert(`Eroare de validare: ${errorMessage}`, 'danger');
                    throw new Error(errorMessage);
                });
            }
            return response.json();
        })
        .then(data => {
            resetForm();
            loadEmployees();
            const action = id ? 'Actualizat' : 'Adăugat';
            showAlert(`Succes! Angajatul a fost ${action}.`, 'success');
        })
        .catch(error => {
            if (!error.message.includes("Unauthorized") && !error.message.includes("Eroare de validare") && !error.message.includes("Forbidden")) {
                showAlert('A apărut o eroare necunoscută. Vezi consola.', 'danger');
            }
            console.error('Error:', error);
        });
});

// --- 4. Functia care activeaza modul de editare ---
function startEdit(id, name, email, jobTitle) {
    if (!shouldShowAdminActions()) return; // Blocare Frontend

    document.getElementById('employeeId').value = id;
    document.getElementById('name').value = name;
    document.getElementById('email').value = email;
    document.getElementById('jobTitle').value = jobTitle;

    document.getElementById('submitBtn').innerText = "Actualizează Angajat";
    document.getElementById('submitBtn').style.backgroundColor = "#f39c12";
    document.getElementById('cancelBtn').style.display = "inline-block";

    window.scrollTo(0, 0);
}

// --- 5. Functia de stergere ---
function deleteEmployee(id) {
    if(confirm('Ești sigur ca vrei să ștergi acest angajat?')) {
        // Verificare rol
        if (!shouldShowAdminActions()) {
            showAlert('Nu aveți permisiuni de Administrator pentru a șterge datele.', 'danger');
            return;
        }

        fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': ADMIN_AUTH_HEADER // Autentificare Basic
            }
        })
            .then(response => {
                if (response.status === 401 || response.status === 403) {
                    showAlert('Acces refuzat! Autentificarea ca Administrator a eșuat.', 'danger');
                    throw new Error("Unauthorized/Forbidden");
                }
                if (!response.ok) {
                    showAlert('Eroare la ștergere (Server error).', 'danger');
                    throw new Error("Server error");
                }
                return response;
            })
            .then(() => {
                loadEmployees();
                showAlert('Succes! Angajatul a fost șters.', 'success');
            })
            .catch(error => {
                if (!error.message.includes("Unauthorized") && !error.message.includes("Forbidden")) {
                    showAlert('Eroare la ștergere.', 'danger');
                }
            });
    }
}

// --- 6. Resetarea formularului ---
function resetForm() {
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeId').value = '';

    document.getElementById('submitBtn').innerText = "Salvează Angajat";
    document.getElementById('submitBtn').style.backgroundColor = "#27ae60";
    document.getElementById('cancelBtn').style.display = "none";
}

// --- 7. Functia de Filtrare a Tabelului (Cautare) ---
function filterTable() {
    const filter = document.getElementById('searchInput').value.toUpperCase();
    const tableBody = document.getElementById('employeeTableBody');
    const tr = tableBody.getElementsByTagName('tr');

    for (let i = 0; i < tr.length; i++) {
        const tdName = tr[i].getElementsByTagName('td')[1];
        const tdEmail = tr[i].getElementsByTagName('td')[2];

        if (tdName || tdEmail) {
            const nameValue = tdName.textContent || tdName.innerText;
            const emailValue = tdEmail.textContent || tdEmail.innerText;

            if (nameValue.toUpperCase().indexOf(filter) > -1 || emailValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}