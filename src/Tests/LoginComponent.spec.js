// Importieren von mount und createLocalVue aus '@vue/test-utils'
import { mount, createLocalVue } from '@vue/test-utils';
// Importieren von LoginComponent aus '@/components/LoginComponent.vue'
import LoginComponent from '@/components/LoginComponent.vue';
// Importieren von Vuetify
import Vuetify from 'vuetify';
// Importieren von VueRouter
import VueRouter from 'vue-router';
// Importieren von auth aus '@/main'
import { auth } from '@/main';

// Mocken von Vue Router
const router = new VueRouter();

// Mocken von Vuetify
const localVue = createLocalVue();
localVue.use(Vuetify);
localVue.use(VueRouter);

// Beschreibung der Test-Suite für LoginComponent
describe('LoginComponent', () => {
  let wrapper;

  // Vor jedem Test wird ein Wrapper erstellt
  beforeEach(() => {
    wrapper = mount(LoginComponent, {
      localVue,
      router,
    });
  });

  // Nach jedem Test wird der Wrapper zerstört
  afterEach(() => {
    wrapper.destroy();
  });

  // Test, ob das Anmeldeformular korrekt gerendert wird
  it('renders the login form correctly', () => {
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  // Test, ob die login-Methode beim Absenden des Formulars aufgerufen wird
  it('calls login method on form submit', async () => {
    const email = 'test@example.com';
    const password = 'password';

    wrapper.setData({ email, password });
    await wrapper.find('form').trigger('submit.prevent');

    expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith(email, password);
  });

  // Test, ob eine Fehlermeldung angezeigt wird, wenn der Login fehlschlägt
  it('displays error message if login fails', async () => {
    const errorMessage = 'Ungültige Email oder Passwort. Bitte versuchen Sie es erneut.';
    auth.signInWithEmailAndPassword.mockRejectedValueOnce(new Error(errorMessage));

    await wrapper.vm.login();

    expect(wrapper.vm.errorMessage).toBe(errorMessage);
  });

  // Test, ob eine Zurücksetzen-Passwort-E-Mail gesendet wird, wenn auf "Passwort vergessen" geklickt wird
  it('sends reset password email when clicked on "Passwort vergessen"', async () => {
    const email = 'test@example.com';
    wrapper.setData({ forgotEmail: email });

    await wrapper.find('.passwort-vergessen-btn').trigger('click');

    expect(auth.fetchSignInMethodsForEmail).toHaveBeenCalledWith(email);
    expect(auth.sendPasswordResetEmail).toHaveBeenCalledWith(email);
  });

  // Weitere Tests hinzufügen, wenn benötigt
});

