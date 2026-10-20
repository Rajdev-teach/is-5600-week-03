new window.EventSource("/sse").onmessage = function(event) {
    const message = document.createElement('p');
    message.textContent = event.data;
    window.messages.appendChild(message);
}

window.form.addEventListener('submit', function(event) {
    event.preventDefault();

    window.fetch(`/chat?${new URLSearchParams({ message: window.input.value })}`);
    window.input.value = '';
})
