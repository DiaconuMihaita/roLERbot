/**
 * roLERbot Internationalization Module
 * Handles language switching, persistence, and UI translation.
 */

const initI18n = () => {
  console.log("roLERbot i18n: Starting initialization...");

  const legacySwitcher = document.getElementById('languageSwitcher');
  const toggleInput = document.getElementById('languageToggleInput');
  const switchContainer = document.querySelector('.language-switcher');

  // Basic check: do we have any switcher elements or translatable content?
  if (!legacySwitcher && !toggleInput && !switchContainer && !document.querySelector('[data-i18n]')) {
    console.log("roLERbot i18n: No i18n elements found on this page.");
    return;
  }

  const dictionaries = {
    ro: {
      pageTitleIndex: 'roLERbot - Echipa de Robotică',
      pageTitleBlog: 'roLERbot - Blog & Activități',
      'nav.home': 'Acasă',
      'nav.team': 'Echipa',
      'nav.sponsors': 'Sponsori',
      'nav.progress': 'Progres',
      'nav.blog': 'Blog',
      'nav.ftcGame': 'Joc FTC 1v1',
      'nav.activities': 'Activități',
      'nav.contact': 'Contact',
      'hero.learnMore': 'Află mai multe',
      'section.team': 'Echipa',
      'section.teamSubtitle': 'Suntem născuți pentru inovație.',
      'team.desc1': 'roLERbot, echipa de robotică a Liceului Teoretic „Emil Racoviță” Vaslui, reunește 12 membri oficiali și voluntari pasionați de tehnologie, inginerie și inovație.',
      'team.desc2': 'Cu o abordare colaborativă și o viziune axată pe performanță, echipa proiectează, construiește și programează robotul pentru competiția First Tech Challenge, în timp ce promovează educația STEAM în comunitatea locală.',
      'team.desc3': 'roLERbot îmbină creativitatea cu rigurozitatea tehnică, reflectând spiritul inovator al elevilor liceului.',
      'section.sponsors': 'Sponsori',
      'section.progress': 'Progres',
      'timeline.1.date': '14 Octombrie 2018',
      'timeline.1.title': 'Pasiunea care ne-a unit',
      'timeline.1.desc': 'Echipa roLERbot a apărut în 2018, din dorința unor tineri pasionați de științele exacte de a-și transforma ideile în realitate. Cine suntem noi? Suntem roLERbot – motivați, ambițioși și uniți de pasiunea pentru tehnologie. Prin programul Rover Ruckus am intrat în lumea Tech Challenge-urilor, hotărâți să lăsăm o amprentă în domeniul inovației.',
      'timeline.2.date': '20 Februarie 2019',
      'timeline.2.title': 'Primul pas, primul succes',
      'timeline.2.desc': 'În 2019, echipa roLERbot, formată din 15 elevi, a obținut prima calificare la etapa națională a competiției BRD First Tech Challenge România. După trei zile intense la Iași, emoțiile au fost înlocuite de bucuria reușitei. Robotul nostru, construit cu multă muncă și dedicare, a funcționat impecabil, reflectând efortul zilnic depus de echipă, chiar și în vacanțe. Cu mult entuziasm, simț al umorului (dovedit și de numele robotului – „Puiu”) și dorința de a evolua, am pornit spre finala de la București, gata să demonstrăm că pasiunea și spiritul de echipă pot duce departe, chiar și la primul contact cu acest univers tehnologic.',
      'timeline.3.date': '11 Martie 2024',
      'timeline.3.title': 'O nouă zi, un nou premiu',
      'timeline.3.desc': 'Ziua a treia, 11 martie 2024, ne-a adus zâmbetul pe buze! După două zile pline de emoții, provocări și momente intense, Regionala 4 de la Iași s-a încheiat cu o mare bucurie pentru echipa roLERbot: am câștigat The Judges Award. Suntem foarte mândri de evoluția noastră, de robotul construit și de tot ceea ce am reușit să realizăm în acest sezon. În cele trei zile, am legat prietenii, am râs, ne-am enervat, am dansat și am trăit fiecare clipă la intensitate maximă. Am plecat acasă obosiți, dar cu inimile pline de recunoștință și cu echipa mai unită ca niciodată.',
      'timeline.4.date': '19 Ianuarie 2025',
      'timeline.4.title': 'O reușită care ne inspiră',
      'timeline.4.desc': 'Astăzi, 19 ianuarie 2025, încheiem competiția regională cu capul sus, după ce am câștigat 4 din cele 6 meciuri și am demonstrat determinare, creativitate și spirit de echipă. Suntem extrem de mândri să anunțăm că am obținut Design Award – Locul 3, o distincție care evidențiază echilibrul dintre funcționalitate și estetică în construcția robotului nostru. Acest premiu recunoaște echipele care transformă un robot într-o veritabilă operă tehnologică, printr-un design inovator, bine planificat și executat cu grijă și precizie.',
      'timeline.final': 'Fii parte<br>din<br>poveste',
      'section.blog': 'Blog',
      'section.blogSubtitle': 'Articole și actualizări din echipa roLERbot',
      'blog.viewAll': 'Vezi toate articolele',
      'footer.desc': 'Echipa de robotică a Liceului Teoretic „Emil Racoviță" Vaslui. Pasionați de tehnologie, inovație și competiții FIRST Tech Challenge.',
      'footer.nav': 'Navigare',
      'footer.resources': 'Resurse',
      'footer.contact': 'Contact',
      'footer.location': 'Liceul Teoretic<br>„Emil Racoviță" Vaslui',
      'footer.copyright': '&copy; 2024 roLERbot. Toate drepturile rezervate.',
      'footer.made_by': 'Site realizat de Diaconu Mihăiță',
      'footer.privacy': 'Politica de Confidențialitate',
      'footer.terms': 'Termeni și Condiții',
      'blog.skipLink': 'Mergi la conținut',
      'blog.masthead': 'Bloguri',
      'blog.teamTitle': 'Cunoaște Echipa',
      'blog.teamSubtitle': 'Membrii roLERbot',
      'blog.activitiesTitle': 'Activități & Competiții',
      'blog.activitiesSubtitle': 'Explorează documentația fiecarui sezon.',
      'game.redScore': 'ROȘU',
      'game.blueScore': 'ALBASTRU',
      'game.pressStart': 'Apasă START',
      'game.redControl': 'Control Roșu (1v1)',
      'game.blueControl': 'Control Albastru (1v1)',
      'game.rules': 'Reguli rapide (FTC 1v1)',
      'game.move': 'mișcare',
      'game.action': 'ia piesă / trage',
      'game.rule1': 'Mingile apar pe liniile albe de pe teren.',
      'game.rule2': 'Roșu marchează în pătratul roșu, albastru în pătratul albastru.',
      'game.back': 'Înapoi site',
      // Index Blog Carousel
      'blog.card0.date': '10 ianuarie 2026',
      'blog.card0.title': 'MEET #1 - Piatra Neamt',
      'blog.card0.desc': 'Meet-ul "Jurassic Peaks" , organizat la Piatra Neamț pe 10 ianuarie, a fost primul nostru meet din acest sezon. Am reușit să câștigăm 4 meciuri din 6, fiind un start bun.',
      'blog.card1.date': '11 ianuarie 2026',
      'blog.card1.title': 'MEET #2 - Iasi',
      'blog.card1.desc': 'Meet-ul "Defrost", organizat la Iași pe 11 ianuarie, a fost al doilea meet la care am participat. Deși am câștigat doar 2/6 meciuri, am observat mai multe lipsuri.',
      'blog.card2.date': '24 ianuarie 2026',
      'blog.card2.title': 'MEET #3 - Focșani',
      'blog.card2.desc': 'La meet-ul "Focșani Tech Challenge", organizat pe 24 ianuarie, ne-am îmbunătățit strategia, câștigând 3/6 meciuri.',
      'blog.card3.date': '31 ianuarie 2026',
      'blog.card3.title': 'MEET #4 - Galati',
      'blog.card3.desc': 'Meet-ul "Ice Age", organizat pe 31 ianuarie, ne-a dat verdictul în sensul viabilității robotului, reușind să câștigăm 5/6 meciuri.',
      'blog.card4.date': '7 februarie 2026',
      'blog.card4.title': 'MEET #5 - Botosani',
      'blog.card4.desc': 'Ultimul meet la care am participat a fost ,,Royal Stars”, organizat pe 7 februarie la Botoșani. Am câștigat 4/6 meciuri.',
      // Modal Tabs
      'modal.tab.proba': 'Proba',
      'modal.tab.robot': 'Robot',
      'modal.tab.activitati': 'Activitati',
      'modal.tab.meeturi': 'Meeturi',
      // Team Members
      'member.1.name': 'Ina Cioata',
      'member.1.dept': 'Departamentul PR&Fotograf',
      'member.2.name': 'Ahire Simona',
      'member.2.dept': 'Departamentul Marketing&PR',
      'member.3.name': 'Tocariuc Nicoleta',
      'member.3.dept': 'Departamentul Marketing&PR',
      'member.4.name': 'Diaconu Mihaita',
      'member.4.dept': 'Departamentul Hardware&Web Developer',
      'member.5.name': 'Gospodin Rares',
      'member.5.dept': 'Departamentul Hardware',
      'member.6.name': 'Padurarau Natalia',
      'member.6.dept': 'Departamentul Software',
      'member.7.name': 'Mandru Stefan',
      'member.7.dept': 'Departamentul Hardware',
      'member.8.name': 'Arnaut Crina',
      'member.8.dept': 'Departamentul Hardware',
      'member.9.name': 'Averchi Radu',
      'member.9.dept': 'Departamentul Designer Grafic',
      'member.10.name': 'Rascanu Maria',
      'member.10.dept': 'Departamentul Marketing&PR',
      // Season 2023-2024
      'season.2023-2024.proba': `
                 <div class="row">
                    <div class="col-md-6">
                        <h4>FTC Challenge: CENTERSTAGE 🎭</h4>
                        <p>Sezonul 2023-2024, prezentat de RTX, a fost despre <strong>ARTĂ</strong> și <strong>TEHNOLOGIE</strong>. Roboții au trebuit să colecteze "pixeli" hexagonali și să-i plaseze pe un Backdrop înclinat pentru a crea mozaicuri artistice.</p>
                        <div class="mt-3">
                            <h5>Phase 1: Autonomous (30s)</h5>
                            <ul>
                                <li>Detectarea elementului de echipă (Team Prop) folosind camere video.</li>
                                <li>Plasarea pixelului violet pe poziția corectă (Spike Mark).</li>
                                <li>Deplasarea către Backdrop și plasarea pixelului galben.</li>
                                <li>Parcarea în zona de Backstage.</li>
                            </ul>
                            <h5>Phase 2: TeleOp (2m)</h5>
                            <ul>
                                <li>Colectarea pixelilor de pe teren sau din zona de alimentare (Wing).</li>
                                <li>Trecerea pe sub porțile centrale (Rigging).</li>
                                <li>Plasarea pixelilor pe Backdrop pentru a forma linii și mozaicuri.</li>
                            </ul>
                            <h5>Phase 3: Endgame (30s)</h5>
                            <ul>
                                <li>Suspendarea robotului de barele orizontale (Rigging).</li>
                                <li>Lansarea "Dronei" (avion de hârtie) în zonele de punctaj (Zona 1, 2 sau 3).</li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-md-6 text-center">
                        <img src="assets/img/ftc-challenge.png" class="img-fluid rounded shadow-lg mb-3 animate-on-scroll" alt="CenterStage Field">
                        <img src="teren/20241.png" class="img-fluid rounded shadow-sm mb-2" alt="Detaliu Joc 1">
                        <img src="teren/20242.png" class="img-fluid rounded shadow-sm" alt="Detaliu Joc 2">
                    </div>
                 </div>`,
      'season.2023-2024.robot': `
            <div class="robot-section">
              <div class="robot-media">
                 <img src="assets/roboti/2024.png" class="robot-image" alt="Robot Puiu">
              </div>
              <div class="robot-content">
                <h4 class="robot-title">Robotul "Puiu" v3.0</h4>
                      <p>În cadrul evoluției robotului nostru, un aspect deosebit de important este dezvoltarea și perfecționarea sistemelor de locomoție. În acest sens, baza robotului nostru a rămas neschimbată în acest sezon, păstrând caracteristicile tehnologice și de performanță ale roților de tip Mecanum. Astfel, echipa noastră a pus accent asupra altor aspecte ale dezvoltării robotului, știind că baza sa de mișcare este solidă și eficientă.</p>
                      <p>Procesul de dezvoltare a cleștelui pentru prinderea a doi pixeli simultan a fost unul plin de provocări și inovație, începând de la concepția inițială a cleștelui cu separator în mijloc, care ar fi permis prinderea simultană a doi pixeli, la realizarea sa practică care s-a dovedit a fi total diferită. Primul meet de la Brăila a fost momentul care ne-a confruntat cu realitatea și ne-a forțat să regândim complet conceptul nostru inițial. Cleștele cu separator pe mijloc nu a fost o soluție viabilă în practică, iar această conștientizare ne-a condus către o abordare radical noua.</p>
                      <p>Pentru înlocuirea cleștelui am explorat mai multe opțiuni, iar lopățica a devenit alegerea noastră finală. Inițial, am creat-o din plexiglas și am lipit-o cu superglue, o idee spontană care a fost înlocuită imediat de o lopățică printată. Un aspect imporant al lopățicii sunt suporții plasați la baza acesteia, suporți ce țin pixelii în loc, evitând posibilul risc de a cădea unde nu dorim. De asemenea, având posibilitatea de a ține pixelii în loc, autonomia era avantajată, deoarece cunoșteam poziția pixelilor în lopățică. Pentru partea superioară a lopățicii, am ales să folosim în continuare plexiglasul, pentru a facilita vizibilitatea și pentru a permite operatorului să vadă clar momentul prinderii a doi pixeli.</p>
                      <p>În faza inițială a proiectului nostru pentru lansatorul de avioane, am avut în vedere o soluție ce implica folosirea unui mecanism bazat pe elastic și plexiglas. Cu toate acestea, pe măsură ce am analizat mai atent cerințele și fezabilitatea, am concluzionat că o abordare alternativă ar fi mai potrivită pentru nevoile noastre. Astfel, am decis să ne orientăm către printarea 3D a unui lansator, însă rezultatele nu au fost conform așteptărilor noastre.</p>
                      <p>Din această cauză, am revenit la conceptul inițial care implica utilizarea elasticului ca principală sursă de energie pentru lansator, însă de data aceasta am optat pentru un sistem mai simplu și mai eficient. Lansatorul nostru de avioane utilizează un elastic atașat de un cârlig, iar acesta din urmă este conectat la un servo. Funcționarea este intuitivă: servo-ul acționează cârligul, eliberând astfel elasticul și propulsând avionul în aer.</p>
                      <p>După participarea la primul meet din acel sezon, am decis să dăm o șansă ideii de parcare suspendată și am început să o punem în practică. După mai multe idei testate, am ajuns la una finală, care presupunea utilizarea a două lifturi, plasate pe fiecare parte a robotului. Neavând posibilitatea de a cumpăra lifturile am creat propriul nostru concept cu ață și rulmenți.</p>
                    </div>
                </div>`,
      'season.2023-2024.activitati': `
                  <div class="activity-grid">
                    <article class="activity-card">
                      <div class="activity-media">
                        <img src="assets/img/2023/activitati/ac1.png" class="activity-img" alt="Halloween">
                      </div>
                      <div class="activity-body">
                        <h5 class="activity-title">🎃 Halloween - robot in tema de sarbatoare</h5>
                        <p class="activity-text">De Halloween am adaptat aspectul robotului nostru in tema de sarbatoare, pentru a fi si in ton cu tehnologia, dar si cu distractia.</p>
                      </div>
                    </article>
                    <article class="activity-card">
                      <div class="activity-media">
                        <img src="assets/img/2023/activitati/ac2.png" class="activity-img" alt="Femei si fete in stiinta">
                      </div>
                      <div class="activity-body">
                        <h5 class="activity-title">🔬 11 februarie - Ziua Internationala a Femeilor si a Fetelor in Stiinta</h5>
                        <p class="activity-text">Am sarbatorit Ziua Internationala a Femeilor si a Fetelor in Stiinta, apreciind implicarea fetelor in teme precum cercetarea.</p>
                      </div>
                    </article>
                    <article class="activity-card">
                      <div class="activity-media">
                        <img src="assets/img/2023/activitati/ac3.png" class="activity-img" alt="Martisoare">
                      </div>
                      <div class="activity-body">
                        <h5 class="activity-title">🌸 1 martie - Martisoare cu Puiu</h5>
                        <p class="activity-text">Ziua de 1 martie a fost celebrata prin confectionarea martisoarelor in care Puiu a fost in centrul atentiei. Aceste simboluri ale primaverii au adus zambete pe chipul elevilor, al doamnei mentor si al doamnei director.</p>
                      </div>
                    </article>
                  </div>`,
      'season.2023-2024.meeturi': `
                 <div class="accordion" id="meeturiAccordion">
                   <div class="card mb-4 border-0 shadow-sm">
                    <div class="card-header bg-white text-primary p-3">
                      <div class="d-flex justify-content-between align-items-center">
                         <h5 class="mb-0">13 Ian - Braila</h5>
                      </div>
                    </div>
                    <div class="card-body p-4">
                      <p>roLERbot a participat la primul sau meet din sezon nu a inceput intocmai cum am fi vrut, insa a fost spre imbunatatirea robotului. Pentru proba de atunci, bratul si barele de sustinere erau prea inalte pentru a incapea sub poarta, ceea ce ducea adesea la blocarea robotului in timpul perioadei autonome.</p>
                      <p>Cleștele, ulterior inlocuit cu o lopata, nu reușea să prindă doi pixeli simultan, ci doar câte unul, cu o probabilitate ridicată de eșec în a-i plasa pe panou. Nu am obținut victorii propriu zise, dar am putut să lucrăm atât partea de hardware cat și de software a lui Puiu, pentru meet-urile viitoare.</p>
                    </div>
                   </div>
                 </div>`,
      // Season 2024-2025
      'season.2024-2025.proba': `
                 <div class="row">
                    <div class="col-md-6">
                        <h4>FTC Challenge: INTO THE DEEP 🌊</h4>
                        <p>Sezonul 2024-2025 aduce roboții în lumea submarină! Echipele trebuie să colecteze și să plaseze <strong>EȘANTIOANE</strong> în diferite zone de scufundare, simulând explorarea oceanelor.</p>
                        <div class="mt-3">
                            <h5>Phase 1: Autonomous (30s)</h5>
                            <ul>
                                <li>Detectarea eșantionului de echipă folosind computer vision.</li>
                                <li>Plasarea specimen-ului în coșul de scufundare (Submersible).</li>
                                <li>Navigarea către zonele de punctaj și plasarea eșantioanelor.</li>
                                <li>Parcarea în zona Observation Zone.</li>
                            </ul>
                            <h5>Phase 2: TeleOp (2m)</h5>
                            <ul>
                                <li>Colectarea specimen-urilor de pe fundul oceanului.</li>
                                <li>Ridicarea și plasarea eșantioanelor în High Chamber și Low Chamber.</li>
                                <li>Colectarea algelor și plasarea lor în Net Zone.</li>
                            </ul>
                        </div>
                    </div>
                 </div>`,
      'season.2024-2025.robot': `
                 <div class="robot-section">
                   <div class="robot-media">
                     <img src="assets/roboti/2025.png" alt="Robot Puiu 2024" class="robot-image">
                   </div>
                    <div class="robot-content">
                        <h4 class="robot-title">Robotul "Puiu" v4.0 - Deep Diver</h4>
                        <p>Baza robotului reprezintă fundația pe care se construiesc toate celelalte mecanisme. Este formată dintr-un șasiu rigid și ușor, optimizat pentru stabilitate și mobilitate pe terenul de joc.</p>
                    </div>
                 </div>`,
      'season.2024-2025.activitati': `
                  <div class="activity-grid">
                    <article class="activity-card">
                      <div class="activity-media">
                        <img src="assets/img/2024/activitati/ac1.png" class="activity-img" alt="Targul Educational">
                      </div>
                      <div class="activity-body">
                        <h5 class="activity-title">🎓 Targul Educational</h5>
                        <p class="activity-meta">11-12 aprilie 2024</p>
                        <p class="activity-text">Anual, inca de la infiintarea echipei, suntem prezenti la targul educational organizat de CJRAE Vaslui.</p>
                      </div>
                    </article>
                  </div>`,
      'season.2024-2025.meeturi': `
                 <div class="accordion" id="meeturiAccordion2024">
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Xmas Robo Stone - Piatra Neamt</h5>
                            <span class="badge bg-primary rounded-pill px-3 py-2">21 decembrie</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                       <p>Primul meet al sezonului. Am castigat doua meciuri, am inceput si am terminat cu cate o victorie.</p>
                     </div>
                   </div>
                 </div>`,
      // Season 2025-2026
      'season.2025-2026.proba': `
                <div class="row">
                    <div class="col-md-6">
                        <h4>FTC Challenge: DECODE 🧩</h4>
                        <p>Sezonul FTC 2025-2026, <strong>DECODE</strong>, este axat pe <strong>colectarea, sortarea și lansarea artefactelor</strong>.</p>
                    </div>
                </div>`,
      'season.2025-2026.robot': `
                <div class="robot-section">
                  <div class="robot-media">
                     <img src="assets/roboti/2026.png" alt="Robot Puiu 2025" class="robot-image">
                  </div>
                  <div class="robot-content">
                    <h4 class="robot-title">Robotul "Puiu"</h4>
                    <p>Puiu a trecut prin numeroase schimbari, evoluand de la o competitie la alta.</p>
                  </div>
                </div>`,
      'season.2025-2026.activitati': `
                 <div class="activity-grid">
                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac1.jpg" class="activity-img" alt="Targ educational">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🎓 Ediția a XXVI-a a Târgului educațional</h5>
                      <p class="activity-meta">15-16 aprilie</p>
                    </div>
                  </article>
                 </div>`,
      'season.2025-2026.meeturi': `
                <div class="accordion" id="meeturiAccordion2025">
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Piatra Neamț - „Jurassic Peaks”</h5>
                            <span class="badge bg-primary rounded-pill px-3 py-2">10 ianuarie</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                       <p>Primul meet al sezonului, cu 4 victorii din 6 meciuri.</p>
                     </div>
                   </div>
                </div>`
    },
    en: {
      pageTitleIndex: 'roLERbot - Robotics Team',
      pageTitleBlog: 'roLERbot - Blog & Activities',
      'nav.home': 'Home',
      'nav.team': 'Team',
      'nav.sponsors': 'Sponsors',
      'nav.progress': 'Progress',
      'nav.blog': 'Blog',
      'nav.ftcGame': 'FTC 1v1 Game',
      'nav.activities': 'Activities',
      'nav.contact': 'Contact',
      'hero.learnMore': 'Learn more',
      'section.team': 'Team',
      'section.teamSubtitle': 'Born for innovation.',
      'team.desc1': 'roLERbot, the robotics team of the "Emil Racoviță" Theoretical High School in Vaslui, brings together 12 official members and volunteers passionate about technology, engineering, and innovation.',
      'team.desc2': 'With a collaborative approach and a performance-oriented vision, the team designs, builds, and programs the robot for the First Tech Challenge competition while promoting STEAM education in the local community.',
      'team.desc3': 'roLERbot combines creativity with technical rigor, reflecting the innovative spirit of the high school students.',
      'section.sponsors': 'Sponsors',
      'section.progress': 'Progress',
      'timeline.1.date': 'October 14, 2018',
      'timeline.1.title': 'Passion That United Us',
      'timeline.1.desc': 'The roLERbot team appeared in 2018, from the desire of young people passionate about exact sciences to turn their ideas into reality. Who are we? We are roLERbot – motivated, ambitious, and united by a passion for technology. Through the Rover Ruckus program, we entered the world of Tech Challenges, determined to leave a mark in the field of innovation.',
      'timeline.2.date': 'February 20, 2019',
      'timeline.2.title': 'First Step, First Success',
      'timeline.2.desc': 'In 2019, the roLERbot team, consisting of 15 students, obtained its first qualification for the national stage of the BRD First Tech Challenge Romania competition. After three intense days in Iași, emotions were replaced by the joy of success. Our robot, built with a lot of work and dedication, worked perfectly, reflecting the daily effort put in by the team, even during holidays. With a lot of enthusiasm, a sense of humor (proven by the robot\'s name – "Puiu"), and a desire to evolve, we set off for the final in Bucharest, ready to demonstrate that passion and team spirit can go far, even at our first contact with this technological universe.',
      'timeline.3.date': 'March 11, 2024',
      'timeline.3.title': 'A New Day, a New Award',
      'timeline.3.desc': 'The third day, March 11, 2024, brought smiles to our faces! After two days full of emotions, challenges, and intense moments, Regional 4 in Iași ended with great joy for the roLERbot team: we won The Judges Award. We are very proud of our evolution, the robot built, and everything we managed to achieve this season. In the three days, we made friends, laughed, got annoyed, danced, and lived every moment to the maximum intensity. We went home tired, but with hearts full of gratitude and with the team more united than ever.',
      'timeline.4.date': 'January 19, 2025',
      'timeline.4.title': 'A Success That Inspires Us',
      'timeline.4.desc': 'Today, January 19, 2025, we end the regional competition with our heads high, after winning 4 out of 6 matches and demonstrating determination, creativity, and spirit of team. We are extremely proud to announce that we obtained the Design Award – 3rd Place, a distinction that highlights the balance between functionality and aesthetics in our robot\'s construction. This award recognizes teams that transform a robot into a true technological work of art through an innovative, well-planned design, executed with care and precision.',
      'timeline.final': 'Be part<br>of the<br>story',
      'section.blog': 'Blog',
      'section.blogSubtitle': 'Articles and updates from the roLERbot team',
      'blog.viewAll': 'See all articles',
      'footer.desc': 'The robotics team of the "Emil Racoviță" Theoretical High School, Vaslui. Passionate about technology, innovation, and FIRST Tech Challenge competitions.',
      'footer.nav': 'Navigation',
      'footer.resources': 'Resources',
      'footer.contact': 'Contact',
      'footer.location': 'Theoretical High School<br>„Emil Racoviță" Vaslui',
      'footer.copyright': '&copy; 2024 roLERbot. All rights reserved.',
      'footer.made_by': 'Site created by Diaconu Mihăiță',
      'footer.privacy': 'Privacy Policy',
      'footer.terms': 'Terms and Conditions',
      'blog.skipLink': 'Skip to content',
      'blog.masthead': 'Blogs',
      'blog.teamTitle': 'Meet the Team',
      'blog.teamSubtitle': 'roLERbot Members',
      'blog.activitiesTitle': 'Activities & Competitions',
      'blog.activitiesSubtitle': 'Explore documentation for each season.',
      'game.redScore': 'RED',
      'game.blueScore': 'BLUE',
      'game.pressStart': 'Press START',
      'game.redControl': 'Red Control (1v1)',
      'game.blueControl': 'Blue Control (1v1)',
      'game.rules': 'Quick Rules (FTC 1v1)',
      'game.move': 'move',
      'game.action': 'take piece / shoot',
      'game.rule1': 'Balls appear on the white lines on the field.',
      'game.rule2': 'Red scores in the red square, blue in the blue square.',
      'game.back': 'Back to site',
      // Index Blog Carousel
      'blog.card0.date': 'January 10, 2026',
      'blog.card0.title': 'MEET #1 - Piatra Neamt',
      'blog.card0.desc': 'The "Jurassic Peaks" meet, organized in Piatra Neamț on January 10, was our first meet of the season. We managed to win 4 out of 6 matches, a great start.',
      'blog.card1.date': 'January 11, 2026',
      'blog.card1.title': 'MEET #2 - Iasi',
      'blog.card1.desc': 'The "Defrost" meet, organized in Iași on January 11, was the second meet we attended. Although we won 2/6 matches, we noticed several design flaws.',
      'blog.card2.date': 'January 24, 2026',
      'blog.card2.title': 'MEET #3 - Focșani',
      'blog.card2.desc': 'At the "Focșani Tech Challenge" meet on January 24, we improved our strategy, winning 3/6 matches.',
      'blog.card3.date': 'January 31, 2026',
      'blog.card3.title': 'MEET #4 - Galati',
      'blog.card3.desc': 'The "Ice Age" meet on January 31 gave us the verdict on our robot\'s viability, winning 5/6 matches.',
      'blog.card4.date': 'February 7, 2026',
      'blog.card4.title': 'MEET #5 - Botosani',
      'blog.card4.desc': 'The last meet we attended was "Royal Stars", in Botoșani on February 7. We won 4/6 matches.',
      // Modal Tabs
      'modal.tab.proba': 'Challenge',
      'modal.tab.robot': 'Robot',
      'modal.tab.activitati': 'Activities',
      'modal.tab.meeturi': 'Meets',
      // Team Members
      'member.1.name': 'Ina Cioata',
      'member.1.dept': 'PR & Photographer Department',
      'member.2.name': 'Ahire Simona',
      'member.2.dept': 'Marketing & PR Department',
      'member.3.name': 'Tocariuc Nicoleta',
      'member.3.dept': 'Marketing & PR Department',
      'member.4.name': 'Diaconu Mihaita',
      'member.4.dept': 'Hardware & Web Developer Department',
      'member.5.name': 'Gospodin Rares',
      'member.5.dept': 'Hardware Department',
      'member.6.name': 'Padurarau Natalia',
      'member.6.dept': 'Software Department',
      'member.7.name': 'Mandru Stefan',
      'member.7.dept': 'Hardware Department',
      'member.8.name': 'Arnaut Crina',
      'member.8.dept': 'Hardware Department',
      'member.9.name': 'Averchi Radu',
      'member.9.dept': 'Graphic Designer Department',
      'member.10.name': 'Rascanu Maria',
      'member.10.dept': 'Marketing & PR Department',
      // Season 2023-2024
      'season.2023-2024.proba': `
                 <div class="row">
                    <div class="col-md-6">
                        <h4>FTC Challenge: CENTERSTAGE 🎭</h4>
                        <p>The 2023-2024 season, presented by RTX, was about <strong>ART</strong> and <strong>TECHNOLOGY</strong>. Robots had to collect hexagonal "pixels" and place them on an inclined Backdrop to create artistic mosaics.</p>
                        <div class="mt-3">
                            <h5>Phase 1: Autonomous (30s)</h5>
                            <ul>
                                <li>Team Prop detection using video cameras.</li>
                                <li>Placing the purple pixel on the correct Spike Mark.</li>
                                <li>Moving to the Backdrop and placing the yellow pixel.</li>
                                <li>Parking in the Backstage area.</li>
                            </ul>
                            <h5>Phase 2: TeleOp (2m)</h5>
                            <ul>
                                <li>Collecting pixels from the field or the Wing area.</li>
                                <li>Passing under the central Rigging gates.</li>
                                <li>Placing pixels on the Backdrop to form lines and mosaics.</li>
                            </ul>
                            <h5>Phase 3: Endgame (30s)</h5>
                            <ul>
                                <li>Suspending the robot from horizontal Rigging bars.</li>
                                <li>Launching the "Drone" (paper airplane) into scoring zones (Zone 1, 2, or 3).</li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-md-6 text-center">
                        <img src="assets/img/ftc-challenge.png" class="img-fluid rounded shadow-lg mb-3 animate-on-scroll" alt="CenterStage Field">
                    </div>
                 </div>`,
      'season.2023-2024.robot': `
            <div class="robot-section">
              <div class="robot-media">
                 <img src="assets/roboti/2024.png" class="robot-image" alt="Robot Puiu">
              </div>
              <div class="robot-content">
                <h4 class="robot-title">Robot "Puiu" v3.0</h4>
                      <p>In our robot's evolution, a particularly important aspect is the development and refinement of locomotion systems. In this regard, our robot's base remained unchanged this season, keeping the technological and performance characteristics of Mecanum wheels.</p>
                      <p>The development process of the clamp for catching two pixels simultaneously was full of challenges and innovation, starting from the initial concept of a clamp with a separator in the middle.</p>
                      <p>For the replacement of the clamp, we explored several options, and the "scoop" became our final choice. Initially, we created it from plexiglass, then replaced it with a 3D printed version.</p>
                    </div>
                </div>`,
      'season.2023-2024.activitati': `
                  <div class="activity-grid">
                    <article class="activity-card">
                      <div class="activity-body">
                        <h5 class="activity-title">🎃 Halloween Theme</h5>
                        <p class="activity-text">For Halloween, we adapted our robot's appearance to a holiday theme, blending technology with fun.</p>
                      </div>
                    </article>
                    <article class="activity-card">
                      <div class="activity-body">
                        <h5 class="activity-title">🔬 February 11 - Int. Day of Women and Girls in Science</h5>
                        <p class="activity-text">We celebrated the International Day of Women and Girls in Science, appreciating their involvement in research.</p>
                      </div>
                    </article>
                  </div>`,
      'season.2023-2024.meeturi': `
                 <div class="accordion" id="meeturiAccordion">
                   <div class="card mb-4 border-0 shadow-sm">
                    <div class="card-header bg-white text-primary p-3">
                      <h5 class="mb-0">Jan 13 - Braila</h5>
                    </div>
                    <div class="card-body p-4">
                      <p>roLERbot participated in its first meet of the season. Although it didn't start exactly as we wanted, it helped improve the robot's design.</p>
                    </div>
                   </div>
                 </div>`,
      // Season 2024-2025
      'season.2024-2025.proba': `
                 <div class="row">
                    <div class="col-md-6">
                        <h4>FTC Challenge: INTO THE DEEP 🌊</h4>
                        <p>The 2024-2025 season brings robots to the underwater world! Teams must collect and place <strong>SAMPLES</strong> in different diving zones, simulating ocean exploration.</p>
                    </div>
                 </div>`,
      'season.2024-2025.robot': `
                 <div class="robot-section">
                   <div class="robot-media">
                     <img src="assets/roboti/2025.png" alt="Robot Puiu 2024" class="robot-image">
                   </div>
                    <div class="robot-content">
                        <h4 class="robot-title">Robot "Puiu" v4.0 - Deep Diver</h4>
                        <p>The robot's base is the foundation for all other mechanisms. It consists of a rigid and light chassis, optimized for stability and mobility on the field.</p>
                    </div>
                 </div>`,
      'season.2024-2025.activitati': `
                  <div class="activity-grid">
                    <article class="activity-card">
                      <div class="activity-body">
                        <h5 class="activity-title">🎓 Educational Fair</h5>
                        <p class="activity-meta">April 11-12, 2024</p>
                        <p class="activity-text">Annually, since the team's founding, we are present at the educational fair organized by CJRAE Vaslui.</p>
                      </div>
                    </article>
                  </div>`,
      'season.2024-2025.meeturi': `
                 <div class="accordion" id="meeturiAccordion2024">
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <h5 class="mb-0">Xmas Robo Stone - Piatra Neamt</h5>
                        <span class="badge bg-primary rounded-pill px-3 py-2">Dec 21</span>
                     </div>
                     <div class="card-body p-4">
                       <p>The first meet of the season. We won two matches, starting and ending with a victory.</p>
                     </div>
                   </div>
                 </div>`,
      // Season 2025-2026
      'season.2025-2026.proba': `
                <div class="row">
                    <div class="col-md-6">
                        <h4>FTC Challenge: DECODE 🧩</h4>
                        <p>The 2025-2026 FTC season, <strong>DECODE</strong>, focuses on <strong>collecting, sorting, and launching artifacts</strong>.</p>
                    </div>
                </div>`,
      'season.2025-2026.robot': `
                <div class="robot-section">
                  <div class="robot-media">
                     <img src="assets/roboti/2026.png" alt="Robot Puiu 2025" class="robot-image">
                  </div>
                  <div class="robot-content">
                    <h4 class="robot-title">Robot "Puiu"</h4>
                    <p>Puiu has undergone numerous changes, evolving from one competition to another.</p>
                  </div>
                </div>`,
      'season.2025-2026.activitati': `
                 <div class="activity-grid">
                  <article class="activity-card">
                    <div class="activity-body">
                      <h5 class="activity-title">🎓 26th Edition of the Educational Fair</h5>
                      <p class="activity-meta">April 15-16</p>
                    </div>
                  </article>
                 </div>`,
      'season.2025-2026.meeturi': `
                <div class="accordion" id="meeturiAccordion2025">
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <h5 class="mb-0">Piatra Neamț - "Jurassic Peaks"</h5>
                        <span class="badge bg-primary rounded-pill px-3 py-2">Jan 10</span>
                     </div>
                     <div class="card-body p-4">
                       <p>First meet of the season, with 4 wins out of 6 matches.</p>
                     </div>
                   </div>
                </div>`
    }
  };

  const syncLanguageControls = (selectedLanguage) => {
    const isEnglish = (selectedLanguage === 'en');
    const toggleInput = document.getElementById('languageToggleInput');
    const switchContainer = document.querySelector('.language-switcher');
    const legacySwitcher = document.getElementById('languageSwitcher');

    if (legacySwitcher) legacySwitcher.value = selectedLanguage;
    if (toggleInput) toggleInput.checked = isEnglish;
    if (switchContainer) {
      switchContainer.classList.toggle('is-en', isEnglish);
      switchContainer.classList.toggle('is-ro', !isEnglish);
    }
  };

  const applyLanguage = (language) => {
    console.log("roLERbot i18n: Applying language:", language);
    const selected = dictionaries[language] ? language : 'ro';
    const dict = dictionaries[selected];

    document.documentElement.lang = selected;

    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      if (!key || !dict[key]) return;

      if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
        if (node.hasAttribute('placeholder')) node.setAttribute('placeholder', dict[key]);
      } else {
        if (key.includes('.desc') || key.includes('final') || key.includes('copyright') || key.includes('location') || key.includes('season')) {
          node.innerHTML = dict[key];
        } else {
          node.textContent = dict[key];
        }
        if (node.hasAttribute('aria-label')) node.setAttribute('aria-label', dict[key]);
      }
    });

    // Custom event for dynamic components to re-translate
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: selected } }));

    const isBlogPage = window.location.pathname.toLowerCase().includes('blog.html');
    const isGamePage = window.location.pathname.toLowerCase().includes('ftc-decode-1v1.html');

    if (isGamePage) {
      document.title = 'FTC DECODE 1v1 - roLERbot';
    } else {
      document.title = isBlogPage ? dict.pageTitleBlog : dict.pageTitleIndex;
    }

    syncLanguageControls(selected);
  };

  const setLanguage = (language) => {
    console.log("roLERbot i18n: User requested language change to:", language);
    localStorage.setItem('siteLanguage', language);
    applyLanguage(language);
  };

  // Expose globally for debugging or legacy calls
  window.setLanguage = setLanguage;
  window.i18nDictionaries = dictionaries;
  window.applyLanguage = applyLanguage;
  window.translate = (key) => {
    const lang = localStorage.getItem('siteLanguage') || 'ro';
    return dictionaries[lang][key] || dictionaries['ro'][key] || key;
  };

  const storedLanguage = localStorage.getItem('siteLanguage') || 'ro';
  applyLanguage(storedLanguage);

  // Click delegation for the language switcher buttons
  document.addEventListener('click', (e) => {
    const sideBtn = e.target.closest('[data-set-lang]');
    if (sideBtn) {
      console.log("roLERbot i18n: Side button clicked:", sideBtn.getAttribute('data-set-lang'));
      e.preventDefault();
      e.stopPropagation();
      setLanguage(sideBtn.getAttribute('data-set-lang'));
      return;
    }
  });

  // Listener for the toggle input
  document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'languageToggleInput') {
      console.log("roLERbot i18n: Toggle changed to:", e.target.checked ? "en" : "ro");
      setLanguage(e.target.checked ? 'en' : 'ro');
    }
    if (e.target && e.target.id === 'languageSwitcher') {
      setLanguage(e.target.value);
    }
  });

  console.log("roLERbot i18n: Initialization logic complete.");
};

// Start initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}
