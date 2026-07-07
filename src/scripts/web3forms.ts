export function initWeb3Form(form: HTMLFormElement, redirectPath: string): void {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      const result = (await response.json()) as { success?: boolean };

      if (result.success) {
        window.location.assign(redirectPath);
        return;
      }
    } catch {
      /* network error — allow retry */
    }

    if (submitButton) submitButton.disabled = false;
  });
}
