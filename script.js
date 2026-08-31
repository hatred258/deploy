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
      const username = JSON.parse(localStorage.getItem('fintrack_current_user'));
      if (username) {
        const users = this.getUsers();
        const user = users[username];
        if (user) {
          return {
            username: username,
            firstname: user.firstname || username,
            lastname: user.lastname || '',
            email: user.email || username + '@email.com'
          };
        }
      }
      return null;
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

  register(firstname, lastname, email, password) {
    const users = this.getUsers();
    const username = email.split('@')[0];
    
    if (users[username]) {
      return { success: false, error: 'Email already registered! Please use a different email.' };
    }
    
    const passwordCheck = this.validatePassword(password);
    if (!passwordCheck.valid) {
      return { success: false, error: passwordCheck.message };
    }
    
    users[username] = {
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: this.hashPassword(password),
      created: new Date().toISOString(),
      data: {
        income: [],
        expenses: [],
        savings: [],
        investments: [],
        protection: [],
        goals: [],
        inventory: []
      }
    };
    
    localStorage.setItem('fintrack_created_' + username, new Date().toISOString());
    
    this.saveUsers(users);
    return { success: true };
  },

  login(username, password) {
    const users = this.getUsers();
    const user = users[username];
    if (!user) {
      return { success: false, error: 'User not found! Please check your email.' };
    }
    if (user.password !== this.hashPassword(password)) {
      return { success: false, error: 'Invalid password! Please try again.' };
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
        message: 'Weak password! Add: ' + feedback.join(', '),
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

  getSampleData() {
    return {
      income: [
        { id: 1, desc: 'Monthly Allowance / Salary', amount: 18000, type: 'Active' },
        { id: 2, desc: 'Web Design Freelance', amount: 6500, type: 'Side Business' },
        { id: 3, desc: 'YouTube Ad Revenue', amount: 3200, type: 'Passive' }
      ],
      expenses: [
        { id: 1, desc: 'Food & Groceries', amount: 5000, category: 'Food' },
        { id: 2, desc: 'Boarding House & Power', amount: 3800, category: 'Bills' },
        { id: 3, desc: 'Bike Upgrades & Gear', amount: 2200, category: 'Shopping' },
        { id: 4, desc: 'Internet & Mobile', amount: 1500, category: 'Bills' },
        { id: 5, desc: 'Transportation', amount: 1200, category: 'Transportation' }
      ],
      savings: [
        { id: 1, desc: 'Emergency Vault Reserve', amount: 4500, account: 'Digital Bank (5% p.a.)', isCompleted: false },
        { id: 2, desc: '6-Month Time Deposit', amount: 5000, account: 'Traditional Bank', isCompleted: false },
        { id: 3, desc: 'High Yield Savings Deposit', amount: 3000, account: 'E-Wallet', isCompleted: true },
        { id: 4, desc: 'Vacation Fund', amount: 2000, account: 'Cash Vault', isCompleted: false }
      ],
      investments: [
        { id: 1, desc: 'Pag-IBIG MP2 Fund', amount: 3000, expectedReturn: 'Stocks/Funds' },
        { id: 2, desc: 'Mutual Funds / Stock Index', amount: 2500, expectedReturn: 'Stocks/Funds' },
        { id: 3, desc: 'Crypto Portfolio', amount: 1500, expectedReturn: 'Business Investment' }
      ],
      protection: [
        { id: 1, desc: 'PhilHealth / Health Insurance', amount: 50000, policyType: 'Insurance Coverage' },
        { id: 2, desc: 'Life & Accident Coverage', amount: 100000, policyType: 'Insurance Coverage' },
        { id: 3, desc: 'Motorcycle Insurance', amount: 25000, policyType: 'Property Protection' }
      ],
      goals: [
        { id: 1, desc: 'Emergency Fund (6 Months)', current: 4500, target: 12000 },
        { id: 2, desc: 'Gravel Bike Upgrade Fund', current: 3000, target: 10000 },
        { id: 3, desc: 'New Laptop for Work', current: 8000, target: 45000 },
        { id: 4, desc: 'Investment Portfolio Target', current: 7000, target: 50000 }
      ],
      inventory: [
        { id: 1, desc: 'Workstation Laptop', qty: 1, unitValue: 35000, category: 'Tech & Electronics', status: 'In Use' },
        { id: 2, desc: 'Gravel Bike & Gear', qty: 1, unitValue: 22000, category: 'Sports & Transport', status: 'In Stock' },
        { id: 3, desc: 'Spare 700C Tires & Tubes', qty: 4, unitValue: 650, category: 'Maintenance Parts', status: 'Low Stock' },
        { id: 4, desc: 'Hydraulic Brake Mineral Oil', qty: 0, unitValue: 350, category: 'Maintenance Parts', status: 'Out of Stock' },
        { id: 5, desc: 'Wireless Mechanical Keyboard', qty: 1, unitValue: 2800, category: 'Tech & Electronics', status: 'In Stock' },
        { id: 6, desc: 'Portable Monitor', qty: 1, unitValue: 4500, category: 'Tech & Electronics', status: 'In Use' }
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
let confirmModalCallback = null;

function checkPasswordMatch() {
    const password = document.getElementById('register-password');
    const confirm = document.getElementById('register-confirm-password');
    const feedback = document.getElementById('register-feedback');
    const strength = document.getElementById('register-strength');
    
    if (!password || !confirm || !feedback) return;
    
    const passVal = password.value;
    const confirmVal = confirm.value;
    
    password.classList.remove('password-match', 'password-mismatch');
    confirm.classList.remove('password-match', 'password-mismatch');
    
    if (confirmVal.length === 0) {
        if (passVal.length > 0) {
            const result = ACCOUNT_SYSTEM.validatePassword(passVal);
            if (result.valid) {
                strength.className = 'password-strength strong';
                feedback.textContent = '✅ Strong password!';
                feedback.className = 'password-feedback success';
            } else {
                strength.className = 'password-strength weak';
                feedback.textContent = '⚠️ ' + result.message;
                feedback.className = 'password-feedback error';
            }
        } else {
            strength.className = 'password-strength';
            feedback.textContent = '';
            feedback.className = 'password-feedback';
        }
        return;
    }
    
    if (passVal === confirmVal) {
        password.classList.add('password-match');
        confirm.classList.add('password-match');
        
        const result = ACCOUNT_SYSTEM.validatePassword(passVal);
        if (result.valid) {
            strength.className = 'password-strength strong';
            feedback.textContent = '✅ Passwords match! Strong password!';
            feedback.className = 'password-feedback success';
        } else {
            strength.className = 'password-strength weak';
            feedback.textContent = '⚠️ ' + result.message;
            feedback.className = 'password-feedback error';
        }
    } else {
        password.classList.add('password-mismatch');
        confirm.classList.add('password-mismatch');
        strength.className = 'password-strength weak';
        feedback.textContent = '❌ Passwords do not match!';
        feedback.className = 'password-feedback error';
    }
}

function animateNumber(element, target, prefix, suffix, duration) {
  if (!element) return;
  prefix = prefix || '₱';
  suffix = suffix || '';
  duration = duration || 900;
  
  var start = 0;
  var startTime = performance.now();
  var isFloat = target % 1 !== 0;
  var decimals = isFloat ? 2 : 0;
  
  function update(currentTime) {
    var elapsed = currentTime - startTime;
    var progress = Math.min(elapsed / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 4);
    var current = start + (target - start) * eased;
    
    if (isFloat) {
      element.textContent = prefix + current.toFixed(decimals).toLocaleString() + suffix;
    } else {
      element.textContent = prefix + Math.round(current).toLocaleString() + suffix;
    }
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      if (isFloat) {
        element.textContent = prefix + target.toFixed(decimals).toLocaleString() + suffix;
      } else {
        element.textContent = prefix + Math.round(target).toLocaleString() + suffix;
      }
    }
  }
  requestAnimationFrame(update);
}

function getStoredTheme() {
  return localStorage.getItem('fintrack_theme') || 'blue';
}

function setTheme(theme) {
  localStorage.setItem('fintrack_theme', theme);
  document.body.setAttribute('data-theme', theme);
  
  var blueBtn = document.getElementById('theme-btn-blue');
  var pinkBtn = document.getElementById('theme-btn-pink');
  
  if (theme === 'blue') {
    blueBtn.className = 'flex-1 h-10 rounded-xl bg-blue-500/20 border-2 border-blue-500 text-blue-400 text-xs font-bold flex items-center justify-center gap-2 transition';
    pinkBtn.className = 'flex-1 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold flex items-center justify-center gap-2 transition hover:bg-pink-500/20 hover:border-pink-500 hover:text-pink-400';
  } else {
    blueBtn.className = 'flex-1 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold flex items-center justify-center gap-2 transition hover:bg-blue-500/20 hover:border-blue-500 hover:text-blue-400';
    pinkBtn.className = 'flex-1 h-10 rounded-xl bg-pink-500/20 border-2 border-pink-500 text-pink-400 text-xs font-bold flex items-center justify-center gap-2 transition';
  }
  
  updateCharts();
}

function toggleSidebar(e) {
  if (e) e.stopPropagation();
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.toggle('active');
  overlay.classList.toggle('hidden');
}

function showLoginModal() {
  document.getElementById('login-modal').style.display = 'flex';
  switchLoginTab('login');
  lucide.createIcons();
}

function closeLoginModal() {
  document.getElementById('login-modal').style.display = 'none';
}

function switchLoginTab(tab) {
  var loginBtn = document.getElementById('login-tab-btn');
  var registerBtn = document.getElementById('register-tab-btn');
  var loginForm = document.getElementById('login-form');
  var registerForm = document.getElementById('register-form');
  var loginFooter = document.getElementById('login-footer');
  var registerFooter = document.getElementById('register-footer');

  if (tab === 'login') {
    loginBtn.classList.add('active');
    registerBtn.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    loginFooter.style.display = 'block';
    registerFooter.style.display = 'none';
  } else {
    registerBtn.classList.add('active');
    loginBtn.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    loginFooter.style.display = 'none';
    registerFooter.style.display = 'block';
  }
  lucide.createIcons();
}

function togglePasswordVisibility(inputId) {
  var input = document.getElementById(inputId);
  var toggle = input.parentElement.querySelector('.password-toggle i');
  if (input.type === 'password') {
    input.type = 'text';
    toggle.setAttribute('data-lucide', 'eye-off');
  } else {
    input.type = 'password';
    toggle.setAttribute('data-lucide', 'eye');
  }
  lucide.createIcons();
}

function handleLoginForm(e) {
  e.preventDefault();
  var email = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value;
  
  var username = email.split('@')[0];
  
  var result = ACCOUNT_SYSTEM.login(username, password);
  
  if (result.success) {
    closeLoginModal();
    var user = ACCOUNT_SYSTEM.getCurrentUser();
    showToast('Welcome back, ' + user.firstname + '!', 'success');
    fireConfetti();
    loadUserData(username);
    updateUserUI();
  } else {
    showToast(result.error, 'rose');
  }
}

function handleRegisterForm(e) {
    e.preventDefault();
    
    var firstname = document.getElementById('register-firstname').value.trim();
    var lastname = document.getElementById('register-lastname').value.trim();
    var email = document.getElementById('register-email').value.trim();
    var password = document.getElementById('register-password').value;
    var confirm = document.getElementById('register-confirm-password').value;
    
    if (password !== confirm) {
        showToast('❌ Passwords do not match! Please try again.', 'rose');
        document.getElementById('register-confirm-password').focus();
        return;
    }
    
    var strengthResult = ACCOUNT_SYSTEM.validatePassword(password);
    if (!strengthResult.valid) {
        showToast('❌ ' + strengthResult.message, 'rose');
        document.getElementById('register-password').focus();
        return;
    }
    
    var result = ACCOUNT_SYSTEM.register(firstname, lastname, email, password);
    
    if (result.success) {
        closeLoginModal();
        showToast('🎉 Account created! Welcome ' + firstname + '!', 'success');
        fireConfetti();
        
        var loginResult = ACCOUNT_SYSTEM.login(email.split('@')[0], password);
        if (loginResult.success) {
            loadUserData(email.split('@')[0]);
            updateUserUI();
        }
    } else {
        showToast(result.error, 'rose');
    }
}

function continueAsGuest() {
  closeLoginModal();
  showToast('Welcome, Guest!', 'info');
  state.income = [];
  state.expenses = [];
  state.savings = [];
  state.investments = [];
  state.protection = [];
  state.goals = [];
  state.inventory = [];
  renderApp();
}

document.addEventListener('DOMContentLoaded', function() {
    var registerPass = document.getElementById('register-password');
    var registerConfirm = document.getElementById('register-confirm-password');
    var strength = document.getElementById('register-strength');
    var feedback = document.getElementById('register-feedback');
    
    if (registerPass) {
        registerPass.addEventListener('input', function() {
            var val = this.value;
            var confirmVal = registerConfirm.value;
            
            if (val.length === 0) {
                strength.className = 'password-strength';
                feedback.textContent = '';
                feedback.className = 'password-feedback';
                this.classList.remove('password-match', 'password-mismatch');
                registerConfirm.classList.remove('password-match', 'password-mismatch');
                return;
            }
            
            var result = ACCOUNT_SYSTEM.validatePassword(val);
            
            if (confirmVal.length > 0) {
                if (val === confirmVal) {
                    this.classList.add('password-match');
                    registerConfirm.classList.add('password-match');
                    if (result.valid) {
                        strength.className = 'password-strength strong';
                        feedback.textContent = '✅ Passwords match! Strong password!';
                        feedback.className = 'password-feedback success';
                    } else {
                        strength.className = 'password-strength weak';
                        feedback.textContent = '⚠️ ' + result.message;
                        feedback.className = 'password-feedback error';
                    }
                } else {
                    this.classList.add('password-mismatch');
                    registerConfirm.classList.add('password-mismatch');
                    strength.className = 'password-strength weak';
                    feedback.textContent = '❌ Passwords do not match!';
                    feedback.className = 'password-feedback error';
                }
            } else {
                this.classList.remove('password-match', 'password-mismatch');
                registerConfirm.classList.remove('password-match', 'password-mismatch');
                if (result.valid) {
                    strength.className = 'password-strength strong';
                    feedback.textContent = '✅ Strong password!';
                    feedback.className = 'password-feedback success';
                } else {
                    strength.className = 'password-strength weak';
                    feedback.textContent = '⚠️ ' + result.message;
                    feedback.className = 'password-feedback error';
                }
            }
        });
    }
    
    if (registerConfirm) {
        registerConfirm.addEventListener('input', function() {
            var password = registerPass.value;
            var confirmVal = this.value;
            
            if (password.length === 0) {
                strength.className = 'password-strength';
                feedback.textContent = 'Please enter a password first.';
                feedback.className = 'password-feedback info';
                this.classList.remove('password-match', 'password-mismatch');
                return;
            }
            
            if (confirmVal.length === 0) {
                this.classList.remove('password-match', 'password-mismatch');
                registerPass.classList.remove('password-match', 'password-mismatch');
                var result = ACCOUNT_SYSTEM.validatePassword(password);
                if (result.valid) {
                    strength.className = 'password-strength strong';
                    feedback.textContent = '✅ Strong password!';
                    feedback.className = 'password-feedback success';
                } else {
                    strength.className = 'password-strength weak';
                    feedback.textContent = '⚠️ ' + result.message;
                    feedback.className = 'password-feedback error';
                }
                return;
            }
            
            if (password === confirmVal) {
                this.classList.add('password-match');
                registerPass.classList.add('password-match');
                var result = ACCOUNT_SYSTEM.validatePassword(password);
                if (result.valid) {
                    strength.className = 'password-strength strong';
                    feedback.textContent = '✅ Passwords match! Strong password!';
                    feedback.className = 'password-feedback success';
                } else {
                    strength.className = 'password-strength weak';
                    feedback.textContent = '⚠️ ' + result.message;
                    feedback.className = 'password-feedback error';
                }
            } else {
                this.classList.add('password-mismatch');
                registerPass.classList.add('password-mismatch');
                strength.className = 'password-strength weak';
                feedback.textContent = '❌ Passwords do not match!';
                feedback.className = 'password-feedback error';
            }
        });
    }
    
    var savedTheme = getStoredTheme();
    document.body.setAttribute('data-theme', savedTheme);
    setTimeout(function() { setTheme(savedTheme); }, 0);
    
    lucide.createIcons();
    initCharts();
    
    var currentUser = ACCOUNT_SYSTEM.getCurrentUser();
    if (currentUser) {
        loadUserData(currentUser.username);
        updateUserUI();
    } else {
        state.income = [];
        state.expenses = [];
        state.savings = [];
        state.investments = [];
        state.protection = [];
        state.goals = [];
        state.inventory = [];
        renderApp();
    }
    
    document.addEventListener('click', function(e) {
        var badge = document.querySelector('.user-badge');
        var dropdown = document.getElementById('user-dropdown');
        if (badge && dropdown && !badge.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
});

function loadUserData(username) {
  var data = ACCOUNT_SYSTEM.getUserData(username);
  if (data) {
    state.income = data.income || [];
    state.expenses = data.expenses || [];
    state.savings = data.savings || [];
    state.investments = data.investments || [];
    state.protection = data.protection || [];
    state.goals = data.goals || [];
    state.inventory = data.inventory || [];
    renderApp();
  } else {
    state.income = [];
    state.expenses = [];
    state.savings = [];
    state.investments = [];
    state.protection = [];
    state.goals = [];
    state.inventory = [];
    renderApp();
  }
  updateSampleButton();
}

function saveUserData() {
  var user = ACCOUNT_SYSTEM.getCurrentUser();
  if (user && user.username) {
    var data = {
      income: state.income,
      expenses: state.expenses,
      savings: state.savings,
      investments: state.investments,
      protection: state.protection,
      goals: state.goals,
      inventory: state.inventory
    };
    ACCOUNT_SYSTEM.saveUserData(user.username, data);
  }
}

function updateUserUI() {
  var user = ACCOUNT_SYSTEM.getCurrentUser();
  if (!user) return;
  
  var userSection = document.getElementById('user-section');
  var authBtn = document.getElementById('auth-btn-nav');
  var avatar = document.getElementById('user-avatar');
  var nameDisplay = document.getElementById('user-display-name');
  
  var sidebarAuth = document.getElementById('sidebar-auth-section');
  var sidebarUser = document.getElementById('sidebar-user-section');
  var sidebarName = document.getElementById('sidebar-user-name');
  var sidebarEmail = document.getElementById('sidebar-user-email');
  
  userSection.style.display = 'flex';
  authBtn.style.display = 'none';
  
  if (sidebarAuth) sidebarAuth.style.display = 'none';
  if (sidebarUser) sidebarUser.style.display = 'block';
  
  var fullName = (user.firstname + ' ' + user.lastname).trim();
  var initial = user.firstname.charAt(0).toUpperCase();
  
  avatar.textContent = initial;
  nameDisplay.textContent = fullName;
  
  if (sidebarName) sidebarName.textContent = fullName;
  if (sidebarEmail) sidebarEmail.textContent = user.email;
  
  lucide.createIcons();
}

function toggleUserDropdown() {
  var dropdown = document.getElementById('user-dropdown');
  dropdown.classList.toggle('active');
}

function showConfirmModal(title, message, onConfirm) {
  document.getElementById('confirm-modal-title').textContent = title;
  document.getElementById('confirm-modal-message').textContent = message;
  confirmModalCallback = onConfirm;
  document.getElementById('confirm-modal').style.display = 'flex';
  lucide.createIcons();
}

function closeConfirmModal(confirmed) {
  document.getElementById('confirm-modal').style.display = 'none';
  var cb = confirmModalCallback;
  confirmModalCallback = null;
  if (confirmed && cb) {
    cb();
  }
}

function handleLogout() {
  document.getElementById('user-dropdown').classList.remove('active');

  showConfirmModal('Sign Out', 'Are you sure you want to sign out?', function() {
    ACCOUNT_SYSTEM.logout();
    document.getElementById('user-section').style.display = 'none';
    document.getElementById('auth-btn-nav').style.display = 'flex';
    document.getElementById('user-dropdown').classList.remove('active');

    var sidebarAuth = document.getElementById('sidebar-auth-section');
    var sidebarUser = document.getElementById('sidebar-user-section');
    if (sidebarAuth) sidebarAuth.style.display = 'block';
    if (sidebarUser) sidebarUser.style.display = 'none';

    state.income = [];
    state.expenses = [];
    state.savings = [];
    state.investments = [];
    state.protection = [];
    state.goals = [];
    state.inventory = [];

    showToast('Signed out successfully', 'info');
    renderApp();
    updateSampleButton();
  });
}

function showStats() {
  var totalIncome = state.income.reduce(function(s, i) { return s + Number(i.amount); }, 0);
  var totalSavings = state.savings.reduce(function(s, i) { return s + Number(i.amount); }, 0);
  var totalInventory = state.inventory.reduce(function(s, i) { return s + (Number(i.qty) * Number(i.unitValue)); }, 0);
  
  showToast(
    'Income: ₱' + totalIncome.toLocaleString() + ' | Savings: ₱' + totalSavings.toLocaleString() + ' | Assets: ₱' + totalInventory.toLocaleString(),
    'info'
  );
  document.getElementById('user-dropdown').classList.remove('active');
}

function toggleSampleData() {
  var user = ACCOUNT_SYSTEM.getCurrentUser();
  if (!user) {
    showToast('Please sign in first!', 'rose');
    return;
  }

  var sampleData = ACCOUNT_SYSTEM.getSampleData();
  var isSampleLoaded = state.income.length === sampleData.income.length && 
                        state.expenses.length === sampleData.expenses.length &&
                        state.savings.length === sampleData.savings.length &&
                        state.inventory.length === sampleData.inventory.length &&
                        state.income.length > 0;

  if (isSampleLoaded) {
    showConfirmModal('Remove Sample Data', 'This will remove sample data and show your original data. Continue?', function() {
      var savedData = ACCOUNT_SYSTEM.getUserData(user.username);
      if (savedData) {
        state.income = savedData.income || [];
        state.expenses = savedData.expenses || [];
        state.savings = savedData.savings || [];
        state.investments = savedData.investments || [];
        state.protection = savedData.protection || [];
        state.goals = savedData.goals || [];
        state.inventory = savedData.inventory || [];
        showToast('Back to your original data!', 'success');
      } else {
        state.income = [];
        state.expenses = [];
        state.savings = [];
        state.investments = [];
        state.protection = [];
        state.goals = [];
        state.inventory = [];
        showToast('No original data found. Starting fresh!', 'info');
      }
      renderApp();
      saveUserData();
      updateSampleButton();
    });
  } else {
    var userData = ACCOUNT_SYSTEM.getUserData(user.username);
    if (userData && (userData.income.length > 0 || userData.expenses.length > 0 || userData.savings.length > 0)) {
      showConfirmModal('Load Sample Data', 'This will show sample data while keeping your original data saved. Continue?', function() {
        state.income = sampleData.income;
        state.expenses = sampleData.expenses;
        state.savings = sampleData.savings;
        state.investments = sampleData.investments;
        state.protection = sampleData.protection;
        state.goals = sampleData.goals;
        state.inventory = sampleData.inventory;
        renderApp();
        showToast('Sample data loaded!', 'success');
        fireConfetti();
        updateSampleButton();
      });
    } else {
      state.income = sampleData.income;
      state.expenses = sampleData.expenses;
      state.savings = sampleData.savings;
      state.investments = sampleData.investments;
      state.protection = sampleData.protection;
      state.goals = sampleData.goals;
      state.inventory = sampleData.inventory;
      renderApp();
      showToast('Sample data loaded!', 'success');
      fireConfetti();
      updateSampleButton();
    }
  }
}

function updateSampleButton() {
  var btn = document.getElementById('toggle-sample-btn');
  var dashBtn = document.getElementById('dash-toggle-sample-btn');
  var hint = document.getElementById('sample-data-hint');
  
  var sampleData = ACCOUNT_SYSTEM.getSampleData();
  var hasData = state.income.length > 0 || state.expenses.length > 0 || 
                  state.savings.length > 0 || state.inventory.length > 0;
  
  var isSampleLoaded = state.income.length === sampleData.income.length && 
                        state.expenses.length === sampleData.expenses.length &&
                        state.savings.length === sampleData.savings.length &&
                        state.inventory.length === sampleData.inventory.length &&
                        state.income.length > 0;
  
  if (isSampleLoaded) {
    if (btn) {
      btn.innerHTML = '<i data-lucide="undo-2" class="w-4 h-4"></i> Back to Original Data';
      btn.className = 'h-11 px-6 rounded-2xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-amber-400 font-bold text-xs transition flex items-center justify-center gap-2';
    }
    if (dashBtn) {
      dashBtn.innerHTML = '<i data-lucide="undo-2" class="w-3 h-3"></i> Back to Original';
      dashBtn.className = 'h-7 px-3 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-amber-400 text-[10px] font-bold transition flex items-center justify-center gap-1';
    }
    if (hint) {
      hint.textContent = 'Currently viewing sample data. Click "Back to Original Data" to see your original data.';
      hint.className = 'text-xs text-amber-400/70 mt-2';
    }
  } else if (hasData) {
    if (btn) {
      btn.innerHTML = '<i data-lucide="database" class="w-4 h-4"></i> Load Sample Data';
      btn.className = 'h-11 px-6 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-400 font-bold text-xs transition flex items-center justify-center gap-2';
    }
    if (dashBtn) {
      dashBtn.innerHTML = '<i data-lucide="database" class="w-3 h-3"></i> Load Sample';
      dashBtn.className = 'h-7 px-3 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold transition flex items-center justify-center gap-1';
    }
    if (hint) {
      hint.textContent = 'You have your own data. Click "Load Sample Data" to try sample data instead.';
      hint.className = 'text-xs text-slate-500 mt-2';
    }
  } else {
    if (btn) {
      btn.innerHTML = '<i data-lucide="database" class="w-4 h-4"></i> Load Sample Data';
      btn.className = 'h-11 px-6 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-400 font-bold text-xs transition flex items-center justify-center gap-2';
    }
    if (dashBtn) {
      dashBtn.innerHTML = '<i data-lucide="database" class="w-3 h-3"></i> Load Sample';
      dashBtn.className = 'h-7 px-3 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold transition flex items-center justify-center gap-1';
    }
    if (hint) {
      hint.textContent = 'Click "Load Sample Data" to see example financial data and get started!';
      hint.className = 'text-xs text-slate-500 mt-2';
    }
  }
  
  lucide.createIcons();
}

function getSavingsStatus(amount, isCompleted) {
  if (isCompleted) {
    return { text: 'Completed / Reached', badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' };
  }
  var val = Number(amount);
  if (val <= 0) return { text: 'Depleted / ₱0', badge: 'bg-rose-950/80 text-rose-300 border-rose-500/40' };
  if (val < 2000) return { text: 'Low Balance', badge: 'bg-amber-950/80 text-amber-300 border-amber-500/40' };
  if (val < 10000) return { text: 'Active Accumulating', badge: 'bg-blue-950/80 text-blue-300 border-blue-500/40' };
  return { text: 'Target Reached', badge: 'bg-purple-950/80 text-purple-300 border-purple-500/40' };
}

function toggleSavingsProgress(id) {
  var target = state.savings.find(function(s) { return s.id === id; });
  if (target) {
    target.isCompleted = !target.isCompleted;
    if (target.isCompleted) {
      showToast('Marked "' + target.desc + '" as completed!', 'success');
      fireConfetti();
    } else {
      showToast('Reopened goal for "' + target.desc + '"', 'info');
    }
    renderApp();
    saveUserData();
  }
}

function navigateTo(view) {
  state.currentView = view;
  var homeSec = document.getElementById('view-home');
  var dashSec = document.getElementById('view-dashboard');
  var invSec = document.getElementById('view-inventory');

  var btnHome = document.getElementById('nav-btn-home');
  var btnDash = document.getElementById('nav-btn-dashboard');
  var btnInv = document.getElementById('nav-btn-inventory');

  var defaultNavClass = "h-9 px-4 text-xs font-semibold rounded-xl transition text-slate-400 hover:text-white flex items-center justify-center gap-2 shrink-0";

  [btnHome, btnDash, btnInv].forEach(function(btn) {
    if (btn) btn.className = defaultNavClass;
  });

  homeSec.classList.add('hidden');
  dashSec.classList.add('hidden');
  invSec.classList.add('hidden');

  if (view === 'home') {
    homeSec.classList.remove('hidden');
    if (btnHome) btnHome.className = "h-9 px-4 text-xs font-bold rounded-xl transition theme-nav-active flex items-center justify-center gap-2 shrink-0";
  } else if (view === 'dashboard') {
    dashSec.classList.remove('hidden');
    if (btnDash) btnDash.className = "h-9 px-4 text-xs font-bold rounded-xl transition theme-nav-active flex items-center justify-center gap-2 shrink-0";
  } else if (view === 'inventory') {
    invSec.classList.remove('hidden');
    if (btnInv) btnInv.className = "h-9 px-4 text-xs font-bold rounded-xl transition theme-nav-active flex items-center justify-center gap-2 shrink-0";
  }

  renderApp();
}

function renderApp() {
  updateSummaryMetrics();
  renderDashForm();
  renderDashTable();
  renderInventoryTable();
  updateCharts();
  updateSampleButton();
  updateSidebarStats();
}

function updateSummaryMetrics() {
  var totalIncome = state.income.reduce(function(s, i) { return s + Number(i.amount); }, 0);
  var totalSpending = state.expenses.reduce(function(s, i) { return s + Number(i.amount); }, 0);
  var totalSavings = state.savings.reduce(function(s, i) { return s + Number(i.amount); }, 0);
  var totalInvestments = state.investments.reduce(function(s, i) { return s + Number(i.amount); }, 0);
  var totalProtection = state.protection.reduce(function(s, i) { return s + Number(i.amount); }, 0);

  var totalInventoryVal = state.inventory.reduce(function(s, i) { return s + (Number(i.qty) * Number(i.unitValue)); }, 0);
  var totalInventoryUnits = state.inventory.reduce(function(s, i) { return s + Number(i.qty); }, 0);
  var totalInventoryTypes = state.inventory.length;

  var netFlow = totalIncome - totalSpending;
  var savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : 0;

  animateNumber(document.getElementById('home-stat-income'), totalIncome);
  animateNumber(document.getElementById('home-stat-spending'), totalSpending);
  animateNumber(document.getElementById('home-stat-savings'), totalSavings);
  animateNumber(document.getElementById('home-stat-inventory'), totalInventoryVal);

  animateNumber(document.getElementById('stat-income'), totalIncome);
  animateNumber(document.getElementById('stat-savings'), totalSavings);
  animateNumber(document.getElementById('stat-spending'), totalSpending);
  animateNumber(document.getElementById('stat-investments'), totalInvestments);
  animateNumber(document.getElementById('stat-protection'), totalProtection);

  var netElem = document.getElementById('stat-net-flow');
  if (netElem) {
    netElem.className = netFlow >= 0 ? "font-bold theme-text truncate" : "font-bold text-rose-400 truncate";
    animateNumber(netElem, netFlow);
  }

  var rateElem = document.getElementById('stat-savings-rate');
  if (rateElem) {
    animateNumber(rateElem, parseFloat(savingsRate), '', '%', 600);
  }

  animateNumber(document.getElementById('inv-summary-value'), totalInventoryVal);
  
  var unitsElem = document.getElementById('inv-summary-units');
  if (unitsElem) {
    animateNumber(unitsElem, totalInventoryUnits, '', ' Units', 600);
  }
  
  var typesElem = document.getElementById('inv-summary-types');
  if (typesElem) {
    animateNumber(typesElem, totalInventoryTypes, '', ' Items', 600);
  }
}

function updateSidebarStats() {
  var totalIncome = state.income.reduce(function(s, i) { return s + Number(i.amount); }, 0);
  var totalSavings = state.savings.reduce(function(s, i) { return s + Number(i.amount); }, 0);
  var totalInventory = state.inventory.reduce(function(s, i) { return s + (Number(i.qty) * Number(i.unitValue)); }, 0);
  var totalBalance = totalIncome + totalSavings + totalInventory;
  
  var balanceEl = document.getElementById('sidebar-total-balance');
  var inventoryEl = document.getElementById('sidebar-inventory-count');
  var goalsEl = document.getElementById('sidebar-goals-count');
  var savingsRateEl = document.getElementById('sidebar-savings-rate');
  var activityEl = document.getElementById('sidebar-latest-activity');
  
  if (balanceEl) animateNumber(balanceEl, totalBalance);
  if (inventoryEl) animateNumber(inventoryEl, state.inventory.length, '', '', 600);
  if (goalsEl) animateNumber(goalsEl, state.goals.length, '', '', 600);
  
  if (savingsRateEl) {
    var savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : 0;
    animateNumber(savingsRateEl, parseFloat(savingsRate), '', '%', 600);
  }
  
  if (activityEl) {
    if (state.income.length > 0 || state.expenses.length > 0) {
      var latest = state.income.concat(state.expenses);
      latest.sort(function(a, b) { return b.id - a.id; });
      if (latest.length > 0) {
        activityEl.textContent = '📌 Latest: ' + latest[0].desc + ' (₱' + Number(latest[0].amount).toLocaleString() + ')';
      } else {
        activityEl.textContent = 'Welcome to FinTrack Pro! 🚀';
      }
    } else {
      activityEl.textContent = 'Start tracking your finances today! 💰';
    }
  }
}

function switchDashTab(tab) {
  state.activeDashTab = tab;
  ['income', 'expenses', 'savings', 'investments', 'protection', 'goals'].forEach(function(t) {
    var btn = document.getElementById('dash-tab-' + t);
    if (t === tab) {
      btn.className = "h-12 px-5 text-xs font-bold border-b-2 border-blue-500 theme-text flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition";
    } else {
      btn.className = "h-12 px-5 text-xs font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition";
    }
  });
  renderDashForm();
  renderDashTable();
}

function renderDashForm() {
  var title = document.getElementById('dash-form-title');
  var in1 = document.getElementById('dash-input-1');
  var in2 = document.getElementById('dash-input-2');
  var in3 = document.getElementById('dash-input-3');
  var in4 = document.getElementById('dash-input-4');

  in3.innerHTML = '';
  in4.innerHTML = '';
  in4.classList.add('hidden');

  if (state.activeDashTab === 'income') {
    title.innerHTML = '<i data-lucide="plus-circle" class="w-4 h-4 theme-text"></i> Add Income Stream';
    in1.placeholder = 'Income Source (e.g. Salary)';
    in2.placeholder = 'Amount (₱)';
    ['Active', 'Passive', 'Side Business'].forEach(function(opt) { in3.add(new Option(opt, opt)); });
  } else if (state.activeDashTab === 'expenses') {
    title.innerHTML = '<i data-lucide="plus-circle" class="w-4 h-4 text-rose-400"></i> Add Expense & Deduct from Savings';
    in1.placeholder = 'Expense Description';
    in2.placeholder = 'Amount (₱)';
    ['Food', 'Transportation', 'Bills', 'Shopping', 'Entertainment', 'Education'].forEach(function(opt) { in3.add(new Option(opt, opt)); });
    
    in4.classList.remove('hidden');
    in4.add(new Option('Deduct from: None (Cash/Income)', 'none'));
    state.savings.forEach(function(s) {
      in4.add(new Option('Deduct from: ' + s.desc + ' (₱' + s.amount.toLocaleString() + ')', s.id));
    });

  } else if (state.activeDashTab === 'savings') {
    title.innerHTML = '<i data-lucide="plus-circle" class="w-4 h-4 theme-text-secondary"></i> Add / Deposit Savings';
    in1.placeholder = 'Account / Savings Goal';
    in2.placeholder = 'Deposit Amount (₱)';
    ['Digital Bank', 'Traditional Bank', 'E-Wallet', 'Cash Vault'].forEach(function(opt) { in3.add(new Option(opt, opt)); });
  } else if (state.activeDashTab === 'investments') {
    title.innerHTML = '<i data-lucide="plus-circle" class="w-4 h-4 text-purple-400"></i> Add Investment Asset';
    in1.placeholder = 'Asset / Fund Title';
    in2.placeholder = 'Invested Amount (₱)';
    ['Stocks/Funds', 'Business Investment', 'Bonds/Fixed income', 'Property'].forEach(function(opt) { in3.add(new Option(opt, opt)); });
  } else if (state.activeDashTab === 'protection') {
    title.innerHTML = '<i data-lucide="plus-circle" class="w-4 h-4 text-amber-400"></i> Add Insurance Coverage';
    in1.placeholder = 'Policy Name';
    in2.placeholder = 'Coverage Amount (₱)';
    ['Insurance Coverage', 'Property Protection'].forEach(function(opt) { in3.add(new Option(opt, opt)); });
  } else if (state.activeDashTab === 'goals') {
    title.innerHTML = '<i data-lucide="plus-circle" class="w-4 h-4 theme-text-secondary"></i> Add Goal Target';
    in1.placeholder = 'Goal Description';
    in2.placeholder = 'Current Saved (₱)';
    ['Target: ₱5,000', 'Target: ₱10,000', 'Target: ₱20,000', 'Target: ₱50,000'].forEach(function(opt) { in3.add(new Option(opt, opt)); });
  }
  lucide.createIcons();
}

function handleDashFormSubmit(e) {
  e.preventDefault();
  var val1 = document.getElementById('dash-input-1').value;
  var val2 = parseFloat(document.getElementById('dash-input-2').value);
  var val3 = document.getElementById('dash-input-3').value;
  var val4 = document.getElementById('dash-input-4').value;
  var newId = Date.now();

  if (state.activeDashTab === 'income') {
    state.income.push({ id: newId, desc: val1, amount: val2, type: val3 });
    triggerCardPulse('card-income');
  } else if (state.activeDashTab === 'expenses') {
    state.expenses.push({ id: newId, desc: val1, amount: val2, category: val3 });
    triggerCardPulse('card-spending');

    if (val4 && val4 !== 'none') {
      var targetSavings = state.savings.find(function(s) { return s.id == val4; });
      if (targetSavings) {
        targetSavings.amount = Math.max(0, targetSavings.amount - val2);
        triggerCardPulse('card-savings');
        showToast('Deducted ₱' + val2.toLocaleString() + ' from ' + targetSavings.desc + '!', 'info');
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
    var targetVal = parseFloat(val3.replace(/[^0-9]/g, '')) || 10000;
    state.goals.push({ id: newId, desc: val1, current: val2, target: targetVal });
  }

  showToast('Added "' + val1 + '" to ' + state.activeDashTab + '!', 'success');
  fireConfetti();
  document.getElementById('dash-form').reset();
  renderApp();
  saveUserData();
}

function handleInventorySubmit(e) {
  e.preventDefault();
  var name = document.getElementById('inv-input-name').value;
  var price = parseFloat(document.getElementById('inv-input-price').value);
  var qty = parseInt(document.getElementById('inv-input-qty').value);
  var category = document.getElementById('inv-input-category').value;
  var status = document.getElementById('inv-input-status').value;

  state.inventory.push({
    id: Date.now(),
    desc: name,
    qty: qty,
    unitValue: price,
    category: category,
    status: status
  });

  showToast('Added ' + name + ' [' + status + '] to Inventory!', 'info');
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
  state[tab] = state[tab].filter(function(i) { return i.id !== id; });
  showToast('Item removed from ' + tab, 'rose');
  renderApp();
  saveUserData();
}

function renderDashTable() {
  var tbody = document.getElementById('dash-table-body');
  var thead = document.getElementById('dash-table-head');
  tbody.innerHTML = '';

  if (state.activeDashTab === 'goals') {
    thead.innerHTML = `
      <th class="py-3 px-4 min-w-[150px]">Goal Title</th>
      <th class="py-3 px-4 min-w-[140px]">Current / Target</th>
      <th class="py-3 px-4 min-w-[180px]">Progress Track</th>
      <th class="py-3 px-4 text-right min-w-[80px]">Actions</th>
    `;
    state.goals.forEach(function(item) {
      var pct = Math.min(100, Math.round((item.current / item.target) * 100));
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

    state.savings.forEach(function(item) {
      var statusInfo = getSavingsStatus(item.amount, item.isCompleted);
      var completedStyle = item.isCompleted ? 'line-through opacity-50' : '';

      tbody.innerHTML += `
        <tr class="hover:bg-slate-800/40 transition">
          <td class="py-3 px-4 text-center">
            <input 
              type="checkbox" 
              ${item.isCompleted ? 'checked' : ''} 
              onchange="toggleSavingsProgress(${item.id})"
              class="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-blue-500/30 focus:ring-offset-slate-900 cursor-pointer accent-blue-500 transition"
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
    var list = state[state.activeDashTab] || [];
    list.forEach(function(item) {
      var tag = item.type || item.category || item.expectedReturn || item.policyType || 'General';
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
  var tbody = document.getElementById('inventory-table-body');
  tbody.innerHTML = '';

  var items = state.inventory;
  if (state.inventoryFilter !== 'all') {
    items = items.filter(function(i) { return i.status === state.inventoryFilter; });
  }

  var statusBadgeMap = {
    'In Stock': 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    'Low Stock': 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    'Out of Stock': 'bg-rose-950/80 text-rose-300 border-rose-500/40',
    'In Use': 'bg-blue-950/80 text-blue-300 border-blue-500/40',
    'Maintenance': 'bg-purple-950/80 text-purple-300 border-purple-500/40'
  };

  items.forEach(function(item) {
    var totalVal = Number(item.qty) * Number(item.unitValue);
    var badgeClass = statusBadgeMap[item.status] || 'bg-slate-800 text-slate-300 border-slate-700';

    tbody.innerHTML += `
      <tr class="hover:bg-slate-800/40">
        <td class="py-3 px-4 font-bold text-white break-words">
          <div class="flex items-center gap-2">
            <i data-lucide="box" class="w-4 h-4 theme-text shrink-0"></i>
            <span>${item.desc}</span>
          </div>
        </td>
        <td class="py-3 px-4 whitespace-nowrap">
          <span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">${item.category}</span>
        </td>
        <td class="py-3 px-4 font-extrabold text-slate-200 whitespace-nowrap">${item.qty} Units</td>
        <td class="py-3 px-4 whitespace-nowrap">₱${Number(item.unitValue).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td class="py-3 px-4 font-extrabold theme-text whitespace-nowrap">₱${totalVal.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
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
    data: { labels: [], datasets: [{ data: [], backgroundColor: ['#f43f5e', '#3b82f6', '#a855f7', '#eab308', '#10b981', '#f97316'] }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } } }
  });

  charts.allocation = new Chart(document.getElementById('allocationChart'), {
    type: 'bar',
    data: {
      labels: ['Income', 'Savings', 'Spending', 'Investment', 'Protection'],
      datasets: [{ data: [0,0,0,0,0], backgroundColor: ['#3b82f6', '#06b6d4', '#f43f5e', '#a855f7', '#f59e0b'] }]
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
  var theme = getStoredTheme();
  var primaryColor = theme === 'pink' ? '#ec4899' : '#3b82f6';
  var secondaryColor = theme === 'pink' ? '#f43f5e' : '#06b6d4';

  var expCatMap = {};
  state.expenses.forEach(function(e) { expCatMap[e.category] = (expCatMap[e.category] || 0) + Number(e.amount); });
  charts.expense.data.labels = Object.keys(expCatMap);
  charts.expense.data.datasets[0].data = Object.values(expCatMap);
  charts.expense.update();

  var totalInc = state.income.reduce(function(s, i) { return s + Number(i.amount); }, 0);
  var totalSav = state.savings.reduce(function(s, i) { return s + Number(i.amount); }, 0);
  var totalExp = state.expenses.reduce(function(s, i) { return s + Number(i.amount); }, 0);
  var totalInv = state.investments.reduce(function(s, i) { return s + Number(i.amount); }, 0);
  var totalPro = state.protection.reduce(function(s, i) { return s + Number(i.amount); }, 0);

  charts.allocation.data.datasets[0].data = [totalInc, totalSav, totalExp, totalInv, totalPro];
  charts.allocation.data.datasets[0].backgroundColor = [primaryColor, secondaryColor, '#f43f5e', '#a855f7', '#f59e0b'];
  charts.allocation.update();

  charts.goals.data.labels = state.goals.map(function(g) { return g.desc; });
  charts.goals.data.datasets[0].data = state.goals.map(function(g) { return g.current; });
  charts.goals.data.datasets[1].data = state.goals.map(function(g) { return g.target; });
  charts.goals.data.datasets[0].backgroundColor = primaryColor;
  charts.goals.update();

  var invCatMap = {};
  state.inventory.forEach(function(inv) { invCatMap[inv.category] = (invCatMap[inv.category] || 0) + (Number(inv.qty) * Number(inv.unitValue)); });
  charts.inventory.data.labels = Object.keys(invCatMap);
  charts.inventory.data.datasets[0].data = Object.values(invCatMap);
  charts.inventory.update();

  var monthlyNet = totalInc - totalExp;
  var totalAssets = totalSav + totalInv + state.inventory.reduce(function(s, i) { return s + (Number(i.qty) * Number(i.unitValue)); }, 0);

  charts.growth.data.datasets[0].data = Array.from({length: 6}, function(_, idx) { return totalAssets + (monthlyNet * (idx + 1)); });
  charts.growth.data.datasets[1].data = Array.from({length: 6}, function(_, idx) { return totalSav + (totalSav * 0.2 * (idx + 1)); });
  charts.growth.data.datasets[0].borderColor = '#a855f7';
  charts.growth.data.datasets[1].borderColor = primaryColor;
  charts.growth.update();
}

function fireConfetti() {
  var theme = getStoredTheme();
  var colors = theme === 'pink' 
    ? ['#ec4899', '#f472b6', '#f43f5e', '#fb7185']
    : ['#3b82f6', '#06b6d4', '#60a5fa', '#a855f7'];
  confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: colors });
}

function triggerCardPulse(cardId) {
  var card = document.getElementById(cardId);
  if (card) {
    card.classList.remove('animate-pulse-glow');
    void card.offsetWidth;
    card.classList.add('animate-pulse-glow');
  }
}

function showToast(message, color) {
  color = color || 'success';
  var container = document.getElementById('toast-container');
  
  if (!container) {
    alert(message);
    return;
  }
  
  var toast = document.createElement('div');
  
  var bgColors = {
    success: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300',
    info: 'bg-blue-950/90 border-blue-500/50 text-blue-300',
    rose: 'bg-rose-950/90 border-rose-500/50 text-rose-300'
  };

  toast.className = 'px-4 py-3 rounded-xl border text-xs font-bold shadow-xl flex items-center gap-2 backdrop-blur pointer-events-auto toast-slide-in ' + (bgColors[color] || bgColors.success);
  toast.innerHTML = '<i data-lucide="sparkles" class="w-4 h-4"></i> ' + message;

  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
}

function handleSocialLogin(provider) {
  showToast(provider.charAt(0).toUpperCase() + provider.slice(1) + ' login coming soon!', 'info');
}
