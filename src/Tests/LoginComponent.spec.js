import { mount, createLocalVue } from '@vue/test-utils';
import LoginComponent from '@/components/LoginComponent.vue';
import Vuetify from 'vuetify';
import VueRouter from 'vue-router';
import { auth } from '@/main';

// Mocking Vue Router
const router = new VueRouter();

// Mocking Vuetify
const localVue = createLocalVue();
localVue.use(Vuetify);
localVue.use(VueRouter);

describe('LoginComponent', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(LoginComponent, {
      localVue,
      router,
    });
  });

  afterEach(() => {
    wrapper.destroy();
  });

  it('renders the login form correctly', () => {
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it('calls login method on form submit', async () => {
    const email = 'test@example.com';
    const password = 'password';

    wrapper.setData({ email, password });
    await wrapper.find('form').trigger('submit.prevent');

    expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith(email, password);
  });

  it('displays error message if login fails', async () => {
    const errorMessage = 'Ungültige Email oder Passwort. Bitte versuchen Sie es erneut.';
    auth.signInWithEmailAndPassword.mockRejectedValueOnce(new Error(errorMessage));

    await wrapper.vm.login();

    expect(wrapper.vm.errorMessage).toBe(errorMessage);
  });

  it('sends reset password email when clicked on "Passwort vergessen"', async () => {
    const email = 'test@example.com';
    wrapper.setData({ forgotEmail: email });

    await wrapper.find('.passwort-vergessen-btn').trigger('click');

    expect(auth.fetchSignInMethodsForEmail).toHaveBeenCalledWith(email);
    expect(auth.sendPasswordResetEmail).toHaveBeenCalledWith(email);
  });

  // Add more tests as needed
});
