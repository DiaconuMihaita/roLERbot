# Arhitectura Tehnică a Platformei Web roLERbot

## 1. Considerații Arhitecturale Generale

Din punct de vedere arhitectural, platforma web roLERbot este concepută și implementată exclusiv pe nivelul de **front end** — componenta vizibilă și direct accesibilă utilizatorului final. Arhitectura nu include un nivel de back end (server dedicat procesării logicii de business) și nici un sistem de gestiune a bazelor de date externalizat. Această abordare arhitecturală de tip *static front-end application* este fundamentată pe premisa că toate funcționalitățile necesare pot fi acoperite prin execuție locală în browser, fără a necesita comunicare cu un server extern.

Front end-ul constituie interfața grafică prin care platforma comunică cu utilizatorul, asigurând atât prezentarea conținutului, cât și gestionarea interacțiunilor. Implementarea sa se realizează prin utilizarea a trei tehnologii web fundamentale: **HTML**, **CSS** și **JavaScript** — fiecare cu o responsabilitate distinctă în cadrul arhitecturii stratificate a aplicației.

---

## 2. HTML — Structura și Ierarhia Documentelor

HTML (*HyperText Markup Language*) reprezintă nivelul de structură al aplicației, definind organizarea semantică a conținutului prin elemente precum `<nav>`, `<header>`, `<section>`, `<article>` și `<footer>`. Platforma este compusă din **cinci fișiere HTML** distincte, fiecare îndeplinind un rol precis în cadrul ecosistemului digital al echipei.

### 2.1 `index.html` — Pagina Principală

Fișierul `index.html` constituie punctul de intrare al platformei și prima interfață pe care vizitatorul o accesează. Scopul său este dublu: prezentarea identității echipei roLERbot și orientarea utilizatorului spre celelalte secțiuni ale site-ului. Pagina este construită pe o arhitectură modulară, structurată în secțiuni funcționale bine delimitate:

**Head-ul** reprezintă secțiunea de metadate a documentului, invizibilă utilizatorului final, dar esențială pentru interpretarea corectă a paginii de către browser și motoarele de căutare. Aceasta include:
-   **Configurații de randare**: `<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">` asigură scalarea corectă și densitatea pixelilor pe ecrane Retina.
-   **SEO și Identitate**: Meta-tag-uri pentru descriere și autor, plus favicon-ul personalizat (logo-ul roLERbot).
-   **Gestiunea Dependențelor**: Integrarea resurselor externe prin CDN (Content Delivery Network):
    -   `Bootstrap 5.2.3`: Pentru sistemul de grid și utilitarele de layout.
    -   `Font Awesome 6.x`: Pentru setul de iconițe vectoriale.
    -   `Google Fonts`: Importul ierarhic al fonturilor *Montserrat* (pentru titluri) și *Roboto Slab* (pentru text de tip „serif” academic).

**Navbar-ul** este componenta de navigare fixă, ancorată în partea superioară a ferestrei de browser (`id="mainNav"`, `.fixed-top`). Utilizarea claselor `.navbar-expand-lg` permite adaptarea automată: pe ecrane mari, link-urile sunt desfășurate, în timp ce pe ecrane mobile (sub 992px), acestea sunt grupate într-un element `.collapse` activat prin `data-bs-toggle="collapse"`. Un element distinct este butonul 🐥, al cărui atribut `onclick` declanșează scriptul `chickenRain()`.

**Masthead-ul** (secțiunea *hero*) este primul element vizualizat de utilizator la accesarea paginii. Acesta este implementat prin elementul `<header class="masthead">` și conține titlul principal al echipei și un buton de tip *call-to-action* care direcționează utilizatorul spre conținutul paginii. Elementele acestei secțiuni beneficiază de animații de intrare definite în CSS.

**Secțiunea Echipă** prezintă descrierea echipei și misiunea sa în cadrul competiției FTC (*FIRST Tech Challenge*). Structura este realizată pe un layout cu două coloane (proprietăți Bootstrap `.col-md-6`), combinând textul descriptiv cu imaginea reprezentativă a echipei, servită prin elementul `<picture>` cu surse alternative optimizate pentru rezoluții diferite.

**Secțiunea Sponsori** implementează un mecanism de recunoaștere publică a partenerilor care susțin echipa. Fiecare sponsor este reprezentat printr-un element `.portfolio-item` ce conține logo-ul companiei. Din punct de vedere funcțional, există implementată în JavaScript o rutină de redirecționare: la apăsarea pe logo-ul unui sponsor, browserul deschide automat, într-o filă nouă, pagina oficială a companiei respective, prin atributele `target="_blank"` și `rel="noopener noreferrer"` aplicate link-urilor.

**Secțiunea Progres** prezintă cronologia evoluției echipei sub forma unei linii de timp vizuale (`<ul class="timeline">`), marcând momentele-cheie din activitatea roLERbot de la fondare și până în sezonul curent. Fiecare eveniment este reprezentat printr-un nod al timeline-ului cu dată, imagine circulară și text descriptiv, elementele alterând poziția stânga-dreapta față de axa centrală. Secțiunea este completată de o previzualizare a articolelor din sezonul curent, organizate într-un carousel interactiv cu autoplay și navigare manuală.

**Footer-ul** constituie subsolul paginii și conține datele de contact ale echipei, link-uri spre rețelele de socializare (Instagram, Facebook, YouTube, GitHub) și o secțiune de navigare rapidă. Este decorat cu un element SVG animat care simulează un efect de val.

---

### 2.2 `blog.html` — Arhiva de Activități și Sezoane

Fișierul `blog.html` reprezintă componenta de documentare extinsă a platformei, accesibil prin butonul dedicat din secțiunea de bloguri a paginii principale. Spre deosebire de introducerea sumarizată din `index.html`, această pagină constituie arhiva completă a activității echipei, acoperind probe, dezvoltarea roboților, activități comunitare și participări la meet-uri, organizate pe sezoane competiționale.

**Secțiunea Membri** prezintă individual fiecare component al echipei într-un format de carousel interactiv. Din punct de vedere structural, fiecare membru este definit printr-un card ierarhic:
```html
<div class="member-card">
    <div class="member-img-container">
        <img src="..." alt="Membru">
    </div>
    <h3>Nume Membru</h3>
    <p>Departament / Rol</p>
</div>
```
Sistemul afișează simultan trei carduri (`.prev`, `.active`, `.next`), cardul central beneficiind de o tratare vizuală distinctivă prin CSS (scalare `scale(1.1)` și `z-index` superior).

**Secțiunea Sezoane** utilizează un sistem de reprezentare vizuală inovativ: fiecare dintre cele trei sezoane competiționale (2023-2024, 2024-2025, 2025-2026) este reprezentat printr-un folder CSS 3D animat. La interacțiunea cu un folder, se declanșează o animație de deschidere, urmată de afișarea unui modal (fereastră suprapusă) cu detalii complete despre sezonul respectiv. Modalul este organizat pe patru tab-uri navigabile — **Proba**, **Robot**, **Activități**, **Meeturi** — al căror conținut este injectat dinamic în DOM de JavaScript din structuri de date definite în cod, evitând astfel crearea de pagini HTML separate pentru fiecare sezon.

Pagina se încheie cu același **footer** utilizat în `index.html`, asigurând consistența vizuală a platformei.

---

### 2.3 `puiu-run.html` — Componenta de Joc „Puiu Run"

Fișierul `puiu-run.html` implementează primul mini-joc al platformei: un *endless runner* (joc de alergare infinită) în stil retro-pixel, în care utilizatorul controlează personajul Puiu — mascota echipei — evitând obstacolele (cactuși) cu frecvență și viteză crescândă.

Nucleul tehnic al paginii îl constituie elementul `<canvas id="gameCanvas">`, o suprafață de randare 2D pe care întreaga grafică a jocului este desenată programatic, cadru cu cadru, prin Canvas 2D API. Implementarea se bazează pe o buclă de tip `requestAnimationFrame`, care asigură o rată de împrospătare sincronizată cu monitorul (de regulă 60fps), minimizând efectul de *screen tearing*. Elementele vizuale — teren, personaj, obstacole — sunt obiecte JavaScript cu proprietăți de poziție (`x`, `y`) și dimensiune (`width`, `height`), actualizate la fiecare iterație a buclei.

Peste suprafața canvas sunt suprapuse mai multe **ecrane de stare**, vizibil alternativ în funcție de stadiul jocului:

- **Ecranul de start** — primul ecran cu care este întâmpinat utilizatorul, unde acesta selectează una din cele 32 de echipe ale Ligii din Est FTC, în numele căreia va juca.
- **Numărătoarea inversă** — ecran tranzițional afișat la apăsarea butonului de start, care pregătește psihologic jucătorul prin o secvență 3-2-1-GO!, însoțită de tonuri sonore generate prin Web Audio API.
- **Ecranul Game Over** — afișat la coliziunea personajului cu un obstacol, prezintă scorul obținut în sesiunea respectivă și opțiunea de repornire.
- **Leaderboard-ul** — clasament al scorurilor maxime pe echipe, persistent între sesiuni prin mecanismul `localStorage` al browserului, fără a necesita un server de stocare.

---

### 2.4 `puiu-cross.html` — Componenta de Joc „Puiu Cross"

Al doilea joc al platformei, `puiu-cross.html`, implementează o variantă a jocului clasic *Frogger*: personajul Puiu trebuie să traverseze o stradă cu trafic bidirecțional, evitând vehiculele pe parcursul a cât mai multor niveluri consecutive.

**Sistemul de vieți** gestionează rezistența jucătorului: sesiunea debutează cu trei vieți (reprezentate vizual prin iconița ❤️), fiecare coliziune cu un vehicul reducând contorul cu o unitate și resetând poziția personajului la punctul de start. Epuizarea completă a vieților declanșează tranziția spre ecranul Game Over.

**Controlul pe dispozitive mobile** este implementat printr-un D-pad virtual — un set de patru butoane direcționale (sus, stânga, dreapta, jos) poziționate în configurație de cruce, vizibil exclusiv pe ecranele tactile. Butoanele răspund evenimentelor `touchstart` și `touchend`, asigurând un control fluid al personajului pe smartphone-uri și tablete, apropiat de experiența oferită de tastatura fizică pe desktop.

**Sistemul de niveluri** introduce progresie dinamică: la fiecare traversare completă a drumului, jucătorul avansează un nivel, viteza vehiculelor crește și se afișează un ecran de tranziție „Level Up!", semnalând progresul și amplificând dificultatea progresiv.

Ambele jocuri utilizează un algoritm de detecție a coliziunilor de tip **AABB (Axis-Aligned Bounding Box)**. Această tehnică verifică suprapunerea dreptunghiurilor de încadrare ale personajului și obstacolelor prin inegalități matematice simple, oferind o performanță optimă pentru jocuri 2D:
```javascript
if (rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.height + rect1.y > rect2.y) {
    // Coliziune detectată
}
```
Efectele audio (săritură, eșec, level-up) sunt generate sau redate prin **Web Audio API**, permițând controlul precis al volumului și al temporizării sunetelor în raport cu acțiunea de pe ecran.

---

## 3. CSS — Design Vizual și Adaptabilitate

CSS (*Cascading Style Sheets*) este limbajul de stilizare care definește aspectul vizual al fiecărui element HTML — culori, fonturi, dimensiuni, spațieri, tranziții, animații — și modul în care interfața se adaptează la diferite dimensiuni de ecran și tipuri de dispozitive.

Stilurile platformei sunt distribuite în mai multe fișiere cu responsabilități distincte:

**`styles.css`** definește identitatea vizuală globală a platformei prin utilizarea unui sistem de **variabile native CSS** (Custom Properties) în `:root`. Această abordare permite o mentenanță centralizată și consistență cromatică:
```css
:root {
  --brand: #f9056c;
  --accent: #ff4081;
  --glass: rgba(255, 255, 255, 0.1);
  --shadow-strong: 0 10px 30px rgba(0,0,0,0.3);
}
```
Paleta cromatică este construită pentru a genera un contrast ridicat, utilizând gradientul de tip `linear-gradient(135deg, var(--brand), #b0044d)` pentru elementele de tip masthead și butoane.

**`blog-redesign.css`** implementează logica vizuală complexă pentru elementele 3D. Un punct central este **sistemul de foldere animate**, care utilizează proprietățile `perspective: 1000px` și `transform-style: preserve-3d` pentru a crea adâncime reală în browser. Capacul folderului (`.folder-front`) este rotit pe axa X (`rotateX(-110deg)`) la activarea clasei `.open`, oferind o interacțiune tactilă virtuală.

**`mobile-responsive.css`** asigură *responsive design*-ul prin *media queries* strategice. O tehnică avansată utilizată este **Glassmorphism**, implementată pe navbar-ul mobil prin `backdrop-filter: blur(10px)` și o bordură subțire semi-transparentă, creând un efect de sticlă mată peste conținutul care rulează în fundal. Aceasta îmbunătățește lizibilitatea fără a obstrucționa complet vizibilitatea elementelor subjacente.

**`curved-timeline.css`** gestionează stilizarea liniei de timp curbate utilizate în secțiunea Progres din `index.html`.

---

## 4. JavaScript — Logică Funcțională și Interactivitate

JavaScript este limbajul de programare care implementează comportamentul dinamic al platformei — totalitatea acțiunilor declanșate ca răspuns la interacțiunile utilizatorului sau pe baza unor logici temporale și de stare. Codul este organizat în fișiere funcționale distincte.

**`scripts.js`** constituie modulul central de logică al platformei și gestionează multiple subsisteme:

- **Navbar adaptiv**: un listener pe evenimentul `scroll` monitorizează permanent poziția verticală a paginii și aplică sau elimină clasa CSS `navbar-shrink` pe elementul `#mainNav`, determinând tranziția vizuală a barei de navigare (de la transparent la gradient roz cu umbră) în funcție de poziția utilizatorului.
- **Animații la scroll prin IntersectionObserver API**: Pentru a optimiza performanța și a evita calculele costisitoare pe evenimentul `scroll`, platforma utilizează `IntersectionObserver`. Acesta monitorizează starea de vizibilitate a elementelor:
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in-visible');
    }
  });
}, { threshold: 0.1 });
```
Elementele de tip `.portfolio-item` sunt înregistrate în observer, primind clasa de vizibilitate doar atunci când cel puțin 10% din suprafața lor este prezentă în viewport.
- **Carousel de bloguri**: implementează navigare automată (autoplay la 5 secunde), navigare manuală prin butoane și indicatori punctați, cu pauză la hover și reluare la mouseleave.
- **Generare dinamică de conținut**: cardurile de meeturi și activități sunt produse programatic prin funcții JavaScript care utilizează *template literals*, pornind de la array-uri de date definite în cod — eliminând redundanța HTML și facilitând actualizarea conținutului.
- **Animația „Ploaie cu Pui"**: Implementată în funcția `chickenRain()`, aceasta demonstrează manipularea dinamică a DOM-ului. JavaScript instanțiază elemente `<span>` cu emoji-ul 🐥, atribuindu-le proprietăți CSS randomizate (poziție `left`, dimensiune `font-size` și `duration` pentru animația CSS `@keyframes fall`). Resursele sunt eliberate automat prin `element.remove()` la expirarea duratei de viață a animației.

**`navbar.js`** gestionează comportamentul meniului pe dispozitive mobile și integrarea cu mecanismul Bootstrap *ScrollSpy*, care evidențiază automat link-ul de navigare corespunzător secțiunii active în viewport.

Logica jocurilor din `puiu-run.html` și `puiu-cross.html` implementează arhitectura clasică *Game Loop* pe Canvas 2D, gestionând generarea și interpolarea obstacolelor, detectarea coliziunilor prin calcul geometric, managementul stărilor de joc și persistența scorurilor prin `localStorage`.

---

## 5. Concluzie

Platforma web roLERbot demonstrează că o aplicație web complexă, cu funcționalități interactive avansate, poate fi implementată integral prin tehnologiile fundamentale ale web-ului, fără a recurge la soluții de back end sau framework-uri JavaScript de nivel înalt. Separarea riguroasă a responsabilităților între structura HTML, stilizarea CSS și logica JavaScript asigură un cod organizat, extensibil și ușor de întreținut pe termen lung, reflectând aceleași principii de inginerie modulară pe care echipa le aplică și în proiectarea robotului FTC.