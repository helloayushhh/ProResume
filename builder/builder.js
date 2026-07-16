// ==========================================================================
// Resume Builder — form state, live preview, progress bar, PDF export
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------ */
  /* State                                                               */
  /* ------------------------------------------------------------------ */
  let skills = [];
  let eduCount = 0;
  let expCount = 0;

  /* ------------------------------------------------------------------ */
  /* Element refs                                                        */
  /* ------------------------------------------------------------------ */
  const fullName = document.getElementById('fullName');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  const location = document.getElementById('location');
  const summary = document.getElementById('summary');

  const educationRows = document.getElementById('educationRows');
  const experienceRows = document.getElementById('experienceRows');
  const educationTpl = document.getElementById('educationRowTpl');
  const experienceTpl = document.getElementById('experienceRowTpl');

  const skillInput = document.getElementById('skillInput');
  const skillTagsEl = document.getElementById('skillTags');

  const progressFill = document.getElementById('progressFill');
  const progressPct = document.getElementById('progressPct');

  /* preview refs */
  const pName = document.getElementById('pName');
  const pRole = document.getElementById('pRole');
  const pContact = document.getElementById('pContact');
  const pSummary = document.getElementById('pSummary');
  const pEducation = document.getElementById('pEducation');
  const pSkills = document.getElementById('pSkills');
  const pExperience = document.getElementById('pExperience');

  const blockSummary = document.getElementById('blockSummary');
  const blockEducation = document.getElementById('blockEducation');
  const blockSkills = document.getElementById('blockSkills');
  const blockExperience = document.getElementById('blockExperience');
  const emptyState = document.getElementById('emptyState');

  /* ------------------------------------------------------------------ */
  /* Dynamic row helpers                                                 */
  /* ------------------------------------------------------------------ */
  function addRow(container, tpl, prefix) {
    const clone = tpl.content.cloneNode(true);
    const rowEl = clone.querySelector('[data-row]');
    const id = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    rowEl.dataset.id = id;

    rowEl.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', updateAll);
    });
    rowEl.querySelector('.row-remove').addEventListener('click', () => {
      rowEl.style.opacity = '0';
      rowEl.style.transform = 'translateY(-6px) scale(0.98)';
      setTimeout(() => {
        rowEl.remove();
        updateAll();
      }, 200);
    });

    container.appendChild(rowEl);
    return rowEl;
  }

  document.getElementById('addEducation').addEventListener('click', () => {
    eduCount++;
    addRow(educationRows, educationTpl, 'edu');
    updateAll();
  });

  document.getElementById('addExperience').addEventListener('click', () => {
    expCount++;
    addRow(experienceRows, experienceTpl, 'exp');
    updateAll();
  });

  /* Seed one row of each so the form doesn't feel empty */
  addRow(educationRows, educationTpl, 'edu');
  addRow(experienceRows, experienceTpl, 'exp');

  /* ------------------------------------------------------------------ */
  /* Skills / tag input                                                  */
  /* ------------------------------------------------------------------ */
  function addSkill(value) {
    const clean = value.trim();
    if (!clean || skills.includes(clean)) return;
    skills.push(clean);
    renderSkillTags();
    updateAll();
  }

  function removeSkill(value) {
    skills = skills.filter(s => s !== value);
    renderSkillTags();
    updateAll();
  }

  function renderSkillTags() {
    skillTagsEl.innerHTML = '';
    skills.forEach(skill => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.innerHTML = `<span>${escapeHtml(skill)}</span>`;
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.innerHTML = '&times;';
      removeBtn.setAttribute('aria-label', `Remove ${skill}`);
      removeBtn.addEventListener('click', () => removeSkill(skill));
      chip.appendChild(removeBtn);
      skillTagsEl.appendChild(chip);
    });
  }

  skillInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(skillInput.value);
      skillInput.value = '';
    }
  });
  document.getElementById('addSkill').addEventListener('click', () => {
    addSkill(skillInput.value);
    skillInput.value = '';
    skillInput.focus();
  });
  document.querySelectorAll('.tag-suggest').forEach(tag => {
    tag.addEventListener('click', () => addSkill(tag.textContent));
  });

  /* ------------------------------------------------------------------ */
  /* Personal fields listeners                                           */
  /* ------------------------------------------------------------------ */
  [fullName, email, phone, location, summary].forEach(el => {
    el.addEventListener('input', updateAll);
  });

  /* ------------------------------------------------------------------ */
  /* Escape helper (avoid injecting raw HTML from user input)            */
  /* ------------------------------------------------------------------ */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ------------------------------------------------------------------ */
  /* Read row data                                                       */
  /* ------------------------------------------------------------------ */
  function readRows(container) {
    return Array.from(container.querySelectorAll('[data-row]')).map(row => {
      const data = {};
      row.querySelectorAll('[data-key]').forEach(input => {
        data[input.dataset.key] = input.value.trim();
      });
      return data;
    });
  }

  /* ------------------------------------------------------------------ */
  /* Render preview                                                      */
  /* ------------------------------------------------------------------ */
  function updatePreview() {
    const name = fullName.value.trim();
    const emailVal = email.value.trim();
    const phoneVal = phone.value.trim();
    const locVal = location.value.trim();
    const summaryVal = summary.value.trim();
    const eduData = readRows(educationRows).filter(r => r.school || r.degree);
    const expData = readRows(experienceRows).filter(r => r.company || r.role);

    pName.textContent = name || 'Your Name';
    pRole.textContent = expData[0] && expData[0].role ? expData[0].role : (eduData[0] && eduData[0].degree ? eduData[0].degree : 'Your role or headline');

    pContact.innerHTML = '';
    [
      ['email', emailVal || 'you@email.com'],
      ['phone', phoneVal || '+91 00000 00000'],
      ['location', locVal || 'Your city']
    ].forEach(([key, val]) => {
      const span = document.createElement('span');
      span.dataset.field = key;
      span.textContent = val;
      pContact.appendChild(span);
    });

    /* summary */
    if (summaryVal) {
      pSummary.textContent = summaryVal;
      blockSummary.hidden = false;
    } else {
      blockSummary.hidden = true;
    }

    /* education */
    pEducation.innerHTML = '';
    if (eduData.length) {
      eduData.forEach(e => {
        const entry = document.createElement('div');
        entry.className = 'resume-entry';
        entry.innerHTML = `
          <div class="resume-entry-top">
            <div>
              <div class="resume-entry-title">${escapeHtml(e.school || 'School / University')}</div>
              <div class="resume-entry-sub">${escapeHtml(e.degree || '')}</div>
            </div>
            <div class="resume-entry-meta">${escapeHtml(e.year || '')}${e.grade ? ' · ' + escapeHtml(e.grade) : ''}</div>
          </div>`;
        pEducation.appendChild(entry);
      });
      blockEducation.hidden = false;
    } else {
      blockEducation.hidden = true;
    }

    /* skills */
    pSkills.innerHTML = '';
    if (skills.length) {
      skills.forEach(skill => {
        const chip = document.createElement('span');
        chip.className = 'resume-skill-chip';
        chip.textContent = skill;
        pSkills.appendChild(chip);
      });
      blockSkills.hidden = false;
    } else {
      blockSkills.hidden = true;
    }

    /* experience */
    pExperience.innerHTML = '';
    if (expData.length) {
      expData.forEach(x => {
        const entry = document.createElement('div');
        entry.className = 'resume-entry';
        entry.innerHTML = `
          <div class="resume-entry-top">
            <div>
              <div class="resume-entry-title">${escapeHtml(x.role || 'Role')}</div>
              <div class="resume-entry-sub">${escapeHtml(x.company || '')}</div>
            </div>
            <div class="resume-entry-meta">${escapeHtml(x.duration || '')}</div>
          </div>
          ${x.description ? `<div class="resume-entry-desc">${escapeHtml(x.description)}</div>` : ''}`;
        pExperience.appendChild(entry);
      });
      blockExperience.hidden = false;
    } else {
      blockExperience.hidden = true;
    }

    /* empty state */
    const hasAnything = name || emailVal || phoneVal || locVal || summaryVal || eduData.length || skills.length || expData.length;
    emptyState.classList.toggle('hide', !!hasAnything);
  }

  /* ------------------------------------------------------------------ */
  /* Progress bar                                                        */
  /* ------------------------------------------------------------------ */
  function updateProgress() {
    const checks = [
      !!fullName.value.trim(),
      !!email.value.trim(),
      !!phone.value.trim(),
      !!summary.value.trim(),
      readRows(educationRows).some(r => r.school || r.degree),
      skills.length > 0,
      readRows(experienceRows).some(r => r.company || r.role)
    ];
    const done = checks.filter(Boolean).length;
    const pct = Math.round((done / checks.length) * 100);
    progressFill.style.width = pct + '%';
    progressPct.textContent = pct;
  }

  function updateAll() {
    updatePreview();
    updateProgress();
  }

  /* ------------------------------------------------------------------ */
  /* Clear form                                                          */
  /* ------------------------------------------------------------------ */
  document.getElementById('clearForm').addEventListener('click', () => {
    if (!confirm('Clear the whole form? This cannot be undone.')) return;
    fullName.value = '';
    email.value = '';
    phone.value = '';
    location.value = '';
    summary.value = '';
    educationRows.innerHTML = '';
    experienceRows.innerHTML = '';
    skills = [];
    renderSkillTags();
    addRow(educationRows, educationTpl, 'edu');
    addRow(experienceRows, experienceTpl, 'exp');
    updateAll();
  });

  /* ------------------------------------------------------------------ */
  /* Download as PDF                                                     */
  /* ------------------------------------------------------------------ */
  document.getElementById('downloadPdf').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const resumeEl = document.getElementById('resumePage');
    const label = btn.querySelector('span');
    const originalText = label.textContent;
    label.textContent = 'Preparing…';
    btn.disabled = true;

    const fileName = (fullName.value.trim() || 'resume').toLowerCase().replace(/\s+/g, '-');

    const opt = {
      margin: 0,
      filename: `${fileName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
      window.html2pdf().set(opt).from(resumeEl).save().then(() => {
        label.textContent = originalText;
        btn.disabled = false;
      }).catch(() => {
        label.textContent = originalText;
        btn.disabled = false;
        alert('PDF export failed — please try again.');
      });
    } else {
      label.textContent = originalText;
      btn.disabled = false;
      alert('PDF library did not load — check your connection and try again.');
    }
  });

  /* ------------------------------------------------------------------ */
  /* Init                                                                */
  /* ------------------------------------------------------------------ */
  renderSkillTags();
  updateAll();

});