const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const root = document.documentElement;

menuToggle?.addEventListener('click', () => {
  const open = nav?.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(Boolean(open)));
});
document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => {
  nav?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

// ---------- Theme ----------
const themeToggle = document.getElementById('theme-toggle');
const systemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  const icon = themeToggle?.querySelector('.theme-icon');
  const label = themeToggle?.querySelector('.theme-label');
  const lang = root.lang || 'en';

  if (icon) icon.textContent = theme === 'dark' ? '☀' : '☾';
  if (label) {
    label.textContent =
      theme === 'dark'
        ? (lang === 'fr' ? 'Clair' : 'Light')
        : (lang === 'fr' ? 'Sombre' : 'Dark');
  }

  const target = theme === 'dark'
    ? (lang === 'fr' ? 'clair' : 'light')
    : (lang === 'fr' ? 'sombre' : 'dark');

  themeToggle?.setAttribute(
    'aria-label',
    lang === 'fr' ? `Passer au thème ${target}` : `Switch to ${target} theme`
  );
}

applyTheme(localStorage.getItem('moomaf-theme') || systemTheme());

themeToggle?.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('moomaf-theme', next);
});

// ---------- Language ----------
const translations = {
  fr: {
    'nav.apps':'Applications',
    'nav.how':'Ma méthode',
    'nav.news':'Actualités Tech',
    'nav.ideas':'Idées',
    'nav.roadmap':'Feuille de route',
    'nav.about':'À propos',
    'nav.build':'Construisons',
    'hero.eyebrow':'LOGICIELS • APPLICATIONS • IA',
    'hero.title':'Créer des logiciels<br/>utiles <span>pour la vie réelle.</span>',
    'hero.text':'Moomaf est un laboratoire de développement où je crée des applications pratiques autour de vrais problèmes — puis je les fais évoluer avec l’IA.',
    'hero.apps':'Découvrir les applications →',
    'hero.about':'À propos de Moomaf',
    'go.tagline':'Trouvez des événements.<br/>Trouvez des personnes.<br/><span>Allez-y ensemble.</span>',
    'go.description':'Découvrez ce qui se passe autour de vous — et trouvez aussi les personnes qui y vont.',
    'evolution.eyebrow':'L’ÉVOLUTION',
    'evolution.title':'Les apps d’abord. L’IA ensuite.<br/>Les agents plus tard.',
    'evolution.apps.title':'Applications',
    'evolution.apps.text':'Créer des produits utiles avec de solides bases en ingénierie logicielle.',
    'evolution.ai.title':'Fonctions IA',
    'evolution.ai.text':'Ajouter recommandations, analyse, personnalisation et assistance intelligente.',
    'evolution.agents.title':'Agents',
    'evolution.agents.text':'Des workflows autonomes capables d’effectuer des actions utiles pour les utilisateurs.',
    'evolution.products.title':'Produits réels',
    'evolution.products.text':'Les applications qui prouvent leur potentiel peuvent grandir au-delà du portfolio.',
    'lab.eyebrow':'LE LAB PRODUIT',
    'lab.title':'Applications',
    'lab.text':'Des produits utiles construits autour de vrais problèmes. Certains commencent comme de simples outils. D’autres peuvent devenir beaucoup plus grands.',
    'about.eyebrow':'À PROPOS DE Moomaf',
    'about.title':'Un portfolio de développeur qui peut devenir une entreprise produit.',
    'about.text':'Je construis des logiciels en public. Le but est simple : résoudre des problèmes utiles, améliorer mes compétences en ingénierie, partager ce que j’apprends et créer des produits qui comptent.',
    'about.more':'En savoir plus sur moi →',
    'public.eyebrow':'CONSTRUIRE EN PUBLIC',
    'public.title':'Suivez l’aventure.',
    'public.text':'Découvrez ce que je construis, ce que j’apprends et la suite de Moomaf.',
    'ideas.eyebrow':'IDÉES DE LA COMMUNAUTÉ',
    'ideas.title':'Aidez à façonner ce que Moomaf construira ensuite.',
    'ideas.text':'Vous avez une idée d’application, une demande de fonctionnalité, une recommandation ou un problème quotidien que le logiciel pourrait résoudre ? Partagez-la ici.',
    'ideas.note':'Votre idée sera envoyée directement à Moomaf.',
    'ideas.submit':'Envoyer l’idée →',
    'form.name':'Nom',
    'form.namePlaceholder':'Votre nom (facultatif)',
    'form.email':'E-mail',
    'form.idea':'Idée ou recommandation',
    'form.ideaPlaceholder':'Que devrait construire ou améliorer Moomaf ?'
  }
};

const englishOriginal = new Map();

function applyLanguage(lang) {
  root.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (!englishOriginal.has(el)) englishOriginal.set(el, el.textContent);
    el.textContent = lang === 'fr' ? (translations.fr[key] || englishOriginal.get(el)) : englishOriginal.get(el);
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (!englishOriginal.has(el)) englishOriginal.set(el, el.innerHTML);
    el.innerHTML = lang === 'fr' ? (translations.fr[key] || englishOriginal.get(el)) : englishOriginal.get(el);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    const storageKey = `placeholder:${key}`;
    if (!el.dataset.originalPlaceholder) el.dataset.originalPlaceholder = el.placeholder;
    el.placeholder = lang === 'fr' ? (translations.fr[key] || el.dataset.originalPlaceholder) : el.dataset.originalPlaceholder;
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  applyTheme(root.getAttribute('data-theme') || 'light');
  localStorage.setItem('moomaf-lang', lang);
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLanguage(btn.dataset.lang || 'en'));
});

applyLanguage(localStorage.getItem('moomaf-lang') || 'en');

// ---------- Community ideas: direct AJAX submission ----------
const ideaForm = document.getElementById('idea-form');
const ideaStatus = document.getElementById('idea-status');
const ideaSubmit = document.getElementById('idea-submit');

ideaForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const lang = root.lang || 'en';
  ideaStatus.className = 'form-status';
  ideaStatus.textContent = lang === 'fr' ? 'Envoi de votre idée…' : 'Sending your idea…';
  ideaSubmit.disabled = true;

  try {
    const response = await fetch(ideaForm.action, {
      method: 'POST',
      body: new FormData(ideaForm),
      headers: { 'Accept': 'application/json' }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.ok) {
      throw new Error(data.message || 'Submission failed.');
    }

    ideaForm.reset();
    ideaStatus.className = 'form-status success';
    ideaStatus.textContent = lang === 'fr'
      ? 'Merci — votre idée a bien été envoyée.'
      : 'Thank you — your idea was submitted successfully.';
  } catch (error) {
    ideaStatus.className = 'form-status error';
    ideaStatus.textContent = lang === 'fr'
      ? 'Un problème est survenu. Veuillez réessayer dans un instant.'
      : 'Something went wrong. Please try again in a moment.';
  } finally {
    ideaSubmit.disabled = false;
  }
});
