document.addEventListener('DOMContentLoaded', function() {
  let html5QrCode;
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

  function showInfo(message) {
    document.getElementById('infoModalBody').textContent = message;
    $('#infoModal').modal('show');
  }

  function showQrResult(qrCodeMessage) {
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

    document.getElementById('qr-parent').classList.remove('d-none');
  }

  document.getElementById('startScanBtn').addEventListener('click', function() {
    $('#scanModal').modal('show');
  });

  // Wait until the modal has finished its fade-in transition before starting the
  // camera: html5-qrcode measures the container's size when start() is called, and
  // reading it too early (mid-transition) makes it fall back to a fixed default
  // width, leaving a large blank gap under the video.
  $('#scanModal').on('shown.bs.modal', function() {
    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode("readerModal", scannerConfig);
    }

    html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: 240 },
      qrCodeMessage => {
        showQrResult(qrCodeMessage);
        html5QrCode.stop().then(() => {
          $('#scanModal').modal('hide');
        }).catch(err => {
          console.log(`Error stopping QR Code reader: ${err}`);
        });
      },
      errorMessage => {
        console.log(`Error scanning QR Code: ${errorMessage}`);
      }
    ).catch(err => {
      console.log(`Error initializing QR Code reader: ${err}`);
    });
  });

  document.getElementById('stopScanBtn').addEventListener('click', function() {
    if (html5QrCode) {
      html5QrCode.stop().then(() => {
        $('#scanModal').modal('hide');
      }).catch(err => {
        console.log(`Error stopping QR Code reader: ${err}`);
      });
    }
  });

  document.getElementById('qrInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      html5QrCode = new Html5Qrcode("reader", scannerConfig);
      html5QrCode.scanFile(file, true)
        .then(qrCodeMessage => {
          if (qrCodeMessage) {
            showQrResult(qrCodeMessage);
          } else {
            showInfo("Please select a valid QR code");
          }
        })
        .catch(err => {
          console.log(`Error reading QR Code: ${err}`);
          showInfo("The selected file is not a QR code");
        });
    } else {
      showInfo("The selected file is not supported");
    }
    event.target.value = '';
  });

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

      document.getElementById('downloadQrBtn').classList.remove("disabled");
      qrCodeContainer.appendChild(qr.canvas);
    } else {
      showInfo("Minimum required value is 5 characters to generate a QR code");
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
      showInfo("Please generate a QR code first.");
    }
  });

  $('#generateModal').on('hidden.bs.modal', function() {
    document.getElementById('qrText').value = '';
    document.getElementById('qrCode').innerHTML = '';
    document.getElementById('downloadQrBtn').classList.add('disabled');
  });

  document.getElementById("copyButton").addEventListener('click', function() {
    const value = document.getElementById("qr-result").textContent;

    navigator.clipboard.writeText(value).then(() => {
      showInfo("Copied!");
    }).catch(() => {
      showInfo("Error occurred, try again");
    });
  });
});
