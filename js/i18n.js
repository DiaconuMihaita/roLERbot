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
      'nav.ftcGame': 'Înapoi',
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
      'footer.creator': '<span class="text-primary">Site realizat de Diaconu Mihăiță</span>',
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
      'modal.seasonPrefix': 'Sezon',
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
                    <article class="activity-card">
                      <div class="activity-media">
                        <img src="assets/img/2023/activitati/ac4.png" class="activity-img" alt="Robotica: La granita dintre inginerie si tehnologie">
                      </div>
                      <div class="activity-body">
                        <h5 class="activity-title">🤖 Robotica: La granita dintre inginerie si tehnologie</h5>
                        <p class="activity-text">Am sustinut prezentari si meciuri FTC demonstrative dedicate comunitatii noastre. Am aratat ca robotica nu inseamna doar asamblarea unor piese, ci si pasiune, colaborare si dorinta de a inova.</p>
                      </div>
                    </article>
                  </div>`,
      'season.2023-2024.meeturi': `
                <div class="accordion" id="meeturiAccordion2324">
                   <!-- Meet 1 -->
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Meet 1 - Brăila</h5>
                            <span class="badge bg-primary rounded-pill px-3 py-2">13 ianuarie</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                       <p>roLERbot a participat la primul sau meet din sezon; nu a inceput intocmai cum am fi vrut, insa a fost spre imbunatatirea robotului. Pentru proba de atunci, bratul si barele de sustinere erau prea inalte pentru a incapea sub poarta, ceea ce ducea adesea la blocarea robotului in timpul perioadei autonome.</p>
                       <p>Cleștele, ulterior inlocuit cu o lopata, nu reușea să prindă doi pixeli simultan, ci doar câte unul, cu o probabilitate ridicată de eșec în a-i plasa pe panou.</p>
                     </div>
                   </div>

                   <!-- Meet 2 -->
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Meet 2 - Focșani</h5>
                            <span class="badge bg-primary rounded-pill px-3 py-2">20 ianuarie</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                       <p>Al doilea meet a fost marcat de evoluție și adaptare. Am reușit să rezolvăm o parte din problemele mecanice și să îmbunătățim precizia robotului în timpul meciurilor.</p>
                     </div>
                   </div>

                   <!-- Meet 3 -->
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Meet 3 - Iași</h5>
                            <span class="badge bg-primary rounded-pill px-3 py-2">3 februarie</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                       <p>La Iași am demonstrat o consistență mai mare în performanță, reușind să colaborăm eficient cu aliații noștri pentru a obține puncte valoroase.</p>
                     </div>
                   </div>

                   <!-- Regionala -->
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Regionala - Iași</h5>
                            <span class="badge bg-success rounded-pill px-3 py-2">9-11 martie 2024</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                       <p>Regionala de la Iași a fost punctul culminant al sezonului. Am trăit emoții intense, am legat prietenii și am învățat enorm din fiecare meci. Am fost mândri să primim „The Judges Award” ca recunoaștere a parcursului nostru.</p>
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
                            <h5>Phase 3: Endgame (30s)</h5>
                            <ul>
                                <li>Urcarea robotului pe prima sau a doua treaptă a Submersible.</li>
                                <li>Bonus: Suspended - robotul suspendat complet fără contact cu solul.</li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-md-6 text-center">
                        <img src="assets/img/2024/meet/field-2024.jpg" class="img-fluid rounded shadow-lg mb-3 animate-on-scroll" alt="Into The Deep Field">
                        <img src="teren/20251.png" class="img-fluid rounded shadow-sm mb-2" alt="Detaliu Joc 1">
                        <img src="teren/20252.png" class="img-fluid rounded shadow-sm" alt="Detaliu Joc 2">
                    </div>
                 </div>`,
      'season.2024-2025.robot': `
                 <div class="robot-section">
                   <div class="robot-media">
                     <img src="assets/roboti/2025.png" alt="Robot Puiu 2024" class="robot-image">
                   </div>
                    <div class="robot-content">
                        <h4 class="robot-title">Robotul "Puiu" v4.0 - Deep Diver</h4>
                        <p>Baza robotului reprezintă fundația pe care se construiesc toate celelalte mecanisme. Este formată dintr-un șasiu rigid și ușor, optimizat pentru stabilitate și mobilitate pe terenul de joc, fiind dotată cu 3 dead wheels pentru odometrie, care permit localizarea precisă pe teren, esențială pentru perioada de autonomie. Mecanismul de roți pasive oferă o înaltă precizie în calcularea traiectoriei.</p>
                        <p>Am ales un sistem de roți mecanum care permite robotului să se deplaseze în orice direcție, având un control precis al mișcărilor laterale și diagonale. Alegerea s-a dovedit extrem de insipirată deoarece există deja o sumedenie de resurse în legătura cu fizica din spate. Pentru drive train, am optat pentru motoare GoBilda 312rpm, cu un cuplu de 4.14N/m, conectate la roți, transmisia facându-se prin pinioane conice. Designul actual oferă o combinație ideală între viteză și putere datorită noilor roților mecanum ce au circumferința mai mare.</p>
                        <p>Intake-ul este componenta care se ocupă cu colectarea obiectelor de pe teren. Este format din două sub-secțiuni principale: mecanismul propriu-zis de intake și patul de transfer. Se utilizează un sistem bazat pe un antebraț virtual acționat de doua servomotoare care au la capăt atașat un clește ce permite prinderea obiectelor și ridicarea lor de la nivelul solului cu ușurință. Am ales un sistem bazat pe antebraț virtual cu scopul de a menține cleștele mereu paralel cu solul pentru a evita folosirea a inca un servomotor care ar fi îngreunat robotul.</p>
                        <p>După colectare, obiectele sunt mutate pe un pat de transfer care le transportă către outtake. Patul este proiectat să mențină obiectele în poziție stabilă, indiferent de mișcările robotului. Am îmbunătățit mecanismul prin ajustarea unghiurilor de înclinare și optimizarea vitezelor pentru a asigura un flux constant.</p>
                        <p>Outtake-ul este responsabil pentru plasarea precisă a obiectelor în zonele desemnate. Este proiectat să funcționeze rapid și eficient, asigurând puncte valoroase în competiție.Brațul outtake-ului este pe un mecanism format din glisiere, construit dintr-o serie de segmente care se pot extinde și retrage cu ajutorul unor ațe puse pe scripeți și actionate de două motoare. Brațul este acționat de un servomotor cu transmisie pe curea care permite rotirea cleștelui prin pivot, și de un servomotor care facilitează mișcarea atât în direcția frontală, cât și în cea opusă. Am ales acest design pentru a putea atinge diferite înălțimi fără a compromite stabilitatea robotului.</p>
                        <p>La capătul brațului se află un clește acționat la rândul său de un servomotor, care poate apuca și elibera obiectele cu un control precis. Inițial, am avut dificultăți în prinderea sample-urilor, dar, după mai multe iterații am îmbunătățit designul cleștelui, adăugând un strat de cauciuc pentru aderență suplimentară. Pentru a asigura unghiuri de plasare precise, brațul include un pivot care permite rotația pentru manipularea sample-urilor. Am amplasat servomotorul care acționează pivotul la baza brațului pentru a nu-i îngreuna partea de sus. Funcționalitatea adaugă flexibilitate în amplasarea lor, indiferent de poziția robotului pe teren.</p>
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
                      <p class="activity-text">Reprezentand Liceul Teoretic "Emil Racovita" Vaslui, am prezentat robotul, echipa si competitia FIRST Tech Challenge.</p>
                      <p class="activity-text">Evenimentul este important pentru noi: multi membri si alumni s-au alaturat echipei dupa ce ne-au vazut aici.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2024/activitati/ac2.png" class="activity-img" alt="Robotica la granita dintre inginerie si tehnologie">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🤖 Robotica: La granita dintre inginerie si tehnologie</h5>
                      <p class="activity-meta">16 august 2024</p>
                      <p class="activity-text">Am organizat activitatea in parteneriat cu Primaria Vaslui, cu ocazia Zilelor Culturale ale Municipiului.</p>
                      <p class="activity-text">Am jucat un meci demonstrativ cu echipa Orion si am explicat ce inseamna cu adevarat FTC.</p>
                      <p class="activity-text">La final am primit un premiu de recunostinta din partea Primariei Municipiului Vaslui.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2024/activitati/ac3.png" class="activity-img" alt="Gala Tanarului Vasluian">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🏆 Gala Tanarului Vasluian</h5>
                      <p class="activity-meta">2024</p>
                      <p class="activity-text">Echipa roLERbot a fost premiata la categoria "Implicare si Solidaritate".</p>
                      <p class="activity-text">Premiul a fost oferit de Federatia Tinerilor din Vaslui, Vaslui Capitala Tineretului si Primaria Vaslui.</p>
                      <p class="activity-text">Este o recunoastere a eforturilor de a aduce educatia STEAM mai aproape de comunitate.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2024/activitati/ac4.png" class="activity-img" alt="Targul de hobby-uri">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🎨 Targul de hobby-uri</h5>
                      <p class="activity-meta">13-14 decembrie 2024</p>
                      <p class="activity-text">Am aratat vizitatorilor ca robotica nu inseamna doar suruburi si cod, ci si echipa, creativitate si perseverenta.</p>
                      <p class="activity-text">In FTC nu asamblam doar roboti, ci formam familii si invatam colaborarea.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2024/activitati/ac5.png" class="activity-img" alt="Proiectul Puiu Eco-Clean">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">♻️ Proiectul Puiu: Eco-Clean</h5>
                      <p class="activity-meta">2024</p>
                      <p class="activity-text">Am evidentiat impactul pozitiv al tehnologiei in combaterea problemelor de mediu.</p>
                      <p class="activity-text">Robotul Puiu este un exemplu practic al modului in care robotii pot ajuta la colectarea si gestionarea deseurilor.</p>
                      <p class="activity-text">Proiectul este un apel la responsabilitate si actiune pentru un viitor mai curat.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2024/activitati/ac6.png" class="activity-img" alt="3D Print(re) elevi">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🧩 3D Print(re) elevi</h5>
                      <p class="activity-meta">30 septembrie si 3 octombrie 2024</p>
                      <p class="activity-text">Proiectul "3D Print(re) elevi" a adus printarea 3D mai aproape de elevii liceului.</p>
                      <p class="activity-text">Participantii au invatat Blender si Tinkercad si au vazut cum modelele devin obiecte reale.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2024/activitati/ac7.png" class="activity-img" alt="Robot in 20 hours">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">⏱️ Robot in 20 hours</h5>
                      <p class="activity-meta">29-30 noiembrie si 7-8 decembrie 2024</p>
                      <p class="activity-text">Am participat la proiectul organizat de echipa Orion, in colaborare cu Federatia Tinerilor din Vaslui.</p>
                      <p class="activity-text">Grupuri de copii ne-au vizitat si le-am prezentat competitia FTC si valorile Gracious Professionalism.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2024/activitati/ac8.png" class="activity-img" alt="STEM la Feminin">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">👩‍🔬 STEM la Feminin</h5>
                      <p class="activity-meta">29 noiembrie 2024</p>
                      <p class="activity-text">Eveniment dedicat promovarii egalitatii de gen si incurajarii tinerelor in STEAM.</p>
                      <p class="activity-text">Discutiile au abordat egalitatea de sansa, provocarile si oportunitatile pentru fete si femei.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2024/activitati/ac9.png" class="activity-img" alt="Parteneriate cu scolile gimnaziale">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🤝 Parteneriate cu scolile gimnaziale</h5>
                      <p class="activity-meta">2024-2025</p>
                      <p class="activity-text">Extindem anual parteneriatele pentru a incuraja echipe FIRST LEGO League si mentorat.</p>
                      <p class="activity-text">Povestile impartasite de profesori ne confirma impactul pozitiv in comunitate.</p>
                    </div>
                  </article>
                </div>`,
      'season.2024-2025.meeturi': `
                <div class="accordion" id="meeturiAccordion2024">
                   <!-- Meet 1 -->
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Xmas Robo Stone - Piatra Neamț</h5>
                            <span class="badge bg-primary rounded-pill px-3 py-2">21 decembrie</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                       <p>Primul meet al sezonului. Am castigat doua meciuri, am inceput si am terminat cu cate o victorie.</p>
                       <p>Desi eram demoralizati, ne-am incurajat si am vazut pierderile ca oportunitati de a ne perfectiona pentru regionala.</p>
                       <p>Meet-ul a reflectat ce inseamna o echipa: sustinere, incurajare si pozitivitate indiferent de circumstante.</p>
                     </div>
                   </div>

                   <!-- Meet 2 -->
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Frozen Depths Meet - Suceava</h5>
                            <span class="badge bg-success rounded-pill px-3 py-2">4 ianuarie</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                       <p>Am aratat progres major fata de primul meet, cu 4 victorii obtinute.</p>
                       <p>La final am primit recunoastere pentru designul inovativ al lui Puiu.</p>
                     </div>
                   </div>

                   <!-- Meet 3 -->
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">League Meet of Iasi</h5>
                            <span class="badge bg-warning text-dark rounded-pill px-3 py-2">11 ianuarie</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                       <p>Am venit increzatori, dar robotul s-a defectat la inceput din cauza unui bug al Control Hub-ului, care a sters configuratia.</p>
                       <p>Rescrierea configuratiei a durat aproximativ doua ore; am masurat tensiunile cu multimetru si am facut reverse engineering la robot.</p>
                     </div>
                   </div>
                </div>`,
      // Season 2025-2026
      'season.2025-2026.proba': `
            <div class="robot-section">
              <div class="robot-media">
                 <img src="assets/roboti/2026.png" alt="Robot Puiu 2025" class="robot-image">
              </div>
              <div class="robot-content">
                <h4 class="robot-title">Robotul "Puiu"</h4>
                        <p>Puiu a trecut prin numeroase schimbari, evoluand de la o competitie la alta. Am folosit un sasiu cu roti mecanum, care ne-a oferit mobilitate in orice directie si manevrabilitate in spatii restranse.</p>
                        <p>Sistemul de colectare (intake) a fost conceput pentru a prelua artefactele eficient si fara blocaje, trimitandu-le mai departe catre un mecanism intern de sortare.</p>
                        <p>Pentru scorare, robotul a fost echipat cu un shooter reglabil, capabil sa arunce mingile de la distante diferite, adaptandu-se pozitiei fata de goal. Precizia a fost imbunatatita prin auto-alignment, care ajuta robotul sa se pozitioneze corect inainte de lansare.</p>
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
                      <p class="activity-text">Am continuat tradiția anuală de a lua parte la Târgul educațional organizat de CJRAE Vaslui și ISJ Vaslui pentru a promova echipa de robotică și oferta educațională a Liceului Teoretic „Emil Racoviță” Vaslui elevilor de clasa a VIII-a.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac2.png" class="activity-img" alt="Vizite scoli gimnaziale">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🏫 Vizite la Școlile Gimnaziale din Vaslui</h5>
                      <p class="activity-meta">Final de mai - început de iunie</p>
                      <ul class="activity-list">
                        <li>22 mai - Școala Gimnazială Nr. 2 „Dimitrie Cantemir” și Școala Gimnazială Nr. 3 „Constantin Parfene”</li>
                        <li>23 mai - Școala Gimnazială Nr. 6 „Mihai Eminescu” și Școala Gimnazială Nr. 8 „Alexandra Nechita”</li>
                        <li>12 iunie - Școala Gimnazială Nr. 1 Văleni</li>
                      </ul>
                      <p class="activity-text">Obiectivul principal a fost promovarea educației STEM, din postura de ambassadors FIRST. Ne-am propus atragerea noilor generații către domeniul roboticii și am prezentat întreaga noastră activitate, împărtășind din experiențele competiționale și despre munca din spatele construirii și programării unui robot.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac3.png" class="activity-img" alt="Tabara Rotary">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🏕️ Tabăra Rotary</h5>
                      <p class="activity-meta">7 iulie</p>
                      <p class="activity-text">În cadrul Taberei Rotary organizată de Rotaract, dedicată elevilor olimpici din Vaslui, am prezentat competiția și valorile FIRST Tech Challenge, activitatea echipei noastre și parcursul din ultimii ani, împărtășind atât reușitele, cât și provocările întâmpinate. Participanții au putut controla robotul nostru și am discutat despre mecanisme, funcționalități și importanța implicării tinerilor în domenii STEM.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac4.png" class="activity-img" alt="Biblioteca de vacanta">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">📚 Ateliere săptămânale de educație STEM - „Biblioteca de vacanță”</h5>
                      <p class="activity-meta">7 iulie - 22 august</p>
                      <p class="activity-text">În parteneriat cu Biblioteca Județeană „Nicolae Milescu Spătarul”, în fiecare miercuri am prezentat copiilor de 11-14 ani noțiuni de programare în C++, într-un mediu interactiv. Ei au descoperit logica din spatele codului, și-au creat propriile proiecte și au aflat pașii din spatele construirii și funcționării robotului nostru, ultima sesiune fiind prezentarea lui Puiu.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac5.png" class="activity-img" alt="Zilele Vasluiului">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🎉 Zilele Vasluiului</h5>
                      <p class="activity-meta">19 august</p>
                      <p class="activity-text">Cu ocazia Zilelor Vasluiului, am fost parte din organizatorii proiectului „Robotica, la granița dintre știință și tehnologie”. La Centrul Cultural Județean Vaslui, am susținut prezentări și meciuri FTC demonstrative dedicate comunității noastre. Ne-am bucurat de susținerea directă oferită de domnul primar și domnul viceprimar, dar și de participarea localnicilor de toate vârstele.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/rob.jpeg" class="activity-img" alt="Ziua Educatiei">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">📖 Ziua Educației</h5>
                      <p class="activity-meta">5 octombrie</p>
                      <p class="activity-text">Am desfășurat o activitate la Casa Corpului Didactic Vaslui, unde am avut bucuria de a le prezenta elevilor de la Școala Gimnazială „Mihai Eminescu” Vaslui robotul nostru și activitatea echipei.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/sah.jpeg" class="activity-img" alt="Robotica pe tabla de sah">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">♟️ „Robotica pe tabla de șah”</h5>
                      <p class="activity-meta">21 octombrie</p>
                      <p class="activity-text">Alături de Clubul de Șah CSM Vaslui, am desfășurat un atelier de robotică dedicat micilor șahiști. Copiii au fost cu adevărat interesați de echipă, au controlat cu măiestrie robotul și au descoperit cum gândirea critică din șah îi poate ajuta în domeniile STEM.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/vr.png" class="activity-img" alt="VR eXperience">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🕶️ „VR eXperience”</h5>
                      <p class="activity-meta">28 noiembrie</p>
                      <p class="activity-text">În cadrul Zilelor Liceului Teoretic „Emil Racoviță” Vaslui, am organizat un workshop despre realitatea virtuală. Participanții au testat ochelarii VR și au descoperit simulări 3D captivante, jocuri educative și aplicații care arată cum tehnologia poate transforma modul în care învățăm și interacționăm cu lumea din jur.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac9.jpeg" class="activity-img" alt="Erasmus plus">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🌍 Erasmus+ „Emotional Intelligence Approach on Teaching Methods”</h5>
                      <p class="activity-meta">3 decembrie</p>
                      <p class="activity-text">Am susținut un atelier internațional cu profesori din Spania, Italia, Portugalia și Finlanda. Am prezentat competiția și valorile FIRST Tech Challenge, parcursul echipei noastre și emoțiile gestionate în timpul meciurilor, proiectelor și în timpul construcției robotului. La final, profesorii au putut controla robotul și ne-au împărtășit emoțiile lor: bucurie, uimire și apreciere.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac10.jpeg" class="activity-img" alt="Lab Mobil">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🧪 Lab Mobil</h5>
                      <p class="activity-meta">10 decembrie</p>
                      <p class="activity-text">Am creat un mini-laborator mobil de robotică şi l-am prezentat la două şcoli gimnaziale din municipiul Vaslui. Elevii au testat robotul şi au învățat principiile roboticii prin demonstrații practice și exerciții interactive, dezvoltându-și gândirea critică, creativitatea şi abilitatea de a lucra în echipă. Proiectul a reprezentat primul contact al tinerilor cu robotică, iar ei au dat dovadă de curiozitate şi apreciere față de domeniu.</p>
                      <p class="activity-text">Am învățat cât de important este să ne împărtășim cunoştinţele tinerilor, contribuind la dezvoltarea comunității în ceea ce privește tehnologia.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac11.jpeg" class="activity-img" alt="Roboti pentru viitor">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🤖 Roboți pentru viitor</h5>
                      <p class="activity-meta">11-12 decembrie</p>
                      <p class="activity-text">Am desfășurat două workshop-uri la Liceul Teoretic „Emil Racoviță” Vaslui, adresate elevilor de la Şcoala Gimnazială Nr. 1 Văleni. Am învățat copiii să-și construiască propriul robot cu ajutorul kit-urilor Arduino şi a programării. La final, elevii și-au prezentat proiectele, primind diplome și dulciuri, dezvoltând o pasiune pentru robotică.</p>
                      <p class="activity-text">Activitatea a avut un impact important asupra elevilor din Văleni. Datorită activității, doamna profesoară a Şcoala Gimnazială Nr. 1 Văleni a început implementarea unui opțional de robotică în cadrul şcolii din mediul rural. Am învățat că accesul la resurse educaționale şi tehnologie poate schimba în bine o comunitate, iar tinerii merită oportunități egale.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac12.jpeg" class="activity-img" alt="Coding and Tech">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">💻 Coding & Tech - Programarea pe înțelesul tuturor</h5>
                      <p class="activity-meta">16 decembrie</p>
                      <p class="activity-text">Am organizat un workshop introductiv în C++ și tehnologii Arduino pentru elevii din Vaslui, la Biblioteca Județeană „Nicolae Milescu Spătarul”. Activitatea a oferit acces la educație STEM prin activități interactive, folosind simulatoare online și demonstrații practice. Am crescut treptat dificultatea exercițiilor, iar copiii au învățat bazele programării și ale electronicii într-un mod interactiv și distractiv.</p>
                      <p class="activity-text">Ei și-au dezvoltat gândirea logică și au fost motivați să își continue parcursul în domeniul programării și al roboticii.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac13.png" class="activity-img" alt="3D Minds">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🧩 3D Minds - Workshop-uri de imprimare 3D</h5>
                      <p class="activity-meta">11 și 17 decembrie</p>
                      <p class="activity-text">Am desfășurat două workshop-uri practice de modelare și imprimare 3D, unul pentru elevii de gimnaziu și unul pentru elevii de liceu. Participanții au învățat să creeze modele 3D în Blender și să le transforme în obiecte reale, descoperind cum imprimarea 3D este strâns legată de robotică.</p>
                      <p class="activity-text">Am învățat că accesul la tehnologii moderne, precum robotica și imprimarea 3D, oferă tinerilor abilități relevante pentru piața muncii și oportunități importante de carieră.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac14.png" class="activity-img" alt="Girls Code">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">👩‍💻 Girls Code</h5>
                      <p class="activity-meta">12 și 13 decembrie</p>
                      <p class="activity-text">Două sesiuni practice de robotică și programare, în care participantele au explorat partea hardware a construirii unui robot și partea software, învățând să creeze un site web folosind HTML, CSS și JavaScript. Impactul activității a fost semnificativ: 78% dintre participanți nu mai creaseră anterior un site web, iar 56% nu participaseră la activități de robotică.</p>
                      <p class="activity-text">Am înțeles cât de important este ca fetele să aibă șanse și oportunități egale în domeniile STEM și cât de mult contează un mediu incluziv în procesul de învățare.</p>
                    </div>
                  </article>
                 </div>`,
      'season.2025-2026.meeturi': `
                <div class="accordion" id="meeturiAccordion2025">
                   <!-- Meet 1 -->
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Piatra Neamț - „Jurassic Peaks”</h5>
                            <span class="badge bg-primary rounded-pill px-3 py-2">10 ianuarie</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                       <p>Primul meet al sezonului, cu 4 victorii din 6 meciuri. Robotul a funcționat bine în autonomous și teleop, iar problemele inițiale de ping au fost rezolvate rapid. Am dezvoltat o strategie solidă de scorare, care a pus bazele evoluției noastre ulterioare.</p>
                     </div>
                   </div>

                   <!-- Meet 2 -->
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Iași - „Defrost”</h5>
                            <span class="badge bg-warning text-dark rounded-pill px-3 py-2">11 ianuarie</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                       <p>Un meet mai dificil, cu 2 victorii din 6 meciuri, în care au apărut probleme la push-arm. Chiar și așa, robotul a reușit perioade eficiente de scorare, iar experiența ne-a ajutat să identificăm punctele fragile ale robotului și să îmbunătățim design-ul.</p>
                     </div>
                   </div>

                   <!-- Meet 3 -->
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Focșani - „Focșani Tech Challenge”</h5>
                            <span class="badge bg-info rounded-pill px-3 py-2">24 ianuarie</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                       <p>Am revenit cu o performanță mai bună, 3 victorii din 6 meciuri, menținând o tactică de scorare constantă. Robotul s-a mișcat eficient, confirmând îmbunătățirile aduse după meet-ul precedent.</p>
                     </div>
                   </div>

                   <!-- Meet 4 -->
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Galați - „Ice Age”</h5>
                            <span class="badge bg-success rounded-pill px-3 py-2">31 ianuarie</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                    <p>Cel mai reușit meet al sezonului, cu 5 victorii din 6 meciuri. Acest rezultat a confirmat viabilitatea design-ului, eficiența sistemelor și consistența strategiei noastre.</p>
                     </div>
                   </div>

                   <!-- Regionala -->
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Regionala - Piatra Neamț</h5>
                            <span class="badge bg-primary rounded-pill px-3 py-2">21-22 februarie 2026</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                       <h6>Obiective pentru regionala</h6>
                       <ul>
                         <li><strong>Stabilitate maxima:</strong> meciuri fara erori, cu autonomous si teleop curate.</li>
                         <li><strong>Strategie clara:</strong> rol bine definit in alianta si punctaj constant.</li>
                         <li><strong>Calificare:</strong> sa intram in fazele finale si sa obtinem recunoastere.</li>
                       </ul>
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
      'nav.ftcGame': 'Back',
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
      'timeline.1.desc': 'The roLERbot team appeared in 2018, from the desire of young people passionate about exact sciences to turn their ideas into reality. Who are we? We are roLERbot – motivated, ambitious, and united by a passion for technology. Through the Rover Ruckus program, we entered the world of Tech Challenges, determined to leave a field of innovation.',
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
      'footer.creator': '<span class="text-primary">Site created by Diaconu Mihăiță</span>',
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
      'modal.seasonPrefix': 'Season',
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
                      <p>In our robot's evolution, a particularly important aspect is the development and refinement of locomotion systems. In this regard, our robot's base remained unchanged this season, keeping the technological and performance characteristics of Mecanum wheels. Thus, our team focused on other aspects of the robot's development, knowing that its movement base is solid and efficient.</p>
                      <p>The development process of the clamp for catching two pixels simultaneously was full of challenges and innovation, starting from the initial concept of a clamp with a separator in the middle, which would have allowed catching two pixels simultaneously, to its practical implementation which proved to be totally different. The first meet in Brăila was the moment that confronted us with reality and forced us to completely rethink our initial concept. The clamp with a separator in the middle was not a viable solution in practice, and this realization led us to a radically new approach.</p>
                      <p>For the replacement of the clamp, we explored several options, and the "scoop" became our final choice. Initially, we created it from plexiglass and glued it with superglue, a spontaneous idea that was immediately replaced by a 3D printed scoop. An important aspect of the scoop are the supports placed at its base, supports that keep the pixels in place, avoiding the risk of falling where we don't want them to. Also, having the possibility to keep the pixels in place, autonomy was benefited because we knew the position of the pixels in the scoop. For the upper part of the scoop, we chose to continue using plexiglass to facilitate visibility and allow the operator to clearly see the moment of catching two pixels.</p>
                      <p>In the initial phase of our project for the airplane launcher, we considered a solution involving a mechanism based on elastic and plexiglass. However, as we analyzed the requirements and feasibility more closely, we concluded that an alternative approach would be more suitable for our needs. Thus, we decided to shift towards 3D printing a launcher, but the results were not according to our expectations.</p>
                      <p>Because of this, we returned to the initial concept that involved using elastic as the main source of energy for the launcher, but this time we opted for a simpler and more efficient system. Our airplane launcher uses an elastic attached to a hook, and the latter is connected to a servo. Operation is intuitive: the servo activates the hook, thereby releasing the elastic and propelling the plane into the air.</p>
                      <p>After participating in the first meet of that season, we decided to give the idea of suspended parking a chance and started putting it into practice. After several tested ideas, we reached a final one, which involved using two lifts, placed on each side of the robot. Not having the possibility to buy the lifts, we created our own concept with string and bearings.</p>
                    </div>
                </div>`,
      'season.2023-2024.activitati': `
                  <div class="activity-grid">
                    <article class="activity-card">
                      <div class="activity-media">
                        <img src="assets/img/2023/activitati/ac1.png" class="activity-img" alt="Halloween">
                      </div>
                      <div class="activity-body">
                        <h5 class="activity-title">🎃 Halloween - holiday theme robot</h5>
                        <p class="activity-text">For Halloween, we adapted our robot's appearance to the holiday theme, to be in tune with both technology and fun.</p>
                      </div>
                    </article>
                    <article class="activity-card">
                      <div class="activity-media">
                        <img src="assets/img/2023/activitati/ac2.png" class="activity-img" alt="Women and girls in science">
                      </div>
                      <div class="activity-body">
                        <h5 class="activity-title">🔬 February 11 - International Day of Women and Girls in Science</h5>
                        <p class="activity-text">We celebrated the International Day of Women and Girls in Science, appreciating the involvement of girls in topics such as research.</p>
                      </div>
                    </article>
                    <article class="activity-card">
                      <div class="activity-media">
                        <img src="assets/img/2023/activitati/ac3.png" class="activity-img" alt="Martisoare">
                      </div>
                      <div class="activity-body">
                        <h5 class="activity-title">🌸 March 1 - Martisoare with Puiu</h5>
                        <p class="activity-text">The day of March 1 was celebrated by making "martisoare" where Puiu was the center of attention. These symbols of spring brought smiles to the faces of students, the mentor lady, and the headmistress.</p>
                      </div>
                    </article>
                    <article class="activity-card">
                      <div class="activity-media">
                        <img src="assets/img/2023/activitati/ac4.png" class="activity-img" alt="Robotics: At the border between engineering and technology">
                      </div>
                      <div class="activity-body">
                        <h5 class="activity-title">🤖 Robotics: At the border between engineering and technology</h5>
                        <p class="activity-text">We held presentations and demonstration FTC matches dedicated to our community. We showed that robotics doesn't just mean assembling parts, but also passion, collaboration, and the desire to innovate.</p>
                      </div>
                    </article>
                  </div>`,
      'season.2023-2024.meeturi': `
                <div class="accordion" id="meeturiAccordion2324EN">
                   <!-- Meet 1 -->
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Meet 1 - Brăila</h5>
                            <span class="badge bg-primary rounded-pill px-3 py-2">January 13</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                       <p>roLERbot participated in its first meet of the season; it didn't start exactly as we wanted, but it was towards improving the robot. For that test, the arm and support bars were too high to fit under the gate, which often led to the robot getting stuck during the autonomous period.</p>
                       <p>The clamp, later replaced by a scoop, failed to catch two pixels simultaneously, but only one at a time, with a high probability of failure in placing them on the backdrop.</p>
                     </div>
                   </div>

                   <!-- Meet 2 -->
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Meet 2 - Focșani</h5>
                            <span class="badge bg-primary rounded-pill px-3 py-2">January 20</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                       <p>The second meet was marked by evolution and adaptation. We managed to solve some of the mechanical problems and improve the robot's precision during matches.</p>
                     </div>
                   </div>

                   <!-- Meet 3 -->
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Meet 3 - Iași</h5>
                            <span class="badge bg-primary rounded-pill px-3 py-2">February 3</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                       <p>In Iași we demonstrated greater consistency in performance, managing to collaborate effectively with our allies to obtain valuable points.</p>
                     </div>
                   </div>

                   <!-- Regional -->
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Regional - Iași</h5>
                            <span class="badge bg-success rounded-pill px-3 py-2">March 9-11, 2024</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                       <p>The Regional in Iași was the highlight of the season. We experienced intense emotions, made friends, and learned a lot from every match. We were proud to receive "The Judges Award" as recognition of our journey.</p>
                     </div>
                   </div>
                </div>`,
      // Season 2024-2025
      'season.2024-2025.proba': `
                 <div class="row">
                    <div class="col-md-6">
                        <h4>FTC Challenge: INTO THE DEEP 🌊</h4>
                        <p>The 2024-2025 season brings robots to the underwater world! Teams must collect and place <strong>SAMPLES</strong> in different diving zones, simulating ocean exploration.</p>
                        <div class="mt-3">
                            <h5>Phase 1: Autonomous (30s)</h5>
                            <ul>
                                <li>Detecting the team sample using computer vision.</li>
                                <li>Placing the specimen in the Submersible diving basket.</li>
                                <li>Navigating to scoring zones and placing samples.</li>
                                <li>Parking in the Observation Zone.</li>
                            </ul>
                            <h5>Phase 2: TeleOp (2m)</h5>
                            <ul>
                                <li>Collecting specimens from the ocean floor.</li>
                                <li>Lifting and placing samples in the High Chamber and Low Chamber.</li>
                                <li>Collecting algae and placing them in the Net Zone.</li>
                            </ul>
                            <h5>Phase 3: Endgame (30s)</h5>
                            <ul>
                                <li>Climbing the robot onto the first or second step of the Submersible.</li>
                                <li>Bonus: Suspended - robot completely suspended without ground contact.</li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-md-6 text-center">
                        <img src="assets/img/2024/meet/field-2024.jpg" class="img-fluid rounded shadow-lg mb-3 animate-on-scroll" alt="Into The Deep Field">
                        <img src="teren/20251.png" class="img-fluid rounded shadow-sm mb-2" alt="Game Detail 1">
                        <img src="teren/20252.png" class="img-fluid rounded shadow-sm" alt="Game Detail 2">
                    </div>
                 </div>`,
      'season.2024-2025.robot': `
                 <div class="robot-section">
                   <div class="robot-media">
                     <img src="assets/roboti/2025.png" alt="Robot Puiu 2024" class="robot-image">
                   </div>
                    <div class="robot-content">
                        <h4 class="robot-title">Robot "Puiu" v4.0 - Deep Diver</h4>
                        <p>The robot's base represents the foundation on which all other mechanisms are built. It consists of a rigid and light chassis, optimized for stability and mobility on the field, equipped with 3 dead wheels for odometry, which allow precise location on the field, essential for the autonomy period. The passive wheel mechanism offers high precision in calculating the trajectory.</p>
                        <p>We chose a mecanum wheel system that allows the robot to move in any direction, having precise control of lateral and diagonal movements. The choice proved to be extremely inspired as there are already plenty of resources regarding the physics behind it. For the drive train, we opted for GoBilda 312rpm motors, with a torque of 4.14N/m, connected to the wheels, transmission being done through bevel gears. The current design offers an ideal combination of speed and power thanks to the new mecanum wheels that have a larger circumference.</p>
                        <p>The intake is the component that handles collecting objects from the field. It consists of two main sub-sections: the intake mechanism itself and the transfer bed. A system based on a virtual forearm powered by two servomotors is used, which has a clamp attached to the end that allows catching objects and lifting them from ground level with ease. We chose a virtual forearm system in order to keep the clamp always parallel to the ground to avoid using another servomotor that would have made the robot heavier.</p>
                        <p>After collection, the objects are moved to a transfer bed that transports them to the outtake. The bed is designed to keep objects in a stable position, regardless of the robot's movements. We improved the mechanism by adjusting the inclination angles and optimizing speeds to ensure a constant flow.</p>
                        <p>The outtake is responsible for the precise placement of objects in designated areas. It is designed to operate quickly and efficiently, ensuring valuable points in competition. The outtake arm is on a slide-based mechanism, built from a series of segments that can extend and retract using strings placed on pulleys and powered by two motors. The arm is powered by a servomotor with belt transmission that allows rotating the clamp through a pivot, and by a servomotor that facilitates movement in both forward and opposite directions. We chose this design to be able to reach different heights without compromising the robot's stability.</p>
                        <p>At the end of the arm is a clamp also powered by a servomotor, which can grab and release objects with precise control. Initially, we had difficulties in catching samples, but after several iterations we improved the clamp design, adding a rubber layer for extra grip. To ensure precise placement angles, the arm includes a pivot that allows rotation for sample manipulation. We placed the servomotor that powers the pivot at the base of the arm to not make the upper part heavier. This functionality adds flexibility in their placement, regardless of the robot's position on the field.</p>
                    </div>
                 </div>`,
      'season.2024-2025.activitati': `
                <div class="activity-grid">
                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2024/activitati/ac1.png" class="activity-img" alt="Educational Fair">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🎓 Educational Fair</h5>
                      <p class="activity-meta">April 11-12, 2024</p>
                      <p class="activity-text">Annually, since the founding of the team, we are present at the educational fair organized by CJRAE Vaslui.</p>
                      <p class="activity-text">Representing the "Emil Racovita" Theoretical High School Vaslui, we presented the robot, the team and the FIRST Tech Challenge competition.</p>
                      <p class="activity-text">The event is important for us: many members and alumni joined the team after seeing us here.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2024/activitati/ac2.png" class="activity-img" alt="Robotics at the border between engineering and technology">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🤖 Robotics: At the border between engineering and technology</h5>
                      <p class="activity-meta">August 16, 2024</p>
                      <p class="activity-text">We organized the activity in partnership with the Vaslui City Hall, on the occasion of the Cultural Days of the Municipality.</p>
                      <p class="activity-text">We played a demonstration match with the Orion team and explained what FTC really means.</p>
                      <p class="activity-text">At the end we received a gratitude award from the Vaslui Municipality City Hall.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2024/activitati/ac3.png" class="activity-img" alt="Vaslui Youth Gala">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🏆 Vaslui Youth Gala</h5>
                      <p class="activity-meta">2024</p>
                      <p class="activity-text">The roLERbot team was awarded in the "Involvement and Solidarity" category.</p>
                      <p class="activity-text">The award was offered by the Federation of Youth from Vaslui, Vaslui Youth Capital and the Vaslui City Hall.</p>
                      <p class="activity-text">It is a recognition of the efforts to bring STEAM education closer to the community.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2024/activitati/ac4.png" class="activity-img" alt="Hobby Fair">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🎨 Hobby Fair</h5>
                      <p class="activity-meta">December 13-14, 2024</p>
                      <p class="activity-text">We showed visitors that robotics doesn't just mean screws and code, but also team, creativity and perseverance.</p>
                      <p class="activity-text">In FTC we don't just assemble robots, but form families and learn collaboration.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2024/activitati/ac5.png" class="activity-img" alt="Puiu Eco-Clean Project">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">♻️ Puiu Project: Eco-Clean</h5>
                      <p class="activity-meta">2024</p>
                      <p class="activity-text">We highlighted the positive impact of technology in fighting environmental problems.</p>
                      <p class="activity-text">The Puiu robot is a practical example of how robots can help collect and manage waste.</p>
                      <p class="activity-text">The project is a call to responsibility and action for a cleaner future.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2024/activitati/ac6.png" class="activity-img" alt="3D Print(re) students">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🧩 3D Print(re) students</h5>
                      <p class="activity-meta">September 30 and October 3, 2024</p>
                      <p class="activity-text">The "3D Print(re) students" project brought 3D printing closer to the school's students.</p>
                      <p class="activity-text">Participants learned Blender and Tinkercad and saw how models become real objects.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2024/activitati/ac7.png" class="activity-img" alt="Robot in 20 hours">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">⏱️ Robot in 20 hours</h5>
                      <p class="activity-meta">November 29-30 and December 7-8, 2024</p>
                      <p class="activity-text">We participated in the project organized by the Orion team, in collaboration with the Federation of Youth from Vaslui.</p>
                      <p class="activity-text">Groups of children visited us and we presented the FTC competition and the values of Gracious Professionalism.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2024/activitati/ac8.png" class="activity-img" alt="Female STEM">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">👩‍🔬 Female STEM</h5>
                      <p class="activity-meta">November 29, 2024</p>
                      <p class="activity-text">Event dedicated to promoting gender equality and encouraging young women in STEAM.</p>
                      <p class="activity-text">The discussions addressed equal opportunity, challenges and opportunities for girls and women.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2024/activitati/ac9.png" class="activity-img" alt="Partnerships with middle schools">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🤝 Partnerships with middle schools</h5>
                      <p class="activity-meta">2024-2025</p>
                      <p class="activity-text">We annually extend partnerships to encourage FIRST LEGO League teams and mentoring.</p>
                      <p class="activity-text">Stories shared by teachers confirm our positive impact in the community.</p>
                    </div>
                  </article>
                </div>`,
      'season.2024-2025.meeturi': `
                <div class="accordion" id="meeturiAccordion2024EN">
                   <!-- Meet 1 -->
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Xmas Robo Stone - Piatra Neamt</h5>
                            <span class="badge bg-primary rounded-pill px-3 py-2">December 21</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                       <p>The first meet of the season. We won two matches, starting and ending with a victory.</p>
                       <p>Although we were demoralized, we encouraged each other and saw the losses as opportunities to perfect ourselves for the regional.</p>
                       <p>The meet reflected what a team means: support, encouragement and positivity regardless of circumstances.</p>
                     </div>
                   </div>

                   <!-- Meet 2 -->
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Frozen Depths Meet - Suceava</h5>
                            <span class="badge bg-success rounded-pill px-3 py-2">January 4</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                       <p>We showed major progress compared to the first meet, with 4 wins obtained.</p>
                       <p>At the end we received recognition for Puiu's innovative design.</p>
                     </div>
                   </div>

                   <!-- Meet 3 -->
                   <div class="card mb-4 border-0 shadow-sm">
                     <div class="card-header bg-white text-primary p-3">
                        <div class="d-flex justify-between align-items-center">
                            <h5 class="mb-0">League Meet of Iasi</h5>
                            <span class="badge bg-warning text-dark rounded-pill px-3 py-2">January 11</span>
                        </div>
                     </div>
                     <div class="card-body p-4">
                       <p>We came confident, but the robot broke down at the beginning due to a bug in the Control Hub, which erased the configuration.</p>
                       <p>Rewriting the configuration took about two hours; we measured the voltages with a multimeter and did reverse engineering on the robot.</p>
                     </div>
                   </div>
                </div>`,
      // Season 2025-2026
      'season.2025-2026.proba': `
                <div class="row">
                    <div class="col-md-6">
                <h4>FTC Challenge: DECODE 🧩</h4>
                <p>The 2025-2026 FTC season, <strong>DECODE</strong>, is focused on <strong>collecting, sorting, and launching artifacts</strong> into baskets, with the objective of reproducing a model of 3 artifacts displayed on the backdrop. The game emphasizes speed, precision, and coordination between the robots in an alliance.</p>
                <div class="mt-3">
                  <h5>Phase 1: Autonomous (30s)</h5>
                  <ul>
                    <li>Identification of a random model of 3 artifacts displayed on the backdrop.</li>
                    <li>Autonomous navigation to collection and launch zones.</li>
                    <li>Rapid sorting and correct marking for bonus points.</li>
                  </ul>
                  <h5>Phase 2: TeleOp (2m)</h5>
                  <ul>
                    <li>Manual control oriented on launching artifacts (balls) into baskets.</li>
                    <li>Optimization of routes for continuous flow between collection and launch.</li>
                    <li>Coordination with allies to cover as many baskets as possible.</li>
                  </ul>
                  <h5>Scoring</h5>
                  <ul>
                    <li>Correctly classified artifacts are worth more than those in overflow.</li>
                    <li>Matching the model in autonomous brings bonus points.</li>
                    <li>Consistency and precision of the team can make the difference at the end.</li>
                  </ul>
                </div>
                    </div>
                    <div class="col-md-6 text-center">
                        <img src="assets/img/2025/meet/field-concept.jpg" class="img-fluid rounded shadow-lg mb-3 animate-on-scroll" alt="Reefscape Field">
                        <img src="teren/20261.png" class="img-fluid rounded shadow-sm mb-2" alt="Coral Detail">
                        <img src="teren/20262.png" class="img-fluid rounded shadow-sm" alt="Sanctuary Zone">
                    </div>
                </div>`,
      'season.2025-2026.robot': `
                <div class="robot-section">
                  <div class="robot-media">
                     <img src="assets/roboti/2026.png" alt="Robot Puiu 2025" class="robot-image">
                  </div>
                  <div class="robot-content">
                    <h4 class="robot-title">Robot "Puiu"</h4>
                    <p>Puiu has undergone numerous changes, evolving from one competition to another. We used a chassis with mecanum wheels, which gave us mobility in any direction and maneuverability in tight spaces.</p>
                    <p>The collection system (intake) was designed to pick up artifacts efficiently and without blockages, sending them further to an internal sorting mechanism.</p>
                    <p>For scoring, the robot was equipped with an adjustable shooter, capable of throwing balls from different distances, adapting to the position relative to the goal. Precision was improved through auto-alignment, which helps the robot position itself correctly before launching.</p>
                  </div>
                </div>`,
      'season.2025-2026.activitati': `
                 <div class="activity-grid">
                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac1.jpg" class="activity-img" alt="Educational Fair">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🎓 26th Edition of the Educational Fair</h5>
                      <p class="activity-meta">April 15-16</p>
                      <p class="activity-text">We continued the annual tradition of participating in the Educational Fair organized by CJRAE Vaslui and ISJ Vaslui to promote the robotics team and the educational offer of the "Emil Racovită" Theoretical High School Vaslui to 8th-grade students.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac2.png" class="activity-img" alt="Middle school visits">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🏫 Visits to Middle Schools in Vaslui</h5>
                      <p class="activity-meta">Late May - early June</p>
                      <ul class="activity-list">
                        <li>May 22 - Middle School No. 2 "Dimitrie Cantemir" and Middle School No. 3 "Constantin Parfene"</li>
                        <li>May 23 - Middle School No. 6 "Mihai Eminescu" and Middle School No. 8 "Alexandra Nechita"</li>
                        <li>June 12 - Middle School No. 1 Văleni</li>
                      </ul>
                      <p class="activity-text">The main objective was the promotion of STEM education, from the position of FIRST ambassadors. We aimed to attract new generations to the field of robotics and presented our entire activity, sharing from competitive experiences and the work behind building and programming a robot.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac3.png" class="activity-img" alt="Rotary Camp">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🏕️ Rotary Camp</h5>
                      <p class="activity-meta">July 7</p>
                      <p class="activity-text">Within the Rotary Camp organized by Rotaract, dedicated to Olympic students from Vaslui, we presented the FIRST Tech Challenge competition and values, our team's activity and the journey in recent years, sharing both successes and challenges encountered. Participants were able to control our robot and we discussed mechanisms, functionalities, and the importance of youth involvement in STEM fields.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac4.png" class="activity-img" alt="Holiday Library">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">📚 Weekly STEM Education Workshops - "Holiday Library"</h5>
                      <p class="activity-meta">July 7 - August 22</p>
                      <p class="activity-text">In partnership with the "Nicolae Milescu Spatarul" County Library, every Wednesday we presented 11-14 year olds with programming notions in C++, in an interactive environment. They discovered the logic behind the code, created their own projects and learned the steps behind building and operating our robot, with the last session being Puiu's presentation.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac5.png" class="activity-img" alt="Vaslui Days">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🎉 Vaslui Days</h5>
                      <p class="activity-meta">August 19</p>
                      <p class="activity-text">On the occasion of Vaslui Days, we were part of the organizers of the "Robotics, at the border between science and technology" project. At the Vaslui County Cultural Center, we held presentations and demonstration FTC matches dedicated to our community. We enjoyed the direct support offered by the mayor and the deputy mayor, but also the participation of locals of all ages.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/rob.jpeg" class="activity-img" alt="Education Day">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">📖 Education Day</h5>
                      <p class="activity-meta">October 5</p>
                      <p class="activity-text">We carried out an activity at the Vaslui Teaching Staff House, where we had the joy of presenting our robot and the team's activity to students from the "Mihai Eminescu" Middle School Vaslui.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/sah.jpeg" class="activity-img" alt="Robotics on the chessboard">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">♟️ "Robotics on the chessboard"</h5>
                      <p class="activity-meta">October 21</p>
                      <p class="activity-text">Alongside the CSM Vaslui Chess Club, we carried out a robotics workshop dedicated to little chess players. The children were truly interested in the team, skillfully controlled the robot and discovered how critical thinking in chess can help them in STEM fields.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/vr.png" class="activity-img" alt="VR eXperience">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🕶️ "VR eXperience"</h5>
                      <p class="activity-meta">November 28</p>
                      <p class="activity-text">Within the Days of the "Emil Racovită" Theoretical High School Vaslui, we organized a workshop about virtual reality. Participants tested VR glasses and discovered captivating 3D simulations, educational games and applications that show how technology can transform the way we learn and interact with the world around us.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac9.jpeg" class="activity-img" alt="Erasmus plus">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🌍 Erasmus+ "Emotional Intelligence Approach on Teaching Methods"</h5>
                      <p class="activity-meta">December 3</p>
                      <p class="activity-text">We held an international workshop with teachers from Spain, Italy, Portugal and Finland. We presented the FIRST Tech Challenge competition and values, our team's journey and the emotions managed during matches, projects and during the construction of the robot. At the end, teachers were able to control the robot and shared their emotions with us: joy, amazement and appreciation.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac10.jpeg" class="activity-img" alt="Mobile Lab">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🧪 Mobile Lab</h5>
                      <p class="activity-meta">December 10</p>
                      <p class="activity-text">We created a mini mobile robotics lab and presented it at two middle schools in the municipality of Vaslui. Students tested the robot and learned the principles of robotics through practical demonstrations and interactive exercises, developing their critical thinking, creativity and ability to work in a team. The project represented the first contact of young people with robotics, and they showed curiosity and appreciation for the field.</p>
                      <p class="activity-text">We learned how important it is to share our knowledge with young people, contributing to the development of the community in terms of technology.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac11.jpeg" class="activity-img" alt="Robots for the future">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🤖 Robots for the future</h5>
                      <p class="activity-meta">December 11-12</p>
                      <p class="activity-text">We carried out two workshops at the "Emil Racovită" Theoretical High School Vaslui, addressed to students from Middle School No. 1 Văleni. We taught children to build their own robot using Arduino kits and programming. At the end, students presented their projects, receiving diplomas and sweets, developing a passion for robotics.</p>
                      <p class="activity-text">The activity had an important impact on the students of Văleni. Thanks to the activity, the teacher at Middle School No. 1 Văleni started implementing a robotics elective within the school in the rural environment. We learned that access to educational resources and technology can change a community for the better, and young people deserve equal opportunities.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac12.jpeg" class="activity-img" alt="Coding and Tech">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">💻 Coding & Tech - Programming understood by everyone</h5>
                      <p class="activity-meta">December 16</p>
                      <p class="activity-text">We organized an introductory workshop in C++ and Arduino technologies for students in Vaslui, at the "Nicolae Milescu Spatarul" County Library. The activity provided access to STEM education through interactive activities, using online simulators and practical demonstrations. We gradually increased the difficulty of the exercises, and the children learned the basics of programming and electronics in an interactive and fun way.</p>
                      <p class="activity-text">They developed their logical thinking and were motivated to continue their journey in the field of programming and robotics.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac13.png" class="activity-img" alt="3D Minds">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">🧩 3D Minds - 3D Printing Workshops</h5>
                      <p class="activity-meta">December 11 and 17</p>
                      <p class="activity-text">We carried out two practical 3D modeling and printing workshops, one for middle school students and one for high school students. Participants learned to create 3D models in Blender and transform them into real objects, discovering how 3D printing is closely related to robotics.</p>
                      <p class="activity-text">We learned that access to modern technologies, such as robotics and 3D printing, offers young people relevant skills for the labor market and important career opportunities.</p>
                    </div>
                  </article>

                  <article class="activity-card">
                    <div class="activity-media">
                      <img src="assets/img/2025/activitati/ac14.png" class="activity-img" alt="Girls Code">
                    </div>
                    <div class="activity-body">
                      <h5 class="activity-title">👩‍💻 Girls Code</h5>
                      <p class="activity-meta">December 12 and 13</p>
                      <p class="activity-text">Two practical robotics and programming sessions, in which participants explored the hardware part of building a robot and the software part, learning to create a website using HTML, CSS and JavaScript. The impact of the activity was significant: 78% of participants had not previously created a website, and 56% had not participated in robotics activities.</p>
                      <p class="activity-text">We understood how important it is for girls to have equal chances and opportunities in STEM fields and how much an inclusive environment counts in the learning process.</p>
                    </div>
                  </article>
                </div>`,
      'season.2025-2026.meeturi': `
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
        if (key.includes('.desc') || key.includes('final') || key.includes('copyright') || key.includes('location') || key.includes('season') || key.includes('creator') || key.includes('made_by')) {
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