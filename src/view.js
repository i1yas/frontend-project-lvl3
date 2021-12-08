const renderForm = ({
  form, i18n, elements,
}) => {
  const { url, addButton, feedback } = elements;

  addButton.textContent = i18n.t('form.add');
  url.placeholder = i18n.t('form.url_placeholder');
  url.value = form.fields.url;

  addButton.disabled = form.state === 'validating';
  feedback.textContent = '';

  switch (form.state) {
    case 'valid':
      url.classList.remove('is-invalid');
      break;
    case 'invalid':
      url.classList.add('is-invalid');
      feedback.textContent = i18n.t(`errorsMessages.${form.errors[0]}`);
      break;
    case 'validating':
      break;
    default:
      throw new Error(`Unknown form state ${form.state}`);
  }
};

const renderFeeds = ({ state, i18n, elements }) => {
  const { feeds } = elements;

  feeds.innerHTML = '';

  if (!state.feeds.length) return;

  const feedsItems = state.feeds.map((item) => (
    `<div>
      <a href=${item.url} target="_blank">${item.title}</a>
      <p>${item.description}</p>
    </div>`
  ));

  feeds.innerHTML = `
    <h2>${i18n.t('feeds.title')}</h2>
    ${feedsItems.join('\n')}
  `;
};

const renderPosts = ({ state, i18n, elements }) => {
  const { posts } = elements;

  posts.innerHTML = '';

  if (!state.posts.length) return;

  const sortedPostItems = state.posts.sort((a, b) => b.pubDate - a.pubDate);

  const postsItems = sortedPostItems.map((item) => {
    const isRead = state.readPosts.includes(item.guid);
    const linkClass = isRead ? 'fw-normal' : 'fw-bold';
    return (
      `<div class="row align-items-center">
        <div class="col">
          <a class="${linkClass}" href=${item.url} target="_blank">${item.title}</a>
        </div>
        <div class="col">
          <button
            class="btn btn-outline-primary btn-sm"
            data-bs-toggle="modal"
            data-bs-target="#postPreviewModal"
            data-post-id=${item.guid}
          >
            ${i18n.t('posts.show')}
          </button>
        </div>
      </div>`
    );
  });

  posts.innerHTML = `
    <h2>${i18n.t('posts.title')}</h2>
    ${postsItems.join('\n')}
  `;
};

const renderPostPreviewModal = ({ state, i18n, elements }) => {
  const { postId } = state.postPreviewModal;

  if (!postId) return;

  const post = state.posts.find((item) => item.guid === postId);

  const { postPreviewModal: modal } = elements;
  const title = modal.querySelector('.modal-title');
  const description = modal.querySelector('.modal-body');
  const readBtn = modal.querySelector('.read-more');
  const closeBtn = modal.querySelector('.close-preview');

  title.textContent = post.title;
  description.textContent = post.description;
  readBtn.textContent = i18n.t('posts.readMore');
  readBtn.href = post.url;
  closeBtn.textContent = i18n.t('posts.closePreview');
};

const render = ({
  path = '', state, i18n, elements,
}) => {
  const { form } = state;

  if (path.startsWith('form.')) {
    renderForm({
      form,
      i18n,
      elements,
    });
  }

  if (path.startsWith('postPreviewModal')) {
    renderPostPreviewModal({ state, i18n, elements });
  }

  renderFeeds({
    state,
    i18n,
    elements,
  });

  renderPosts({
    state,
    i18n,
    elements,
  });
};

export default render;
