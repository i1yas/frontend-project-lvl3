const renderForm = (form, { url, addButton, feedback }) => {
  addButton.disabled = form.state === 'validating';
  feedback.textContent = '';

  const [error] = form.errors;

  switch (form.state) {
    case 'valid':
      url.classList.remove('is-invalid');
      break;
    case 'invalid':
      url.classList.add('is-invalid');
      feedback.textContent = error;
      break;
    case 'validating':
      break;
    default:
      throw new Error(`Unknown form state ${form.state}`);
  }
};

const render = (path, value, state, {
  url, addButton, feedback,
}) => {
  switch (path) {
    case 'form.state':
      renderForm(state.form, { url, addButton, feedback });
      break;

    case 'form.fields.url':
      url.value = value;
      break;

    default:
      break;
  }
};

export default render;
