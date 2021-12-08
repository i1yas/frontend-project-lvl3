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
  postPreviewModal: document.querySelector('#postPreviewModal'),
  readPostBtn: document.querySelector('#postPreviewModal .read-more'),
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

const updateFeed = ({ state, feedInd, newData }) => {
  const feed = state.feeds[feedInd];
  const posts = state.posts.filter((post) => post.feedUrl === feed.url);

  const newPosts = newData.items
    .filter((item) => {
      const samePost = posts.find((post) => post.guid === item.guid);
      return !samePost;
    })
    .map((post) => ({ ...post, feedUrl: feed.url }));

  state.posts = state.posts.concat(newPosts);
};

const watchFeeds = ({ state, feedInd = 0, interval = 5000 }) => {
  setTimeout(() => {
    const currentFeed = state.feeds[feedInd];

    if (!currentFeed) {
      return watchFeeds({ state, interval });
    }

    const onResponseEnd = (error) => (response) => {
      if (!error) {
        const xmlNode = parseXML(response);
        const newData = parseFeed(xmlNode);
        updateFeed({ state, feedInd, newData });
      }
      const nextFeedInd = (feedInd + 1) % state.feeds.length;
      watchFeeds({ state, feedInd: nextFeedInd, interval });
    };

    return loadFeed(currentFeed.url)
      .then(onResponseEnd())
      .catch(onResponseEnd(true));
  }, interval);
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
  readPosts: [],
  postPreviewModal: {
    postId: null,
  },
};

const initEventListeners = ({ elements, state }) => {
  elements.addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit(state);
  });

  elements.url.addEventListener('input', (e) => {
    state.form.fields.url = e.target.value;
  });

  elements.postPreviewModal.addEventListener('show.bs.modal', (e) => {
    const button = e.relatedTarget;
    const { postId } = button.dataset;
    state.postPreviewModal.postId = postId;
  });

  elements.postPreviewModal.addEventListener('hide.bs.modal', () => {
    state.postPreviewModal.postId = null;
  });

  elements.readPostBtn.addEventListener('click', () => {
    const { postId } = state.postPreviewModal;
    if (state.readPosts.includes(postId)) return;
    state.readPosts.push(postId);
  });
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

  initEventListeners({ elements, state });

  watchFeeds({ state });

  render({ state, i18n, elements });
};

export default initApp;
