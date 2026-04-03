# EBANX – Software Engineer Case (Banking Core)

Este repositório contém a implementação do desafio técnico para a posição de Software Engineer no EBANX. O foco principal da solução é a **correção da lógica de negócio**, **consistência de estado** e **extrema simplicidade**, evitando "overengineering" desnecessário.

## 🎯 Objetivo do Projeto
Desenvolver uma API de operações bancárias (Ledger) capaz de gerenciar eventos financeiros (depósitos, saques e transferências) garantindo a integridade dos saldos e a atomicidade das transações em um ambiente *in-memory*.

---

## 🚀 Funcionalidades Implementadas

- **Consulta de Saldo (`GET /balance`)**: Recuperação de saldo de contas existentes com retorno rigoroso de erro (404) para contas inexistentes.
- **Gestão de Eventos (`POST /event`)**:
    - **Deposit**: Incremento de saldo ou criação automática de novas contas.
    - **Withdraw**: Redução de saldo com validação de fundos insuficientes.
    - **Transfer**: Operação atômica que garante a consistência entre a conta de origem e a de destino.
- **GET Sem Efeitos Colaterais**: Garantia de que nenhuma operação de leitura altera o estado interno do sistema.
- **Documentação Swagger**: API documentada e testável via interface interativa.

---

## 🛠️ Decisões de Arquitetura

Para atender ao requisito de **"Separação de Responsabilidades"**, a estrutura foi organizada seguindo padrões de Clean Code no NestJS:

* **Camada de Transporte (Controllers):** Responsável apenas pelo protocolo HTTP e validação de entrada (DTOs).
* **Camada de Negócio (Services):** Onde reside a inteligência financeira e as regras de validação.
* **Persistência em Memória (Repositories/Store):** Utilização de uma estrutura de dados centralizada (`Map`) para simular o banco de dados de forma consistente e performática.
* **Atomicidade:** As operações de transferência são tratadas como uma unidade única de lógica, prevenindo estados inconsistentes onde o dinheiro "some" ou "duplica".

---

## 📁 Estrutura do Projeto

```bash
src/
├── account/
│   ├── dto/                # Validação de entrada (CreateEventDto)
│   ├── account.controller.ts # Endpoints (HTTP Layer)
│   ├── account.service.ts    # Regras de Negócio (Business Layer)
│   ├── account.repository.ts # Persistência em Memória (Data Layer)
│   └── account.module.ts
├── common/
│   └── filters/            # Tratamento global de exceções
├── app.module.ts
└── main.ts                 # Configuração de Swagger e Validation Pipes


## 🛠️ Tecnologias Principais

- **NestJS** (v11)
- **TypeScript**
- **Class Validator & Transformer** (Garantia de integridade de dados)
- **Swagger UI** (Documentação técnica)

---

## ⚙️ Como Iniciar

### Pré-requisitos
- **Node.js** >= 20
- **npm** ou **yarn**

### Instalação e Execução

1. **Instale as dependências:**
   ```bash
   npm install