document.addEventListener('DOMContentLoaded', () => {
  const DESKTOP_BP = 860;

  /* ==========================================================================
     ۱. سیستم تغییر تم دارک / لایت (Dark / Light Theme Engine)
     ========================================================================== */
  const THEME_KEY = 'pyramid:theme';
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    themeToggleBtns.forEach(btn => {
      btn.innerHTML = theme === 'dark' 
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
      btn.setAttribute('aria-label', theme === 'dark' ? 'فعال‌سازی حالت روشن' : 'فعال‌سازی حالت تاریک');
    });
  };

  const savedTheme = localStorage.getItem(THEME_KEY) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(savedTheme);

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  });

  /* ==========================================================================
     ۲. منوی واکنش‌گرا و دراپ‌داون‌ها (Navigation & Mobile Menu)
     ========================================================================== */
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  const dropdownItems = document.querySelectorAll('.has-dropdown');

  const closeDropdown = (li) => {
    li.classList.remove('is-open');
    const link = li.querySelector('.nav-link');
    if (link) link.setAttribute('aria-expanded', 'false');
  };

  const closeAllDropdowns = (except = null) => {
    dropdownItems.forEach(li => {
      if (li !== except) closeDropdown(li);
    });
  };

  const closeMobileMenu = () => {
    if (mainNav) {
      mainNav.classList.remove('is-open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    }
    closeAllDropdowns();
  };

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (!isOpen) closeAllDropdowns();
    });
  }

  dropdownItems.forEach(li => {
    const link = li.querySelector('.nav-link');
    if (!link) return;

    link.addEventListener('click', (e) => {
      if (window.innerWidth <= DESKTOP_BP) {
        e.preventDefault();
        const isOpen = li.classList.contains('is-open');
        closeAllDropdowns(li);
        if (isOpen) {
          closeDropdown(li);
        } else {
          li.classList.add('is-open');
          link.setAttribute('aria-expanded', 'true');
        }
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.site-header')) {
      closeMobileMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > DESKTOP_BP) {
      closeMobileMenu();
    }
  });

  /* ==========================================================================
     ۳. همگام‌سازی پروفایل کاربر (Profile & User State Management)
     ========================================================================== */
  const PROFILE_KEY = 'pyramid:user-profile';
  const defaultProfile = {
    name: 'دانش‌آموز مک',
    gradient: 'g-1',
    avatarImg: ''
  };

  const gradientsMap = {
    'g-1': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)',
    'g-2': 'linear-gradient(135deg, #2563eb 0%, #6366f1 50%, #a855f7 100%)',
    'g-3': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)'
  };

  const loadProfile = () => {
    try {
      return JSON.parse(localStorage.getItem(PROFILE_KEY)) || defaultProfile;
    } catch {
      return defaultProfile;
    }
  };

  const saveProfile = (data) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
    syncProfileUI(data);
  };

  const syncProfileUI = (profile) => {
    document.querySelectorAll('.user-pill b').forEach(el => el.textContent = profile.name);
    document.querySelectorAll('.user-pill .avatar, .profile-avatar-large').forEach(el => {
      if (profile.avatarImg) {
        el.style.backgroundImage = `url(${profile.avatarImg})`;
        el.textContent = '';
      } else {
        el.style.backgroundImage = 'none';
        el.style.background = gradientsMap[profile.gradient] || gradientsMap['g-1'];
        el.textContent = profile.name ? profile.name.trim().charAt(0) : 'پ';
      }
    });
  };

  const currentProfile = loadProfile();
  syncProfileUI(currentProfile);

  // اتصال فرم صفحه پروفایل
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    const nameInput = document.getElementById('profile-name');
    const avatarInput = document.getElementById('avatar-upload');
    const gradientOptions = document.querySelectorAll('.gradient-opt');

    if (nameInput) nameInput.value = currentProfile.name;

    gradientOptions.forEach(opt => {
      if (opt.dataset.grad === currentProfile.gradient) opt.classList.add('is-active');
      opt.addEventListener('click', () => {
        gradientOptions.forEach(o => o.classList.remove('is-active'));
        opt.classList.add('is-active');
        currentProfile.gradient = opt.dataset.grad;
        currentProfile.avatarImg = ''; // پاک کردن عکس در صورت انتخاب گرادیان
        saveProfile(currentProfile);
      });
    });

    if (avatarInput) {
      avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            currentProfile.avatarImg = event.target.result;
            saveProfile(currentProfile);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (nameInput) currentProfile.name = nameInput.value.trim() || 'دانش‌آموز';
      saveProfile(currentProfile);
      alert('تنظیمات پروفایل با موفقیت ذخیره شد!');
    });
  }

  /* ==========================================================================
     ۴. انیمیشن گیج و اسلایدر تراز (Gauge & Slider Animation)
     ========================================================================== */
  const needle = document.querySelector('.gauge-needle');
  if (needle) {
    const min = parseFloat(needle.dataset.min) || 0;
    const max = parseFloat(needle.dataset.max) || 10000;
    const val = parseFloat(needle.dataset.value) || min;

    const ratio = Math.min(Math.max((val - min) / (max - min), 0), 1);
    const targetDeg = -90 + (ratio * 180);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        needle.style.transform = `rotate(${targetDeg}deg)`;
      });
    });
  }

  /* ==========================================================================
     ۵. ذخیره‌سازی و اعتبارسنجی فرم درصدها (Form Persistence & Validation)
     ========================================================================== */
  const form = document.querySelector('form[aria-label="فرم تخمین کنکور"]') || document.querySelector('.form-card form');
  const STORAGE_KEY = 'pyramid:input-form';

  if (form && !form.id.includes('calc') && !form.id.includes('profile')) {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      Object.entries(saved).forEach(([k, v]) => {
        const field = form.elements[k];
        if (field) field.value = v;
      });
    } catch (e) {
      console.warn('Form restore failed:', e);
    }

    form.addEventListener('input', (e) => {
      const field = e.target;
      if (field.type === 'number') {
        const num = parseFloat(field.value);
        let error = field.parentNode.querySelector('.field-error');
        if (num < 0 || num > 100) {
          field.setAttribute('aria-invalid', 'true');
          if (!error) {
            error = document.createElement('span');
            error.className = 'field-error';
            error.textContent = 'درصد باید بین ۰ تا ۱۰۰ باشد.';
            field.parentNode.appendChild(error);
          }
        } else {
          field.removeAttribute('aria-invalid');
          if (error) error.remove();
        }
      }

      const data = {};
      Array.from(form.elements).forEach(el => {
        if (el.name) data[el.name] = el.value;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    });
  }

  /* ==========================================================================
     ۶. ماژول ماشین‌حساب پیشرفته کنکور و مهندسی (Advanced Calculator)
     ========================================================================== */
  const konkurCalcForm = document.getElementById('konkur-calc-form');
  if (konkurCalcForm) {
    konkurCalcForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const correct = parseFloat(document.getElementById('calc-correct').value) || 0;
      const wrong = parseFloat(document.getElementById('calc-wrong').value) || 0;
      const total = parseFloat(document.getElementById('calc-total').value) || 1;

      if (correct + wrong > total) {
        alert('مجموع پاسخ‌های درست و غلط نمی‌تواند بیشتر از کل سوالات باشد!');
        return;
      }

      const percentage = (((correct * 3) - wrong) / (total * 3)) * 100;
      const resultBox = document.getElementById('konkur-calc-result');
      if (resultBox) {
        resultBox.textContent = `${percentage.toFixed(2)} %`;
      }
    });
  }

  // ماشین‌حساب استاندارد علمی
  const calcOutput = document.querySelector('.calc-output');
  const calcHistory = document.querySelector('.calc-history');
  let currentExpr = '';

  document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.val;
      const action = btn.dataset.action;

      if (action === 'clear') {
        currentExpr = '';
        if (calcOutput) calcOutput.textContent = '0';
        if (calcHistory) calcHistory.textContent = '';
      } else if (action === 'backspace') {
        currentExpr = currentExpr.slice(0, -1);
        if (calcOutput) calcOutput.textContent = currentExpr || '0';
      } else if (action === 'calculate') {
        try {
          const sanitized = currentExpr.replace(/×/g, '*').replace(/÷/g, '/');
          const evalResult = Function(`'use strict'; return (${sanitized})`)();
          if (calcHistory) calcHistory.textContent = currentExpr;
          if (calcOutput) calcOutput.textContent = evalResult;
          currentExpr = String(evalResult);
        } catch {
          if (calcOutput) calcOutput.textContent = 'خطا';
          currentExpr = '';
        }
      } else if (val) {
        if (currentExpr === '0' && val !== '.') currentExpr = '';
        currentExpr += val;
        if (calcOutput) calcOutput.textContent = currentExpr;
      }
    });
  });

  /* ==========================================================================
     ۷. دکمه شناور اشتراک‌گذاری (Share FAB)
     ========================================================================== */
  const shareBtn = document.querySelector('.fab-share');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: 'کارنامه تخمین پیرامید',
        text: 'نتیجه تخمین تراز و رتبه کنکور در سامانه پیرامید',
        url: window.location.href
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch {}
      } else {
        await navigator.clipboard.writeText(window.location.href);
        const originalTitle = shareBtn.getAttribute('title');
        shareBtn.setAttribute('title', 'لینک کپی شد!');
        setTimeout(() => shareBtn.setAttribute('title', originalTitle), 2000);
      }
    });
  }
});
