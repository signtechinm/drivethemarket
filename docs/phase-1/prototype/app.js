const screens = [...document.querySelectorAll('.screen')];
const prototypeLinks = [...document.querySelectorAll('.prototype-link')];
const releaseDialog = document.querySelector('#release-dialog');
const enquiryDialog = document.querySelector('#enquiry-dialog');
const toast = document.querySelector('.toast');

function showScreen(id) {
  screens.forEach((screen) => screen.classList.toggle('active', screen.id === id));
  prototypeLinks.forEach((link) => link.classList.toggle('active', link.dataset.screen === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showView(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const group = target.classList.contains('student-view') ? '.student-view' : '.admin-view';
  document.querySelectorAll(group).forEach((view) => view.classList.remove('active'));
  target.classList.add('active');
  if (target.classList.contains('student-view')) showScreen('student');
  else showScreen('admin');
  document.querySelectorAll('[data-view]').forEach((button) => {
    if (button.closest('.sidebar') || button.closest('.student-header')) {
      button.classList.toggle('active', button.dataset.view === id);
    }
  });
}

function openDialog(dialog) {
  dialog.hidden = false;
  document.body.style.overflow = 'hidden';
  const focusTarget = dialog.querySelector('input, button');
  focusTarget?.focus();
}

function closeDialog(dialog) {
  dialog.hidden = true;
  document.body.style.overflow = '';
}

function showToast(title = 'Action completed', message = 'The prototype state has been updated.') {
  toast.querySelector('strong').textContent = title;
  toast.querySelector('small').textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3500);
}

document.addEventListener('click', (event) => {
  const screenButton = event.target.closest('[data-screen]');
  if (screenButton) showScreen(screenButton.dataset.screen);

  const viewButton = event.target.closest('[data-view]');
  if (viewButton) showView(viewButton.dataset.view);

  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) return;

  const action = actionButton.dataset.action;
  if (action === 'open-release') openDialog(releaseDialog);
  if (action === 'close-dialog') closeDialog(releaseDialog);
  if (action === 'confirm-release') {
    closeDialog(releaseDialog);
    document.querySelector('#release .status.completed').textContent = 'Materials released';
    const releaseButton = document.querySelector('[data-action="open-release"]');
    releaseButton.textContent = '✓ Released to 28 students';
    releaseButton.disabled = true;
    showToast('Materials released', '28 students now have access.');
  }
  if (action === 'enquire') openDialog(enquiryDialog);
  if (action === 'close-enquiry') closeDialog(enquiryDialog);
  if (action === 'submit-enquiry') {
    closeDialog(enquiryDialog);
    showToast('Enquiry received', 'The academic team will contact you shortly.');
  }
  if (action === 'mark-complete') {
    actionButton.textContent = '✓ Class completed';
    actionButton.classList.remove('ghost');
    actionButton.classList.add('primary');
    showToast('Progress updated', 'Class 06 is now marked complete.');
  }
  if (['quick', 'new-batch', 'class-details', 'courses', 'course-detail', 'select-all'].includes(action)) {
    showToast('Prototype interaction', 'This action will be implemented in the production application.');
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!releaseDialog.hidden) closeDialog(releaseDialog);
  if (!enquiryDialog.hidden) closeDialog(enquiryDialog);
});

[releaseDialog, enquiryDialog].forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog(dialog);
  });
});
