document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.trackable').forEach(el => {
    el.addEventListener('click', () => {
      const path = el.getAttribute('data-track');
      if (path && window.goatcounter) {
        goatcounter.count({ path: `/event/${path}` });
      }
    });
  });
});
