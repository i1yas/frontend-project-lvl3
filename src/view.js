const render = (path, value, state, {
  url, addButton, feedback,
}) => {
  switch (path) {
    case 'form.state':
      addButton.disabled = value === 'validating';
      feedback.textContent = '';

      if (state.form.state === 'valid') {
        url.classList.remove('is-invalid');
        break;
      }

      if (state.form.state === 'invalid') {
        url.classList.add('is-invalid');
        const [error] = state.form.errors;
        feedback.textContent = error;
        break;
      }

      if (state.form.state === 'validating') {
        break;
      }

      break;

    case 'form.fields.url':
      url.value = value;
      break;

    default:
      break;
  }
};

export default render;
