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

  const linkGithub = document.getElementById('linkGithub');
  const linkLinkedin = document.getElementById('linkLinkedin');
  const linkPortfolio = document.getElementById('linkPortfolio');
  const linkOther = document.getElementById('linkOther');

  const educationRows = document.getElementById('educationRows');
  const experienceRows = document.getElementById('experienceRows');
  const projectRows = document.getElementById('projectRows');
  const certificationRows = document.getElementById('certificationRows');
  const achievementRows = document.getElementById('achievementRows');

  const educationTpl = document.getElementById('educationRowTpl');
  const experienceTpl = document.getElementById('experienceRowTpl');
  const projectTpl = document.getElementById('projectRowTpl');
  const certificationTpl = document.getElementById('certificationRowTpl');
  const achievementTpl = document.getElementById('achievementRowTpl');

  const skillInput = document.getElementById('skillInput');
  const skillTagsEl = document.getElementById('skillTags');

  const progressFill = document.getElementById('progressFill');
  const progressPct = document.getElementById('progressPct');

  /* preview refs */
  const pName = document.getElementById('pName');
  const pRole = document.getElementById('pRole');
  const pContact = document.getElementById('pContact');
  const pLinks = document.getElementById('pLinks');
  const pSummary = document.getElementById('pSummary');
  const pEducation = document.getElementById('pEducation');
  const pSkills = document.getElementById('pSkills');
  const pExperience = document.getElementById('pExperience');
  const pProjects = document.getElementById('pProjects');
  const pCertifications = document.getElementById('pCertifications');
  const pAchievements = document.getElementById('pAchievements');

  const blockSummary = document.getElementById('blockSummary');
  const blockEducation = document.getElementById('blockEducation');
  const blockSkills = document.getElementById('blockSkills');
  const blockExperience = document.getElementById('blockExperience');
  const blockProjects = document.getElementById('blockProjects');
  const blockCertifications = document.getElementById('blockCertifications');
  const blockAchievements = document.getElementById('blockAchievements');
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

  document.getElementById('addProject').addEventListener('click', () => {
    addRow(projectRows, projectTpl, 'proj');
    updateAll();
  });

  document.getElementById('addCertification').addEventListener('click', () => {
    addRow(certificationRows, certificationTpl, 'cert');
    updateAll();
  });

  document.getElementById('addAchievement').addEventListener('click', () => {
    addRow(achievementRows, achievementTpl, 'ach');
    updateAll();
  });

  /* Seed one row of each so the form doesn't feel empty */
  addRow(educationRows, educationTpl, 'edu');
  addRow(experienceRows, experienceTpl, 'exp');
  addRow(projectRows, projectTpl, 'proj');
  addRow(certificationRows, certificationTpl, 'cert');
  addRow(achievementRows, achievementTpl, 'ach');

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
  [fullName, email, phone, location, summary, linkGithub, linkLinkedin, linkPortfolio, linkOther].forEach(el => {
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

  function normalizeUrl(value) {
    const v = value.trim();
    if (!v) return '';
    if (/^https?:\/\//i.test(v)) return v;
    return `https://${v}`;
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

    /* profile links */
    pLinks.innerHTML = '';
    [
      ['GitHub', linkGithub.value],
      ['LinkedIn', linkLinkedin.value],
      ['Portfolio', linkPortfolio.value],
      ['Link', linkOther.value]
    ].forEach(([label, raw]) => {
      const url = normalizeUrl(raw);
      if (!url) return;
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = label;
      pLinks.appendChild(a);
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

    /* projects */
    const projectData = readRows(projectRows).filter(r => r.name);
    pProjects.innerHTML = '';
    if (projectData.length) {
      projectData.forEach(p => {
        const entry = document.createElement('div');
        entry.className = 'resume-entry';
        const url = normalizeUrl(p.link || '');
        entry.innerHTML = `
          <div class="resume-entry-top">
            <div>
              <div class="resume-entry-title">${escapeHtml(p.name)}</div>
              <div class="resume-entry-sub">${escapeHtml(p.stack || '')}</div>
            </div>
            ${url ? `<a class="resume-entry-link" href="${url}" target="_blank" rel="noopener noreferrer">View</a>` : ''}
          </div>
          ${p.description ? `<div class="resume-entry-desc">${escapeHtml(p.description)}</div>` : ''}`;
        pProjects.appendChild(entry);
      });
      blockProjects.hidden = false;
    } else {
      blockProjects.hidden = true;
    }

    /* certifications */
    const certData = readRows(certificationRows).filter(r => r.name);
    pCertifications.innerHTML = '';
    if (certData.length) {
      certData.forEach(c => {
        const entry = document.createElement('div');
        entry.className = 'resume-entry';
        const url = normalizeUrl(c.link || '');
        entry.innerHTML = `
          <div class="resume-entry-top">
            <div>
              <div class="resume-entry-title">${escapeHtml(c.name)}</div>
              <div class="resume-entry-sub">${escapeHtml(c.provider || '')}</div>
            </div>
            ${url ? `<a class="resume-entry-link" href="${url}" target="_blank" rel="noopener noreferrer">Verify</a>` : ''}
          </div>`;
        pCertifications.appendChild(entry);
      });
      blockCertifications.hidden = false;
    } else {
      blockCertifications.hidden = true;
    }

    /* achievements */
    const achData = readRows(achievementRows).filter(r => r.text);
    pAchievements.innerHTML = '';
    if (achData.length) {
      achData.forEach(a => {
        const li = document.createElement('li');
        li.textContent = a.text;
        pAchievements.appendChild(li);
      });
      blockAchievements.hidden = false;
    } else {
      blockAchievements.hidden = true;
    }

    /* empty state */
    const hasAnything = name || emailVal || phoneVal || locVal || summaryVal || eduData.length || skills.length || expData.length
      || projectData.length || certData.length || achData.length || linkGithub.value.trim() || linkLinkedin.value.trim()
      || linkPortfolio.value.trim() || linkOther.value.trim();
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
      readRows(experienceRows).some(r => r.company || r.role),
      readRows(projectRows).some(r => r.name),
      readRows(certificationRows).some(r => r.name),
      readRows(achievementRows).some(r => r.text)
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
    linkGithub.value = '';
    linkLinkedin.value = '';
    linkPortfolio.value = '';
    linkOther.value = '';
    educationRows.innerHTML = '';
    experienceRows.innerHTML = '';
    projectRows.innerHTML = '';
    certificationRows.innerHTML = '';
    achievementRows.innerHTML = '';
    skills = [];
    renderSkillTags();
    addRow(educationRows, educationTpl, 'edu');
    addRow(experienceRows, experienceTpl, 'exp');
    addRow(projectRows, projectTpl, 'proj');
    addRow(certificationRows, certificationTpl, 'cert');
    addRow(achievementRows, achievementTpl, 'ach');
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