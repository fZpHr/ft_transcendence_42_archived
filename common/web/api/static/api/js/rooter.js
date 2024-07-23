// router.js

document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('main-content');
    console.log('router.js loaded');
    function loadPage(url) {
        fetch(url)
            .then(response => response.text())
            .then(html => {
                mainContent.innerHTML = html;
                // Vous pouvez initialiser des scripts spécifiques à la page chargée ici
            })
            .catch(error => console.error('Error loading page:', error));
    }

    // Gestion des clics sur les liens internes pour éviter le rechargement de la page
    document.body.addEventListener('click', function(event) {
        const target = event.target;
        if (target.tagName === 'A' && target.getAttribute('href').startsWith('/')) {
            event.preventDefault();
            const url = target.href;
            history.pushState(null, null, url);
            loadPage(url);
        }
    });

    document.body.addEventListener('submit', function(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        fetch('/api/login_player/', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirection côté client si la connexion est réussie
                loadPage(data.redirect_url); // Charger la page de profil par exemple
            } else {
                // Gestion des erreurs de connexion
                alert('Error: ' + data.error);
            }
        })
        .catch(error => console.error('Error:', error));
    });

    // Gestion de l'événement popstate pour naviguer en arrière et en avant dans l'historique du navigateur
    window.addEventListener('popstate', function(event) {
        const url = location.pathname;
        loadPage(url);
    });

    loadPage(window.location.pathname);
});
