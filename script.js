
// highlight current page
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.site-nav a').forEach(link => {
      if (link.href.split('#')[0] === window.location.href.split('#')[0]) {
        link.classList.add('active');
      }
    });
  });