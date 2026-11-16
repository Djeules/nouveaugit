/* Landing : en-tête opaque après le film, apparitions douces, formulaire de démonstration. */
(() => {
  const root = document.documentElement;
  root.classList.add('js');

  const top = document.querySelector('.top');
  const film = document.querySelector('[data-dressing-film]');
  const solid = () => {
    const end = film ? film.offsetTop + film.offsetHeight - innerHeight * 0.5 : 0;
    top.classList.toggle('solid', scrollY > end);
  };
  addEventListener('scroll', solid, { passive: true });
  addEventListener('resize', solid);
  solid();

  const els = document.querySelectorAll('.reveal-up');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -10% 0px' });
    els.forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 80}ms`; io.observe(el); });
  } else els.forEach(el => el.classList.add('in'));

  // Formulaire non branché (action="#") : on l'indique au lieu d'envoyer dans le vide.
  const form = document.querySelector('.form');
  if (form && form.getAttribute('action') === '#') form.addEventListener('submit', e => {
    e.preventDefault();
    let msg = form.querySelector('.form__msg');
    if (!msg) { msg = document.createElement('p'); msg.className = 'form__msg'; msg.setAttribute('role', 'status'); form.appendChild(msg); }
    msg.textContent = 'Merci ! (Démo : ce formulaire n’est pas encore relié à une adresse d’envoi.)';
  });
})();
