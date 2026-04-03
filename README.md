# Backend – Pokémon Challenge (Clean Architecture)

Este projeto é a implementação do desafio técnico para a Leany. O foco principal foi criar uma arquitetura extensível utilizando NestJS e TypeORM, garantindo a integridade das regras de negócio e uma estratégia eficiente de cache para os dados da PokéAPI.

##  Funcionalidades

- **Gestão de Treinadores**: Cadastro completo com enriquecimento automático de endereço via ViaCEP.
- **Gestão de Times**: Criação de times com limite de 5 pokémons e regras de integridade.
- **Integração PokéAPI**: Sincronização automática de dados de pokémons diretamente da API oficial.
- **Performance com SWC**: Compilação e execução de testes ultra-rápidos com Rust.
- **Documentação Swagger**: API documentada e testável via ONLINE (http://54.236.5.232/docs).
- **Testes & Cobertura**: Suite de testes com Jest e feedback instantâneo.
- **Persistência Robusta**: Integração com PostgreSQL via TypeORM e suporte a Migrations.

---

## Arquitetura do Projeto

O projeto segue os padrões de **Clean Architecture** e **Domain-Driven Design (DDD)**, organizando as responsabilidades de forma clara.

## 🛠 Decisões de Arquitetura 

* **Clean Architecture:** Divisão clara entre `Domain` (Regras), `Application` (Casos de Uso) e `Infrastructure` (Frameworks/DB).
* **Isolamento de Entidades:** Uso de **Mappers** para garantir que as entidades do TypeORM não vazem para os Controllers. A API trafega apenas **DTOs** e utiliza entidades de domínio puro internamente.
* **Repository Pattern:** Desacoplamento total da lógica de persistência, facilitando a troca de banco de dados ou a implementação de testes unitários com Mocks.
* **Performance com SWC:** Configuração do compilador SWC para garantir que o ciclo de desenvolvimento (Hot Reload) e a execução de testes sejam extremamente rápidos.

--- 

### `Estrutura do projeto`

```bash
src/
├── modules/
│   └── [module-name]/               
│       ├── domain/                  
│       │   ├── entities/            
│       │   ├── repositories/        
│       │   └── providers/ (interfaces)
│       ├── application/             
│       └── infra/                   
│           ├── http/
│           │   ├── controllers/     
│           │   └── dtos/            
│           ├── database/            
│           │   ├── entities/        
│           │   └── repositories/    
│           ├── providers/           
│           └── jobs/                
│
├── shared/                          
│   ├── domain/                      
│   └── infra/                       
│       ├── http/
│       │   ├── filters/             
│       │   ├── interceptors/        
│       │   └── providers/           
│       └── database/
│           ├── migrations/          
│           └── base.mapper.ts       
│
├── app.module.ts                    
└── main.ts                          
``` 

## 🛠️ Tecnologias Principais

- **NestJS** (v11)
- **TypeScript**
- **TypeORM** & **PostgreSQL**
- **SWC** (Compiler)
- **RabbitMQ** (Message Broker)
- **Docker** & **Docker Compose**

---

## � Como Iniciar

### Pré-requisitos

- **Node.js** >= 20
- **Docker** & **Docker Compose** (Opcional, para ambiente isolado)

### Instalação e Execução Local

1. **Instale as dependências:**
   ```bash
   yarn install 
   ```

2. **Configure o ambiente:**
   Copie `.env.example` para `.env` e ajuste as credenciais do banco de dados.

3. **Inicie o servidor (Desenvolvimento):**
   ```bash
   yarn dev
   ```
   O servidor estará disponível em: `http://localhost:3000`

---

## � Rodando com Docker

### Docker Compose (Recomendado)

Para subir o banco de dados e a aplicação:

```bash
docker-compose up -d --build
```

--- 

## 📋 Regras de Negócio Implementadas

### 1. Treinador (Trainers)
* **Enriquecimento com ViaCEP:** No cadastro, o sistema consome a API externa do ViaCEP para preencher automaticamente endereço, bairro, cidade e estado. Isso garante padronização e qualidade nos dados de localização.
* **Restrição de Exclusão (Restrict Delete):** Para manter a integridade referencial, o sistema bloqueia a exclusão de treinadores que possuam times ativos. O usuário deve gerenciar os times antes de remover o perfil.
* **Persistência Segura (Soft Delete):** A remoção de treinadores e times utiliza a estratégia de *Soft Delete* (`deleted_at`). Os dados não são apagados fisicamente, permitindo auditoria e evitando perda acidental de histórico.

### 2. Times (Teams)
* **Limite de Composição:** Cada time pode ter no máximo **5 Pokémon**. O sistema rejeita automaticamente a tentativa de adicionar um 6º integrante com erro `400 Bad Request`.
* **Prevenção de Duplicidade:** É proibido adicionar o mesmo Pokémon mais de uma vez no mesmo time. Essa regra é validada na camada de aplicação e reforçada por uma *Unique Constraint* no banco de dados.
* **Vínculo Obrigatório:** Um time não pode existir sem um treinador responsável (Dono).

### 3. Pokémon & PokéAPI (Cache Strategy)
* **Estratégia Cache-Aside:** A aplicação prioriza o banco de dados local. Caso o Pokémon solicitado não exista na base, o sistema busca na PokéAPI, persiste os dados localmente (nome, tipos, imagem, ID externo) e então realiza a associação ao time.
* **Redução de Latência:** O uso do cache local evita chamadas desnecessárias à API externa em todas as requisições, tornando a listagem de times significativamente mais rápida.
* **Normalização de Dados:** Buscas por nome de Pokémon são tratadas como *case-insensitive*, garantindo que "Pikachu" e "pikachu" sejam reconhecidos como o mesmo registro, evitando redundância.

---

##  Validação, Permissões e Ciclo de Vida

Para garantir uma API robusta e segura, utilizei os recursos nativos do ciclo de vida do NestJS para separar as responsabilidades de validação e tratamento:

### 1. Validação de Entrada e DTOs
* **Sanitização:** Utilizei `class-validator` e `class-transformer` nos DTOs para garantir que apenas dados válidos cheguem aos Casos de Uso.
* **Segurança de Tipagem:** O uso de TypeScript em todas as camadas impede que estados inconsistentes sejam processados ou persistidos.

### 2. Gerenciamento de "Permissões" e Regras
* **Integridade do Domínio:** Como o desafio não exigia autenticação JWT, as "permissões" foram implementadas como **Regras de Integridade** dentro dos Use Cases. 
* **Blindagem de Negócio:** As restrições (limite de 5 Pokémon, bloqueio de exclusão de treinador com times) são tratadas como permissões de execução, garantindo que o sistema seja inviolável mesmo sem um sistema de login.
* **Pronto para Evolução:** A arquitetura está preparada para a inclusão de **NestJS Guards** e **Decorators** para validação de identidade (ex: `OwnerId`) em futuras iterações.

### 3. Interceptors e Exception Filters (Padronização)
* **Interceptors:** Utilizados para interceptar as respostas de sucesso e garantir que o JSON retornado ao cliente siga sempre o mesmo padrão de estrutura.
* **Exception Filters:** Implementado o `HttpExceptionFilter` para capturar exceções da camada de aplicação e transformá-las em respostas amigáveis. Isso evita o vazamento de logs internos ou erros brutos do banco de dados (PostgreSQL) para o usuário final.

---

## 🧪 Guia de Testes Manuais (Fluxo Principal)

Para validar as regras de negócio de ponta a ponta, você pode seguir este fluxo no Swagger (`/api`):

1. **Cadastro com CEP:** Crie um Treinador enviando apenas Nome e CEP. O sistema buscará o endereço automaticamente via **ViaCEP**.
2. **Criação de Time:** Vincule um novo time ao ID do treinador criado.
3. **Adição de Pokémon (Cache Strategy):** - Ao adicionar o primeiro Pokémon (ex: `pikachu`), o sistema sincroniza com a **PokéAPI** e persiste localmente.
   - As próximas consultas ao mesmo Pokémon priorizam o banco local.
4. **Validação de Limites:** Tente adicionar mais de 5 Pokémon no mesmo time para ver o bloqueio da regra de negócio (Erro 400).
5. **Prevenção de Duplicidade:** Tente adicionar o mesmo Pokémon duas vezes no mesmo time para validar a restrição.
6. **Integridade Referencial:** Tente deletar um Treinador que possui times ativos para validar o bloqueio de segurança.

---

## 🧪 Testes Unitários e Cobertura

A aplicação foi desenvolvida focando em alta testabilidade, atingindo **84% de cobertura global** e **100% de cobertura nos Casos de Uso (Business Logic)**.

Para rodar os testes:
```bash
yarn test        # Executa os testes
yarn test:cov    # Gera o relatório de cobertura
```
--- 

## 📺 Apresentação e Demonstração Técnica

Devido à profundidade técnica do desafio, dividi a explicação em quatro partes para facilitar a análise:

* 🎥 **Parte 1: Arquitetura e Decisões Técnicas** [Assista aqui](https://www.loom.com/share/afaa500207f24d038520be4ec5b2627c)  
    *Foco: Clean Architecture, DDD, Mappers e a organização da estrutura de pastas.*

* 🎥 **Parte 2: Integrações e Regras de Negócio** [Assista aqui](https://www.loom.com/share/934111040ec94c8d8343917a3afd996d)  
    *Foco: Implementação da integração com ViaCEP e as regras core de domínio.*

* 🎥 **Parte 3: Gerenciamento de Pokémon: Adicionando e Atualizando Dados no Banco** [Assista aqui](https://www.loom.com/share/285b5cb297fa42928f2a47d0ec74635b)  
    *Foco: Estratégia de Cache-aside, persistência de dados da PokéAPI e sincronização.*

* 🎥 **Parte 4: Validação e Testes de Cobertura em Projeto de Desenvolvimento** [Assista aqui]https://www.loom.com/share/c42d8ea98ac44cbaa1e0f91f09227431)  
    *Foco: Demonstração prática no Swagger, validação de limites de time (5 Pokémon) e relatório de 84% de cobertura de testes.*

--- 

## 🌐 Endpoints da API (Swagger)

A aplicação está disponível para testes nos seguintes ambientes:

* 🚀 **Produção (Web):** [http://54.236.5.232/docs](http://54.236.5.232/docs)
* 🏠 **Local:** [http://localhost:3333/docs](http://localhost:3333/docs)

--- 

## 📖 Documentação da API

Acesse o Swagger UI para explorar os endpoints REST Local:
🔗 [http://localhost:3000/docs](http://localhost:3000/docs)

Acesse o Swagger UI para explorar os endpoints REST web:
🔗 [http://54.236.5.232:3000/docs](http://54.236.5.232:3000/docs)

---

## 👤 Autor

**Robson Feitosa Pimentel**

---

## 📄 Licença

Este projeto está sob a licença [MIT](https://github.com/nestjs/nest/blob/master/LICENSE).
