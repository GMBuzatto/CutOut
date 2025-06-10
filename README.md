# ✂️ CutOut

<div align="center">

![CutOut Logo](https://img.shields.io/badge/✂️-CutOut-blue?style=for-the-badge&labelColor=purple)

**Remoção inteligente de fundo de imagens: transforme suas fotos com IA profissional e algoritmos avançados.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-black?style=flat-square&logo=express)](https://expressjs.com/)
[![Sharp](https://img.shields.io/badge/Sharp-Image-orange?style=flat-square)](https://sharp.pixelplumbing.com/)
[![remove.bg](https://img.shields.io/badge/remove.bg-API-red?style=flat-square)](https://www.remove.bg/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## 🚀 Funcionalidades

<table>
<tr>
<td width="50%">

### 🤖 **IA Profissional**
- **remove.bg API**: Remoção de fundo com qualidade profissional
- **Processamento Híbrido**: IA + algoritmos locais avançados
- **Detecção Inteligente**: Reconhecimento automático de objetos
- **Alta Precisão**: Ideal para pessoas, animais e objetos complexos

</td>
<td width="50%">

### ⚡ **Performance Superior**
- **Processamento Rápido**: Resultados em segundos
- **Fallback Inteligente**: Sistema de backup automático
- **Múltiplos Formatos**: JPEG, JPG, PNG suportados
- **Interface Moderna**: Drag & drop responsivo

</td>
</tr>
</table>

### 🎯 **Qualidade & Facilidade**
- **Resultados Profissionais**: Qualidade de estúdio automatizada
- **Zero Configuração**: Funciona imediatamente após instalação
- **API REST**: Integração simples com outros sistemas
- **Métricas em Tempo Real**: Confiança e tempo de processamento

---

## 🛠️ Stack Tecnológica

<div align="center">

| Categoria | Tecnologias |
|-----------|-------------|
| **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white) |
| **IA & Processamento** | ![remove.bg](https://img.shields.io/badge/remove.bg-FF6B35?style=flat&logoColor=white) ![Sharp](https://img.shields.io/badge/Sharp-99CC00?style=flat&logoColor=white) |
| **Upload** | ![Multer](https://img.shields.io/badge/Multer-FF6B35?style=flat&logoColor=white) |
| **Segurança** | ![CORS](https://img.shields.io/badge/CORS-000000?style=flat&logoColor=white) ![dotenv](https://img.shields.io/badge/dotenv-ECD53F?style=flat&logoColor=black) |
| **Dev Tools** | ![ts-node](https://img.shields.io/badge/ts--node-3178C6?style=flat&logoColor=white) ![TypeScript](https://img.shields.io/badge/tsc-007ACC?style=flat&logoColor=white) |

</div>

---

## 📦 Instalação Rápida

### 1️⃣ **Clone e Configure**
```bash
# Clone o repositório
git clone https://github.com/GMBuzatto/CutOut.git
cd CutOut

# Instale as dependências
npm install
```

### 2️⃣ **Configure a API remove.bg**
```bash
# Crie sua conta gratuita em https://www.remove.bg/api
# Obtenha sua API key

# Configure o ambiente
cp env.example .env

# Edite o arquivo .env
REMOVE_BG_API_KEY=sua_chave_aqui
ENABLE_REMOVE_BG_API=true
```

### 3️⃣ **Execute o Projeto**
```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm run build && npm start
```

🎉 **Pronto!** Acesse `http://localhost:3000`

---

## 📡 API Endpoints

### 🏠 **Interface e Status**
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/` | 🏠 Interface web moderna |
| `GET` | `/health` | ❤️ Status do servidor |
| `GET` | `/ai-status` | 🤖 Status das funcionalidades de IA |

### ✂️ **Processamento de Imagens**
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/upload` | ⚡ Upload e remoção de fundo |
| `GET` | `/uploads/:filename` | 📥 Acessar imagem original |
| `GET` | `/output/:filename` | 📤 Acessar imagem processada |

---

## 💡 Exemplos de Uso

<details>
<summary><b>🤖 Verificar Status da IA</b></summary>

```bash
curl http://localhost:3000/ai-status
```

**Resposta:**
```json
{
  "removeBackground": {
    "apiConfigured": true,
    "enabled": true
  },
  "enhancedLocal": {
    "available": true,
    "description": "AI-inspired local processing"
  }
}
```
</details>

<details>
<summary><b>✂️ Remover Fundo de Imagem</b></summary>

```bash
curl -X POST http://localhost:3000/upload \
  -F "image=@foto.jpg" \
  --output foto_sem_fundo.png
```

**Resposta:**
```json
{
  "success": true,
  "message": "Image processed successfully with AI",
  "originalImage": "/uploads/image-123456.jpg",
  "processedImage": "/output/processed-123456.png",
  "method": "remove.bg API",
  "processingTime": 2344,
  "confidence": 0.95
}
```
</details>

<details>
<summary><b>🖼️ Interface Web (Drag & Drop)</b></summary>

1. Acesse `http://localhost:3000`
2. Arraste sua imagem para a área de upload
3. Aguarde o processamento automático
4. Visualize o resultado lado a lado
5. Download automático disponível

**Recursos da Interface:**
- ✨ Drag & drop intuitivo
- 📊 Métricas em tempo real
- 🎯 Preview lado a lado
- 📱 Design responsivo
</details>

<details>
<summary><b>⚡ Processamento em Lote (JavaScript)</b></summary>

```javascript
async function processMultipleImages(files) {
  const results = [];
  
  for (const file of files) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    results.push(result);
  }
  
  return results;
}
```

**Processamento inteligente de múltiplas imagens**
</details>

---

## 🎯 Métodos de Processamento

### 🤖 **remove.bg API (Prioritário)**

<div align="center">

| Característica | Descrição | Qualidade |
|----------------|-----------|-----------|
| **Precisão** | IA treinada profissionalmente | 🌟🌟🌟🌟🌟 |
| **Velocidade** | 1-5 segundos | ⚡⚡⚡⚡ |
| **Tipos suportados** | Pessoas, animais, objetos, carros | 🎯 Universal |
| **Bordas** | Detecção de cabelos e bordas suaves | ✨ Perfeita |

</div>

### 🔬 **Processamento Local Avançado (Fallback)**

<div align="center">

| Técnica | Funcionalidade | Uso Recomendado |
|---------|----------------|-----------------|
| **Análise de Clusters** | Detecção inteligente de cores | 🎨 Fundos uniformes |
| **Detecção de Bordas** | Algoritmos Sobel avançados | 📐 Objetos definidos |
| **Análise de Textura** | Padrões locais binários | 🌊 Texturas complexas |
| **Coerência Espacial** | Análise de vizinhança | 🎯 Objetos contínuos |

</div>

---

## 📁 Arquitetura do Projeto

```
CutOut/
├── 📂 src/
│   ├── 🎮 services/             # Lógica de processamento
│   │   ├── AIBackgroundRemover.ts    # IA e remove.bg API
│   │   └── ImageProcessor.ts         # Algoritmos locais avançados
│   ├── 🚀 server.ts            # Servidor Express principal
├── 🌐 public/                  # Interface web moderna
│   └── index.html              # UI responsiva com drag & drop
├── 📥 uploads/                 # Imagens originais (temporário)
├── 📤 output/                  # Imagens processadas
├── 🏗️ dist/                   # Código TypeScript compilado
├── ⚙️ .env                     # Configurações sensíveis
├── 📋 package.json            # Dependências do projeto
└── 📖 README.md               # Documentação completa
```

---

## ⚙️ Configuração Avançada

### 🔧 **Variáveis de Ambiente**
```env
# 🤖 API remove.bg
REMOVE_BG_API_KEY=sua_chave_aqui
ENABLE_REMOVE_BG_API=true

# 🌐 Servidor
PORT=3000
NODE_ENV=production

# 📏 Limites de Arquivo
MAX_FILE_SIZE=10485760          # 10MB
SUPPORTED_FORMATS=jpeg,jpg,png

# ⚡ Performance
PROCESSING_TIMEOUT=30000        # 30 segundos
```

### 🚀 **Scripts Disponíveis**
```bash
npm run build        # 🏗️ Compilar TypeScript
npm start            # 🚀 Servidor de produção
npm run dev          # 🔥 Desenvolvimento com hot reload
npm run watch        # 👁️ Compilação contínua
```

---

## 🚦 Status do Projeto

<div align="center">

### ✅ **Funcionalidades Implementadas**

| Funcionalidade | Status | Descrição |
|----------------|--------|-----------|
| 🤖 **Integração remove.bg** | ✅ **Completo** | API profissional com 95% de precisão |
| 🔬 **Processamento Local** | ✅ **Completo** | Algoritmos avançados inspirados em IA |
| 🎯 **Sistema de Fallback** | ✅ **Completo** | Backup automático inteligente |
| 🌐 **Interface Moderna** | ✅ **Completo** | Drag & drop + design responsivo |
| 📊 **Métricas em Tempo Real** | ✅ **Completo** | Confiança + tempo de processamento |
| 🔒 **Configuração Segura** | ✅ **Completo** | Variáveis de ambiente + CORS |
| 📡 **API REST Simples** | ✅ **Completo** | Endpoints unificados e claros |
| 🧹 **Limpeza Automática** | ✅ **Completo** | Gerenciamento de arquivos temporários |
| ⚡ **Performance Otimizada** | ✅ **Completo** | Sharp + processamento assíncrono |

</div>

---

## 💳 Configurando a API remove.bg

### 🆓 **Plano Gratuito**
- **50 imagens/mês** gratuitas
- **Qualidade profissional** garantida
- **Sem compromisso** inicial

### 🚀 **Como Configurar**

1. **Crie sua conta**: [remove.bg/api](https://www.remove.bg/api)
2. **Obtenha sua chave**: Copie da dashboard
3. **Configure no projeto**:
   ```bash
   # No arquivo .env
   REMOVE_BG_API_KEY=sua_chave_aqui
   ENABLE_REMOVE_BG_API=true
   ```
4. **Teste**: Faça upload de uma imagem

### 📊 **Planos Disponíveis**
| Plano | Imagens/mês | Preço | Ideal para |
|-------|-------------|-------|------------|
| **Gratuito** | 50 | $0 | 🧪 Testes e projetos pessoais |
| **Subscription** | 500 | $9.99 | 💼 Pequenos negócios |
| **Pay-as-you-go** | Ilimitado | $0.20/img | 🏢 Uso empresarial |

---

## 🤝 Contribuição

<div align="center">

**Contribuições são sempre bem-vindas!** 🎉

</div>

1. 🍴 **Fork** o projeto
2. 🌿 **Crie** uma branch para sua feature
   ```bash
   git checkout -b feature/MinhaNovaFeature
   ```
3. 💾 **Commit** suas mudanças
   ```bash
   git commit -m 'feat: Adiciona processamento de PNG transparente'
   ```
4. 📤 **Push** para a branch
   ```bash
   git push origin feature/MinhaNovaFeature
   ```
5. 🔄 **Abra** um Pull Request

### 📋 **Diretrizes de Contribuição**
- Use **Conventional Commits** para mensagens
- Mantenha o **código TypeScript** bem tipado
- Adicione **testes** para novas funcionalidades
- Documente **mudanças na API**

---

## 🔧 Solução de Problemas Comuns

<details>
<summary><b>❌ Erro "API key not configured"</b></summary>

```bash
# Verifique se o arquivo .env existe e tem a chave
cat .env | grep REMOVE_BG_API_KEY

# Se não existir, configure:
echo "REMOVE_BG_API_KEY=sua_chave_aqui" >> .env
echo "ENABLE_REMOVE_BG_API=true" >> .env
```
</details>

<details>
<summary><b>🚫 Erro "API quota exceeded"</b></summary>

```bash
# Você atingiu o limite mensal
# Soluções:
# 1. Aguarde o próximo mês (plano gratuito)
# 2. Upgrade para plano pago
# 3. Use processamento local (fallback automático)

# Desabilitar API temporariamente:
# No .env: ENABLE_REMOVE_BG_API=false
```
</details>

<details>
<summary><b>📁 Erro de upload de arquivo</b></summary>

```bash
# Verifique permissões dos diretórios
chmod 755 uploads output

# Ou recrie os diretórios
rm -rf uploads output
mkdir uploads output
```
</details>

<details>
<summary><b>⚡ Processamento muito lento</b></summary>

```bash
# Verifique sua conexão com a API
curl -w "%{time_total}" https://api.remove.bg/

# Para grandes volumes, considere:
# 1. Redimensionar imagens antes do upload
# 2. Usar plano pay-as-you-go para prioridade
# 3. Processamento em lote inteligente
```
</details>

---

## 📊 Comparação com Concorrentes

<div align="center">

| Solução | Qualidade | Velocidade | Custo | Facilidade |
|---------|-----------|------------|-------|------------|
| **CutOut + remove.bg** | 🌟🌟🌟🌟🌟 | ⚡⚡⚡⚡ | 💰💰 | 🎯🎯🎯🎯🎯 |
| **Photoshop** | 🌟🌟🌟🌟🌟 | ⚡⚡ | 💰💰💰💰 | 🎯🎯 |
| **GIMP (manual)** | 🌟🌟🌟 | ⚡ | 💰 (gratuito) | 🎯 |
| **Canva** | 🌟🌟🌟🌟 | ⚡⚡⚡ | 💰💰💰 | 🎯🎯🎯🎯 |

**CutOut**: Melhor custo-benefício para automação profissional

</div>

---

## 📄 Licença

<div align="center">

Este projeto está licenciado sob a **MIT License**.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

</div>

---

## 🆘 Suporte & Comunidade

<div align="center">

**Precisa de ajuda? Estamos aqui para você!** 💪

</div>

### 📚 **Recursos de Ajuda**
1. 📖 **[Wiki](../../wiki)** - Guias detalhados e tutoriais
2. 🐛 **[Issues](../../issues)** - Problemas conhecidos e soluções
3. ❓ **[Nova Issue](../../issues/new)** - Reporte bugs ou solicite features
4. 💬 **[Discussões](../../discussions)** - Tire dúvidas com a comunidade

### 🌐 **Links Úteis**
- 🤖 **[remove.bg API Docs](https://www.remove.bg/api)** - Documentação oficial
- 📸 **[Sharp Documentation](https://sharp.pixelplumbing.com/)** - Processamento de imagens
- 🎨 **[Design Guidelines](docs/design.md)** - Padrões de interface

---

## 🙏 Agradecimentos

<div align="center">

**Este projeto não seria possível sem essas tecnologias incríveis:**

[![remove.bg](https://img.shields.io/badge/remove.bg-FF6B35?style=for-the-badge&logoColor=white)](https://www.remove.bg/)
[![Sharp](https://img.shields.io/badge/Sharp-99CC00?style=for-the-badge&logoColor=white)](https://sharp.pixelplumbing.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

**Agradecimentos especiais para:**
- 🤖 **[remove.bg](https://www.remove.bg/)** - Pela IA de remoção de fundo mais avançada do mundo
- 🖼️ **[Sharp](https://sharp.pixelplumbing.com/)** - Pelo processamento ultrarrápido de imagens
- 🌐 **[Express.js](https://expressjs.com/)** - Pelo framework web robusto e flexível  
- 📘 **[TypeScript](https://www.typescriptlang.org/)** - Pela tipagem estática e desenvolvimento seguro
- 📦 **[Multer](https://github.com/expressjs/multer)** - Pelo gerenciamento eficiente de uploads

</div>

---

<div align="center">

**⭐ Se este projeto te ajudou, considere dar uma estrela!**

[![GitHub stars](https://img.shields.io/github/stars/GMBuzatto/CutOut?style=social)](https://github.com/GMBuzatto/CutOut/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/GMBuzatto/CutOut?style=social)](https://github.com/GMBuzatto/CutOut/network/members)

**Feito com ❤️ para designers, desenvolvedores e criadores de conteúdo**

*Transforme suas ideias em realidade com remoção de fundo profissional*

</div>
