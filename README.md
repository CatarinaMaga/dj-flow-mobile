# 🎧 DJ Flow Mobile - Engine

O **DJ Flow Mobile** é o motor de busca e streaming que alimenta a versão mobile do ecossistema DJ Flow. Ele permite pesquisar músicas no YouTube, ouvir o áudio em tempo real e fazer downloads diretamente para o dispositivo.

## 🚀 Funcionalidades

- **Busca Inteligente**: Encontra os 5 melhores resultados no YouTube para qualquer termo.
- **Streaming Nativo**: Carregamento rápido de áudio (M4A) via stream direto do servidor.
- **Downloads**: Botão dedicado para baixar a faixa em alta qualidade.
- **Motor de Extração**: Utiliza `yt-dlp` para garantir a melhor qualidade e estabilidade.

## 🛠️ Tecnologias Utilizadas

- **Node.js** & **Express**: Backend de alta performance.
- **yt-dlp**: Motor robusto para extração de áudio/vídeo.
- **Youtube Search API**: Para buscas rápidas e precisas.
- **Cors**: Configurado para integração segura com o frontend.

## 📦 Como Instalar e Rodar

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/CatarinaMaga/dj-flow-mobile.git
    cd dj-flow-mobile
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Inicie o servidor:**
    ```bash
    npm start
    ```
    O servidor estará rodando em `http://localhost:3001` (ou na porta definida no seu ambiente).

## 📄 Scripts Disponíveis

- `npm start`: Inicia o servidor Node.js.
- `npm run build`: Garante a instalação das dependências (útil para ambientes de deploy como Render).

---
Desenvolvido para facilitar a vida do DJ. 🎶
