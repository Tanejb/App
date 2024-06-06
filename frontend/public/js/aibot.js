document.addEventListener('DOMContentLoaded', () => {
  const chatModal = document.getElementById('chatModal');
  const chatBox = document.getElementById('chatBox');
  const helpButton = document.getElementById('helpButton');
  const closeButton = document.getElementById('closeButton');
  const sendButton = document.getElementById('sendButton');
  const userInput = document.getElementById('userInput');

  // Prepričajte se, da je pogovorno okno skrito, ko je stran naložena
  chatModal.style.display = 'none';

  helpButton.addEventListener('click', () => {
      if (chatModal.style.display === 'none' || chatModal.style.display === '') {
          chatModal.style.display = 'block';
          setTimeout(() => {
              chatBox.scrollTop = chatBox.scrollHeight;
          }, 100);
      } else {
          chatModal.style.display = 'none';
      }
  });

  closeButton.addEventListener('click', () => {
      chatModal.style.display = 'none';
  });

  sendButton.addEventListener('click', async () => {
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

      // Prikaži vprašanje uporabnika
      const userMessage = document.createElement('div');
      userMessage.textContent = `Vi: ${userInput.value}`;
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
});