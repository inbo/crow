import { mount, createLocalVue } from '@vue/test-utils'
import Crow from '../../src/components/Crow'
import { BootstrapVue } from 'bootstrap-vue'

const localVue = createLocalVue()
localVue.use(BootstrapVue)

test('Crow component rendering', () => {
  // render the component
  const wrapper = mount(Crow, {localVue});

  expect(wrapper.contains('form')).toBe(true); // It contains a form
  
});