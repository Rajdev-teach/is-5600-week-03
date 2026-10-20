const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadChat() {
  const elements = [];
  let submit;
  let source;
  let request;
  const window = {
    EventSource: function () { source = this; },
    messages: { appendChild: element => elements.push(element) },
    form: { addEventListener: (_, listener) => { submit = listener; } },
    input: { value: '' },
    fetch: url => { request = url; },
  };
  vm.runInNewContext(fs.readFileSync(`${__dirname}/public/chat.js`, 'utf8'), {
    window, URLSearchParams, document: { createElement: () => ({}) },
  });
  return { window, elements, receive: message => source.onmessage({ data: message }),
    send: () => { submit({ preventDefault() {} }); return request; } };
}

test('received HTML remains message text', () => {
  const chat = loadChat();
  const payload = '<img src=x onerror=alert(1)>';
  chat.receive(payload);
  assert.equal(chat.elements[0].textContent, payload);
  assert.equal(chat.elements[0].innerHTML, undefined);
});

test('reserved URL characters survive sending a message', () => {
  const chat = loadChat();
  const message = 'A&B + C? #chat';
  chat.window.input.value = message;
  const request = new URL(chat.send(), 'http://localhost');
  assert.equal(request.searchParams.get('message'), message);
  assert.equal(chat.window.input.value, '');
});
