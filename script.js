/**
 * Employee Onboarding Assistant - script.js
 * Plain JavaScript (ES6+), No Frameworks, No Backend
 * Client-Side Only - Zero Persistent Storage for Sensitive Data
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. WELCOME SECTION
  // =========================================================================
  const userNameInput = document.getElementById('userNameInput');
  const displayName = document.getElementById('displayName');
  const currentDateChip = document.getElementById('currentDateChip');

  // Set formatted current date in header chip
  if (currentDateChip) {
    const today = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    currentDateChip.textContent = today.toLocaleDateString(undefined, options);
  }

  // Reactive Welcome Greeting
  userNameInput.addEventListener('input', (e) => {
    const trimmed = e.target.value.trim();
    if (trimmed) {
      displayName.textContent = trimmed;
    } else {
      displayName.textContent = 'Colleague';
    }

    // Auto-sync to Form 1 Full Name if user hasn't explicitly customized Form 1
    const form1Name = document.getElementById('form1_fullname');
    if (form1Name && (!form1Name.dataset.userEdited || form1Name.value === '')) {
      form1Name.value = trimmed;
      updateFormCounter(1);
    }

    // Also auto-sync to Form 7 (NDA signature) if not customized
    const form7Name = document.getElementById('form7_signee_name');
    if (form7Name && (!form7Name.dataset.userEdited || form7Name.value === '')) {
      form7Name.value = trimmed;
      updateFormCounter(7);
    }
  });

  // Track if user manually edits Form 1 name
  const form1NameInput = document.getElementById('form1_fullname');
  if (form1NameInput) {
    form1NameInput.addEventListener('input', () => {
      form1NameInput.dataset.userEdited = 'true';
    });
  }


  // =========================================================================
  // 2. POLICY Q&A SECTION (Sample Policy Data & Keyword Matching Engine)
  // =========================================================================
  const companyPolicies = [
    {
      id: 'leave',
      topic: 'Leave & Holidays Policy',
      icon: '🏖️',
      keywords: ['leave', 'holiday', 'holidays', 'vacation', 'pto', 'sick', 'casual', 'maternity', 'paternity', 'bereavement', 'off', 'absent', 'time off'],
      summary: 'Employees are entitled to 28 days of paid annual leave plus declared public holidays.',
      points: [
        'Annual Earned / Privilege Leave: 18 days per calendar year (accrued monthly at 1.5 days).',
        'Casual & Sick Leave: 10 days per year for personal errands or health recovery without prior notice.',
        'Maternity & Paternity Leave: 26 weeks fully paid maternity leave; 2 weeks paid paternity leave.',
        'Public Holidays: 10 fixed company-wide holidays published annually on the intranet calendar.',
        'Apply for planned leaves at least 3 business days in advance via the HRMS portal.'
      ],
      contact: 'People Operations (leave@company.com)'
    },
    {
      id: 'working_hours',
      topic: 'Working Hours & Hybrid Policy',
      icon: '🕒',
      keywords: ['hours', 'timing', 'timings', 'work', 'working', 'shift', 'flexible', 'hybrid', 'remote', 'wfh', 'lunch', 'break', 'schedule', 'core hours'],
      summary: 'Our standard work week is 40 hours, Monday through Friday, with flexible hybrid options.',
      points: [
        'Standard Business Hours: 9:30 AM to 6:30 PM with 1 hour flexible lunch/break window.',
        'Core Collaboration Hours: 11:00 AM to 4:00 PM when all team members are expected to be available for syncs.',
        'Hybrid Model: 2 to 3 days in-office per week depending on team cadence; 2 days remote work allowed.',
        'Flexible Shift Options: Discuss and align with your reporting manager for custom working windows if needed.'
      ],
      contact: 'Your Direct Manager / People Ops'
    },
    {
      id: 'dress_code',
      topic: 'Workplace Dress Code',
      icon: '👔',
      keywords: ['dress', 'code', 'clothes', 'attire', 'wear', 'formal', 'casual', 'friday', 'shoes', 'jeans', 'appearance'],
      summary: 'Smart casual from Monday to Thursday, with relaxed casual attire on Fridays.',
      points: [
        'Monday to Thursday: Smart Casual (collared shirts, polos, blouses, chinos, neat denim, closed footwear or clean sneakers).',
        'Casual Fridays: Relaxed Casual (tees, jeans, casual sneakers). Offensive slogans or beachwear are not permitted.',
        'Client Meetings & Formal Events: Business Formal attire (blazers, suits, dress trousers) is expected when representing the company to external clients.',
        'Remote Video Calls: Business casual from the waist up during client or company-wide video syncs.'
      ],
      contact: 'HR Workplace Experience (workplace@company.com)'
    },
    {
      id: 'it_usage',
      topic: 'IT Assets & Information Security',
      icon: '💻',
      keywords: ['it', 'laptop', 'computer', 'macbook', 'asset', 'assets', 'software', 'security', 'password', 'wifi', 'vpn', 'usb', 'install', 'device', 'byod', 'data'],
      summary: 'Company-issued laptops and digital assets are designated strictly for authorized official business.',
      points: [
        'Mandatory Multi-Factor Authentication (MFA / 2FA) must be enabled on all corporate email, Slack, and VPN accounts.',
        'Software Installation: Only pre-approved software from Company Self-Service portal may be installed. Pirated or peer-to-peer software is strictly prohibited.',
        'Security Updates: Keep OS auto-updates enabled. Do not disable antivirus or compliance management software.',
        'Device Security: Always lock your screen (Win+L / Cmd+Ctrl+Q) when stepping away. Never leave equipment unattended in public.',
        'Lost or Stolen Assets: Report immediately within 2 hours to IT Security at security@company.com.'
      ],
      contact: 'IT Helpdesk & Cyber Security (it-support@company.com)'
    },
    {
      id: 'code_of_conduct',
      topic: 'Code of Conduct & Ethics',
      icon: '🤝',
      keywords: ['conduct', 'ethics', 'harassment', 'posh', 'respect', 'bribe', 'bribery', 'conflict', 'behavior', 'complaint', 'integrity', 'whistleblower'],
      summary: 'We maintain a respectful, safe, inclusive, and ethical environment for all team members.',
      points: [
        'Zero Tolerance for Harassment: Any harassment, discrimination, bullying, or unwelcome conduct is strictly prohibited.',
        'POSH & Equal Opportunity: Our Internal Complaints Committee (ICC) ensures safe, confidential resolution of workplace grievances.',
        'Conflict of Interest: Outside commercial engagements, moonlighting without approval, or personal gain using company resources is disallowed.',
        'Whistleblower Protection: Anonymous reporting available via the confidential ethics hotline.'
      ],
      contact: 'Ethics Committee (ethics@company.com)'
    },
    {
      id: 'probation_performance',
      topic: 'Probation Period & Performance Reviews',
      icon: '📈',
      keywords: ['probation', 'review', 'performance', 'confirmation', 'notice', 'period', 'appraisal', 'evaluation', 'goals', 'okr'],
      summary: 'New joiners undergo a standard 3 to 6 months probation period to align expectations and growth.',
      points: [
        'Duration: Standard probation is 3 to 6 months depending on the role designation.',
        'Check-ins: Bi-weekly catchups with your manager, with a comprehensive 30-day and 90-day milestone review.',
        'Confirmation: A formal confirmation letter is issued upon successful review at the end of the probation window.',
        'Notice Period: During probation, notice period is 15 to 30 days for either party; 60 to 90 days post confirmation.'
      ],
      contact: 'People Operations (people@company.com)'
    },
    {
      id: 'benefits_insurance',
      topic: 'Medical Benefits & Health Insurance',
      icon: '🏥',
      keywords: ['insurance', 'medical', 'health', 'mediclaim', 'doctor', 'hospital', 'wellness', 'gym', 'benefits', 'reimbursement', 'claims'],
      summary: 'Comprehensive Group Medical Insurance coverage for you and your eligible family dependents.',
      points: [
        'Group Medical Cover: Up to $10,000 / ₹5,00,000 floater coverage for self, spouse, and up to 2 children.',
        'Cashless Hospitalization: Network across 8,000+ top hospitals via our digital insurance app.',
        'Wellness Allowance: Annual reimbursement for gym memberships, mental health therapy, and optical check-ups.',
        'Enrollment: Complete your nominee and dependent registration in Form 5 within the first 15 days.'
      ],
      contact: 'Benefits Team (benefits@company.com)'
    }
  ];

  const policyQueryInput = document.getElementById('policyQueryInput');
  const askPolicyBtn = document.getElementById('askPolicyBtn');
  const clearQueryBtn = document.getElementById('clearQueryBtn');
  const policyAnswerContainer = document.getElementById('policyAnswerContainer');
  const quickButtons = document.querySelectorAll('.quick-btn');

  // Input listeners for clear button toggle
  policyQueryInput.addEventListener('input', () => {
    clearQueryBtn.style.display = policyQueryInput.value ? 'block' : 'none';
  });

  clearQueryBtn.addEventListener('click', () => {
    policyQueryInput.value = '';
    clearQueryBtn.style.display = 'none';
    policyQueryInput.focus();
    renderEmptyPolicyState();
  });

  // Quick Question Buttons
  quickButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const query = btn.dataset.query;
      policyQueryInput.value = query;
      clearQueryBtn.style.display = 'block';
      searchPolicy(query);
    });
  });

  // Search button and Enter key
  askPolicyBtn.addEventListener('click', () => {
    searchPolicy(policyQueryInput.value);
  });

  policyQueryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchPolicy(policyQueryInput.value);
    }
  });

  // Keyword Matching Algorithm
  function searchPolicy(rawQuery) {
    if (!rawQuery || !rawQuery.trim()) {
      renderEmptyPolicyState();
      return;
    }

    const query = rawQuery.toLowerCase().trim();
    // Normalize words into tokens
    const tokens = query.replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);

    let bestMatch = null;
    let highestScore = 0;

    companyPolicies.forEach((policy) => {
      let score = 0;

      // Check direct ID or topic match
      if (query.includes(policy.id) || policy.topic.toLowerCase().includes(query)) {
        score += 15;
      }

      tokens.forEach((token) => {
        // Direct keyword match
        policy.keywords.forEach((kw) => {
          if (kw === token) {
            score += 10;
          } else if (kw.includes(token) || token.includes(kw)) {
            score += 4;
          }
        });

        // Points & summary text match
        if (policy.summary.toLowerCase().includes(token)) {
          score += 2;
        }
        policy.points.forEach((pt) => {
          if (pt.toLowerCase().includes(token)) {
            score += 1.5;
          }
        });
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = policy;
      }
    });

    // Score threshold for confident match
    if (bestMatch && highestScore >= 3) {
      renderPolicyAnswer(bestMatch, query);
    } else {
      renderPolicyFallback(rawQuery);
    }
  }

  function renderPolicyAnswer(policy, userQuery) {
    policyAnswerContainer.classList.remove('empty-state');
    policyAnswerContainer.innerHTML = `
      <div class="answer-card">
        <div class="answer-header">
          <div class="answer-topic">
            <span class="topic-icon">${policy.icon}</span>
            <h4 class="topic-title">${policy.topic}</h4>
          </div>
          <span class="matched-badge">Official Policy Guidance</span>
        </div>
        <p class="answer-summary">${policy.summary}</p>
        <ul class="answer-points-list">
          ${policy.points.map(pt => `<li>${pt}</li>`).join('')}
        </ul>
        <div class="answer-footer">
          <span>Need an exception or further clarity?</span>
          <span class="contact-helper">Contact: ${policy.contact}</span>
        </div>
      </div>
    `;
  }

  function renderPolicyFallback(userQuery) {
    policyAnswerContainer.classList.remove('empty-state');
    policyAnswerContainer.innerHTML = `
      <div class="fallback-card">
        <div class="fallback-header">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>No Direct Policy Match Found</span>
        </div>
        <p class="fallback-text">
          I couldn't find a specific policy entry matching <strong>"${escapeHTML(userQuery)}"</strong>. 
          Company guidelines are regularly updated. For specific advice, approvals, or exceptions, please connect with 
          <strong>People Operations (hr@company.com)</strong> or speak with your onboarding buddy.
        </p>
        <div class="fallback-suggestions">
          <span>Or explore these common policy topics:</span>
          <div class="fallback-chips">
            <button type="button" class="fallback-chip" data-query="working hours">Working Hours</button>
            <button type="button" class="fallback-chip" data-query="leave policy">Leave &amp; Holidays</button>
            <button type="button" class="fallback-chip" data-query="dress code">Dress Code</button>
            <button type="button" class="fallback-chip" data-query="it usage">IT &amp; Laptop Usage</button>
            <button type="button" class="fallback-chip" data-query="code of conduct">Code of Conduct &amp; Ethics</button>
            <button type="button" class="fallback-chip" data-query="health insurance">Medical Benefits</button>
          </div>
        </div>
      </div>
    `;

    // Bind click events on suggestion chips
    policyAnswerContainer.querySelectorAll('.fallback-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.dataset.query;
        policyQueryInput.value = q;
        clearQueryBtn.style.display = 'block';
        searchPolicy(q);
      });
    });
  }

  function renderEmptyPolicyState() {
    policyAnswerContainer.classList.add('empty-state');
    policyAnswerContainer.innerHTML = `
      <div class="answer-empty">
        <div class="empty-icon-circle">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <h4 class="empty-title">Have a policy question?</h4>
        <p class="empty-sub">Type a keyword above or click one of the quick buttons to view policy details.</p>
      </div>
    `;
  }


  // =========================================================================
  // 3. ONBOARDING CHECKLIST SECTION (Saved in localStorage)
  // =========================================================================
  const CHECKLIST_STORAGE_KEY = 'emp_onboarding_checklist_state_v1';

  const checklistData = {
    day1: [
      { id: 'd1_t1', label: 'Attend Welcome & HR Orientation', desc: 'Join the morning welcome briefing with People Ops and meet other new joiners.' },
      { id: 'd1_t2', label: 'Configure Laptop & IT Security Credentials', desc: 'Activate corporate email, MFA, 1Password, VPN, and connect to secure Wi-Fi.' },
      { id: 'd1_t3', label: 'Meet Your Assigned Onboarding Buddy', desc: 'Schedule a 20-min coffee sync with your assigned buddy for team guidance.' },
      { id: 'd1_t4', label: 'Fill Joining Documents & Payroll Info', desc: 'Complete the 9 documentation forms below and copy your details for HR.' }
    ],
    week1: [
      { id: 'w1_t1', label: '1-on-1 Milestone Alignment with Manager', desc: 'Review role expectations, team roadmap, and first 30-60-90 day goals.' },
      { id: 'w1_t2', label: 'Team Intro & Join Channels', desc: 'Say hello on Slack/Teams channels, join daily standups and weekly syncs.' },
      { id: 'w1_t3', label: 'Repository & Workspace Permissions', desc: 'Verify access to GitHub, Jira, Figma, internal wikis, and cloud consoles.' },
      { id: 'w1_t4', label: 'Complete Mandatory Security & POSH Modules', desc: 'Finish initial cyber awareness, data privacy, and anti-harassment e-learnings.' }
    ],
    month1: [
      { id: 'm1_t1', label: 'Ship First Project / Task Delivery', desc: 'Successfully complete and deploy your first sprint task or independent assignment.' },
      { id: 'm1_t2', label: '30-Day Check-in with Manager', desc: 'Reflect on initial wins, discuss blockers, and evaluate onboarding velocity.' },
      { id: 'm1_t3', label: 'Enroll in Medical Insurance & Benefits', desc: 'Submit dependent info and ensure benefits card is issued.' },
      { id: 'm1_t4', label: 'Submit 30-Day Onboarding Feedback', desc: 'Complete the anonymous HR pulse survey to help improve the onboarding program.' }
    ]
  };

  // Load saved checklist state from localStorage
  let checklistState = loadChecklistState();

  function loadChecklistState() {
    try {
      const saved = localStorage.getItem(CHECKLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.warn('Could not read checklist from localStorage', e);
      return {};
    }
  }

  function saveChecklistState() {
    try {
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checklistState));
    } catch (e) {
      console.warn('Could not save checklist to localStorage', e);
    }
  }

  // Render checklist groups
  function renderChecklistGroup(groupId, tasks, containerEl) {
    containerEl.innerHTML = '';
    tasks.forEach(task => {
      const isChecked = !!checklistState[task.id];
      const itemEl = document.createElement('div');
      itemEl.className = `task-item ${isChecked ? 'checked' : ''}`;
      itemEl.dataset.taskId = task.id;

      itemEl.innerHTML = `
        <input type="checkbox" class="task-checkbox" id="chk_${task.id}" ${isChecked ? 'checked' : ''}>
        <div class="task-text-wrap">
          <label class="task-label" for="chk_${task.id}">${task.label}</label>
          <p class="task-desc">${task.desc}</p>
        </div>
      `;

      // Event listener for checkbox
      const checkbox = itemEl.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', (e) => {
        checklistState[task.id] = e.target.checked;
        if (e.target.checked) {
          itemEl.classList.add('checked');
        } else {
          itemEl.classList.remove('checked');
        }
        saveChecklistState();
        updateChecklistProgress();
      });

      containerEl.appendChild(itemEl);
    });
  }

  const taskListDay1 = document.getElementById('taskListDay1');
  const taskListWeek1 = document.getElementById('taskListWeek1');
  const taskListMonth1 = document.getElementById('taskListMonth1');

  renderChecklistGroup('day1', checklistData.day1, taskListDay1);
  renderChecklistGroup('week1', checklistData.week1, taskListWeek1);
  renderChecklistGroup('month1', checklistData.month1, taskListMonth1);

  // Update progress bar and milestone counters
  function updateChecklistProgress() {
    const allTasks = [...checklistData.day1, ...checklistData.week1, ...checklistData.month1];
    const totalCount = allTasks.length;
    const completedCount = allTasks.filter(t => !!checklistState[t.id]).length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    const progressBarFill = document.getElementById('progressBarFill');
    const checklistStats = document.getElementById('checklistStats');

    if (progressBarFill) {
      progressBarFill.style.width = `${percentage}%`;
      progressBarFill.parentElement.setAttribute('aria-valuenow', percentage);
    }
    if (checklistStats) {
      checklistStats.textContent = `${completedCount} of ${totalCount} completed (${percentage}%)`;
    }

    // Update group counts
    const day1Done = checklistData.day1.filter(t => !!checklistState[t.id]).length;
    const week1Done = checklistData.week1.filter(t => !!checklistState[t.id]).length;
    const month1Done = checklistData.month1.filter(t => !!checklistState[t.id]).length;

    document.getElementById('countDay1').textContent = `${day1Done}/${checklistData.day1.length}`;
    document.getElementById('countWeek1').textContent = `${week1Done}/${checklistData.week1.length}`;
    document.getElementById('countMonth1').textContent = `${month1Done}/${checklistData.month1.length}`;

    // Update milestone pill badges
    const pillDay1 = document.getElementById('pillDay1');
    const pillWeek1 = document.getElementById('pillWeek1');
    const pillMonth1 = document.getElementById('pillMonth1');

    pillDay1.textContent = `Day 1: ${day1Done}/${checklistData.day1.length}`;
    pillDay1.classList.toggle('completed', day1Done === checklistData.day1.length);

    pillWeek1.textContent = `Week 1: ${week1Done}/${checklistData.week1.length}`;
    pillWeek1.classList.toggle('completed', week1Done === checklistData.week1.length);

    pillMonth1.textContent = `Month 1: ${month1Done}/${checklistData.month1.length}`;
    pillMonth1.classList.toggle('completed', month1Done === checklistData.month1.length);
  }

  updateChecklistProgress();

  // Reset checklist handler
  const resetChecklistBtn = document.getElementById('resetChecklistBtn');
  resetChecklistBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all checklist tasks? This will uncheck all items.')) {
      checklistState = {};
      saveChecklistState();

      // Uncheck all UI elements
      document.querySelectorAll('.task-checkbox').forEach(cb => {
        cb.checked = false;
        cb.closest('.task-item').classList.remove('checked');
      });

      updateChecklistProgress();
      showToast('Checklist Reset', 'All onboarding checklist items have been reset to 0%.', 'info');
    }
  });


  // =========================================================================
  // 4. JOINING DOCUMENTS (9 Forms)
  // STRICT RULE: Do NOT save sensitive form data anywhere, keep ONLY on page!
  // =========================================================================

  // Accordion Expand/Collapse logic
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      const isExpanded = header.getAttribute('aria-expanded') === 'true';
      header.setAttribute('aria-expanded', !isExpanded);
    });
  });

  // Global Expand All / Collapse All buttons
  const expandAllBtn = document.getElementById('expandAllBtn');
  const collapseAllBtn = document.getElementById('collapseAllBtn');

  if (expandAllBtn && collapseAllBtn) {
    expandAllBtn.addEventListener('click', () => {
      accordionHeaders.forEach(h => h.setAttribute('aria-expanded', 'true'));
    });

    collapseAllBtn.addEventListener('click', () => {
      accordionHeaders.forEach(h => h.setAttribute('aria-expanded', 'false'));
    });
  }

  // Form 1: "Same as current address" sync helper
  const form1SameAddress = document.getElementById('form1_same_address');
  const form1CurrentAddr = document.getElementById('form1_current_addr');
  const form1PermAddr = document.getElementById('form1_perm_addr');

  if (form1SameAddress && form1CurrentAddr && form1PermAddr) {
    form1SameAddress.addEventListener('change', () => {
      if (form1SameAddress.checked) {
        form1PermAddr.value = form1CurrentAddr.value;
        form1PermAddr.readOnly = true;
      } else {
        form1PermAddr.readOnly = false;
      }
      updateFormCounter(1);
    });

    form1CurrentAddr.addEventListener('input', () => {
      if (form1SameAddress.checked) {
        form1PermAddr.value = form1CurrentAddr.value;
      }
    });
  }

  // Form Field Live Counters
  function updateFormCounter(formIndex) {
    const formItem = document.querySelector(`.accordion-item[data-form-index="${formIndex}"]`);
    if (!formItem) return;

    const counterEl = document.getElementById(`counterForm${formIndex}`);
    if (!counterEl) return;

    const inputs = formItem.querySelectorAll('input, select, textarea');
    let filledCount = 0;

    inputs.forEach(input => {
      if (input.type === 'checkbox') {
        if (input.checked) filledCount++;
      } else if (input.value && input.value.trim() !== '') {
        filledCount++;
      }
    });

    if (filledCount > 0) {
      counterEl.textContent = `${filledCount} filled`;
      counterEl.classList.add('active');
    } else {
      counterEl.textContent = '0 filled';
      counterEl.classList.remove('active');
    }
  }

  // Attach live change listeners to all 9 forms for real-time counters
  for (let i = 1; i <= 9; i++) {
    const item = document.querySelector(`.accordion-item[data-form-index="${i}"]`);
    if (item) {
      item.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('input', () => updateFormCounter(i));
        field.addEventListener('change', () => updateFormCounter(i));
      });
    }
  }

  // Copy Filled Details Handler
  const copyDetailsBtn = document.getElementById('copyDetailsBtn');
  const copyDetailsBtn2 = document.getElementById('copyDetailsBtn2');

  function handleCopyDetails() {
    const report = generateFilledReport();

    if (!report.hasContent) {
      showToast('No Data Entered', 'Please fill in some document details before copying.', 'error');
      return;
    }

    copyTextToClipboard(report.text)
      .then(() => {
        showToast('Details Copied!', `Successfully compiled and copied ${report.fieldCount} fields from your onboarding forms to clipboard.`, 'success');
      })
      .catch((err) => {
        console.error('Clipboard copy error:', err);
        showToast('Copy Notice', 'Please copy manually from the prompt dialog.', 'info');
      });
  }

  if (copyDetailsBtn) copyDetailsBtn.addEventListener('click', handleCopyDetails);
  if (copyDetailsBtn2) copyDetailsBtn2.addEventListener('click', handleCopyDetails);

  // Clear Forms Handler
  const clearFormsBtn = document.getElementById('clearFormsBtn');
  const clearFormsBtn2 = document.getElementById('clearFormsBtn2');

  function handleClearForms() {
    if (confirm('Are you sure you want to clear all entered form details? This action cannot be undone as data is kept only in page memory.')) {
      for (let i = 1; i <= 9; i++) {
        const item = document.querySelector(`.accordion-item[data-form-index="${i}"]`);
        if (item) {
          item.querySelectorAll('input, select, textarea').forEach(input => {
            if (input.type === 'checkbox') {
              input.checked = false;
            } else {
              input.value = '';
            }
          });
          updateFormCounter(i);
        }
      }

      // Re-enable permanent address if it was set to readonly
      if (form1PermAddr) form1PermAddr.readOnly = false;

      showToast('Forms Cleared', 'All 9 onboarding forms have been cleared from browser memory.', 'info');
    }
  }

  if (clearFormsBtn) clearFormsBtn.addEventListener('click', handleClearForms);
  if (clearFormsBtn2) clearFormsBtn2.addEventListener('click', handleClearForms);

  // Report Generator for All 9 Forms
  function generateFilledReport() {
    const lines = [];
    let fieldCount = 0;

    const joinerName = userNameInput.value.trim() || 'Colleague';
    const reportDate = new Date().toLocaleString();

    lines.push('=====================================================');
    lines.push('EMPLOYEE ONBOARDING JOINING DOCUMENTATION REPORT');
    lines.push('=====================================================');
    lines.push(`Generated: ${reportDate}`);
    lines.push(`Candidate / Employee: ${joinerName}`);
    lines.push('-----------------------------------------------------\n');

    // Helper to add field if filled
    function addField(label, value) {
      if (value !== undefined && value !== null && value.toString().trim() !== '') {
        lines.push(`  * ${label}: ${value.toString().trim()}`);
        fieldCount++;
      }
    }

    function addCheck(label, isChecked) {
      if (isChecked) {
        lines.push(`  * [X] ${label}`);
        fieldCount++;
      }
    }

    // 1. Personal Details
    const f1_lines = [];
    if (val('form1_fullname')) f1_lines.push(`  * Full Legal Name: ${val('form1_fullname')}`);
    if (val('form1_dob')) f1_lines.push(`  * Date of Birth: ${val('form1_dob')}`);
    if (val('form1_gender')) f1_lines.push(`  * Gender: ${val('form1_gender')}`);
    if (val('form1_bloodgroup')) f1_lines.push(`  * Blood Group: ${val('form1_bloodgroup')}`);
    if (val('form1_marital')) f1_lines.push(`  * Marital Status: ${val('form1_marital')}`);
    if (val('form1_email')) f1_lines.push(`  * Personal Email: ${val('form1_email')}`);
    if (val('form1_mobile')) f1_lines.push(`  * Mobile Phone: ${val('form1_mobile')}`);
    if (val('form1_current_addr')) f1_lines.push(`  * Current Address: ${val('form1_current_addr')}`);
    if (val('form1_perm_addr')) f1_lines.push(`  * Permanent Address: ${val('form1_perm_addr')}`);
    if (chk('form1_same_address')) f1_lines.push(`  * (Permanent address same as current address: Yes)`);

    if (f1_lines.length > 0) {
      lines.push('[1. PERSONAL DETAILS]');
      lines.push(...f1_lines);
      lines.push('');
      fieldCount += f1_lines.length;
    }

    // 2. ID & Address Proof Checklist
    const f2_lines = [];
    if (val('form2_aadhaar')) f2_lines.push(`  * National ID / Aadhaar / SSN: ${val('form2_aadhaar')}`);
    if (val('form2_pan')) f2_lines.push(`  * PAN / Tax ID: ${val('form2_pan')}`);
    if (val('form2_passport')) f2_lines.push(`  * Passport Number: ${val('form2_passport')}`);
    if (val('form2_dl')) f2_lines.push(`  * Voter ID / Driving License: ${val('form2_dl')}`);
    if (val('form2_doc_type')) f2_lines.push(`  * Address Proof Type: ${val('form2_doc_type')}`);
    if (val('form2_doc_ref')) f2_lines.push(`  * Address Proof Ref / Number: ${val('form2_doc_ref')}`);
    if (chk('form2_check_photo')) f2_lines.push(`  * [X] 2 Passport Size Photos Prepared`);
    if (chk('form2_check_id')) f2_lines.push(`  * [X] ID Proof Self-Attested Copy Ready`);
    if (chk('form2_check_addr')) f2_lines.push(`  * [X] Address Proof Self-Attested Copy Ready`);
    if (chk('form2_check_edu')) f2_lines.push(`  * [X] Education & Degree Certificates Ready`);

    if (f2_lines.length > 0) {
      lines.push('[2. ID & ADDRESS PROOF CHECKLIST]');
      lines.push(...f2_lines);
      lines.push('');
      fieldCount += f2_lines.length;
    }

    // 3. Bank Details
    const f3_lines = [];
    if (val('form3_bankname')) f3_lines.push(`  * Bank Name: ${val('form3_bankname')}`);
    if (val('form3_accname')) f3_lines.push(`  * Account Holder Name: ${val('form3_accname')}`);
    if (val('form3_accnum')) f3_lines.push(`  * Bank Account Number: ${val('form3_accnum')}`);
    if (val('form3_ifsc')) f3_lines.push(`  * IFSC / Routing Code: ${val('form3_ifsc')}`);
    if (val('form3_branch')) f3_lines.push(`  * Branch Name & City: ${val('form3_branch')}`);
    if (chk('form3_cancelled_cheque')) f3_lines.push(`  * [X] Voided / Cancelled Cheque Attached for Verification`);

    if (f3_lines.length > 0) {
      lines.push('[3. BANK DETAILS (SALARY DISBURSEMENT)]');
      lines.push(...f3_lines);
      lines.push('');
      fieldCount += f3_lines.length;
    }

    // 4. PF / UAN and ESIC
    const f4_lines = [];
    if (val('form4_uan')) f4_lines.push(`  * Universal Account Number (UAN): ${val('form4_uan')}`);
    if (val('form4_prev_pf')) f4_lines.push(`  * Previous PF Member ID: ${val('form4_prev_pf')}`);
    if (val('form4_esic')) f4_lines.push(`  * ESIC IP Number: ${val('form4_esic')}`);
    if (val('form4_prev_company')) f4_lines.push(`  * Previous Employer: ${val('form4_prev_company')}`);
    if (val('form4_exit_date')) f4_lines.push(`  * Prior Org Date of Exit: ${val('form4_exit_date')}`);
    if (val('form4_first_job')) f4_lines.push(`  * Employment Status: ${val('form4_first_job')}`);

    if (f4_lines.length > 0) {
      lines.push('[4. PF / UAN & ESIC DETAILS]');
      lines.push(...f4_lines);
      lines.push('');
      fieldCount += f4_lines.length;
    }

    // 5. Nominations
    const f5_lines = [];
    if (val('form5_pf_nom_name')) f5_lines.push(`  * PF Nominee Name: ${val('form5_pf_nom_name')}`);
    if (val('form5_pf_nom_rel')) f5_lines.push(`  * PF Nominee Relationship: ${val('form5_pf_nom_rel')}`);
    if (val('form5_pf_nom_dob')) f5_lines.push(`  * PF Nominee DOB: ${val('form5_pf_nom_dob')}`);
    if (val('form5_pf_nom_share')) f5_lines.push(`  * PF Nominee Share: ${val('form5_pf_nom_share')}%`);
    if (val('form5_grat_nom_name')) f5_lines.push(`  * Gratuity Nominee Name: ${val('form5_grat_nom_name')}`);
    if (val('form5_grat_nom_rel')) f5_lines.push(`  * Gratuity Nominee Relationship: ${val('form5_grat_nom_rel')}`);
    if (val('form5_grat_nom_share')) f5_lines.push(`  * Gratuity Nominee Share: ${val('form5_grat_nom_share')}%`);
    if (val('form5_nom_addr')) f5_lines.push(`  * Nominee Address: ${val('form5_nom_addr')}`);

    if (f5_lines.length > 0) {
      lines.push('[5. BENEFICIARY NOMINATIONS]');
      lines.push(...f5_lines);
      lines.push('');
      fieldCount += f5_lines.length;
    }

    // 6. Emergency Contact
    const f6_lines = [];
    if (val('form6_contact_name')) f6_lines.push(`  * Primary Emergency Contact: ${val('form6_contact_name')}`);
    if (val('form6_contact_rel')) f6_lines.push(`  * Relationship: ${val('form6_contact_rel')}`);
    if (val('form6_contact_phone')) f6_lines.push(`  * Primary Phone: ${val('form6_contact_phone')}`);
    if (val('form6_contact_alt')) f6_lines.push(`  * Alternate Phone: ${val('form6_contact_alt')}`);
    if (val('form6_contact_addr')) f6_lines.push(`  * Contact Address: ${val('form6_contact_addr')}`);
    if (val('form6_medical_notes')) f6_lines.push(`  * Medical Notes/Allergies: ${val('form6_medical_notes')}`);

    if (f6_lines.length > 0) {
      lines.push('[6. EMERGENCY CONTACT]');
      lines.push(...f6_lines);
      lines.push('');
      fieldCount += f6_lines.length;
    }

    // 7. NDA
    const f7_lines = [];
    if (val('form7_signee_name')) f7_lines.push(`  * Signed By: ${val('form7_signee_name')}`);
    if (val('form7_sign_date')) f7_lines.push(`  * Date of Signing: ${val('form7_sign_date')}`);
    if (chk('form7_nda_agree')) f7_lines.push(`  * [X] Agreed to Non-Disclosure Agreement (NDA) Terms`);

    if (f7_lines.length > 0) {
      lines.push('[7. NON-DISCLOSURE AGREEMENT (NDA)]');
      lines.push(...f7_lines);
      lines.push('');
      fieldCount += f7_lines.length;
    }

    // 8. Policy Acknowledgment
    const f8_lines = [];
    if (val('form8_emp_id')) f8_lines.push(`  * Employee ID: ${val('form8_emp_id')}`);
    if (val('form8_dept')) f8_lines.push(`  * Designated Department: ${val('form8_dept')}`);
    if (chk('form8_policy_agree')) f8_lines.push(`  * [X] Acknowledged & Agreed to Company Policies (Code of Conduct, POSH, Security)`);

    if (f8_lines.length > 0) {
      lines.push('[8. POLICY ACKNOWLEDGMENT]');
      lines.push(...f8_lines);
      lines.push('');
      fieldCount += f8_lines.length;
    }

    // 9. IT Asset Declaration
    const f9_lines = [];
    if (val('form9_asset_type')) f9_lines.push(`  * Primary Workstation: ${val('form9_asset_type')}`);
    if (val('form9_serial')) f9_lines.push(`  * Serial / Tag Number: ${val('form9_serial')}`);
    if (val('form9_os')) f9_lines.push(`  * Operating System: ${val('form9_os')}`);
    if (val('form9_monitor')) f9_lines.push(`  * External Monitor: ${val('form9_monitor')}`);

    const accessories = [];
    if (chk('form9_acc_charger')) accessories.push('Power Adapter');
    if (chk('form9_acc_mouse')) accessories.push('Wireless Mouse');
    if (chk('form9_acc_keyboard')) accessories.push('External Keyboard');
    if (chk('form9_acc_headset')) accessories.push('Headset');
    if (chk('form9_acc_dock')) accessories.push('USB Hub');
    if (chk('form9_acc_bag')) accessories.push('Laptop Bag');

    if (accessories.length > 0) {
      f9_lines.push(`  * Accessories Handed Over: ${accessories.join(', ')}`);
    }
    if (val('form9_remarks')) f9_lines.push(`  * Hardware Remarks: ${val('form9_remarks')}`);
    if (chk('form9_asset_pledge')) f9_lines.push(`  * [X] Agreed to IT Asset Responsible Usage Pledge`);

    if (f9_lines.length > 0) {
      lines.push('[9. IT ASSET DECLARATION]');
      lines.push(...f9_lines);
      lines.push('');
      fieldCount += f9_lines.length;
    }

    lines.push('-----------------------------------------------------');
    lines.push('Notice: This text was compiled client-side from session memory.');
    lines.push('=====================================================');

    return {
      hasContent: fieldCount > 0,
      fieldCount: fieldCount,
      text: lines.join('\n')
    };
  }

  // Helper getters for input values
  function val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function chk(id) {
    const el = document.getElementById(id);
    return el ? el.checked : false;
  }

  // Cross-browser clipboard copy with fallback
  function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    } else {
      // Fallback using temporary textarea
      return new Promise((resolve, reject) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          if (successful) resolve();
          else reject(new Error('execCommand copy returned false'));
        } catch (err) {
          document.body.removeChild(textArea);
          reject(err);
        }
      });
    }
  }


  // =========================================================================
  // 5. TOAST NOTIFICATION SYSTEM & UTILITIES
  // =========================================================================
  const toastNotification = document.getElementById('toastNotification');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');
  const toastCloseBtn = document.getElementById('toastCloseBtn');
  let toastTimer = null;

  function showToast(title, message, type = 'success') {
    if (!toastNotification) return;

    if (toastTimer) clearTimeout(toastTimer);

    toastTitle.textContent = title;
    toastMessage.textContent = message;

    toastNotification.classList.remove('toast-error');
    if (type === 'error') {
      toastNotification.classList.add('toast-error');
    }

    toastNotification.classList.add('show');

    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 4500);
  }

  if (toastCloseBtn) {
    toastCloseBtn.addEventListener('click', () => {
      if (toastTimer) clearTimeout(toastTimer);
      toastNotification.classList.remove('show');
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

});
