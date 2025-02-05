let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let editingId = null;

document.getElementById('inventoryForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const item = {
        id: editingId || Date.now(),
        name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        quantity: parseInt(document.getElementById('itemQuantity').value),
        price: parseFloat(document.getElementById('itemPrice').value)
    };

    if (!item.name || !item.category || isNaN(item.quantity) || isNaN(item.price)) {
        alert('Please fill all fields correctly');
        return;
    }

    if (editingId) {
        const index = inventory.findIndex(i => i.id === editingId);
        inventory[index] = item;
        editingId = null;
    } else {
        inventory.push(item);
    }

    saveInventory();
    renderInventory();
    e.target.reset();
    document.getElementById('itemName').focus(); // Set focus to item name
});

function renderInventory(filteredInventory = inventory) {
    const tbody = document.getElementById('inventoryBody');
    tbody.innerHTML = '';

    let totalQuantity = 0;
    let totalAmount = 0;

    filteredInventory.forEach(item => {
        totalQuantity += item.quantity;
        totalAmount += item.quantity * item.price;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td class="no-print"> <!-- Added no-print class here -->
                <button onclick="editItem(${item.id})">Edit</button>
                <button class="delete-btn" onclick="deleteItem(${item.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('totalQuantity').textContent = totalQuantity;
    document.getElementById('totalAmount').textContent = totalAmount.toFixed(2);
}

function editItem(id) {
    const item = inventory.find(i => i.id === id);
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemQuantity').value = item.quantity;
    document.getElementById('itemPrice').value = item.price;
    editingId = id;
    document.getElementById('itemName').focus(); // Set focus when editing
}

function deleteItem(id) {
    inventory = inventory.filter(i => i.id !== id);
    saveInventory();
    renderInventory();
}

function saveInventory() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = inventory.filter(item => 
        item.name.toLowerCase().includes(searchTerm)
    );
    renderInventory(filtered);
});

document.getElementById('categoryFilter').addEventListener('change', (e) => {
    const category = e.target.value;
    const filtered = category ? 
        inventory.filter(item => item.category === category) : 
        inventory;
    renderInventory(filtered);
});

// PDF Download Functionality
function downloadPDF() {
    const element = document.getElementById('inventoryTable');

    // Hide the actions column (both header and buttons)
    const elementsToHide = document.querySelectorAll('.no-print');
    elementsToHide.forEach(el => el.style.display = 'none');

    const opt = {
        margin: 10,
        filename: 'InventoryTable.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        // Show the actions column again after saving
        elementsToHide.forEach(el => el.style.display = '');
    });
}

document.getElementById('downloadPDF').addEventListener('click', downloadPDF);

renderInventory();
