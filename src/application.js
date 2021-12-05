import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import './style.scss';
import render from './view';
import { parseXML, parseFeed } from './parser';
import ru from './locale.ru.json';

const getElements = () => ({
  addForm: document.querySelector('#add-form'),
  addButton: document.querySelector('#add-feed'),
  url: document.querySelector('#url'),
  feedback: document.querySelector('#feedback'),
  feeds: document.querySelector('#feeds'),
  posts: document.querySelector('#posts'),
});

const loadFeed = (feedUrl) => {
  const proxyUrl = 'https://hexlet-allorigins.herokuapp.com/get';
  const proxyOptions = {
    url: feedUrl,
    disableCache: true,
  };
  const promise = axios.get(proxyUrl, { params: proxyOptions });
  return promise.then(({ data }) => {
    if (data.status.http_code === 200) return data.contents;
    const error = { errors: ['network_issue'] };
    throw error;
  });
};

const handleSubmit = async (state) => {
  const { form } = state;

  form.state = 'validating';

  const { url: newUrl } = form.fields;
  const urls = state.feeds.map((item) => item.path);

  const schema = yup.string()
    .url()
    .notOneOf(urls);

  try {
    await schema.validate(newUrl);

    const rawFeedData = await loadFeed(newUrl);
    const xmlNode = parseXML(rawFeedData);
    const { channel, items } = parseFeed(xmlNode);

    const newFeed = { ...channel, url: newUrl };
    const newPosts = items.map((item) => ({ ...item, feedUrl: newUrl }));

    state.feeds.push(newFeed);
    state.posts = state.posts.concat(newPosts);
    form.fields.url = '';
    form.errors = [];
    form.state = 'valid';
  } catch (e) {
    const { errors } = e;
    form.errors = errors;
    form.state = 'invalid';
  }
};

const validationLocale = {
  mixed: {
    notOneOf: 'already_exists',
  },
  string: {
    url: 'invalid_url',
  },
};

const initialState = {
  form: {
    state: 'valid',
    errors: [],
    fields: {
      url: '',
    },
  },
  feeds: [],
  posts: [],
};

const initApp = () => {
  const elements = getElements();

  const i18n = i18next.createInstance({
    lng: 'ru',
    resources: { ru },
  }, (err) => {
    if (err) console.log('something went wrong loading', err);
  });

  yup.setLocale(validationLocale);

  const state = onChange(initialState, (path) => {
    render({
      path, state, i18n, elements,
    });
  });

  elements.addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit(state);
  });

  elements.url.addEventListener('input', (e) => {
    state.form.fields.url = e.target.value;
  });

  render({ state, i18n, elements });
};

export default initApp;
