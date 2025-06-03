CREATE DATABASE IF NOT EXISTS GoPlanningDB;
USE GoPlanningDB;

-- Tabela TipoDocumento
CREATE TABLE TipoDocumento (
    id_tipo_documento INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(100) NOT NULL UNIQUE, -- CPF, RG, etc.
    valor VARCHAR(100) NOT NULL UNIQUE      -- número do documento
);

-- Tabela Usuario
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    documento VARCHAR(255),
    id_tipo_documento INT,
    FOREIGN KEY (id_tipo_documento) REFERENCES TipoDocumento(id_tipo_documento)
);

-- Tabela Destino
CREATE TABLE destinos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    pais VARCHAR(50) NOT NULL
);

-- Tabela Transporte para a cidade (aviões, ônibus de linha, etc.)
CREATE TABLE transporte_para_cidade (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, -- Avião, Ônibus
    descricao VARCHAR(255) NOT NULL,
    cidade_origem VARCHAR(100) NOT NULL,
    cidade_destino VARCHAR(100) NOT NULL
);

-- Tabela Transporte local (dentro da cidade)
CREATE TABLE transporte_local (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, -- carro, ônibus local, etc.
    descricao VARCHAR(255) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    endereco VARCHAR(100) NOT NULL
);

-- Tabela filha: Detalhes de ônibus (para transporte_para_cidade)
CREATE TABLE detalhes_onibus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_transporte INT NOT NULL,
    horario_saida TIME NOT NULL,
    horario_chegada TIME NOT NULL,
    numero_assento VARCHAR(10),
    empresa VARCHAR(100),
	preco DECIMAL (10,2),
    FOREIGN KEY (id_transporte) REFERENCES transporte_para_cidade(id)
);

-- Tabela filha: Detalhes de aviões (para transporte_para_cidade)
CREATE TABLE detalhes_avioes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_transporte INT NOT NULL,
    companhia_aerea VARCHAR(100) NOT NULL,
    numero_voo VARCHAR(20) NOT NULL,
    horario_embarque TIME NOT NULL,
    horario_chegada TIME NOT NULL,
    assento VARCHAR(10),
	preco DECIMAL (10,2),
    FOREIGN KEY (id_transporte) REFERENCES transporte_para_cidade(id)
);

-- Tabela filha: Detalhes de carros alugados (para transporte_local)
CREATE TABLE carros_alugados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_transporte_local INT NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    ano INT NOT NULL,
    tipo_combustivel VARCHAR(50) NOT NULL,
    numero_portas INT,
    ar_condicionado BOOLEAN DEFAULT TRUE,
    cambio VARCHAR(50), -- manual, automático
    capacidade_passageiros INT,
    placa VARCHAR(20) UNIQUE,
    FOREIGN KEY (id_transporte_local) REFERENCES transporte_local(id)
);

-- Tabela Hospedagem
CREATE TABLE hospedagem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL
);

-- Tabela filha: Detalhes de hotéis
CREATE TABLE hoteis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_hospedagem INT NOT NULL,
    numero_quarto VARCHAR(20),
    tipo_cama VARCHAR(50),
    possui_wifi BOOLEAN DEFAULT TRUE,
    possui_cafe_manha BOOLEAN DEFAULT FALSE,
    possui_estacionamento BOOLEAN DEFAULT FALSE,
	preco DECIMAL (10,2), 
    FOREIGN KEY (id_hospedagem) REFERENCES hospedagem(id)
);

-- Tabela Alimentacao
CREATE TABLE alimentacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
	preco DECIMAL (10,2),
    categoria VARCHAR(50) NOT NULL
);

-- Tabela Atividade
CREATE TABLE atividades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL (10,2),
    endereco VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    localidade VARCHAR(100) NOT NULL
);

-- Tabela Interesse
CREATE TABLE interesses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    endereco VARCHAR(100) NOT NULL,
	preco DECIMAL (10,2),
    cidade VARCHAR(100) NOT NULL,
    descricao TEXT
);

-- Tabela Eventos
CREATE TABLE eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    data_hora DATETIME NOT NULL,
    endereco VARCHAR(100) NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    id_destino INT NOT NULL,
    FOREIGN KEY (id_destino) REFERENCES destinos(id)
);

-- Relacionamento Evento <-> Atividade (n para n)
CREATE TABLE evento_atividades (
    id_evento INT,
    id_atividade INT,
    PRIMARY KEY (id_evento, id_atividade),
    FOREIGN KEY (id_evento) REFERENCES eventos(id),
    FOREIGN KEY (id_atividade) REFERENCES atividades(id)
);

-- Relacionamento Evento <-> Interesse (n para n)
CREATE TABLE evento_interesses (
    id_evento INT,
    id_interesse INT,
    PRIMARY KEY (id_evento, id_interesse),
    FOREIGN KEY (id_evento) REFERENCES eventos(id),
    FOREIGN KEY (id_interesse) REFERENCES interesses(id)
);

-- Tabela Pacote de Viagem
CREATE TABLE pacotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_destino INT NOT NULL,
    data_ida DATE NOT NULL,
    data_volta DATE NOT NULL,
    id_transporte INT NOT NULL,
    id_hospedagem INT NOT NULL,
    id_alimentacao INT NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    FOREIGN KEY (id_destino) REFERENCES destinos(id),
    FOREIGN KEY (id_transporte) REFERENCES transporte_para_cidade(id),
    FOREIGN KEY (id_hospedagem) REFERENCES hospedagem(id),
    FOREIGN KEY (id_alimentacao) REFERENCES alimentacoes(id)
);

-- Tabela Opções de Preferência
CREATE TABLE opcoes_preferencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria VARCHAR(50) NOT NULL,
    descricao VARCHAR(100) NOT NULL UNIQUE
);

-- Preferências do Usuário (n para n)
CREATE TABLE preferencias_usuario (
    id_usuario INT NOT NULL,
    id_opcao INT NOT NULL,
    PRIMARY KEY (id_usuario, id_opcao),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    FOREIGN KEY (id_opcao) REFERENCES opcoes_preferencia(id)
);

-- Histórico de Preferências
CREATE TABLE historico_preferencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_opcao INT NOT NULL,
    data_selecao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    FOREIGN KEY (id_opcao) REFERENCES opcoes_preferencia(id)
);

-- Histórico de Viagens
CREATE TABLE historico_viagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_destino INT NOT NULL,
    data_ida DATE NOT NULL,
    data_volta DATE NOT NULL,
    id_transporte INT,
    id_hospedagem INT,
    id_alimentacao INT,
    preco DECIMAL(10, 2),
    data_realizacao_inicio DATE,
    data_realizacao_fim DATE,
    status_viagem VARCHAR(50), -- Concluída, Cancelada, Em andamento
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    FOREIGN KEY (id_destino) REFERENCES destinos(id),
    FOREIGN KEY (id_transporte) REFERENCES transporte_para_cidade(id),
    FOREIGN KEY (id_hospedagem) REFERENCES hospedagem(id),
    FOREIGN KEY (id_alimentacao) REFERENCES alimentacoes(id)
);