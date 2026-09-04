document.addEventListener('DOMContentLoaded', function() {
  const urlPattern = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;

  // Support common 1D barcodes (product/EAN/UPC barcodes) in addition to QR codes.
  const scannerConfig = {
    formatsToSupport: [
      Html5QrcodeSupportedFormats.QR_CODE,
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E,
      Html5QrcodeSupportedFormats.CODE_39,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.CODABAR,
      Html5QrcodeSupportedFormats.ITF,
    ],
  };

  // ---------- i18n ----------
  const translations = {
    en: {
      'app.title': 'QR Code Reader & Generator',
      'scan.tagline': 'Scan with privacy',
      'scan.torch': 'Toggle flashlight',
      'scan.flip': 'Switch camera',
      'scan.rescan': 'Restart scanning',
      'scan.gallery': 'Read QR code from an image file',
      'tabs.scan': 'Scan',
      'tabs.generate': 'Generate',
      'tabs.settings': 'Settings',
      'generate.placeholder': 'Enter text to generate QR code',
      'generate.button': 'Generate',
      'generate.download': 'Download generated QR code',
      'result.title': 'Result',
      'result.close': 'Close',
      'result.browse': 'Browse',
      'result.copy': 'Copy',
      'settings.theme': 'Appearance',
      'settings.dark': 'Dark',
      'settings.light': 'Light',
      'settings.language': 'Language',
      'common.ok': 'OK',
      'info.minChars': 'Minimum required value is 5 characters to generate a QR code',
      'info.invalidQr': 'Please select a valid QR code',
      'info.notQr': 'The selected file is not a QR code',
      'info.unsupported': 'The selected file is not supported',
      'info.generateFirst': 'Please generate a QR code first.',
      'info.copied': 'Copied!',
      'info.copyError': 'Error occurred, try again',
    },
    ar: {
      'app.title': 'قارئ ومولّد أكواد QR',
      'scan.tagline': 'امسح بخصوصية',
      'scan.torch': 'تشغيل/إطفاء الفلاش',
      'scan.flip': 'تبديل الكاميرا',
      'scan.rescan': 'إعادة تشغيل المسح',
      'scan.gallery': 'قراءة كود QR من صورة',
      'tabs.scan': 'مسح',
      'tabs.generate': 'توليد',
      'tabs.settings': 'الإعدادات',
      'generate.placeholder': 'أدخل نصًا لتوليد كود QR',
      'generate.button': 'توليد',
      'generate.download': 'تنزيل كود QR',
      'result.title': 'النتيجة',
      'result.close': 'إغلاق',
      'result.browse': 'فتح',
      'result.copy': 'نسخ',
      'settings.theme': 'المظهر',
      'settings.dark': 'داكن',
      'settings.light': 'فاتح',
      'settings.language': 'اللغة',
      'common.ok': 'حسنًا',
      'info.minChars': 'الحد الأدنى المطلوب 5 أحرف لتوليد كود QR',
      'info.invalidQr': 'يرجى اختيار كود QR صالح',
      'info.notQr': 'الملف المحدد ليس كود QR',
      'info.unsupported': 'نوع الملف غير مدعوم',
      'info.generateFirst': 'يرجى توليد كود QR أولاً',
      'info.copied': 'تم النسخ!',
      'info.copyError': 'حدث خطأ، حاول مرة أخرى',
    },
  };

  let currentLang = localStorage.getItem('qr-lang') || 'en';

  function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) || key;
  }

  function applyLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    document.title = t('app.title');
    document.querySelectorAll('#langToggle button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === lang);
    });
    localStorage.setItem('qr-lang', lang);
  }

  // ---------- Theme ----------
  let currentTheme = localStorage.getItem('qr-theme') || 'dark';

  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('#themeToggle button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === theme);
    });
    localStorage.setItem('qr-theme', theme);
  }

  document.getElementById('themeToggle').addEventListener('click', event => {
    const btn = event.target.closest('button[data-value]');
    if (btn) applyTheme(btn.dataset.value);
  });

  document.getElementById('langToggle').addEventListener('click', event => {
    const btn = event.target.closest('button[data-value]');
    if (btn) applyLanguage(btn.dataset.value);
  });

  applyLanguage(currentLang);
  applyTheme(currentTheme);

  // ---------- Info modal (replaces alert()) ----------
  function showInfo(message) {
    document.getElementById('infoModalBody').textContent = message;
    $('#infoModal').modal('show');
  }

  // ---------- Tabs ----------
  const views = {
    scan: document.getElementById('view-scan'),
    generate: document.getElementById('view-generate'),
    settings: document.getElementById('view-settings'),
  };
  const tabButtons = document.querySelectorAll('.tab-btn');

  function switchTab(tab) {
    Object.keys(views).forEach(key => {
      views[key].classList.toggle('d-none', key !== tab);
    });
    tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));

    if (tab === 'scan') {
      startCameraScanner();
    } else {
      stopCameraScanner();
    }
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // ---------- Camera scanner (Scan tab) ----------
  let html5QrCodeCamera;
  let html5QrCodeFile;
  let currentFacingMode = 'environment';
  let torchOn = false;

  function updateTorchAvailability() {
    const torchBtn = document.getElementById('torchBtn');
    try {
      const capabilities = html5QrCodeCamera.getRunningTrackCapabilities();
      torchBtn.classList.toggle('d-none', !(capabilities && capabilities.torch));
    } catch (err) {
      torchBtn.classList.add('d-none');
    }
    torchOn = false;
    torchBtn.classList.remove('active');
  }

  function startCameraScanner() {
    if (!html5QrCodeCamera) {
      html5QrCodeCamera = new Html5Qrcode('readerHome', scannerConfig);
    }
    if (html5QrCodeCamera.isScanning) return;

    document.getElementById('readerHome').classList.toggle('mirrored', currentFacingMode === 'user');

    html5QrCodeCamera.start(
      { facingMode: currentFacingMode },
      { fps: 10 },
      qrCodeMessage => {
        showResult(qrCodeMessage);
      },
      () => {}
    ).then(() => {
      updateTorchAvailability();
    }).catch(err => {
      console.log('Error starting camera scanner:', err);
    });
  }

  function stopCameraScanner() {
    if (html5QrCodeCamera && html5QrCodeCamera.isScanning) {
      html5QrCodeCamera.stop().catch(() => {});
    }
  }

  document.getElementById('rescanBtn').addEventListener('click', () => {
    stopCameraScanner();
    setTimeout(startCameraScanner, 300);
  });

  document.getElementById('flipCamBtn').addEventListener('click', () => {
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    stopCameraScanner();
    setTimeout(startCameraScanner, 300);
  });

  document.getElementById('torchBtn').addEventListener('click', function() {
    if (!html5QrCodeCamera || !html5QrCodeCamera.isScanning) return;
    const nextTorchState = !torchOn;
    html5QrCodeCamera.applyVideoConstraints({ advanced: [{ torch: nextTorchState }] })
      .then(() => {
        torchOn = nextTorchState;
        this.classList.toggle('active', torchOn);
      })
      .catch(() => {});
  });

  document.getElementById('qrInputHome').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (!html5QrCodeFile) {
        html5QrCodeFile = new Html5Qrcode('readerFile', scannerConfig);
      }
      html5QrCodeFile.scanFile(file, true)
        .then(qrCodeMessage => {
          if (qrCodeMessage) {
            showResult(qrCodeMessage);
          } else {
            showInfo(t('info.invalidQr'));
          }
        })
        .catch(err => {
          console.log(`Error reading QR Code: ${err}`);
          showInfo(t('info.notQr'));
        });
    } else {
      showInfo(t('info.unsupported'));
    }
    event.target.value = '';
  });

  // ---------- Result sheet ----------
  function showResult(qrCodeMessage) {
    const qrResult = document.getElementById('qr-result');
    const browseButton = document.getElementById('browseButton');

    qrResult.textContent = qrCodeMessage;

    if (urlPattern.test(qrCodeMessage)) {
      browseButton.classList.remove('disabled');
      browseButton.href = qrCodeMessage;
      qrResult.classList.add('is-link');
    } else {
      browseButton.classList.add('disabled');
      browseButton.removeAttribute('href');
      qrResult.classList.remove('is-link');
    }

    stopCameraScanner();

    const sheet = document.getElementById('resultSheet');
    const backdrop = document.getElementById('resultBackdrop');
    sheet.classList.remove('d-none');
    backdrop.classList.remove('d-none');
    requestAnimationFrame(() => {
      sheet.classList.add('open');
      backdrop.classList.add('open');
    });
  }

  function hideResult() {
    const sheet = document.getElementById('resultSheet');
    const backdrop = document.getElementById('resultBackdrop');
    sheet.classList.remove('open');
    backdrop.classList.remove('open');
    setTimeout(() => {
      sheet.classList.add('d-none');
      backdrop.classList.add('d-none');
    }, 280);

    if (!views.scan.classList.contains('d-none')) {
      startCameraScanner();
    }
  }

  document.getElementById('resultCloseBtn').addEventListener('click', hideResult);
  document.getElementById('resultBackdrop').addEventListener('click', hideResult);

  document.getElementById('copyButton').addEventListener('click', function() {
    const value = document.getElementById('qr-result').textContent;
    navigator.clipboard.writeText(value).then(() => {
      showInfo(t('info.copied'));
    }).catch(() => {
      showInfo(t('info.copyError'));
    });
  });

  // ---------- Generate tab ----------
  document.getElementById('generateBtn').addEventListener('click', function() {
    const qrText = document.getElementById('qrText').value;
    const qrCodeContainer = document.getElementById('qrCode');

    if (qrText.trim().length > 4) {
      qrCodeContainer.innerHTML = '';

      const qr = new QRious({
        element: qrCodeContainer,
        value: qrText,
        size: 200
      });

      document.getElementById('downloadQrBtn').classList.remove('disabled');
      qrCodeContainer.appendChild(qr.canvas);
    } else {
      showInfo(t('info.minChars'));
    }
  });

  document.getElementById('qrText').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      document.getElementById('generateBtn').click();
    }
  });

  document.getElementById('downloadQrBtn').addEventListener('click', function() {
    const qrCodeCanvas = document.querySelector('#qrCode canvas');
    if (qrCodeCanvas) {
      const qrCodeImage = qrCodeCanvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = qrCodeImage;
      downloadLink.download = 'qrcode.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      showInfo(t('info.generateFirst'));
    }
  });

  // ---------- Init ----------
  switchTab('scan');
});
