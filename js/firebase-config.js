/* roLERbot Field Sim 3D — configurare Firebase (necesară pentru conturi, prieteni și meciuri online).
 *
 * 1. console.firebase.google.com → Add project (gratuit, planul Spark).
 * 2. Build → Authentication → Get started → activează "Email/Password" (și "Google" dacă vrei).
 *    La Settings → Authorized domains adaugă domeniul unde ține siteul (ex. echipa.netlify.app).
 * 3. Build → Realtime Database → Create database → apoi tabul "Rules" → lipește conținutul din database.rules.json → Publish.
 * 4. Project settings (rotița) → Your apps → Web (</>) → copiază obiectul firebaseConfig aici mai jos.
 *    Cheile sunt publice prin design; securitatea vine din database.rules.json.
 */
window.FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  appId: ""
};
