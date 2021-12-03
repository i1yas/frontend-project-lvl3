import onChange from 'on-change';
import * as yup from 'yup';
import './style.scss';
import render from './view';

const initApp = () => {
  const elements = {
    addForm: document.querySelector('#add-form'),
    addButton: document.querySelector('#add-feed'),
    url: document.querySelector('#url'),
    feedback: document.querySelector('#feedback'),
  };

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

  const handleSubmit = async () => {
    const { fields } = state.form;

    state.form.state = 'validating';

    try {
      await yup.string().url().validate(fields.url);

      const urls = state.feeds.map((item) => item.path);
      await yup.string().notOneOf(urls);

      state.feeds.push({ path: state.form.fields.url });
      state.form.fields.url = '';
      state.form.errors = [];
      state.form.state = 'valid';
    } catch ({ errors }) {
      state.form.errors = errors;
      state.form.state = 'invalid';
    }
  };

  elements.addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit();
  });

  elements.url.addEventListener('input', (e) => {
    state.form.fields.url = e.target.value;
  });
};

export default initApp;
