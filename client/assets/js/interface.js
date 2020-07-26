// highlight chatox

document.addEventListener('click', (e) => {
  let chatInput = document.querySelector("#chat label")

  if (document.querySelectorAll("#chat label :focus").length === 0) {
    chatInput.className = 'inactive'
  } else {
    chatInput.className = 'active'
  }
})
  

// copy game link
document.querySelector('#join-link').innerText = window.location.href
document.querySelector('#join').addEventListener('click', () => {
  // var copyText = document.getElementById("join-link");
  // copyText.select();
  // copyText.setSelectionRange(0, 99999)
  // document.execCommand("copy");

  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($('#join-link').text()).select();
  document.execCommand("copy");
  $temp.remove();
  alert("Link copied to clipboard");
})

// function copyToClipboard(element) {
  
// }
