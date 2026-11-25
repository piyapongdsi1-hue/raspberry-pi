document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle (Shared across all pages)
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('rpi_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (themeToggleBtn) {
    themeToggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    themeToggleBtn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('rpi_theme', next);
      themeToggleBtn.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  }

  // Shared Login Session Badge in Navbar
  const navActions = document.querySelector('.nav-actions');
  const savedUser = localStorage.getItem('rpi_login_user');
  if (navActions && savedUser && !document.getElementById('navUserBadge')) {
    const badgeLink = document.createElement('a');
    badgeLink.id = 'navUserBadge';
    badgeLink.href = 'login.html';
    badgeLink.className = 'nav-user-badge';
    badgeLink.textContent = `👤 ${savedUser}`;
    navActions.prepend(badgeLink);
  }

  // Web Audio API Buzzer Helper
  let audioCtx = null;
  function playBuzzer(freq = 2400, durationMs = 200, buzzerEl = null, statusEl = null) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    if (buzzerEl) buzzerEl.classList.add('ringing');
    if (statusEl) statusEl.textContent = `กำลังส่งเสียง ${freq}Hz...`;

    osc.start();
    osc.stop(audioCtx.currentTime + durationMs / 1000);
    setTimeout(() => {
      if (buzzerEl) buzzerEl.classList.remove('ringing');
      if (statusEl) statusEl.textContent = 'พร้อมส่งเสียงแจ้งเตือน';
    }, durationMs);
  }

  const page = document.body.dataset.page;

  // =========================================================================
  // PAGE 1: HOME (index.html)
  // =========================================================================
  if (page === 'home') {
    const partDetails = {
      gpio: {
        title: '40-Pin GPIO Header',
        spec: '3.3V Logic • Digital / PWM / I2C / SPI / UART',
        desc: 'ใช้รับ-ส่งสัญญาณดิจิทัล ควบคุมหลอด LED, มอเตอร์ PWM, เซนเซอร์ DHT11/PIR และสื่อสารกับอุปกรณ์ภายนอกผ่าน I2C (Pin 3, 5), SPI และ UART',
        cmd: 'pinout',
        warn: 'แรงดันสูงสุด 3.3V เท่านั้น ห้ามต่อไฟ 5V เข้าขา GPIO โดยตรง'
      },
      power: {
        title: 'USB-C Power Port (5V / 5A PD)',
        spec: 'USB-C 5V / 5A Power Delivery',
        desc: 'ช่องจ่ายไฟเลี้ยงหลักของบอร์ด Raspberry Pi 5 รองรับกระแสสูงขึ้นเมื่อต่ออุปกรณ์ต่อพ่วงหลายตัวหรือโมดูลเสริม',
        cmd: 'vcgencmd get_throttled',
        warn: 'ควรใช้สายและอะแดปเตอร์ที่จ่ายไฟนิ่งเพื่อป้องกันไฟตกหรือบอร์ดรีสตาร์ทเอง'
      },
      hdmi: {
        title: '2x micro HDMI Ports',
        spec: 'Up to 4Kp60 Dual Display',
        desc: 'พอร์ตต่อจอภาพออก 2 จอพร้อมกัน ความละเอียดสูงสุดระดับ 4K 60fps รองรับเสียงผ่าน HDMI',
        cmd: 'xrandr',
        warn: 'ตรวจสอบหัวแปลงหรือสาย micro HDMI ให้แน่นและเลือกโหมดความละเอียดให้เหมาะกับจอ/Capture Card'
      },
      csi: {
        title: 'CSI Camera / Display Connector',
        spec: 'MIPI CSI-2 • picamera2 / libcamera',
        desc: 'พอร์ตเชื่อมต่อสายแพกล้องอย่าง Raspberry Pi Camera Module 3 สำหรับถ่ายภาพ วิดีโอ และงาน Vision / AI',
        cmd: 'rpicam-hello',
        warn: 'ปลดล็อกตัวล็อกสายแพอย่างเบามือก่อนเสียบหรือถอด และหันหน้าสัมผัสของสายแพให้ถูกด้าน'
      },
      pcie: {
        title: 'PCIe 2.0 x1 Interface',
        spec: 'PCIe Gen 2.0 • HAT / NVMe Extension',
        desc: 'ช่องต่อขยายความเร็วสูงสำหรับโมดูลเสริม เช่น อะแดปเตอร์ SSD NVMe หรือบอร์ดต่อขยายเฉพาะทาง',
        cmd: 'lspci',
        warn: 'ปิดเครื่องและถอดสายไฟก่อนติดตั้งหรือถอดโมดูล PCIe ทุกครั้ง'
      },
      ethernet: {
        title: 'Gigabit Ethernet (GbE LAN)',
        spec: 'RJ45 10/100/1000 Mbps',
        desc: 'พอร์ตเชื่อมต่อเครือข่ายแบบสายความเร็วสูง เหมาะสำหรับงานที่ต้องการความเสถียรของเน็ต เช่น โอนไฟล์หรือสตรีมข้อมูล',
        cmd: 'ip a',
        warn: 'ตรวจสอบหัว RJ45 และสาย LAN ให้ล็อกเข้ากับพอร์ตแน่นหนา'
      },
      usb: {
        title: 'USB 3.0 x2 & USB 2.0 x2 Ports',
        spec: '2x USB 3.0 (5Gbps) + 2x USB 2.0',
        desc: 'ใช้ต่อคีย์บอร์ด เมาส์ แฟลชไดรฟ์ เซนเซอร์ USB หรืออุปกรณ์ต่อพ่วงต่างๆ',
        cmd: 'lsusb',
        warn: 'อุปกรณ์ที่ใช้กระแสสูงหลายตัวรวมกันอาจทำให้ไฟเลี้ยงไม่พอ ควรใช้ Powered USB Hub หากจำเป็น'
      },
      soc: {
        title: 'Broadcom BCM2712 SoC',
        spec: 'Quad-core ARM Cortex-A76 (2.4GHz) • VideoCore VII',
        desc: 'ชิปประมวลผลหลักของ Raspberry Pi 5 แบบ 64-bit มาพร้อมหน่วยประมวลผลกราฟิก VideoCore VII สำหรับงานมัลติมีเดียและประมวลผลทั่วไป',
        cmd: 'vcgencmd measure_temp',
        warn: 'เมื่อประมวลผลหนักต่อเนื่อง ควรมีฮีตซิงก์หรือพัดลมระบายความร้อนเพื่อลดอาการ Thermal Throttling'
      }
    };

    const rotateSlider = document.getElementById('boardRotateSlider');
    const rotateAngleText = document.getElementById('boardRotateAngleText');
    const boardRotator = document.getElementById('rpiBoardRotator');
    const boardBadge = document.getElementById('rpiBoardPartBadge');

    let currentAngle = 0;
    let selectedPart = 'gpio';

    function updateBoardTransform(angle) {
      currentAngle = Number(angle) || 0;
      if (rotateSlider) rotateSlider.value = String(currentAngle);
      if (rotateAngleText) rotateAngleText.textContent = `${currentAngle}°`;
      if (boardRotator) boardRotator.style.transform = `rotate(${currentAngle}deg)`;
      if (boardBadge) {
        boardBadge.textContent = `มุม: ${currentAngle}° • ${selectedPart.toUpperCase()}`;
      }
    }

    function selectBoardPart(partKey) {
      const info = partDetails[partKey];
      if (!info) return;
      selectedPart = partKey;

      document.querySelectorAll('.rpi-hotspot').forEach((el) => {
        el.classList.toggle('active-part', el.dataset.part === partKey);
      });
      document.querySelectorAll('.port-select-btn').forEach((btn) => {
        btn.classList.toggle('active-mode', btn.dataset.part === partKey);
      });

      const titleEl = document.getElementById('portDetailTitle');
      const specEl = document.getElementById('portDetailSpec');
      const descEl = document.getElementById('portDetailDesc');
      const cmdEl = document.getElementById('portDetailCmd');
      const warnEl = document.getElementById('portDetailWarn');

      if (titleEl) titleEl.textContent = info.title;
      if (specEl) specEl.textContent = info.spec;
      if (descEl) descEl.textContent = info.desc;
      if (cmdEl) cmdEl.textContent = info.cmd;
      if (warnEl) warnEl.textContent = info.warn;
      if (boardBadge) boardBadge.textContent = `มุม: ${currentAngle}° • ${partKey.toUpperCase()}`;
    }

    rotateSlider?.addEventListener('input', (e) => updateBoardTransform(e.target.value));
    document.querySelectorAll('.rotate-preset').forEach((btn) => {
      btn.addEventListener('click', () => updateBoardTransform(btn.dataset.angle));
    });
    document.querySelectorAll('.rpi-hotspot, .port-select-btn').forEach((el) => {
      el.addEventListener('click', () => selectBoardPart(el.dataset.part));
    });

    updateBoardTransform(0);
    selectBoardPart('gpio');

    const powerItems = document.querySelectorAll('.power-item');
    const powerResult = document.getElementById('powerResult');
    function calcPower() {
      let total = 0;
      powerItems.forEach((cb) => {
        if (cb.checked) total += Number(cb.dataset.watt);
      });
      if (powerResult) {
        powerResult.innerHTML = `กำลังไฟรวมโดยประมาณ: <strong>${total}W</strong> (แนะนำอะแดปเตอร์ PD ${total <= 25 ? '30W–45W' : '65W+'})`;
      }
    }
    powerItems.forEach((cb) => cb.addEventListener('change', calcPower));
    calcPower();

    const cmds = [
      { cmd: 'vcgencmd measure_temp', desc: 'ดูอุณหภูมิ CPU ของ Raspberry Pi' },
      { cmd: 'rpicam-hello', desc: 'ทดสอบเปิดกล้อง Camera Module 3' },
      { cmd: 'i2cdetect -y 1', desc: 'สแกนหา Address ของจอ I2C LCD (เช่น 0x27)' },
      { cmd: 'pinout', desc: 'แสดงแผนผังขา GPIO และข้อมูลบอร์ด' },
      { cmd: 'ip a', desc: 'ตรวจสอบ IP Address ของบอร์ด' }
    ];
    const searchInput = document.getElementById('cmdSearchInput');
    const cmdList = document.getElementById('cmdList');
    function renderCmds(q = '') {
      if (!cmdList) return;
      const query = q.trim().toLowerCase();
      const filtered = cmds.filter(
        (c) => c.cmd.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query)
      );
      cmdList.innerHTML = filtered
        .map((c) => `<div class="cmd-item"><code>${c.cmd}</code><small>${c.desc}</small></div>`)
        .join('');
    }
    searchInput?.addEventListener('input', (e) => renderCmds(e.target.value));
    renderCmds();
  }

  // =========================================================================
  // PAGE 2: GPIO 40-PIN & INTERACTIVE PLAYGROUND (gpio.html)
  // =========================================================================
  if (page === 'gpio') {
    const pins = [
      { phys: 1, name: '3.3V', type: 'pwr-3v3', bcm: null }, { phys: 2, name: '5V', type: 'pwr-5v', bcm: null },
      { phys: 3, name: 'GPIO 2 (SDA)', type: 'i2c', bcm: 2 }, { phys: 4, name: '5V', type: 'pwr-5v', bcm: null },
      { phys: 5, name: 'GPIO 3 (SCL)', type: 'i2c', bcm: 3 }, { phys: 6, name: 'GND', type: 'gnd', bcm: null },
      { phys: 7, name: 'GPIO 4', type: 'gpio', bcm: 4 }, { phys: 8, name: 'GPIO 14 (TX)', type: 'uart', bcm: 14 },
      { phys: 9, name: 'GND', type: 'gnd', bcm: null }, { phys: 10, name: 'GPIO 15 (RX)', type: 'uart', bcm: 15 },
      { phys: 11, name: 'GPIO 17 (BTN)', type: 'gpio', bcm: 17 }, { phys: 12, name: 'GPIO 18 (LED)', type: 'gpio', bcm: 18 },
      { phys: 13, name: 'GPIO 27', type: 'gpio', bcm: 27 }, { phys: 14, name: 'GND', type: 'gnd', bcm: null },
      { phys: 15, name: 'GPIO 22', type: 'gpio', bcm: 22 }, { phys: 16, name: 'GPIO 23 (SRV)', type: 'gpio', bcm: 23 },
      { phys: 17, name: '3.3V', type: 'pwr-3v3', bcm: null }, { phys: 18, name: 'GPIO 24 (Y)', type: 'gpio', bcm: 24 },
      { phys: 19, name: 'GPIO 10 (MOSI)', type: 'spi', bcm: 10 }, { phys: 20, name: 'GND', type: 'gnd', bcm: null },
      { phys: 21, name: 'GPIO 9 (MISO)', type: 'spi', bcm: 9 }, { phys: 22, name: 'GPIO 25 (G)', type: 'gpio', bcm: 25 }
    ];
    for (let p = 23; p <= 40; p++) {
      pins.push({ phys: p, name: p % 2 === 0 ? 'GPIO/SPI' : 'GPIO/GND', type: p % 6 === 0 ? 'gnd' : 'gpio', bcm: p });
    }

    const leftCol = document.getElementById('pinColLeft');
    const rightCol = document.getElementById('pinColRight');
    const inspector = document.getElementById('pinInspector');
    const codePreview = document.getElementById('gpioCodePreview');
    const signalLog = document.getElementById('gpioSignalLog');
    const activePinBadge = document.getElementById('activePinBadge');
    const patternButtons = document.querySelectorAll('[data-pattern]');

    const ledRed = document.getElementById('bbLedRed');
    const ledYellow = document.getElementById('bbLedYellow');
    const ledGreen = document.getElementById('bbLedGreen');
    const simLedBulb = document.getElementById('simLedBulb');

    const state = { pwm: 0, pullUp: false, pressed: false, angle: 90, pattern: 'off', step: 0 };
    let patternTimer = null;

    function logGpio(msg) {
      if (!signalLog) return;
      const now = new Date().toLocaleTimeString('th-TH');
      const div = document.createElement('div');
      div.className = 'term-line';
      div.textContent = `[${now}] ${msg}`;
      signalLog.appendChild(div);
      signalLog.scrollTop = signalLog.scrollHeight;
    }

    function highlight(bcm, on) {
      if (bcm == null) return;
      document.querySelector(`.pin-row[data-bcm="${bcm}"]`)?.classList.toggle('hw-active', on);
    }

    function updateCode() {
      if (!codePreview) return;
      const btnVal = state.pullUp ? (!state.pressed ? 1 : 0) : (state.pressed ? 1 : 0);
      codePreview.textContent =
        `from gpiozero import PWMLED, Button, AngularServo\n` +
        `led18 = PWMLED(18)          # Duty: ${state.pwm}%\n` +
        `btn17 = Button(17, pull_up=${state.pullUp ? 'True' : 'False'}) # State: ${btnVal}\n` +
        `srv23 = AngularServo(23)\n` +
        `srv23.angle = ${state.angle}       # Pattern: ${state.pattern}`;
    }

    function setThreeLeds(r, y, g) {
      ledRed?.classList.toggle('on', r);
      ledYellow?.classList.toggle('on', y);
      ledGreen?.classList.toggle('on', g);
      highlight(18, r || state.pwm > 0);
      highlight(24, y);
      highlight(25, g);
    }

    function startPattern(mode) {
      state.pattern = mode;
      state.step = 0;
      clearInterval(patternTimer);

      patternButtons.forEach((btn) => {
        btn.classList.toggle('active-mode', btn.dataset.pattern === mode);
      });

      const labelEl = document.getElementById('ledPatternLabel');
      const names = {
        off: 'ปิดทั้งหมด',
        blink: 'กระพริบพร้อมกัน',
        chase: 'ไฟวิ่ง (Chase)',
        traffic: 'ไฟจราจร'
      };
      if (labelEl) labelEl.textContent = `โหมด: ${names[mode] || mode}`;
      logGpio(`LED Pattern -> ${names[mode]}`);

      if (mode === 'off') {
        setThreeLeds(false, false, false);
        updateCode();
        return;
      }

      const tick = () => {
        if (mode === 'blink') {
          const on = state.step % 2 === 0;
          setThreeLeds(on, on, on);
        } else {
          const idx = state.step % 3;
          setThreeLeds(idx === 0, idx === 1, idx === 2);
        }
        state.step++;
      };

      tick();
      patternTimer = setInterval(tick, mode === 'traffic' ? 750 : 350);
      updateCode();
    }

    patternButtons.forEach((btn) => {
      btn.addEventListener('click', () => startPattern(btn.dataset.pattern));
    });

    pins.forEach((p) => {
      const isRight = p.phys % 2 === 0;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `pin-row ${isRight ? 'right-side' : ''}`;
      if (p.bcm != null) btn.dataset.bcm = p.bcm;
      btn.innerHTML = `<span class="pin-num">${String(p.phys).padStart(2, '0')}</span><span>${p.name}</span><i class="dot ${p.type}"></i>`;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pin-row').forEach((r) => r.classList.remove('selected'));
        btn.classList.add('selected');
        if (inspector) inspector.textContent = `Physical Pin ${p.phys}: ${p.name} | ชนิด: ${p.type.toUpperCase()}`;
        if (activePinBadge) activePinBadge.textContent = `Selected: Pin ${p.phys} (${p.name})`;
      });
      (isRight ? rightCol : leftCol)?.appendChild(btn);
    });

    const pwmSlider = document.getElementById('pwmDutySlider');
    pwmSlider?.addEventListener('input', () => {
      state.pwm = Number(pwmSlider.value);
      const dutyText = document.getElementById('pwmDutyText');
      if (dutyText) dutyText.textContent = `${state.pwm}%`;
      const isLit = state.pwm > 0;
      simLedBulb?.classList.toggle('on', isLit);
      if (simLedBulb) simLedBulb.style.opacity = isLit ? String(0.35 + (state.pwm / 100) * 0.65) : '1';
      setThreeLeds(isLit, ledYellow?.classList.contains('on'), ledGreen?.classList.contains('on'));
      updateCode();
    });
    pwmSlider?.addEventListener('change', () => logGpio(`PWM GPIO 18 set to ${state.pwm}%`));

    const btnInd = document.getElementById('simBtnIndicator');
    const btnStatus = document.getElementById('btnStatusText');

    function syncButtonUi() {
      const logicVal = state.pullUp ? (!state.pressed ? 1 : 0) : (state.pressed ? 1 : 0);
      if (btnInd) {
        btnInd.textContent = String(logicVal);
        btnInd.classList.toggle('high', logicVal === 1);
      }
      const modeText = state.pullUp ? 'Pull-Up' : 'Pull-Down';
      if (btnStatus) {
        btnStatus.textContent = `โหมด ${modeText} • Logic ${logicVal} (${state.pressed ? 'กดค้าง' : 'ปล่อย'})`;
      }
      highlight(17, state.pressed);
      updateCode();
    }

    document.getElementById('togglePullModeBtn')?.addEventListener('click', () => {
      state.pullUp = !state.pullUp;
      logGpio(`GPIO 17 resistor mode -> ${state.pullUp ? 'Pull-Up' : 'Pull-Down'}`);
      syncButtonUi();
    });

    const holdBtn = document.getElementById('holdPushBtn');
    const setPress = (v) => {
      if (state.pressed === v) return;
      state.pressed = v;
      logGpio(`GPIO 17 button ${v ? 'PRESSED' : 'RELEASED'}`);
      syncButtonUi();
    };
    holdBtn?.addEventListener('mousedown', () => setPress(true));
    holdBtn?.addEventListener('mouseup', () => setPress(false));
    holdBtn?.addEventListener('mouseleave', () => setPress(false));

    const srvSlider = document.getElementById('servoAngleSlider');
    srvSlider?.addEventListener('input', () => {
      state.angle = Number(srvSlider.value);
      const angleVal = document.getElementById('servoAngleVal');
      if (angleVal) angleVal.textContent = `${state.angle}°`;
      const arm = document.getElementById('simServoArm');
      if (arm) arm.style.transform = `translateY(-50%) rotate(${state.angle - 180}deg)`;
      highlight(23, true);
      updateCode();
    });
    srvSlider?.addEventListener('change', () => {
      highlight(23, false);
      logGpio(`Servo GPIO 23 rotated to ${state.angle}°`);
    });

    document.getElementById('copyGpioBtn')?.addEventListener('click', () => {
      if (codePreview) navigator.clipboard?.writeText(codePreview.textContent);
    });
    syncButtonUi();
    updateCode();
  }

  // =========================================================================
  // PAGE LED LAB (led.html — Per-LED Color + Speed + PWM + Reset)
  // =========================================================================
  if (page === 'led') {
    const leds = [
      document.getElementById('labLed1'),
      document.getElementById('labLed2'),
      document.getElementById('labLed3')
    ];
    const captions = [
      document.getElementById('captionLed1'),
      document.getElementById('captionLed2'),
      document.getElementById('captionLed3')
    ];
    const colorSelects = document.querySelectorAll('.per-led-select');
    const pwmSlider = document.getElementById('labPwmSlider');
    const speedSlider = document.getElementById('labSpeedSlider');
    const codeEl = document.getElementById('ledLabCode');
    const statusBadge = document.getElementById('labStatusBadge');
    const modeButtons = document.querySelectorAll('.led-mode-btn');
    const resetBtn = document.getElementById('resetLedLabBtn');

    const colorMap = {
      red: { main: '#ef4444', glow: 'rgba(239, 68, 68, 0.75)', label: 'แดง' },
      yellow: { main: '#eab308', glow: 'rgba(234, 179, 8, 0.75)', label: 'เหลือง' },
      green: { main: '#10b981', glow: 'rgba(16, 185, 129, 0.75)', label: 'เขียว' },
      blue: { main: '#3b82f6', glow: 'rgba(59, 130, 246, 0.75)', label: 'น้ำเงิน' },
      purple: { main: '#a855f7', glow: 'rgba(168, 85, 247, 0.75)', label: 'ม่วง' },
      white: { main: '#f8fafc', glow: 'rgba(248, 250, 252, 0.75)', label: 'ขาว' }
    };

    const modeNames = {
      off: 'ดับหมด',
      blink: 'กระพริบ',
      chase: 'ไฟวิ่ง',
      traffic: 'ไฟจราจร',
      sos: 'สัญญาณ SOS'
    };

    const gpioPins = [18, 24, 25];
    let timer = null;
    let step = 0;
    let currentMode = 'off';
    let ledColors = ['red', 'yellow', 'green'];
    let currentPatternBits = [0, 0, 0];

    function applyColorThemes() {
      leds.forEach((el, idx) => {
        const key = ledColors[idx] || 'red';
        const cfg = colorMap[key] || colorMap.red;
        if (el) {
          el.style.setProperty('--led-main', cfg.main);
          el.style.setProperty('--led-glow', cfg.glow);
        }
        if (captions[idx]) {
          captions[idx].textContent = `GPIO ${gpioPins[idx]} • ${cfg.label}`;
        }
      });
    }

    function renderLeds() {
      const pwmVal = pwmSlider ? Number(pwmSlider.value) : 100;
      const pwmFactor = 0.35 + (pwmVal / 100) * 0.65;
      leds.forEach((el, idx) => {
        if (!el) return;
        const isOn = Boolean(currentPatternBits[idx]);
        el.classList.toggle('on', isOn);
        el.style.opacity = isOn ? String(pwmFactor) : '0.45';
      });
    }

    function updateLedCode() {
      if (!codeEl) return;
      const pwmVal = pwmSlider ? Number(pwmSlider.value) : 100;
      const speedVal = speedSlider ? Number(speedSlider.value) : 350;
      const duty = (pwmVal / 100).toFixed(2);
      const delaySec = (speedVal / 1000).toFixed(2);
      const c1 = colorMap[ledColors[0]]?.label || ledColors[0];
      const c2 = colorMap[ledColors[1]]?.label || ledColors[1];
      const c3 = colorMap[ledColors[2]]?.label || ledColors[2];
      codeEl.textContent =
        `from gpiozero import PWMLED\n` +
        `from time import sleep\n\n` +
        `led1 = PWMLED(18)  # ${c1} (${ledColors[0]})\n` +
        `led2 = PWMLED(24)  # ${c2} (${ledColors[1]})\n` +
        `led3 = PWMLED(25)  # ${c3} (${ledColors[2]})\n\n` +
        `# Mode: ${currentMode} (${modeNames[currentMode]})\n` +
        `# PWM: ${duty} (${pwmVal}%) | Delay: ${delaySec}s`;
    }

    function setActiveModeBtn(mode) {
      modeButtons.forEach((btn) => btn.classList.toggle('active-mode', btn.dataset.ledMode === mode));
      if (statusBadge) statusBadge.textContent = `โหมด: ${modeNames[mode] || mode}`;
    }

    function stepPattern() {
      if (currentMode === 'off') {
        currentPatternBits = [0, 0, 0];
      } else if (currentMode === 'blink') {
        const v = step % 2 === 0 ? 1 : 0;
        currentPatternBits = [v, v, v];
      } else if (currentMode === 'chase') {
        const idx = step % 3;
        currentPatternBits = [idx === 0 ? 1 : 0, idx === 1 ? 1 : 0, idx === 2 ? 1 : 0];
      } else if (currentMode === 'traffic') {
        const phase = step % 3;
        currentPatternBits = [phase === 0 ? 1 : 0, phase === 2 ? 1 : 0, phase === 1 ? 1 : 0];
      } else if (currentMode === 'sos') {
        const sosSeq = [
          [1, 0, 0], [0, 0, 0], [1, 0, 0], [0, 0, 0], [1, 0, 0], [0, 0, 0],
          [0, 1, 0], [0, 0, 0], [0, 1, 0], [0, 0, 0], [0, 1, 0], [0, 0, 0],
          [0, 0, 1], [0, 0, 0], [0, 0, 1], [0, 0, 0], [0, 0, 1], [0, 0, 0]
        ];
        currentPatternBits = sosSeq[step % sosSeq.length];
      }
      step++;
      renderLeds();
    }

    function getIntervalMs() {
      const base = speedSlider ? Number(speedSlider.value) : 350;
      return currentMode === 'traffic' ? Math.max(400, base * 2) : base;
    }

    function runMode(mode) {
      currentMode = mode;
      step = 0;
      clearInterval(timer);
      setActiveModeBtn(mode);
      updateLedCode();

      if (mode === 'off') {
        currentPatternBits = [0, 0, 0];
        renderLeds();
        return;
      }

      stepPattern();
      timer = setInterval(stepPattern, getIntervalMs());
    }

    function resetLedLab() {
      clearInterval(timer);
      timer = null;
      step = 0;
      currentMode = 'off';
      ledColors = ['red', 'yellow', 'green'];
      currentPatternBits = [0, 0, 0];

      colorSelects.forEach((sel, idx) => {
        sel.value = ledColors[idx];
      });
      if (pwmSlider) pwmSlider.value = '100';
      if (speedSlider) speedSlider.value = '350';

      const pwmValEl = document.getElementById('labPwmVal');
      const speedValEl = document.getElementById('labSpeedVal');
      if (pwmValEl) pwmValEl.textContent = '100%';
      if (speedValEl) speedValEl.textContent = '350 ms';

      applyColorThemes();
      setActiveModeBtn('off');
      renderLeds();
      updateLedCode();
    }

    colorSelects.forEach((sel) => {
      sel.addEventListener('change', () => {
        const idx = Number(sel.dataset.idx);
        ledColors[idx] = sel.value;
        applyColorThemes();
        renderLeds();
        updateLedCode();
      });
    });

    modeButtons.forEach((btn) => btn.addEventListener('click', () => runMode(btn.dataset.ledMode)));

    document.querySelectorAll('.speed-preset').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!speedSlider) return;
        speedSlider.value = btn.dataset.ms;
        const speedValEl = document.getElementById('labSpeedVal');
        if (speedValEl) speedValEl.textContent = `${speedSlider.value} ms`;
        updateLedCode();
        if (currentMode !== 'off') {
          clearInterval(timer);
          timer = setInterval(stepPattern, getIntervalMs());
        }
      });
    });

    pwmSlider?.addEventListener('input', () => {
      const pwmValEl = document.getElementById('labPwmVal');
      if (pwmValEl) pwmValEl.textContent = `${pwmSlider.value}%`;
      renderLeds();
      updateLedCode();
    });

    speedSlider?.addEventListener('input', () => {
      const speedValEl = document.getElementById('labSpeedVal');
      if (speedValEl) speedValEl.textContent = `${speedSlider.value} ms`;
      updateLedCode();
      if (currentMode !== 'off') {
        clearInterval(timer);
        timer = setInterval(stepPattern, getIntervalMs());
      }
    });

    resetBtn?.addEventListener('click', resetLedLab);
    document.getElementById('copyLedLabBtn')?.addEventListener('click', () => {
      if (codeEl) navigator.clipboard?.writeText(codeEl.textContent);
    });

    resetLedLab();
  }

  // =========================================================================
  // PAGE 3: SENSORS (sensors.html)
  // =========================================================================
  if (page === 'sensors') {
    const tSlider = document.getElementById('dhtTempSlider');
    const hSlider = document.getElementById('dhtHumSlider');
    const dSlider = document.getElementById('distSlider');
    const lSlider = document.getElementById('lightSlider');
    const codeEl = document.getElementById('sensorCodePreview');
    const autoBtn = document.getElementById('toggleAutoSensorBtn');
    let autoTimer = null;

    function syncSensors() {
      if (!tSlider || !hSlider || !dSlider || !lSlider) return;
      const t = Number(tSlider.value);
      const h = Number(hSlider.value);
      const d = Number(dSlider.value);
      const l = Number(lSlider.value);

      document.getElementById('dhtTempVal').textContent = t;
      document.getElementById('dhtHumVal').textContent = h;
      document.getElementById('dhtReadout').textContent = `🌡️ ${t}°C | 💧 ${h}%`;

      document.getElementById('distVal').textContent = d;
      document.getElementById('distReadout').textContent = `📏 ${d} cm`;

      document.getElementById('lightVal').textContent = l;
      document.getElementById('lightReadout').textContent = `${l < 200 ? '🌙 มืด/สลัว' : '☀️ สว่าง'} (${l} Lux)`;

      document.getElementById('barTempText').textContent = `${t}°C`;
      document.getElementById('barTempFill').style.width = `${Math.min(100, Math.max(0, (t / 50) * 100))}%`;

      document.getElementById('barHumText').textContent = `${h}%`;
      document.getElementById('barHumFill').style.width = `${Math.min(100, Math.max(0, ((h - 20) / 75) * 100))}%`;

      document.getElementById('barDistText').textContent = `${d} cm`;
      document.getElementById('barDistFill').style.width = `${Math.min(100, Math.max(0, (d / 200) * 100))}%`;

      document.getElementById('barLightText').textContent = `${l} Lux`;
      document.getElementById('barLightFill').style.width = `${Math.min(100, Math.max(0, (l / 1000) * 100))}%`;

      document.getElementById('sensorSummaryBox').textContent =
        `อุณหภูมิ ${t}°C • ความชื้น ${h}% • ระยะห่าง ${d} cm • ความสว่าง ${l} Lux`;

      if (codeEl) {
        codeEl.textContent =
          `import adafruit_dht, board\n` +
          `dht = adafruit_dht.DHT11(board.D4)\n` +
          `# Temp=${t}C, Hum=${h}%, Distance=${d}cm, Light=${l}Lux`;
      }
    }

    [tSlider, hSlider, dSlider, lSlider].forEach((el) => el?.addEventListener('input', syncSensors));

    document.getElementById('presetNormalBtn')?.addEventListener('click', () => {
      tSlider.value = 28; hSlider.value = 60; dSlider.value = 45; lSlider.value = 650;
      syncSensors();
    });
    document.getElementById('presetHotBtn')?.addEventListener('click', () => {
      tSlider.value = 39; hSlider.value = 42; dSlider.value = 120; lSlider.value = 920;
      syncSensors();
    });
    document.getElementById('presetNearBtn')?.addEventListener('click', () => {
      dSlider.value = 12;
      syncSensors();
    });

    autoBtn?.addEventListener('click', () => {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
        autoBtn.textContent = '▶ Auto-Stream';
        return;
      }
      autoBtn.textContent = '⏸ หยุด Auto';
      autoTimer = setInterval(() => {
        tSlider.value = Math.floor(22 + Math.random() * 18);
        hSlider.value = Math.floor(40 + Math.random() * 45);
        dSlider.value = Math.floor(10 + Math.random() * 170);
        lSlider.value = Math.floor(50 + Math.random() * 900);
        syncSensors();
      }, 900);
    });

    document.getElementById('copySensorBtn')?.addEventListener('click', () => {
      if (codeEl) navigator.clipboard?.writeText(codeEl.textContent);
    });
    syncSensors();
  }

  // =========================================================================
  // PAGE 4: I2C LCD 1602 + BUZZER (lcd-buzzer.html)
  // =========================================================================
  if (page === 'lcd-buzzer') {
    const in1 = document.getElementById('lcdLine1Input');
    const in2 = document.getElementById('lcdLine2Input');
    const out1 = document.getElementById('lcdOut1');
    const out2 = document.getElementById('lcdOut2');
    const screen = document.getElementById('lcdScreen');
    const codeEl = document.getElementById('lcdCodePreview');
    const buzIcon = document.getElementById('simBuzzerIcon');
    const buzStatus = document.getElementById('buzzerStatusText');
    let scrollTimer = null;
    let scrollIdx = 0;

    function updateLcd(l1, l2) {
      const s1 = (l1 || '').slice(0, 16);
      const s2 = (l2 || '').slice(0, 16);
      if (out1) out1.textContent = s1.padEnd(16, ' ');
      if (out2) out2.textContent = s2.padEnd(16, ' ');
      if (codeEl) {
        codeEl.textContent =
          `# I2C LCD 1602 (0x27) + Buzzer (GPIO 22)\n` +
          `lcd.write_string("${s1}")\n` +
          `lcd.crlf()\n` +
          `lcd.write_string("${s2}")`;
      }
    }

    in1?.addEventListener('input', () => updateLcd(in1.value, in2?.value || ''));
    in2?.addEventListener('input', () => updateLcd(in1?.value || '', in2.value));

    document.querySelectorAll('.preset-lcd').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (in1) in1.value = btn.dataset.l1 || '';
        if (in2) in2.value = btn.dataset.l2 || '';
        updateLcd(in1?.value || '', in2?.value || '');
      });
    });

    document.getElementById('toggleBacklightBtn')?.addEventListener('click', () => {
      screen?.classList.toggle('backlight-off');
    });

    document.getElementById('toggleScrollLcdBtn')?.addEventListener('click', (e) => {
      if (scrollTimer) {
        clearInterval(scrollTimer);
        scrollTimer = null;
        e.target.textContent = '↔ เลื่อนข้อความ';
        updateLcd(in1?.value || '', in2?.value || '');
        return;
      }
      e.target.textContent = '⏹ หยุดเลื่อน';
      scrollTimer = setInterval(() => {
        const base = `${in1?.value || 'RASPBERRY PI'}   `;
        const shifted = base.slice(scrollIdx) + base.slice(0, scrollIdx);
        if (out1) out1.textContent = shifted.padEnd(16, ' ').slice(0, 16);
        scrollIdx = (scrollIdx + 1) % base.length;
      }, 240);
    });

    document.getElementById('clearLcdBtn')?.addEventListener('click', () => {
      if (in1) in1.value = '';
      if (in2) in2.value = '';
      updateLcd('', '');
    });

    document.getElementById('triggerWarningBtn')?.addEventListener('click', () => {
      if (in1) in1.value = 'WARNING ALERT!';
      if (in2) in2.value = 'CHECK SENSOR';
      updateLcd(in1?.value || '', in2?.value || '');
      playBuzzer(2100, 220, buzIcon, buzStatus);
    });

    document.getElementById('triggerCriticalBtn')?.addEventListener('click', () => {
      if (in1) in1.value = 'CRITICAL ALARM!';
      if (in2) in2.value = 'BUZZER ACTIVE';
      updateLcd(in1?.value || '', in2?.value || '');
      playBuzzer(2700, 160, buzIcon, buzStatus);
      setTimeout(() => playBuzzer(2200, 240, buzIcon, buzStatus), 190);
    });

    document.getElementById('triggerSuccessBtn')?.addEventListener('click', () => {
      if (in1) in1.value = 'STATUS: OK';
      if (in2) in2.value = 'SYSTEM READY';
      updateLcd(in1?.value || '', in2?.value || '');
      playBuzzer(1500, 120, buzIcon, buzStatus);
      setTimeout(() => playBuzzer(2000, 150, buzIcon, buzStatus), 140);
    });

    document.getElementById('copyLcdBtn')?.addEventListener('click', () => {
      if (codeEl) navigator.clipboard?.writeText(codeEl.textContent);
    });
    updateLcd(in1?.value || '', in2?.value || '');
  }

  // =========================================================================
  // PAGE 5: MINI PROJECT — SMART BURGLAR ALARM + CAMERA PI 3 (security.html)
  // =========================================================================
  if (page === 'security') {
    let armed = false;
    let camStreaming = false;
    let snapCounter = 0;

    const statusBar = document.getElementById('alarmStatusBar');
    const modeLabel = document.getElementById('alarmModeLabel');
    const armBtn = document.getElementById('toggleArmBtn');
    const logBox = document.getElementById('securityLog');
    const l1 = document.getElementById('secLcd1');
    const l2 = document.getElementById('secLcd2');

    const camStatusBadge = document.getElementById('camStatusBadge');
    const camViewfinder = document.getElementById('camViewfinder');
    const camLiveTag = document.getElementById('camLiveTag');
    const camResolutionTag = document.getElementById('camResolutionTag');
    const camCenterText = document.getElementById('camCenterText');
    const camLastCapture = document.getElementById('camLastCapture');
    const camAfSelect = document.getElementById('camAfModeSelect');
    const camEvSlider = document.getElementById('camEvSlider');
    const camEvVal = document.getElementById('camEvVal');
    const camCodeEl = document.getElementById('camCodePreview');
    const autoSnapCb = document.getElementById('autoSnapOnAlarm');

    function addLog(text, isAlert = false) {
      if (!logBox) return;
      const now = new Date().toLocaleTimeString('th-TH');
      const div = document.createElement('div');
      div.className = `term-line ${isAlert ? 'alert' : ''}`;
      div.textContent = `[${now}] ${text}`;
      logBox.appendChild(div);
      logBox.scrollTop = logBox.scrollHeight;
    }

    function setLcdSec(a, b) {
      if (l1) l1.textContent = a.slice(0, 16);
      if (l2) l2.textContent = b.slice(0, 16);
    }

    function updateCamCode() {
      if (!camCodeEl) return;
      const af = camAfSelect?.value || 'Continuous';
      const ev = Number(camEvSlider?.value || 0).toFixed(1);
      camCodeEl.textContent =
        `from picamera2 import Picamera2\n` +
        `from libcamera import controls\n\n` +
        `picam2 = Picamera2()\n` +
        `config = picam2.create_still_configuration(main={"size": (1920, 1080)})\n` +
        `picam2.configure(config)\n` +
        `picam2.set_controls({"AfMode": controls.AfModeEnum.${af}, "ExposureValue": ${ev}})\n` +
        `picam2.start()\n` +
        `picam2.capture_file("intrusion_cam3.jpg")`;
    }

    function syncCamUi() {
      const af = camAfSelect?.value || 'Continuous';
      const ev = Number(camEvSlider?.value || 0).toFixed(1);
      if (camEvVal) camEvVal.textContent = ev;
      if (camResolutionTag) camResolutionTag.textContent = `1920x1080 • AF: ${af} • EV: ${ev}`;
      if (camStatusBadge) {
        camStatusBadge.textContent = camStreaming ? 'CAM 3: LIVE STREAM' : 'CAM 3: STANDBY';
      }
      if (camLiveTag) {
        camLiveTag.textContent = camStreaming ? '● LIVE CAM 3' : '○ STANDBY CAM 3';
      }
      if (camViewfinder) {
        camViewfinder.classList.toggle('live', camStreaming);
      }
      if (camCenterText && !camViewfinder?.classList.contains('snap-flash')) {
        camCenterText.textContent = camStreaming
          ? `กำลังสตรีมภาพสดจาก Camera Module 3 (EV ${ev})`
          : 'กล้องพร้อมใช้งาน (กดเปิดสตรีมหรือถ่ายภาพ)';
      }
      updateCamCode();
    }

    function captureSnapshot(reason = 'Manual') {
      snapCounter++;
      const fileName = `intrusion_${String(snapCounter).padStart(2, '0')}.jpg`;
      if (camViewfinder) {
        camViewfinder.classList.add('snap-flash');
        setTimeout(() => camViewfinder.classList.remove('snap-flash'), 140);
      }
      if (camCenterText) {
        camCenterText.textContent = `📸 บันทึกภาพ ${fileName} (${reason})`;
      }
      if (camLastCapture) {
        camLastCapture.textContent = `ไฟล์ล่าสุด: ${fileName} (${reason})`;
      }
      addLog(`Camera 3 captured ${fileName} [${reason}]`, reason !== 'Manual');
    }

    document.getElementById('toggleCamStreamBtn')?.addEventListener('click', () => {
      camStreaming = !camStreaming;
      addLog(camStreaming ? 'Camera Module 3 stream started.' : 'Camera Module 3 stream stopped.');
      syncCamUi();
    });

    document.getElementById('captureCamBtn')?.addEventListener('click', () => captureSnapshot('Manual'));
    camAfSelect?.addEventListener('change', syncCamUi);
    camEvSlider?.addEventListener('input', syncCamUi);

    armBtn?.addEventListener('click', () => {
      armed = !armed;
      statusBar?.classList.toggle('armed', armed);
      statusBar?.classList.remove('triggered');
      if (modeLabel) modeLabel.textContent = armed ? 'ARMED (กำลังเฝ้าระวัง)' : 'DISARMED (ปิดระบบเฝ้าระวัง)';
      if (armBtn) armBtn.textContent = armed ? 'ปลดระบบ (DISARM)' : 'เปิดระบบเฝ้าระวัง (ARM)';
      setLcdSec(armed ? 'ALARM ARMED' : 'SYSTEM DISARMED', armed ? 'MONITORING...' : 'READY TO ARM');
      addLog(armed ? 'System ARMED.' : 'System DISARMED.');
    });

    function triggerIntrusion(source) {
      if (!armed) {
        addLog(`Detected ${source}, but system is DISARMED.`);
        return;
      }
      statusBar?.classList.add('triggered');
      setLcdSec('INTRUSION ALERT!', source.toUpperCase());
      addLog(`INTRUSION: ${source} triggered!`, true);
      if (autoSnapCb?.checked) captureSnapshot(source);
      playBuzzer(2800, 180);
      setTimeout(() => playBuzzer(2300, 220), 210);
    }

    document.getElementById('simMotionBtn')?.addEventListener('click', () => triggerIntrusion('PIR Motion'));
    document.getElementById('simDoorBtn')?.addEventListener('click', () => triggerIntrusion('Door Opened'));
    document.getElementById('resetAlarmBtn')?.addEventListener('click', () => {
      statusBar?.classList.remove('triggered');
      setLcdSec(armed ? 'ALARM ARMED' : 'SYSTEM DISARMED', armed ? 'MONITORING...' : 'READY TO ARM');
      addLog('Alarm reset.');
    });

    document.getElementById('copyCamCodeBtn')?.addEventListener('click', () => {
      if (camCodeEl) navigator.clipboard?.writeText(camCodeEl.textContent);
    });
    syncCamUi();
  }

  // =========================================================================
  // PAGE QUIZ (quiz.html — Multiple Choice, 5 Questions Per Topic, Shuffled)
  // =========================================================================
  if (page === 'quiz') {
    const rawQuizData = {
      gpio: [
        {
          q: 'ขา GPIO ของ Raspberry Pi รองรับแรงดันลอจิกสูงสุดกี่โวลต์?',
          choices: ['3.3V', '5V', '12V', '9V'],
          correctText: '3.3V',
          explain: 'ขา GPIO ของ Raspberry Pi เป็นลอจิก 3.3V การป้อนไฟเกิน 3.3V เข้าขา GPIO โดยตรงอาจทำให้บอร์ดเสียหายได้'
        },
        {
          q: 'คำสั่งใดใน Terminal ของ Raspberry Pi ใช้ดูแผนผังขา GPIO และข้อมูลบอร์ด?',
          choices: ['pinout', 'lsusb', 'raspistill', 'mkfs'],
          correctText: 'pinout',
          explain: 'คำสั่ง pinout ใช้แสดงแผนผังขา 40-Pin Header และสเปกเบื้องต้นของบอร์ด Raspberry Pi'
        },
        {
          q: 'ในการจำลองปุ่มกดโหมด Pull-Up ถ้า "ไม่ได้กดปุ่ม" ค่า Logic บนขาอินพุตจะเป็นเท่าใด?',
          choices: ['1 (HIGH)', '0 (LOW)', 'Floating', '255'],
          correctText: '1 (HIGH)',
          explain: 'วงจร Pull-Up จะดึงสัญญาณให้เป็น HIGH (1) เมื่อปล่อยปุ่ม และเปลี่ยนเป็น LOW (0) เมื่อกดปุ่มเชื่อมต่อลง GND'
        },
        {
          q: 'การปรับ Duty Cycle ของ PWM จาก 0% ไปเป็น 100% บนขา LED จะส่งผลอย่างไร?',
          choices: ['ความสว่างของ LED ค่อย ๆ เพิ่มขึ้น', 'ความถี่เสียง Buzzer สูงขึ้นอย่างเดียว', 'เปลี่ยนสีของ LED อัตโนมัติ', 'รีสตาร์ทบอร์ด Raspberry Pi'],
          correctText: 'ความสว่างของ LED ค่อย ๆ เพิ่มขึ้น',
          explain: 'Duty Cycle ที่สูงขึ้นหมายถึงสัดส่วนเวลาที่เปิดไฟนานขึ้นในแต่ละรอบ ทำให้ตาเรามองเห็น LED สว่างขึ้น'
        },
        {
          q: 'ขาพินหมายเลข 3 และ 5 บน 40-Pin Header ปกติใช้สื่อสารบัสชนิดใด?',
          choices: ['I2C (SDA / SCL)', 'SPI (MOSI / MISO)', 'HDMI CEC', 'Ethernet'],
          correctText: 'I2C (SDA / SCL)',
          explain: 'Physical Pin 3 คือ GPIO 2 (SDA) และ Physical Pin 5 คือ GPIO 3 (SCL) ซึ่งเป็นขาหลักของบัส I2C'
        }
      ],
      led: [
        {
          q: 'เหตุใดจึงต้องต่อตัวต้านทานอนุกรมกับหลอด LED บนขา GPIO?',
          choices: ['เพื่อจำกัดกระแสไม่ให้ไหลผ่าน LED และขา GPIO เกิน', 'เพื่อเพิ่มแรงดันไฟเลี้ยงให้เป็น 12V', 'เพื่อแปลงสัญญาณดิจิทัลเป็นอนาล็อก', 'เพื่อให้ LED เปลี่ยนสีได้เอง'],
          correctText: 'เพื่อจำกัดกระแสไม่ให้ไหลผ่าน LED และขา GPIO เกิน',
          explain: 'ตัวต้านทาน (เช่น 220Ω) ช่วยจำกัดกระแสให้อยู่ในระดับที่ปลอดภัยต่อทั้งหลอด LED และพินของ Raspberry Pi'
        },
        {
          q: 'แถบสีตัวต้านทาน "แดง - แดง - น้ำตาล" มีค่าความต้านทานกี่โอห์ม?',
          choices: ['220Ω', '100Ω', '1,000Ω (1kΩ)', '4,700Ω (4.7kΩ)'],
          correctText: '220Ω',
          explain: 'แดง = 2, แดง = 2, น้ำตาล = x10 → 22 × 10 = 220Ω'
        },
        {
          q: 'ในหน้า LED Lab หากเลือกสีแยกกันเป็น L1 = แดง, L2 = เหลือง, L3 = เขียว เมื่อเปิดโหมด "ไฟวิ่ง" จะเกิดอะไรขึ้น?',
          choices: ['ไฟจะติดเรียงทีละหลอดตามสีที่ตั้งไว้ของแต่ละหลอด', 'ไฟทั้ง 3 ดวงเปลี่ยนเป็นสีเดียวกันหมด', 'ไฟดับทั้งหมดตลอดเวลา', 'ปุ่มรีเซ็ตไฟจะถูกปิดการใช้งาน'],
          correctText: 'ไฟจะติดเรียงทีละหลอดตามสีที่ตั้งไว้ของแต่ละหลอด',
          explain: 'แต่ละหลอดเก็บสีแยกอิสระจากกัน เมื่อโหมดไฟวิ่งสลับลำดับ หลอดที่ติดจะเรืองแสงตามสีของหลอดนั้น'
        },
        {
          q: 'โหมดใดในหน้า LED Lab ที่ออกแบบมาเพื่อจำลองสัญญาณไฟ 3 สีสลับจังหวะ?',
          choices: ['ไฟจราจร', 'ดับหมด', 'PWM 0%', 'Pull-Down'],
          correctText: 'ไฟจราจร',
          explain: 'โหมดไฟจราจรจะจำลองจังหวะการติดของไฟสัญญาณในแต่ละรอบ'
        },
        {
          q: 'การกดปุ่ม "รีเซ็ตไฟ" ในหน้า LED Lab มีผลอย่างไร?',
          choices: ['หยุดรอบไฟ คืนค่าสี/ความสว่าง/ความเร็ว และดับไฟทั้งหมด', 'ลบไฟล์โค้ด Python ในเครื่อง', 'ปิดหน้าต่างเบราว์เซอร์', 'เปลี่ยนธีมเป็นโหมดกลางวันเสมอ'],
          correctText: 'หยุดรอบไฟ คืนค่าสี/ความสว่าง/ความเร็ว และดับไฟทั้งหมด',
          explain: 'ปุ่มรีเซ็ตไฟจะเคลียร์ตัวจับเวลา คืนค่าเริ่มต้นให้คอนโทรลทั้งหมด และปรับสถานะไฟกลับเป็นดับหมด'
        }
      ],
      sensors: [
        {
          q: 'เซนเซอร์ DHT11 ใช้สำหรับวัดค่าใดเป็นหลัก?',
          choices: ['อุณหภูมิและความชื้นสัมพัทธ์', 'ระยะทางด้วยคลื่นอัลตราโซนิก', 'ความเข้มแสงเป็น Lux', 'การเคลื่อนไหวอินฟราเรด'],
          correctText: 'อุณหภูมิและความชื้นสัมพัทธ์',
          explain: 'DHT11 เป็นเซนเซอร์ดิจิทัลสำหรับวัดอุณหภูมิและความชื้นในอากาศ'
        },
        {
          q: 'คำสั่งใดใช้ตรวจสอบ Address ของโมดูลจอ I2C LCD บนบัสหมายเลข 1?',
          choices: ['i2cdetect -y 1', 'ping 127.0.0.1', 'df -h', 'uname -a'],
          correctText: 'i2cdetect -y 1',
          explain: 'คำสั่ง i2cdetect -y 1 ใช้สแกนหาแอดเดรสอุปกรณ์ I2C เช่น 0x27 หรือ 0x3f บน I2C bus 1'
        },
        {
          q: 'จอ LCD ขนาด 1602 สามารถแสดงตัวอักษรได้สูงสุดกี่ตัวอักษรต่อ 1 บรรทัด?',
          choices: ['16 ตัวอักษร (2 บรรทัด)', '8 ตัวอักษร (1 บรรทัด)', '32 ตัวอักษร (4 บรรทัด)', '64 ตัวอักษร (2 บรรทัด)'],
          correctText: '16 ตัวอักษร (2 บรรทัด)',
          explain: 'จอ LCD 1602 มี 2 แถว แถวละ 16 คอลัมน์ รวมสูงสุด 16 ตัวอักษรต่อบรรทัด'
        },
        {
          q: 'ในหน้า I2C 1602 & Buzzer หากกดปุ่ม "เลื่อนข้อความ" ข้อความบนจอจะแสดงผลอย่างไร?',
          choices: ['ข้อความจะเลื่อนหมุนต่อเนื่องไปตามแถวของจอ', 'ข้อความจะถูกลบจนว่างเปล่า', 'ไฟ Backlight จะกระพริบถี่ขึ้น', 'ความถี่เสียง Buzzer จะเปลี่ยนเป็น 0Hz'],
          correctText: 'ข้อความจะเลื่อนหมุนต่อเนื่องไปตามแถวของจอ',
          explain: 'ระบบจะตั้งตัวจับเวลาเลื่อนตำแหน่งตัวอักษรซ้ำเป็นรอบ ๆ เพื่อให้เห็นข้อความยาวขึ้นบนจอ 16 ตัวอักษร'
        },
        {
          q: 'เมื่อความสว่างแวดล้อมต่ำกว่า 200 Lux ในหน้าจำลองเซนเซอร์ สถานะจะแสดงเป็นแบบใด?',
          choices: ['มืด/สลัว', 'สว่างจ้ากลางแจ้ง', 'อุณหภูมิสูงเกินเกณฑ์', 'ตรวจพบการเปิดประตู'],
          correctText: 'มืด/สลัว',
          explain: 'ค่า Lux ที่ต่ำบ่งบอกถึงสภาพแสงน้อยหรือมืดสลัว ส่วนค่าสูงบ่งบอกถึงสภาพแสงสว่าง'
        }
      ],
      security: [
        {
          q: 'หากระบบกันขโมยอยู่ในสถานะ DISARMED แล้วกดจำลองเหตุการณ์ "PIR Motion" จะเกิดอะไรขึ้น?',
          choices: ['บันทึกเหตุการณ์ว่ายังไม่ได้เปิดระบบเฝ้าระวัง แต่ไม่ส่งสัญญาณเตือนภัย', 'เสียง Buzzer ดังทันทีและถ่ายภาพอัตโนมัติ', 'รีเซ็ตจอ LCD เป็นค่าเริ่มต้น', 'ปิดการทำงานของ Camera Module 3'],
          correctText: 'บันทึกเหตุการณ์ว่ายังไม่ได้เปิดระบบเฝ้าระวัง แต่ไม่ส่งสัญญาณเตือนภัย',
          explain: 'เมื่อระบบอยู่ในโหมด DISARMED การตรวจจับจะถูกบันทึกไว้ใน Log แต่จะยังไม่ทริกเกอร์สัญญาณเตือนภัย'
        },
        {
          q: 'เมื่อระบบอยู่ในสถานะ ARMED และเปิด "ถ่ายภาพอัตโนมัติเมื่อเกิดเตือนภัย" หากมีผู้บุกรุกจะเกิดอะไรขึ้น?',
          choices: ['แจ้งเตือนบนจอ/เสียง Buzzer พร้อมบันทึกภาพ Snapshot อัตโนมัติ', 'ปลดระบบเฝ้าระวังให้เป็น DISARMED ทันที', 'ลดค่า EV ของกล้องเหลือ -5.0 เสมอ', 'หยุดบันทึก Log ทันที'],
          correctText: 'แจ้งเตือนบนจอ/เสียง Buzzer พร้อมบันทึกภาพ Snapshot อัตโนมัติ',
          explain: 'เมื่อเปิด Auto-Snapshot ไว้ ระบบจะสั่งบันทึกภาพเหตุการณ์ให้อัตโนมัติควบคู่ไปกับการแจ้งเตือน'
        },
        {
          q: 'ค่า EV (Exposure Value) บนกล้อง Camera Module 3 ใช้ปรับค่าใดเป็นหลัก?',
          choices: ['การชดเชยความสว่างของภาพ', 'ความละเอียดพิกเซลของเซนเซอร์', 'ความยาวสายแพ CSI', 'หมายเลขขา GPIO'],
          correctText: 'การชดเชยความสว่างของภาพ',
          explain: 'Exposure Value (EV) ใช้ปรับชดเชยแสงให้ภาพสว่างขึ้นหรือมืดลงตามสภาพแสงจริง'
        },
        {
          q: 'ไลบรารี Python มาตรฐานสมัยใหม่บน Raspberry Pi OS สำหรับควบคุมกล้อง Camera Module 3 คืออะไร?',
          choices: ['picamera2', 'RPi.GPIO', 'tkinter', 'sqlite3'],
          correctText: 'picamera2',
          explain: 'picamera2 (ทำงานร่วมกับ libcamera) เป็นไลบรารีหลักสำหรับควบคุมกล้องบน Raspberry Pi รุ่นใหม่'
        },
        {
          q: 'ปุ่ม "รีเซ็ตการเตือน" ในหน้า 5 ใช้ทำอะไรเมื่อเกิดเหตุการณ์เตือนภัยค้างอยู่?',
          choices: ['ล้างสถานะเตือนภัยค้างและคืนข้อความจอตามโหมด ARMED/DISARMED', 'ลบไฟล์ภาพที่ถ่ายไว้ทั้งหมด', 'เปลี่ยนโหมดโฟกัสของกล้อง', 'ปิดโหมดสีหน้าเว็บ'],
          correctText: 'ล้างสถานะเตือนภัยค้างและคืนข้อความจอตามโหมด ARMED/DISARMED',
          explain: 'ปุ่มรีเซ็ตการเตือนจะเอาสถานะ triggered ออกและปรับข้อความบนจอ LCD ให้กลับสู่สถานะเฝ้าระวังปัจจุบัน'
        }
      ]
    };

    function shuffleArray(arr) {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }

    function buildShuffledTopic(topicKey) {
      const sourceList = rawQuizData[topicKey] || [];
      return sourceList.map((item) => {
        const shuffledChoices = shuffleArray(item.choices);
        if (shuffledChoices[0] === item.correctText && Math.random() < 0.75) {
          const swapIdx = 1 + Math.floor(Math.random() * (shuffledChoices.length - 1));
          [shuffledChoices[0], shuffledChoices[swapIdx]] = [shuffledChoices[swapIdx], shuffledChoices[0]];
        }
        return {
          q: item.q,
          choices: shuffledChoices,
          answer: shuffledChoices.indexOf(item.correctText),
          explain: item.explain
        };
      });
    }

    const quizData = {
      gpio: buildShuffledTopic('gpio'),
      led: buildShuffledTopic('led'),
      sensors: buildShuffledTopic('sensors'),
      security: buildShuffledTopic('security')
    };

    const topicTabs = document.querySelectorAll('#quizTopicTabs [data-topic]');
    const containerEl = document.getElementById('quizQuestionContainer');
    const scoreBadge = document.getElementById('quizScoreBadge');
    const summaryBox = document.getElementById('quizSummaryBox');
    const checkBtn = document.getElementById('checkQuizBtn');
    const shuffleBtn = document.getElementById('shuffleQuizBtn');
    const resetBtn = document.getElementById('resetQuizBtn');

    let currentTopic = 'gpio';
    const selectedAnswers = {
      gpio: [null, null, null, null, null],
      led: [null, null, null, null, null],
      sensors: [null, null, null, null, null],
      security: [null, null, null, null, null]
    };
    let showResults = false;

    function updateScoreBadge() {
      const list = quizData[currentTopic] || [];
      const ans = selectedAnswers[currentTopic] || [];
      let correctCount = 0;
      list.forEach((item, idx) => {
        if (ans[idx] === item.answer) correctCount++;
      });
      if (scoreBadge) {
        scoreBadge.textContent = showResults
          ? `คะแนน: ${correctCount} / ${list.length}`
          : `เลือกแล้ว: ${ans.filter((v) => v !== null).length} / ${list.length} ข้อ`;
      }
    }

    function renderQuiz() {
      if (!containerEl) return;
      const list = quizData[currentTopic] || [];
      const ans = selectedAnswers[currentTopic] || [];
      const keys = ['A', 'B', 'C', 'D'];

      containerEl.innerHTML = list
        .map((item, qIdx) => {
          const userPick = ans[qIdx];
          const choicesHtml = item.choices
            .map((choiceText, cIdx) => {
              const classes = ['quiz-choice-btn'];
              if (userPick === cIdx) classes.push('selected');
              if (showResults) {
                if (cIdx === item.answer) classes.push('correct');
                else if (userPick === cIdx && cIdx !== item.answer) classes.push('wrong');
              }
              return `
                <button type="button" class="${classes.join(' ')}" data-q="${qIdx}" data-c="${cIdx}">
                  <span class="quiz-choice-key">${keys[cIdx]}</span>
                  <span>${choiceText}</span>
                </button>
              `;
            })
            .join('');

          let feedbackHtml = '';
          if (showResults) {
            const isCorrect = userPick === item.answer;
            feedbackHtml = `
              <div class="quiz-feedback ${isCorrect ? 'ok' : 'err'}">
                <strong>${isCorrect ? '✓ ถูกต้อง!' : `✕ ยังไม่ถูก (เฉลยข้อ ${keys[item.answer]})`}</strong> — ${item.explain}
              </div>
            `;
          }

          return `
            <div class="card">
              <div class="quiz-q-title"><span class="quiz-q-num">ข้อ ${qIdx + 1}.</span>${item.q}</div>
              <div class="quiz-choices">${choicesHtml}</div>
              ${feedbackHtml}
            </div>
          `;
        })
        .join('');

      containerEl.querySelectorAll('.quiz-choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const qIdx = Number(btn.dataset.q);
          const cIdx = Number(btn.dataset.c);
          selectedAnswers[currentTopic][qIdx] = cIdx;
          showResults = false;
          if (summaryBox) summaryBox.style.display = 'none';
          updateScoreBadge();
          renderQuiz();
        });
      });

      updateScoreBadge();
    }

    topicTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        currentTopic = tab.dataset.topic;
        showResults = false;
        if (summaryBox) summaryBox.style.display = 'none';
        topicTabs.forEach((t) => t.classList.toggle('active-mode', t === tab));
        renderQuiz();
      });
    });

    checkBtn?.addEventListener('click', () => {
      const list = quizData[currentTopic] || [];
      const ans = selectedAnswers[currentTopic] || [];
      showResults = true;
      renderQuiz();

      let score = 0;
      list.forEach((item, idx) => {
        if (ans[idx] === item.answer) score++;
      });

      if (summaryBox) {
        summaryBox.style.display = 'block';
        summaryBox.innerHTML = `สรุปผลหัวข้อนี้: ได้ <strong>${score} / ${list.length} คะแนน</strong> — ดูคำอธิบายเฉลยใต้แต่ละข้อได้เลยครับ`;
      }
    });

    shuffleBtn?.addEventListener('click', () => {
      quizData[currentTopic] = buildShuffledTopic(currentTopic);
      selectedAnswers[currentTopic] = [null, null, null, null, null];
      showResults = false;
      if (summaryBox) summaryBox.style.display = 'none';
      renderQuiz();
    });

    resetBtn?.addEventListener('click', () => {
      selectedAnswers[currentTopic] = [null, null, null, null, null];
      showResults = false;
      if (summaryBox) summaryBox.style.display = 'none';
      renderQuiz();
    });

    renderQuiz();
  }

  // =========================================================================
  // PAGE LOGIN (login.html — Simple Username & Password)
  // =========================================================================
  if (page === 'login') {
    const form = document.getElementById('simpleLoginForm');
    const userInput = document.getElementById('loginUsername');
    const passInput = document.getElementById('loginPassword');
    const msgBox = document.getElementById('loginMessage');
    const loggedInBox = document.getElementById('loggedInBox');
    const currentUserLabel = document.getElementById('currentUserLabel');
    const logoutBtn = document.getElementById('logoutBtn');
    const clearBtn = document.getElementById('clearLoginBtn');

    function syncLoginUi() {
      const activeUser = localStorage.getItem('rpi_login_user');
      if (activeUser) {
        if (loggedInBox) loggedInBox.style.display = 'block';
        if (currentUserLabel) currentUserLabel.textContent = activeUser;
      } else if (loggedInBox) {
        loggedInBox.style.display = 'none';
      }
    }

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (userInput?.value || '').trim();
      const pass = passInput?.value || '';

      if (!name || !pass) {
        if (msgBox) {
          msgBox.style.display = 'block';
          msgBox.textContent = 'กรุณากรอกทั้งชื่อและรหัสผ่านครับ';
        }
        return;
      }

      localStorage.setItem('rpi_login_user', name);
      if (passInput) passInput.value = '';
      if (msgBox) {
        msgBox.style.display = 'block';
        msgBox.innerHTML = `เข้าสู่ระบบสำเร็จแล้วในชื่อ <strong>${name}</strong>`;
      }
      syncLoginUi();

      const navBadge = document.getElementById('navUserBadge');
      if (navBadge) {
        navBadge.textContent = `👤 ${name}`;
      } else if (navActions) {
        const badgeLink = document.createElement('a');
        badgeLink.id = 'navUserBadge';
        badgeLink.href = 'login.html';
        badgeLink.className = 'nav-user-badge';
        badgeLink.textContent = `👤 ${name}`;
        navActions.prepend(badgeLink);
      }
    });

    logoutBtn?.addEventListener('click', () => {
      localStorage.removeItem('rpi_login_user');
      if (msgBox) {
        msgBox.style.display = 'block';
        msgBox.textContent = 'ออกจากระบบเรียบร้อยแล้วครับ';
      }
      document.getElementById('navUserBadge')?.remove();
      syncLoginUi();
    });

    clearBtn?.addEventListener('click', () => {
      if (userInput) userInput.value = '';
      if (passInput) passInput.value = '';
      if (msgBox) msgBox.style.display = 'none';
    });

    syncLoginUi();
  }
});