const renderForm = ({
  form, i18n, elements,
}) => {
  const { url, addButton, feedback } = elements;

  addButton.textContent = i18n.t('form.add');
  url.placeholder = i18n.t('form.url_placeholder');
  url.value = form.fields.url;

  addButton.disabled = form.state === 'validating';
  feedback.textContent = '';

  const [error] = form.errors;

  switch (form.state) {
    case 'valid':
      url.classList.remove('is-invalid');
      break;
    case 'invalid':
      url.classList.add('is-invalid');
      feedback.textContent = i18n.t(`errorsMessages.${error}`);
      break;
    case 'validating':
      break;
    default:
      throw new Error(`Unknown form state ${form.state}`);
  }
};

const render = ({
  path = null, state, i18n, elements,
}) => {
  const { form } = state;

  if (path.startsWith('form.')) {
    renderForm({
      form,
      i18n,
      elements,
    });
  }
};

export default render;
