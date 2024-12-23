<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Widget</title>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            background: transparent;
        }

        #chat-widget-container {
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            z-index: 999999 !important;
            font-family: Arial, sans-serif;
        }

        .chat-bubble {
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            width: 60px;
            height: 60px;
            background: linear-gradient(45deg, #A020F0, #FF1493);
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            transition: opacity 0.3s;
            z-index: 999999 !important;
        }

        .chat-bubble:hover {
            opacity: 0.9;
        }

        .chat-window {
            position: fixed !important;
            bottom: 90px !important;
            right: 20px !important;
            width: 300px;
            height: 400px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
            flex-direction: column;
            display: none;
            z-index: 999999 !important;
            overflow: hidden;
        }

        .chat-header {
            background: linear-gradient(45deg, #A020F0, #FF1493);
            color: white;
            padding: 10px 15px;
            border-radius: 10px 10px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
        }

        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            height: calc(100% - 120px);
        }

        .chat-input-container {
            padding: 10px;
            border-top: 1px solid #eee;
            background: white;
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .chat-input {
            flex: 1;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin: 0;
        }

        .message {
            margin-bottom: 10px;
            max-width: 80%;
            padding: 8px 12px;
            border-radius: 10px;
            font-size: 14px;
        }

        .user-message {
            margin-left: auto;
            background: linear-gradient(45deg, #A020F0, #FF1493);
            color: white;
        }

        .bot-message {
            background: #f0f0f0;
        }

        .close-btn {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 20px;
            padding: 5px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
        }

        .close-btn:hover {
            opacity: 0.8;
        }

        .send-btn {
            width: 36px;
            height: 36px;
            background: linear-gradient(45deg, #A020F0, #FF1493);
            border: none;
            border-radius: 50%;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.3s;
            padding: 0;
            margin-right: 8px;
        }

        .send-btn:hover {
            opacity: 0.9;
        }

        .typing-indicator {
            padding: 10px;
            background: #f0f0f0;
            border-radius: 10px;
            margin-bottom: 10px;
            display: inline-block;
        }

        .typing-indicator::after {
            content: "...";
            animation: typing 1.5s infinite;
        }

        @keyframes typing {
            0% { content: "."; }
            33% { content: ".."; }
            66% { content: "..."; }
        }
    </style>
</head>
<body>
    <div id="chat-widget-container"></div>

    <script>
        document.getElementById('chat-widget-container').innerHTML = `
            <div class="chat-bubble">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
            </div>
            <div class="chat-window">
                <div class="chat-header">
                    <span>Chat Assistente</span>
                    <button class="close-btn" title="Fechar">×</button>
                </div>
                <div class="chat-messages"></div>
                <div class="chat-input-container">
                    <input type="text" class="chat-input" placeholder="Digite sua mensagem...">
                    <button class="send-btn" title="Enviar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        const webhookUrl = 'SUA_URL_DO_WEBHOOK_N8N/chat';

        function setupEventListeners() {
            const container = document.getElementById('chat-widget-container');
            const bubble = container.querySelector('.chat-bubble');
            const chatWindow = container.querySelector('.chat-window');
            const closeBtn = container.querySelector('.close-btn');
            const input = container.querySelector('.chat-input');
            const sendBtn = container.querySelector('.send-btn');

            bubble.addEventListener('click', () => {
                chatWindow.style.display = 'flex';
                bubble.style.display = 'none';
                input.focus();
            });

            closeBtn.addEventListener('click', () => {
                chatWindow.style.display = 'none';
                bubble.style.display = 'flex';
                input.value = '';
            });

            const handleSendMessage = async () => {
                const message = input.value.trim();
                if (message) {
                    input.value = '';
                    await sendMessage(message);
                }
            };

            input.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    await handleSendMessage();
                }
            });

            sendBtn.addEventListener('click', handleSendMessage);
        }

        async function sendMessage(message) {
            const container = document.getElementById('chat-widget-container');
            const messagesContainer = container.querySelector('.chat-messages');
            
            const userMessageElement = document.createElement('div');
            userMessageElement.className = 'message user-message';
            userMessageElement.textContent = message;
            messagesContainer.appendChild(userMessageElement);
            
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'message bot-message typing-indicator';
            typingIndicator.textContent = 'Digitando';
            messagesContainer.appendChild(typingIndicator);
            
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            try {
                console.log('Enviando mensagem:', message);
                
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message })
                });

                // Aguarda a resposta por até 12 segundos
                await new Promise(resolve => setTimeout(resolve, 12000));
                
                console.log('Status da resposta:', response.status);
                const responseText = await response.text();
                console.log('Resposta bruta:', responseText);
                
                const data = JSON.parse(responseText);
                console.log('Dados parseados:', data);
                
                typingIndicator.remove();
                
                const botMessageElement = document.createElement('div');
                botMessageElement.className = 'message bot-message';
                botMessageElement.textContent = data.body.response || data.response || 'Sem resposta';
                messagesContainer.appendChild(botMessageElement);
                
            } catch (error) {
                console.error('Erro completo:', error);
                
                typingIndicator.remove();
                
                const errorMessage = document.createElement('div');
                errorMessage.className = 'message bot-message';
                errorMessage.textContent = 'Não foi possível obter uma resposta. Por favor, tente novamente.';
                messagesContainer.appendChild(errorMessage);
            }
            
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        setupEventListeners();
    </script>
</body>
</html>
