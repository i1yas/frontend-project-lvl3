import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import './style.scss';
import { renderForm } from './view';
import ru from './locale.ru.json';

const getElements = () => ({
  addForm: document.querySelector('#add-form'),
  addButton: document.querySelector('#add-feed'),
  url: document.querySelector('#url'),
  feedback: document.querySelector('#feedback'),
});

const handleSubmit = async (state) => {
  const { form } = state;

  state.form.state = 'validating';

  try {
    const { url: newUrl } = form.fields;

    await yup.string().url().validate(newUrl);

    const urls = state.feeds.map((item) => item.path);
    await yup.string().notOneOf(urls).validate(newUrl);

    state.feeds.push({ path: form.fields.url });
    form.fields.url = '';
    form.errors = [];
    form.state = 'valid';
  } catch ({ errors }) {
    form.errors = errors;
    form.state = 'invalid';
  }
};

const initApp = () => {
  const elements = getElements();

  const i18nextInstance = i18next.createInstance({
    lng: 'ru',
    resources: { ru },
  }, (err) => {
    if (err) console.log('something went wrong loading', err);
  });

  yup.setLocale({
    mixed: {
      notOneOf: 'already_exists',
    },
    string: {
      url: 'invalid_url',
    },
  });

  const state = onChange({
    form: {
      state: 'valid',
      errors: [],
      fields: {
        url: '',
      },
    },
    feeds: [],
  }, (path) => {
    if (path.includes('form.')) {
      renderForm({
        form: state.form,
        i18n: i18nextInstance,
        ...elements,
      });
    }
  });

  elements.addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit(state);
  });

  elements.url.addEventListener('input', (e) => {
    state.form.fields.url = e.target.value;
  });

  renderForm({
    form: state.form,
    i18n: i18nextInstance,
    ...elements,
  });
};

export default initApp;
