// highlight chatox

document.addEventListener('click', (e) => {
  let chatInput = document.querySelector("#chat label")

  if (document.querySelectorAll("#chat label :focus").length === 0) {
    chatInput.className = 'inactive'
  } else {
    chatInput.className = 'active'
  }
})
  