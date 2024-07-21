
document.addEventListener('DOMContentLoaded', function() {
  let html5QrCode;

  document.getElementById('startScanBtn').addEventListener('click', function() {
    $('#scanModal').modal('show');

    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode("readerModal");
    }

    html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: 150 },
      qrCodeMessage => {
        const urlPattern = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i; 
const qrResult =  document.getElementById("qr-result")
  // Check if the value matches the URL pattern
  if (urlPattern.test(qrCodeMessage)) {
    // Enable the browseButton
    const browseButton = document.getElementById("browseButton");
    browseButton.classList.remove("disabled"); 

    // Set the href attribute of visitButton
    const visitButton = document.getElementById("visitButton");
    visitButton.href = qrCodeMessage;
  
  
  qrResult.textContent = qrCodeMessage;
  qrResult.style.color="blue"
          document.getElementById("qr-parent").classList.remove("d-none")
  } else {
  qrResult.textContent = qrCodeMessage;
  qrResult.style.color="black"
          document.getElementById("qr-parent").classList.remove("d-none")
    // Optionally disable the browseButton if not a URL
    const browseButton = document.getElementById("browseButton");
    
  browseButton.classList.add("disabled"); 
  }
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
      html5QrCode = new Html5Qrcode("reader");
      html5QrCode.scanFile(file, true)
        .then(qrCodeMessage => {
if(qrCodeMessage){
            // Regular expression to check if the text is a URL
  const urlPattern = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i; 
const qrResult =  document.getElementById("qr-result")
  // Check if the value matches the URL pattern
  if (urlPattern.test(qrCodeMessage)) {
    // Enable the browseButton
    const browseButton = document.getElementById("browseButton");
    browseButton.classList.remove("disabled"); 

    // Set the href attribute of visitButton
    const visitButton = document.getElementById("visitButton");
    visitButton.href = qrCodeMessage;
  
  
  qrResult.textContent = qrCodeMessage;
  qrResult.style.color="blue"
          document.getElementById("qr-parent").classList.remove("d-none")
  } else {
  qrResult.textContent = qrCodeMessage;
  qrResult.style.color="black"
          document.getElementById("qr-parent").classList.remove("d-none")
    // Optionally disable the browseButton if not a URL
    const browseButton = document.getElementById("browseButton");
    
  browseButton.classList.add("disabled"); 
  }
  
}else {
  alert("Please select a valid QR code")
}
        })
        .catch(err => {
          alert("the selected file is not QR code" , error)
        });
    }else {
      alert("the selected file is not supported")
    }
  });

  document.getElementById('generateBtn').addEventListener('click', function() {
    const qrText = document.getElementById('qrText').value;
    const qrCodeContainer = document.getElementById('qrCode');
    
if(qrText.trim().length > 4){
    // Clear previous QR code
    qrCodeContainer.innerHTML = '';

    const qr = new QRious({
      element: qrCodeContainer,
      value: qrText,
      size: 200
    });
// unable downloadQrBtn
document.getElementById('downloadQrBtn').classList.remove("disabled")

    // Append canvas to the container
    qrCodeContainer.appendChild(qr.canvas);
}else {
  alert("Minimum required value is 5 characters to generate a QR code")
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
      alert("Please generate a QR code first.");
    }
  });
});

// copy Qr code btn function
document.getElementById("copyButton").addEventListener('click', (e) => {
  const value = e.target.parentNode.parentNode.querySelector("#qr-result").textContent;
  
  navigator.clipboard.writeText(value).then(() => {
    alert("Copied!");
  }).catch((error) => {
    alert("Error occurred, try again");
    
  });
});