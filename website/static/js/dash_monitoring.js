  // ========================================
  // UPDATE GREETING AND SEMESTER
  // ========================================
  let updateGreeting = function () {
    const today = new Date();
    const formatted =
      (today.getMonth() + 1).toString().padStart(2, "0") +
      "/" +
      today.getDate().toString().padStart(2, "0") +
      "/" +
      today.getFullYear();
    const el = _("dash_today_date");
    if (el) el.textContent = formatted;

    // Dynamic greeting based on time of day
    const hours = new Date().getHours();
    let greeting = "Hello";
    let timeClass = "";

    if (hours >= 5 && hours < 12) {
      greeting = "Morning";
      timeClass = "morning";
    } else if (hours >= 12 && hours < 17) {
      greeting = "Afternoon";
      timeClass = "afternoon";
    } else if (hours >= 17 && hours < 21) {
      greeting = "Evening";
      timeClass = "evening";
    } else {
      greeting = "Evening";
      timeClass = "evening";
    }

    const greetingEl = _("dash_greeting_time");
    if (greetingEl) {
      greetingEl.textContent = greeting;
    }

    const bannerEl = _("dash_greeting_banner");
    if (bannerEl && timeClass) {
      bannerEl.classList.remove("morning", "afternoon", "evening", "night");
      bannerEl.classList.add(timeClass);
    }

    // Dynamic semester calculation
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    let semesterYear;
    if (currentMonth >= 9) {
      semesterYear = currentYear + "-" + (currentYear + 1);
    } else {
      semesterYear = currentYear - 1 + "-" + currentYear;
    }
    const semesterEl = _("dash_semester");
    if (semesterEl) semesterEl.textContent = semesterYear;
  };

  // ========================================
  // FETCH DASHBOARD STATISTICS FROM DATABASE
  // ========================================
  let fetchDashboardStats = async function () {
    try {
      const response = await fetch('/dashboard_stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      const result = await response.json();

      if (result.type === 'success') {
        // Update stat numbers with animation
        updateStatNumber('stat_probation', result.stats.probation);
        updateStatNumber('stat_tracking', result.stats.tracking);
        updateStatNumber('stat_failed', result.stats.failed);
        updateStatNumber('stat_passed', result.stats.passed);
      } else {
        console.error('Failed to fetch stats:', result.message);
        // Show error state
        _('stat_probation').textContent = '--';
        _('stat_tracking').textContent = '--';
        _('stat_failed').textContent = '--';
        _('stat_passed').textContent = '--';
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Show error state
      _('stat_probation').textContent = '--';
      _('stat_tracking').textContent = '--';
      _('stat_failed').textContent = '--';
      _('stat_passed').textContent = '--';
    }
  };

  // ========================================
  // ANIMATE NUMBER UPDATES
  // ========================================
  function updateStatNumber(elementId, newValue) {
    const element = _(elementId);
    if (!element) return;

    const currentValue = parseInt(element.textContent) || 0;
    
    if (currentValue === newValue) {
      element.textContent = newValue;
      return;
    }

    // Animate the number change
    const duration = 500; // milliseconds
    const steps = 20;
    const stepValue = (newValue - currentValue) / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        element.textContent = newValue;
        clearInterval(interval);
      } else {
        const tempValue = Math.round(currentValue + (stepValue * currentStep));
        element.textContent = tempValue;
      }
    }, duration / steps);
  }


  // ========================================
  // INITIALIZE DASHBOARD
  // ========================================
  updateGreeting();
  fetchDashboardStats();

  // Refresh greeting every 5 seconds
  window.setInterval(updateGreeting, 5000);
  
  // Refresh stats every 5 seconds
  window.setInterval(fetchDashboardStats, 5000);