document.getElementById('closeButton').addEventListener('click', () => {
  const chatModal = document.getElementById('chatModal');
  chatModal.style.display = 'none';
});

document.getElementById('sendButton').addEventListener('click', async () => {
  const userInput = document.getElementById('userInput');
  const question = userInput.value;

  if (question.trim() === '') return;

  const response = await fetch('/api/get-answer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });
  const data = await response.json();

  const chatBox = document.getElementById('chatBox');

  // Prikaži vprašanje uporabnika
  const userMessage = document.createElement('div');
  userMessage.textContent = `You: ${userInput.value}`;
  chatBox.appendChild(userMessage);

  // Prikaži odgovor bota
  const botMessage = document.createElement('div');
  botMessage.textContent = `Bot: ${data.answer}`;
  chatBox.appendChild(botMessage);

  // Pomakni se navzdol
  chatBox.scrollTop = chatBox.scrollHeight;

  // Počisti vnosno polje
  userInput.value = '';
});

window.onload = function () {
  // Get the chat modal
  const chatModal = document.getElementById('chatModal');

  // Hide the chat modal by default
  chatModal.style.display = 'none';

  window.sendToAIChat = function (question) {
    chatModal.style.display = 'block';

    // Get the chat history div
    const chatHistory = document.getElementById('chatBox');

    // Clear the chat history
    if (chatHistory) {
      chatHistory.innerHTML = '';
    }

    // Get the user input box
    const userInputBox = document.getElementById('userInput');

    // Set the value of the input box to the question
    userInputBox.value = question;

    // Get the send button
    const sendButton = document.getElementById('sendButton');

    // Trigger a click event on the send button
    sendButton.click();
    chatHistory.scrollTop = chatBox.scrollHeight;
  };
};
