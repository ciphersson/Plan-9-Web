// Create initial window when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Create initial rio window
    window.rio.createWindow();

    // Setup Acme button
    document.getElementById('new-acme').addEventListener('click', () => {
        const win = window.rio.createWindow('Acme Editor');
        win.element.style.width = '90%';
        win.element.style.height = '90%';
        
        // Create Acme instance
        const acme = new Acme();
        win.content.innerHTML = ''; // Clear default content
        win.content.appendChild(acme.element);
    });
});
