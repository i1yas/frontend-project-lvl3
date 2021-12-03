import onChange from 'on-change';
import * as yup from 'yup';
import './style.scss';
import render from './view';

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

  const state = onChange({
    form: {
      state: 'valid',
      errors: [],
      fields: {
        url: '',
      },
    },
    feeds: [],
  }, (path, value) => render(path, value, state, elements));

  elements.addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit(state);
  });

  elements.url.addEventListener('input', (e) => {
    state.form.fields.url = e.target.value;
  });
};

export default initApp;
