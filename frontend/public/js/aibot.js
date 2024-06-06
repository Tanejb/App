document.getElementById('helpButton').addEventListener('click', () => {
  const chatModal = document.getElementById('chatModal');
  chatModal.style.display = chatModal.style.display === 'block' ? 'none' : 'block';
  if (chatModal.style.display === 'block') {
      setTimeout(() => {
          document.getElementById('chatBox').scrollTop = document.getElementById('chatBox').scrollHeight;
      }, 100);
  }
});

document.getElementById('closeButton').addEventListener('click', () => {
  const chatModal = document.getElementById('chatModal');
  chatModal.style.display = 'none';
});

document.getElementById('sendButton').addEventListener('click', async () => {
  const userInput = document.getElementById('userInput');
  const question = userInput.value;

  if (question.trim() === "") return;

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