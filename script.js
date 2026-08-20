const ACCOUNT_SYSTEM = {
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem('fintrack_users')) || {};
    } catch {
      return {};
    }
  },
  
  saveUsers(users) {
    localStorage.setItem('fintrack_users', JSON.stringify(users));
  },

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('fintrack_current_user'));
    } catch {
      return null;
    }
  },

  setCurrentUser(username) {
    if (username) {
      localStorage.setItem('fintrack_current_user', JSON.stringify(username));
    } else {
      localStorage.removeItem('fintrack_current_user');
    }
  },

  register(username, password) {
    const users = this.getUsers();
    if (users[username]) {
      return { success: false, error: 'Username already exists!' };
    }
    
    const passwordCheck = this.validatePassword(password);
    if (!passwordCheck.valid) {
      return { success: false, error: passwordCheck.message };
    }
    
    users[username] = {
      password: this.hashPassword(password),
      created: new Date().toISOString(),
      data: this.getDefaultUserData()
    };
    
    this.saveUsers(users);
    return { success: true };
  },

  login(username, password) {
    const users = this.getUsers();
    const user = users[username];
    if (!user) {
      return { success: false, error: 'User not found!' };
    }
    if (user.password !== this.hashPassword(password)) {
      return { success: false, error: 'Invalid password!' };
    }
    
    this.setCurrentUser(username);
    return { success: true, username };
  },

  logout() {
    this.setCurrentUser(null);
  },

  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  },

  validatePassword(password) {
    let score = 0;
    let feedback = [];
    
    if (password.length >= 8) {
      score++;
    } else {
      feedback.push('at least 8 characters');
    }
    
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      score++;
    } else {
      feedback.push('uppercase and lowercase letters');
    }
    
    if (/\d/.test(password)) {
      score++;
    } else {
      feedback.push('at least one number');
    }
    
    if (/[^a-zA-Z0-9]/.test(password)) {
      score++;
    } else {
      feedback.push('at least one special character (!@#$% etc.)');
    }
    
    if (score >= 3) {
      return { valid: true, message: 'Strong password!', score: score };
    } else {
      return { 
        valid: false, 
        message: `Weak password! Add: ${feedback.join(', ')}`,
        score: score
      };
    }
  },

  getUserData(username) {
    const users = this.getUsers();
    const user = users[username];
    return user ? user.data : null;
  },

  saveUserData(username, data) {
    const users = this.getUsers();
    if (users[username]) {
      users[username].data = data;
      this.saveUsers(users);
      return true;
    }
    return false;
  },

  getDefaultUserData() {
    return {
      income: [
        { id: 1, desc: 'Monthly Allowance / Salary', amount: 18000, type: 'Active' },
        { id: 2, desc: 'Web Design Freelance', amount: 6500, type: 'Side Business' }
      ],
      expenses: [
        { id: 1, desc: 'Food & Groceries', amount: 5000, category: 'Needs' },
        { id: 2, desc: 'Boarding House & Power', amount: 3800, category: 'Needs' },
        { id: 3, desc: 'Bike Upgrades & Gear', amount: 2200, category: 'Wants' }
      ],
      savings: [
        { id: 1, desc: 'Emergency Vault Reserve', amount: 4500, account: 'Digital Bank (5% p.a.)', isCompleted: false },
        { id: 2, desc: '6-Month Time Deposit', amount: 5000, account: 'Traditional Bank', isCompleted: false },
        { id: 3, desc: 'High Yield Savings Deposit', amount: 3000, account: 'Digital Bank (5% p.a.)', isCompleted: true }
      ],
      investments: [
        { id: 1, desc: 'Pag-IBIG MP2 Dividend Fund', amount: 3000, expectedReturn: '7% Dividend' },
        { id: 2, desc: 'Mutual Funds / Stock Index', amount: 2500, expectedReturn: '8%+ Growth' }
      ],
      protection: [
        { id: 1, desc: 'PhilHealth / Health Insurance', amount: 50000, policyType: 'Health Coverage' },
        { id: 2, desc: 'Life & Accident Coverage', amount: 100000, policyType: 'Term Life' }
      ],
      goals: [
        { id: 1, desc: 'Emergency Fund (6 Months)', current: 4500, target: 12000 },
        { id: 2, desc: 'Gravel Bike Upgrade Fund', current: 3000, target: 10000 }
      ],
      inventory: [
        { id: 1, desc: 'Workstation Laptop', qty: 1, unitValue: 35000, category: 'Tech & Electronics', status: 'In Use' },
        { id: 2, desc: 'Gravel Bike & Gear', qty: 1, unitValue: 22000, category: 'Sports & Transport', status: 'In Stock' },
        { id: 3, desc: 'Spare 700C Tires & Tubes', qty: 4, unitValue: 650, category: 'Maintenance Parts', status: 'Low Stock' },
        { id: 4, desc: 'Hydraulic Brake Mineral Oil', qty: 0, unitValue: 350, category: 'Maintenance Parts', status: 'Out of Stock' }
      ]
    };
  }
};

let state = {
  currentView: 'home',
  activeDashTab: 'income',
  inventoryFilter: 'all',
  income: [],
  expenses: [],
  savings: [],
  investments: [],
  protection: [],
  goals: [],
  inventory: []
};

let charts = {};
let currentAuthMode = 'login';

function setAuthMode(mode) {
  currentAuthMode = mode;
  
  const loginBtn = document.getElementById('auth-toggle-login');
  const registerBtn = document.getElementById('auth-toggle-register');
  const title = document.getElementById('auth-title');
  const subtitle = document.getElementById('auth-subtitle');
  const btn = document.getElementById('auth-btn');
  const errorMsg = document.getElementById('auth-error');
  const strength = document.getElementById('password-strength');
  const feedback = document.getElementById('password-feedback');
  
  errorMsg.style.display = 'none';
  
  loginBtn.classList.toggle('active', mode === 'login');
  registerBtn.classList.toggle('active', mode === 'register');
  
  if (mode === 'login') {
    title.textContent = 'Welcome Back';
    subtitle.textContent = 'Sign in to continue managing your finances';
    btn.textContent = 'Sign In';
    document.getElementById('auth-username').placeholder = 'Username';
    document.getElementById('auth-password').placeholder = 'Password';
    document.getElementById('auth-btn-nav').innerHTML = '<i data-lucide="log-in" class="w-4 h-4"></i> <span>Sign In</span>';
    // Hide password strength in login mode
    strength.className = 'password-strength';
    strength.style.display = 'none';
    feedback.textContent = '';
    feedback.className = 'password-feedback';
    feedback.style.display = 'none';
  } else {
    title.textContent = 'Create Account';
    subtitle.textContent = 'Start your financial journey with FinTrack Pro';
    btn.textContent = 'Create Account';
    document.getElementById('auth-username').placeholder = 'Choose a username';
    document.getElementById('auth-password').placeholder = 'Create a strong password';
    document.getElementById('auth-btn-nav').innerHTML = '<i data-lucide="user-plus" class="w-4 h-4"></i> <span>Sign Up</span>';
    // Show password strength in register mode
    strength.className = 'password-strength';
    strength.style.display = 'block';
    feedback.textContent = '';
    feedback.className = 'password-feedback';
    feedback.style.display = 'none';
  }
  
  document.getElementById('auth-form').reset();
  
  lucide.createIcons();
}

function showAuthModal() {
  document.getElementById('auth-modal').style.display = 'flex';
  document.getElementById('auth-error').style.display = 'none';
  setAuthMode('login');
}

function hideAuthModal() {
  document.getElementById('auth-modal').style.display = 'none';
}

let pendingRegisteredUsername = '';

function showRegisterSuccessModal(username) {
  pendingRegisteredUsername = username;
  document.getElementById('register-success-modal').style.display = 'flex';
  lucide.createIcons();
}

function closeRegisterSuccessModal() {
  document.getElementById('register-success-modal').style.display = 'none';
  document.getElementById('auth-modal').style.display = 'flex';
  document.getElementById('auth-error').style.display = 'none';
  setAuthMode('login');
  document.getElementById('auth-username').value = pendingRegisteredUsername;
  pendingRegisteredUsername = '';
}

function handleAuth(event) {
  event.preventDefault();
  const username = document.getElementById('auth-username').value.trim();
  const password = document.getElementById('auth-password').value;
  const errorEl = document.getElementById('auth-error');
  
  errorEl.style.display = 'none';

  if (!username || !password) {
    errorEl.textContent = '⚠️ Please fill in all fields';
    errorEl.style.display = 'block';
    return;
  }

  let result;
  if (currentAuthMode === 'login') {
    result = ACCOUNT_SYSTEM.login(username, password);
  } else {
    result = ACCOUNT_SYSTEM.register(username, password);
  }

  if (result.success) {
    if (currentAuthMode === 'login') {
      hideAuthModal();
      showToast(`Welcome, ${username}! 🎉`, 'emerald');
      fireConfetti();
      loadUserData(username);
      updateUserUI(username);
    } else {
      hideAuthModal();
      showRegisterSuccessModal(username);
      fireConfetti();
    }
  } else {
    errorEl.textContent = `⚠️ ${result.error}`;
    errorEl.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('auth-password');
  if (passwordInput) {
    passwordInput.addEventListener('input', function() {
      const strength = document.getElementById('password-strength');
      const feedback = document.getElementById('password-feedback');
      const val = this.value;
      
      // Only show validation in register mode
      if (currentAuthMode === 'login') {
        strength.className = 'password-strength';
        strength.style.display = 'none';
        feedback.textContent = '';
        feedback.className = 'password-feedback';
        feedback.style.display = 'none';
        return;
      }
      
      // Show validation in register mode
      strength.style.display = 'block';
      feedback.style.display = 'block';
      
      if (val.length === 0) {
        strength.className = 'password-strength';
        feedback.textContent = '';
        feedback.className = 'password-feedback';
        return;
      }
      
      const result = ACCOUNT_SYSTEM.validatePassword(val);
      
      if (result.valid) {
        strength.className = 'password-strength strong';
        feedback.textContent = '✅ Strong password!';
        feedback.className = 'password-feedback success';
      } else {
        strength.className = 'password-strength weak';
        feedback.textContent = '❌ ' + result.message;
        feedback.className = 'password-feedback error';
      }
    });
  }
});

function loadUserData(username) {
  const data = ACCOUNT_SYSTEM.getUserData(username);
  if (data) {
    state.income = data.income || [];
    state.expenses = data.expenses || [];
    state.savings = data.savings || [];
    state.investments = data.investments || [];
    state.protection = data.protection || [];
    state.goals = data.goals || [];
    state.inventory = data.inventory || [];
    renderApp();
  }
}

function saveUserData() {
  const username = ACCOUNT_SYSTEM.getCurrentUser();
  if (username) {
    const data = {
      income: state.income,
      expenses: state.expenses,
      savings: state.savings,
      investments: state.investments,
      protection: state.protection,
      goals: state.goals,
      inventory: state.inventory
    };
    ACCOUNT_SYSTEM.saveUserData(username, data);
  }
}

function updateUserUI(username) {
  const userSection = document.getElementById('user-section');
  const authBtn = document.getElementById('auth-btn-nav');
  const avatar = document.getElementById('user-avatar');
  const nameDisplay = document.getElementById('user-display-name');
  
  userSection.style.display = 'flex';
  authBtn.style.display = 'none';
  
  const initial = username.charAt(0).toUpperCase();
  avatar.textContent = initial;
  nameDisplay.textContent = username;
  
  lucide.createIcons();
}

function toggleUserDropdown() {
  const dropdown = document.getElementById('user-dropdown');
  dropdown.classList.toggle('active');
}

let confirmModalCallback = null;

function showConfirmModal(title, message, onConfirm) {
  document.getElementById('confirm-modal-title').textContent = title;
  document.getElementById('confirm-modal-message').textContent = message;
  confirmModalCallback = onConfirm;
  document.getElementById('confirm-modal').style.display = 'flex';
  lucide.createIcons();
}

function closeConfirmModal(confirmed) {
  document.getElementById('confirm-modal').style.display = 'none';
  const cb = confirmModalCallback;
  confirmModalCallback = null;
  if (confirmed && cb) {
    cb();
  }
}

function handleLogout() {
  document.getElementById('user-dropdown').classList.remove('active');

  showConfirmModal('Sign Out', 'Are you sure you want to sign out?', () => {
    ACCOUNT_SYSTEM.logout();
    document.getElementById('user-section').style.display = 'none';
    document.getElementById('auth-btn-nav').style.display = 'flex';
    document.getElementById('user-dropdown').classList.remove('active');

    const defaultData = ACCOUNT_SYSTEM.getDefaultUserData();
    state.income = defaultData.income;
    state.expenses = defaultData.expenses;
    state.savings = defaultData.savings;
    state.investments = defaultData.investments;
    state.protection = defaultData.protection;
    state.goals = defaultData.goals;
    state.inventory = defaultData.inventory;

    showToast('Signed out successfully', 'cyan');
    renderApp();
  });
}


function showStats() {
  const totalIncome = state.income.reduce((s, i) => s + Number(i.amount), 0);
  const totalSavings = state.savings.reduce((s, i) => s + Number(i.amount), 0);
  const totalInventory = state.inventory.reduce((s, i) => s + (Number(i.qty) * Number(i.unitValue)), 0);
  
  showToast(
    `📊 Income: ₱${totalIncome.toLocaleString()} | Savings: ₱${totalSavings.toLocaleString()} | Assets: ₱${totalInventory.toLocaleString()}`,
    'cyan'
  );
  document.getElementById('user-dropdown').classList.remove('active');
}

function getSavingsStatus(amount, isCompleted) {
  if (isCompleted) {
    return { text: 'Completed / Reached', badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' };
  }
  const val = Number(amount);
  if (val <= 0) return { text: 'Depleted / ₱0', badge: 'bg-rose-950/80 text-rose-300 border-rose-500/40' };
  if (val < 2000) return { text: 'Low Balance', badge: 'bg-amber-950/80 text-amber-300 border-amber-500/40' };
  if (val < 10000) return { text: 'Active Accumulating', badge: 'bg-blue-950/80 text-blue-300 border-blue-500/40' };
  return { text: 'Target Reached', badge: 'bg-purple-950/80 text-purple-300 border-purple-500/40' };
}

function toggleSavingsProgress(id) {
  const target = state.savings.find(s => s.id === id);
  if (target) {
    target.isCompleted = !target.isCompleted;
    if (target.isCompleted) {
      showToast(`Marked "${target.desc}" as completed!`, 'emerald');
      fireConfetti();
    } else {
      showToast(`Reopened goal for "${target.desc}"`, 'cyan');
    }
    renderApp();
    saveUserData();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initCharts();
  
  ACCOUNT_SYSTEM.setCurrentUser(null);
  const defaultData = ACCOUNT_SYSTEM.getDefaultUserData();
  state.income = defaultData.income;
  state.expenses = defaultData.expenses;
  state.savings = defaultData.savings;
  state.investments = defaultData.investments;
  state.protection = defaultData.protection;
  state.goals = defaultData.goals;
  state.inventory = defaultData.inventory;
  renderApp();
  
  document.addEventListener('click', (e) => {
    const badge = document.querySelector('.user-badge');
    const dropdown = document.getElementById('user-dropdown');
    if (badge && dropdown && !badge.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });
});

function navigateTo(view) {
  state.currentView = view;
  const homeSec = document.getElementById('view-home');
  const dashSec = document.getElementById('view-dashboard');
  const invSec = document.getElementById('view-inventory');

  const btnHome = document.getElementById('nav-btn-home');
  const btnDash = document.getElementById('nav-btn-dashboard');
  const btnInv = document.getElementById('nav-btn-inventory');

  const defaultNavClass = "h-9 px-4 text-xs font-semibold rounded-xl transition text-slate-400 hover:text-white flex items-center justify-center gap-2 shrink-0";

  [btnHome, btnDash, btnInv].forEach(btn => {
    if (btn) btn.className = defaultNavClass;
  });

  homeSec.classList.add('hidden');
  dashSec.classList.add('hidden');
  invSec.classList.add('hidden');

  if (view === 'home') {
    homeSec.classList.remove('hidden');
    btnHome.className = "h-9 px-4 text-xs font-bold rounded-xl transition text-emerald-400 bg-slate-800 border border-slate-700/60 flex items-center justify-center gap-2 shrink-0";
  } else if (view === 'dashboard') {
    dashSec.classList.remove('hidden');
    btnDash.className = "h-9 px-4 text-xs font-bold rounded-xl transition text-emerald-400 bg-slate-800 border border-slate-700/60 flex items-center justify-center gap-2 shrink-0";
  } else if (view === 'inventory') {
    invSec.classList.remove('hidden');
    btnInv.className = "h-9 px-4 text-xs font-bold rounded-xl transition text-cyan-400 bg-slate-800 border border-slate-700/60 flex items-center justify-center gap-2 shrink-0";
  }

  renderApp();
}

function renderApp() {
  updateSummaryMetrics();
  renderDashForm();
  renderDashTable();
  renderInventoryTable();
  updateCharts();
}

function updateSummaryMetrics() {
  const totalIncome = state.income.reduce((s, i) => s + Number(i.amount), 0);
  const totalSpending = state.expenses.reduce((s, i) => s + Number(i.amount), 0);
  const totalSavings = state.savings.reduce((s, i) => s + Number(i.amount), 0);
  const totalInvestments = state.investments.reduce((s, i) => s + Number(i.amount), 0);
  const totalProtection = state.protection.reduce((s, i) => s + Number(i.amount), 0);

  const totalInventoryVal = state.inventory.reduce((s, i) => s + (Number(i.qty) * Number(i.unitValue)), 0);
  const totalInventoryUnits = state.inventory.reduce((s, i) => s + Number(i.qty), 0);
  const totalInventoryTypes = state.inventory.length;

  const netFlow = totalIncome - totalSpending;
  const savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : 0;

  document.getElementById('home-stat-income').innerText = `₱${totalIncome.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('home-stat-spending').innerText = `₱${totalSpending.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('home-stat-savings').innerText = `₱${totalSavings.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('home-stat-inventory').innerText = `₱${totalInventoryVal.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

  document.getElementById('stat-income').innerText = `₱${totalIncome.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('stat-savings').innerText = `₱${totalSavings.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('stat-savings-rate').innerText = `${savingsRate}%`;
  
  document.getElementById('stat-spending').innerText = `₱${totalSpending.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  const netElem = document.getElementById('stat-net-flow');
  netElem.innerText = `₱${netFlow.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  netElem.className = netFlow >= 0 ? "font-bold text-emerald-400 truncate" : "font-bold text-rose-400 truncate";

  document.getElementById('stat-investments').innerText = `₱${totalInvestments.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('stat-protection').innerText = `₱${totalProtection.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

  document.getElementById('inv-summary-value').innerText = `₱${totalInventoryVal.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('inv-summary-units').innerText = `${totalInventoryUnits} Units`;
  document.getElementById('inv-summary-types').innerText = `${totalInventoryTypes} Products`;
}

function switchDashTab(tab) {
  state.activeDashTab = tab;
  ['income', 'expenses', 'savings', 'investments', 'protection', 'goals'].forEach(t => {
    const btn = document.getElementById(`dash-tab-${t}`);
    if (t === tab) {
      btn.className = "h-12 px-5 text-xs font-bold border-b-2 border-emerald-500 text-emerald-400 flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition";
    } else {
      btn.className = "h-12 px-5 text-xs font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition";
    }
  });
  renderDashForm();
  renderDashTable();
}

function renderDashForm() {
  const title = document.getElementById('dash-form-title');
  const in1 = document.getElementById('dash-input-1');
  const in2 = document.getElementById('dash-input-2');
  const in3 = document.getElementById('dash-input-3');
  const in4 = document.getElementById('dash-input-4');

  in3.innerHTML = '';
  in4.innerHTML = '';
  in4.classList.add('hidden');

  if (state.activeDashTab === 'income') {
    title.innerHTML = `<i data-lucide="plus-circle" class="w-4 h-4 text-emerald-400"></i> Add Income Stream`;
    in1.placeholder = 'Income Source (e.g. Salary)';
    in2.placeholder = 'Amount (₱)';
    ['Active', 'Passive', 'Side Business'].forEach(opt => in3.add(new Option(opt, opt)));
  } else if (state.activeDashTab === 'expenses') {
    title.innerHTML = `<i data-lucide="plus-circle" class="w-4 h-4 text-rose-400"></i> Add Expense & Deduct from Savings`;
    in1.placeholder = 'Expense Description';
    in2.placeholder = 'Amount (₱)';
    ['Needs', 'Wants', 'Fixed/Bills'].forEach(opt => in3.add(new Option(opt, opt)));
    
    in4.classList.remove('hidden');
    in4.add(new Option('Deduct from: None (Cash/Income)', 'none'));
    state.savings.forEach(s => {
      in4.add(new Option(`Deduct from: ${s.desc} (₱${s.amount.toLocaleString()})`, s.id));
    });

  } else if (state.activeDashTab === 'savings') {
    title.innerHTML = `<i data-lucide="plus-circle" class="w-4 h-4 text-blue-400"></i> Add / Deposit Savings`;
    in1.placeholder = 'Account / Savings Goal';
    in2.placeholder = 'Deposit Amount (₱)';
    ['Digital Bank', 'Traditional Bank', 'Cash Vault'].forEach(opt => in3.add(new Option(opt, opt)));
  } else if (state.activeDashTab === 'investments') {
    title.innerHTML = `<i data-lucide="plus-circle" class="w-4 h-4 text-purple-400"></i> Add Investment Asset`;
    in1.placeholder = 'Asset / Fund Title';
    in2.placeholder = 'Invested Amount (₱)';
    ['6% Dividend', '7% Dividend', '8%+ Growth'].forEach(opt => in3.add(new Option(opt, opt)));
  } else if (state.activeDashTab === 'protection') {
    title.innerHTML = `<i data-lucide="plus-circle" class="w-4 h-4 text-amber-400"></i> Add Insurance Coverage`;
    in1.placeholder = 'Policy Name';
    in2.placeholder = 'Coverage Amount (₱)';
    ['Health Coverage', 'Term Life', 'Emergency Shield'].forEach(opt => in3.add(new Option(opt, opt)));
  } else if (state.activeDashTab === 'goals') {
    title.innerHTML = `<i data-lucide="plus-circle" class="w-4 h-4 text-blue-400"></i> Add Goal Target`;
    in1.placeholder = 'Goal Description';
    in2.placeholder = 'Current Saved (₱)';
    ['Target: ₱5,000', 'Target: ₱10,000', 'Target: ₱20,000', 'Target: ₱50,000'].forEach(opt => in3.add(new Option(opt, opt)));
  }
  lucide.createIcons();
}

function handleDashFormSubmit(e) {
  e.preventDefault();
  const val1 = document.getElementById('dash-input-1').value;
  const val2 = parseFloat(document.getElementById('dash-input-2').value);
  const val3 = document.getElementById('dash-input-3').value;
  const val4 = document.getElementById('dash-input-4').value;
  const newId = Date.now();

  if (state.activeDashTab === 'income') {
    state.income.push({ id: newId, desc: val1, amount: val2, type: val3 });
    triggerCardPulse('card-income');
  } else if (state.activeDashTab === 'expenses') {
    state.expenses.push({ id: newId, desc: val1, amount: val2, category: val3 });
    triggerCardPulse('card-spending');

    if (val4 && val4 !== 'none') {
      const targetSavings = state.savings.find(s => s.id == val4);
      if (targetSavings) {
        targetSavings.amount = Math.max(0, targetSavings.amount - val2);
        triggerCardPulse('card-savings');
        showToast(`Deducted ₱${val2.toLocaleString()} from ${targetSavings.desc}!`, 'cyan');
      }
    }
  } else if (state.activeDashTab === 'savings') {
    state.savings.push({ id: newId, desc: val1, amount: val2, account: val3, isCompleted: false });
    triggerCardPulse('card-savings');
  } else if (state.activeDashTab === 'investments') {
    state.investments.push({ id: newId, desc: val1, amount: val2, expectedReturn: val3 });
    triggerCardPulse('card-investments');
  } else if (state.activeDashTab === 'protection') {
    state.protection.push({ id: newId, desc: val1, amount: val2, policyType: val3 });
    triggerCardPulse('card-protection');
  } else if (state.activeDashTab === 'goals') {
    const targetVal = parseFloat(val3.replace(/[^0-9]/g, '')) || 10000;
    state.goals.push({ id: newId, desc: val1, current: val2, target: targetVal });
  }

  showToast(`Added "${val1}" to ${state.activeDashTab}!`, 'emerald');
  fireConfetti();
  document.getElementById('dash-form').reset();
  renderApp();
  saveUserData();
}

function handleInventorySubmit(e) {
  e.preventDefault();
  const name = document.getElementById('inv-input-name').value;
  const price = parseFloat(document.getElementById('inv-input-price').value);
  const qty = parseInt(document.getElementById('inv-input-qty').value);
  const category = document.getElementById('inv-input-category').value;
  const status = document.getElementById('inv-input-status').value;

  state.inventory.push({
    id: Date.now(),
    desc: name,
    qty: qty,
    unitValue: price,
    category: category,
    status: status
  });

  showToast(`Added ${name} [${status}] to Inventory!`, 'cyan');
  fireConfetti();
  document.getElementById('inv-input-name').value = '';
  document.getElementById('inv-input-price').value = '';
  document.getElementById('inv-input-qty').value = '1';
  renderApp();
  saveUserData();
}

function filterInventoryByStatus(status) {
  state.inventoryFilter = status;
  renderInventoryTable();
}

function deleteItem(tab, id) {
  state[tab] = state[tab].filter(i => i.id !== id);
  showToast(`Item removed from ${tab}`, 'rose');
  renderApp();
  saveUserData();
}

function renderDashTable() {
  const tbody = document.getElementById('dash-table-body');
  const thead = document.getElementById('dash-table-head');
  tbody.innerHTML = '';

  if (state.activeDashTab === 'goals') {
    thead.innerHTML = `
      <th class="py-3 px-4 min-w-[150px]">Goal Title</th>
      <th class="py-3 px-4 min-w-[140px]">Current / Target</th>
      <th class="py-3 px-4 min-w-[180px]">Progress Track</th>
      <th class="py-3 px-4 text-right min-w-[80px]">Actions</th>
    `;
    state.goals.forEach(item => {
      const pct = Math.min(100, Math.round((item.current / item.target) * 100));
      tbody.innerHTML += `
        <tr class="hover:bg-slate-800/40">
          <td class="py-3 px-4 font-medium text-white break-words">${item.desc}</td>
          <td class="py-3 px-4 whitespace-nowrap">₱${item.current.toLocaleString()} / ₱${item.target.toLocaleString()}</td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-2">
              <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700 min-w-[80px]">
                <div class="bg-blue-500 h-full rounded-full" style="width: ${pct}%"></div>
              </div>
              <span class="text-xs font-bold text-blue-400 shrink-0">${pct}%</span>
            </div>
          </td>
          <td class="py-3 px-4 text-right">
            <button onclick="deleteItem('goals', ${item.id})" class="text-slate-500 hover:text-rose-400 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
          </td>
        </tr>
      `;
    });
  } else if (state.activeDashTab === 'savings') {
    thead.innerHTML = `
      <th class="py-3 px-4 text-center min-w-[60px]">Done</th>
      <th class="py-3 px-4 min-w-[160px]">Account / Goal Description</th>
      <th class="py-3 px-4 min-w-[130px]">Institution</th>
      <th class="py-3 px-4 min-w-[120px]">Amount (₱)</th>
      <th class="py-3 px-4 min-w-[160px]">Status Flow</th>
      <th class="py-3 px-4 text-right min-w-[80px]">Actions</th>
    `;

    state.savings.forEach(item => {
      const statusInfo = getSavingsStatus(item.amount, item.isCompleted);
      const completedStyle = item.isCompleted ? 'line-through opacity-50' : '';

      tbody.innerHTML += `
        <tr class="hover:bg-slate-800/40 transition">
          <td class="py-3 px-4 text-center">
            <input 
              type="checkbox" 
              ${item.isCompleted ? 'checked' : ''} 
              onchange="toggleSavingsProgress(${item.id})"
              class="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500/30 focus:ring-offset-slate-900 cursor-pointer accent-emerald-500 transition"
              title="Mark goal as reached/completed"
            />
          </td>
          <td class="py-3 px-4 font-bold text-white break-words ${completedStyle}">
            <div class="flex items-center gap-2">
              <i data-lucide="vault" class="w-4 h-4 ${item.isCompleted ? 'text-emerald-400' : 'text-blue-400'} shrink-0"></i>
              <span>${item.desc}</span>
            </div>
          </td>
          <td class="py-3 px-4 whitespace-nowrap ${completedStyle}">
            <span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">${item.account}</span>
          </td>
          <td class="py-3 px-4 font-black text-blue-400 whitespace-nowrap ${completedStyle}">₱${Number(item.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
          <td class="py-3 px-4 whitespace-nowrap">
            <span class="text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusInfo.badge}">
              ● ${statusInfo.text}
            </span>
          </td>
          <td class="py-3 px-4 text-right">
            <button onclick="deleteItem('savings', ${item.id})" class="text-slate-500 hover:text-rose-400 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
          </td>
        </tr>
      `;
    });
  } else {
    thead.innerHTML = `
      <th class="py-3 px-4 min-w-[160px]">Description</th>
      <th class="py-3 px-4 min-w-[120px]">Category / Tag</th>
      <th class="py-3 px-4 min-w-[120px]">Amount (₱)</th>
      <th class="py-3 px-4 text-right min-w-[80px]">Actions</th>
    `;
    const list = state[state.activeDashTab] || [];
    list.forEach(item => {
      const tag = item.type || item.category || item.expectedReturn || item.policyType || 'General';
      tbody.innerHTML += `
        <tr class="hover:bg-slate-800/40">
          <td class="py-3 px-4 font-medium text-white break-words">${item.desc}</td>
          <td class="py-3 px-4 whitespace-nowrap"><span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-semibold">${tag}</span></td>
          <td class="py-3 px-4 font-bold text-slate-100 whitespace-nowrap">₱${Number(item.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
          <td class="py-3 px-4 text-right">
            <button onclick="deleteItem('${state.activeDashTab}', ${item.id})" class="text-slate-500 hover:text-rose-400 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
          </td>
        </tr>
      `;
    });
  }
  lucide.createIcons();
}

function renderInventoryTable() {
  const tbody = document.getElementById('inventory-table-body');
  tbody.innerHTML = '';

  let items = state.inventory;
  if (state.inventoryFilter !== 'all') {
    items = items.filter(i => i.status === state.inventoryFilter);
  }

  const statusBadgeMap = {
    'In Stock': 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    'Low Stock': 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    'Out of Stock': 'bg-rose-950/80 text-rose-300 border-rose-500/40',
    'In Use': 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
    'Maintenance': 'bg-purple-950/80 text-purple-300 border-purple-500/40'
  };

  items.forEach(item => {
    const totalVal = Number(item.qty) * Number(item.unitValue);
    const badgeClass = statusBadgeMap[item.status] || 'bg-slate-800 text-slate-300 border-slate-700';

    tbody.innerHTML += `
      <tr class="hover:bg-slate-800/40">
        <td class="py-3 px-4 font-bold text-white break-words">
          <div class="flex items-center gap-2">
            <i data-lucide="box" class="w-4 h-4 text-cyan-400 shrink-0"></i>
            <span>${item.desc}</span>
          </div>
        </td>
        <td class="py-3 px-4 whitespace-nowrap">
          <span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">${item.category}</span>
        </td>
        <td class="py-3 px-4 font-extrabold text-slate-200 whitespace-nowrap">${item.qty} Units</td>
        <td class="py-3 px-4 whitespace-nowrap">₱${Number(item.unitValue).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td class="py-3 px-4 font-extrabold text-cyan-400 whitespace-nowrap">₱${totalVal.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td class="py-3 px-4 whitespace-nowrap">
          <span class="text-[10px] font-bold px-2.5 py-1 rounded-full border ${badgeClass}">
            ● ${item.status}
          </span>
        </td>
        <td class="py-3 px-4 text-right">
          <button onclick="deleteItem('inventory', ${item.id})" class="text-slate-500 hover:text-rose-400 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </td>
      </tr>
    `;
  });
  lucide.createIcons();
}

function initCharts() {
  charts.expense = new Chart(document.getElementById('expenseChart'), {
    type: 'doughnut',
    data: { labels: [], datasets: [{ data: [], backgroundColor: ['#f43f5e', '#3b82f6', '#a855f7', '#eab308'] }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } } }
  });

  charts.allocation = new Chart(document.getElementById('allocationChart'), {
    type: 'bar',
    data: {
      labels: ['Income', 'Savings', 'Spending', 'Investment', 'Protection'],
      datasets: [{ data: [0,0,0,0,0], backgroundColor: ['#10b981', '#3b82f6', '#f43f5e', '#a855f7', '#f59e0b'] }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: { x: { ticks: { color: '#94a3b8' }, grid: { display: false } }, y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } } }
    }
  });

  charts.goals = new Chart(document.getElementById('goalsChart'), {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Saved', data: [], backgroundColor: '#3b82f6' }, { label: 'Target', data: [], backgroundColor: '#1e293b' }] },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 } } } },
      scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } }, y: { ticks: { color: '#94a3b8' }, grid: { display: false } } }
    }
  });

  charts.inventory = new Chart(document.getElementById('inventoryChart'), {
    type: 'polarArea',
    data: { labels: [], datasets: [{ data: [], backgroundColor: ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981'] }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } },
      scales: { r: { grid: { color: '#1e293b' }, ticks: { display: false } } }
    }
  });

  charts.growth = new Chart(document.getElementById('growthChart'), {
    type: 'line',
    data: {
      labels: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
      datasets: [
        { label: 'Cumulative Net Worth (₱)', data: [0, 0, 0, 0, 0, 0], borderColor: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.1)', fill: true, tension: 0.3 },
        { label: 'Cumulative Savings (₱)', data: [0, 0, 0, 0, 0, 0], borderColor: '#3b82f6', borderDash: [5, 5], fill: false, tension: 0.3 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 } } } },
      scales: { x: { ticks: { color: '#94a3b8' }, grid: { display: false } }, y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } } }
    }
  });
}

function updateCharts() {
  const expCatMap = {};
  state.expenses.forEach(e => expCatMap[e.category] = (expCatMap[e.category] || 0) + Number(e.amount));
  charts.expense.data.labels = Object.keys(expCatMap);
  charts.expense.data.datasets[0].data = Object.values(expCatMap);
  charts.expense.update();

  const totalInc = state.income.reduce((s, i) => s + Number(i.amount), 0);
  const totalSav = state.savings.reduce((s, i) => s + Number(i.amount), 0);
  const totalExp = state.expenses.reduce((s, i) => s + Number(i.amount), 0);
  const totalInv = state.investments.reduce((s, i) => s + Number(i.amount), 0);
  const totalPro = state.protection.reduce((s, i) => s + Number(i.amount), 0);

  charts.allocation.data.datasets[0].data = [totalInc, totalSav, totalExp, totalInv, totalPro];
  charts.allocation.update();

  charts.goals.data.labels = state.goals.map(g => g.desc);
  charts.goals.data.datasets[0].data = state.goals.map(g => g.current);
  charts.goals.data.datasets[1].data = state.goals.map(g => g.target);
  charts.goals.update();

  const invCatMap = {};
  state.inventory.forEach(inv => invCatMap[inv.category] = (invCatMap[inv.category] || 0) + (Number(inv.qty) * Number(inv.unitValue)));
  charts.inventory.data.labels = Object.keys(invCatMap);
  charts.inventory.data.datasets[0].data = Object.values(invCatMap);
  charts.inventory.update();

  const monthlyNet = totalInc - totalExp;
  const totalAssets = totalSav + totalInv + state.inventory.reduce((s, i) => s + (Number(i.qty) * Number(i.unitValue)), 0);

  charts.growth.data.datasets[0].data = Array.from({length: 6}, (_, idx) => totalAssets + (monthlyNet * (idx + 1)));
  charts.growth.data.datasets[1].data = Array.from({length: 6}, (_, idx) => totalSav + (totalSav * 0.2 * (idx + 1)));
  charts.growth.update();
}

function fireConfetti() {
  confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#10b981', '#06b6d4', '#3b82f6', '#a855f7'] });
}

function triggerCardPulse(cardId) {
  const card = document.getElementById(cardId);
  if (card) {
    card.classList.remove('animate-pulse-glow');
    void card.offsetWidth;
    card.classList.add('animate-pulse-glow');
  }
}

function showToast(message, color = 'emerald') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  
  const bgColors = {
    emerald: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300',
    cyan: 'bg-cyan-950/90 border-cyan-500/50 text-cyan-300',
    rose: 'bg-rose-950/90 border-rose-500/50 text-rose-300'
  };

  toast.className = `px-4 py-3 rounded-xl border text-xs font-bold shadow-xl flex items-center gap-2 backdrop-blur pointer-events-auto toast-slide-in ${bgColors[color] || bgColors.emerald}`;
  toast.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4"></i> ${message}`;

  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function resetToSampleData() {
  showConfirmModal('Reset Data', 'Reset all data to default samples?', () => {
    const defaultData = ACCOUNT_SYSTEM.getDefaultUserData();
    state.income = defaultData.income;
    state.expenses = defaultData.expenses;
    state.savings = defaultData.savings;
    state.investments = defaultData.investments;
    state.protection = defaultData.protection;
    state.goals = defaultData.goals;
    state.inventory = defaultData.inventory;
    renderApp();
    saveUserData();
    showToast('Data reset to default!', 'emerald');
  });
}
