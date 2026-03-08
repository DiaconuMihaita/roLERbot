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
            'footer.copyright': '&copy; 2024 roLERbot. Toate drepturile rezervate.<br><small>Site realizat de Diaconu Mihaita</small>',
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
            'game.back': 'Înapoi site'
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
            'footer.copyright': '&copy; 2024 roLERbot. All rights reserved.<br><small>Site created by Diaconu Mihaita</small>',
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
            'game.back': 'Back to site'
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
                if (key.includes('.desc') || key.includes('final') || key.includes('copyright') || key.includes('location')) {
                    node.innerHTML = dict[key];
                } else {
                    node.textContent = dict[key];
                }
                if (node.hasAttribute('aria-label')) node.setAttribute('aria-label', dict[key]);
            }
        });

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
