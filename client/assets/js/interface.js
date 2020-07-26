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

  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($('#join-link').text()).select();
  document.execCommand("copy");
  $temp.remove();
  alert("Link copied to clipboard");

})

//mobile nav 

document.querySelector('#show-game-mobile').addEventListener('click', e => {
  document.querySelector('.content').classList.add('content-show')
})

document.querySelector('#hide-game-mobile').addEventListener('click', e => {
  document.querySelector('.content').classList.remove('content-show')
})


// chrome bug fix

let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

window.addEventListener('resize', () => {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
});