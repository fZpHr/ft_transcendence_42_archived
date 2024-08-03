import * as ponglocal from './ponglocal.js';

function onContentChange() {
    console.log('Content changed!');
    ponglocal.toggelMenu();
}

function initializeObserver() {
    // Ciblez l'élément à surveiller
    var targetNode = document.getElementById('main-content');

    // Vérifiez si l'élément existe
    if (targetNode) {
        // Créez une instance de MutationObserver
        var observer = new MutationObserver(function(mutationsList, observer) {
            for (var mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    onContentChange();
                }
            }
        });

        // Configuration de l'observateur : surveillez les ajouts et suppressions de nœuds enfants
        var config = { childList: true, subtree: true };

        // Commencez à observer l'élément cible
        observer.observe(targetNode, config);
    } else {
        console.error('Element with ID "main-content" not found.');
    }
}

// Initialize observer on page load
initializeObserver();

// Listen for popstate event to handle back/forward navigation
window.addEventListener('popstate', function(event) {
    initializeObserver();
});

// Listen for custom events to handle SPA navigation
window.addEventListener('pushstate', function(event) {
    initializeObserver();
});

// Override pushState to trigger custom event
(function(history) {
    var pushState = history.pushState;
    history.pushState = function(state) {
        if (typeof history.onpushstate == "function") {
            history.onpushstate({state: state});
        }
        var result = pushState.apply(history, arguments);
        window.dispatchEvent(new Event('pushstate'));
        return result;
    };
})(window.history);