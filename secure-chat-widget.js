class SecureChatWidget {
  constructor(options = {}) {
    // Validar opções obrigatórias
    if (!options.clientId || !options.apiKey || !options.apiUrl) {
      console.error('SecureChatWidget: clientId, apiKey e apiUrl são obrigatórios');
      return;
    }

    this.clientId = options.clientId;
    this.apiKey = options.apiKey;
    this.apiUrl = options.apiUrl;
    this.theme = options.theme || {
      primary: '#A020F0',
      secondary: '#FF1493',
      text: '#1a1a1a',
      background: '#ffffff'
    };

    this.init();
  }

  async init() {
    try {
      // Validar acesso antes de inicializar
      const isValid = await this.validateAccess();
      if (!isValid) {
        console.error('SecureChatWidget: Acesso não autorizado');
        return;
      }
      this.initializeWidget();
    } catch (error) {
      console.error('SecureChatWidget: Erro na inicialização', error);
    }
  }

  async validateAccess() {
    try {
      const response = await fetch(`${this.apiUrl}/validate-domain`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Client-ID': this.clientId,
          'Origin': window.location.origin,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return data.isValid;
    } catch {
      return false;
    }
  }

  initializeWidget() {
    // Adicionar CSS
    this.addStyles();
    
    // Criar estrutura HTML
    this.createWidgetHTML();
    
    // Adicionar eventos
    this.setupEventListeners();
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .secure-chat-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 99999;
        font-family: Arial, sans-serif;
      }

      .chat-bubble {
        width: 60px;
        height: 60px;
        background: linear-gradient(45deg, ${this.theme.primary}, ${this.theme.secondary});
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      }

      .chat-window {
        display: none;
        position: fixed;
        bottom: 100px;
        right: 20px;
        width: 350px;
        height: 500px;
        background: ${this.theme.background};
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        flex-direction: column;
      }

      .chat-header {
        background: linear-gradient(45deg, ${this.theme.primary}, ${this.theme.secondary});
        color: white;
        padding: 15px;
        border-radius: 10px 10px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
      }

      .chat-input-container {
        padding: 15px;
        border-top: 1px solid #eee;
      }

      .chat-input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        margin-bottom: 10px;
      }

      .message {
        margin-bottom: 10px;
        max-width: 80%;
        padding: 10px;
        border-radius: 10px;
      }

      .user-message {
        margin-left: auto;
        background: linear-gradient(45deg, ${this.theme.primary}, ${this.theme.secondary});
        color: white;
      }

      .bot-message {
        background: #f0f0f0;
        color: ${this.theme.text};
      }
    `;
    document.head.appendChild(style);
  }

  createWidgetHTML() {
    const container = document.createElement('div');
    container.className = 'secure-chat-container';
    container.innerHTML = `
      <div class="chat-bubble">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </div>
      <div class="chat-window">
        <div class="chat-header">
          <span>Chat Assistente</span>
          <button class="close-btn" style="background: none; border: none; color: white; cursor: pointer;">✕</button>
        </div>
        <div class="chat-messages"></div>
        <div class="chat-input-container">
          <input type="text" class="chat-input" placeholder="Digite sua mensagem...">
        </div>
      </div>
    `;
    document.body.appendChild(container);
  }

  async sendMessage(message) {
    const messagesContainer = document.querySelector('.chat-messages');
    
    // Adicionar mensagem do usuário
    const userMessageElement = document.createElement('div');
    userMessageElement.className = 'message user-message';
    userMessageElement.textContent = message;
    messagesContainer.appendChild(userMessageElement);
    
    try {
      // Enviar mensagem para o n8n
      const response = await fetch(`${this.apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Client-ID': this.clientId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });
      
      const data = await response.json();
      
      // Adicionar resposta do bot
      const botMessageElement = document.createElement('div');
      botMessageElement.className = 'message bot-message';
      botMessageElement.textContent = data.response;
      messagesContainer.appendChild(botMessageElement);
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage = document.createElement('div');
      errorMessage.className = 'message bot-message';
      errorMessage.textContent = 'Desculpe, ocorreu um erro ao processar sua mensagem.';
      messagesContainer.appendChild(errorMessage);
    }
    
    // Rolar para a última mensagem
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  setupEventListeners() {
    const bubble = document.querySelector('.chat-bubble');
    const chatWindow = document.querySelector('.chat-window');
    const closeBtn = document.querySelector('.close-btn');
    const input = document.querySelector('.chat-input');

    bubble.addEventListener('click', () => {
      chatWindow.style.display = 'flex';
      bubble.style.display = 'none';
    });

    closeBtn.addEventListener('click', () => {
      chatWindow.style.display = 'none';
      bubble.style.display = 'flex';
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        this.sendMessage(input.value.trim());
        input.value = '';
      }
    });
  }
}
