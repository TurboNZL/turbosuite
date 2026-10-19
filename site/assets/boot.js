// Runs before the first paint: marks the page as scripted so site.css can hide what the script will reveal (the page is complete without it).
document.documentElement.classList.add('js');
