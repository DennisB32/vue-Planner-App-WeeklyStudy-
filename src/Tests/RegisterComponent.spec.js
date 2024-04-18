import { mount, createLocalVue } from '@vue/cli-plugin-unit-jest';
import RegisterComponent from '@/components/RegisterComponent.vue';

// Erstellen einer lokalen Vue-Instanz
const localVue = createLocalVue();

describe('RegistrationComponent', () => {
  let wrapper;

  beforeEach(() => {
    // Montieren der Komponente
    wrapper = mount(RegisterComponent, {
      localVue,
    });
  });

  afterEach(() => {
    // Zerstören der Komponente
    wrapper.destroy();
  });

  it('renders the registration form correctly', () => {
    // Überprüfen, ob das Registrierungsformular gerendert wird
    expect(wrapper.find('form').exists()).toBe(true);
    // Überprüfen, ob die Eingabefelder vorhanden sind
    expect(wrapper.find('input[type="text"][label="First Name *"]').exists()).toBe(true);
    expect(wrapper.find('input[type="text"][label="Last Name *"]').exists()).toBe(true);
    expect(wrapper.find('input[type="email"][label="Email *"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"][label="Password *"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"][label="Confirm Password *"]').exists()).toBe(true);
    // Überprüfen, ob die Schaltflächen vorhanden sind
    expect(wrapper.find('button[type="submit"][color="primary"]').exists()).toBe(true);
    expect(wrapper.find('button[color="secondary"]').exists()).toBe(true);
  });

  it('calls the register method on form submit', async () => {
    // Mocken der Methode register
    const registerMock = jest.fn();
    // Setzen der Methode als Komponentenmethode
    wrapper.setMethods({ register: registerMock });
    // Simulieren des Formularsendens
    await wrapper.find('form').trigger('submit.prevent');
    // Überprüfen, ob die Methode aufgerufen wurde
    expect(registerMock).toHaveBeenCalled();
  });

  // Weitere Tests können hinzugefügt werden

});
