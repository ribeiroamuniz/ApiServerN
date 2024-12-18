const express = require('express');
const axios = require('axios');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const port = 3000; // Usando uma porta única para o servidor

app.use(express.json());
app.use(cors());

// Configuração do banco de dados
const connection = mysql.createConnection({
  host: 'mysql.infocimol.com.br',
  user: 'infocimol28',
  password: 'angelo1',
  database: 'infocimol28',
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados.');
});

// Rota de teste para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.send('API integrada (GPS e Backend) está funcionando!');
});

// Endpoint para enviar dados GPS
app.post('/locations', async (req, res) => {
  const { latitude, longitude } = req.body;
  
  try {
    // Agora estamos apenas processando os dados localmente
    // Você pode salvar esses dados no banco ou realizar alguma ação adicional
    console.log(`Recebido dados GPS: Latitude = ${latitude}, Longitude = ${longitude}`);
    
    // Se precisar salvar esses dados no banco de dados, adicione aqui
    connection.query(
      'INSERT INTO location (latitude, longitude) VALUES (?, ?)',
      [latitude, longitude],
      (error, results) => {
        if (error) {
          console.error('Erro ao salvar dados no banco:', error);
          return res.status(500).json({ error: 'Erro ao salvar dados.' });
        }
        res.json({ status: 'Dados GPS salvos com sucesso' });
      }
    );
    
  } catch (error) {
    console.error('Erro ao processar dados GPS:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de cadastro de usuário
app.post('/api/register', (req, res) => {
  const { nome, email, senha, endereco, data_nascimento } = req.body;

  bcrypt.hash(senha, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Erro ao criptografar a senha:', err);
      return res.status(500).json({ error: 'Erro ao criptografar a senha.' });
    }

    connection.query(
      'INSERT INTO usuario (nome, email, senha, endereco, data_nascimento) VALUES (?, ?, ?, ?, ?)',
      [nome, email, hashedPassword, endereco, data_nascimento],
      (error, results) => {
        if (error) {
          console.error('Erro ao registrar o usuário:', error);
          return res.status(500).json({ error: 'Erro ao registrar o usuário.' });
        }
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
      }
    );
  });
});

// Endpoint de login de usuário
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  console.log('Recebido no login:', { email, senha });

  connection.query('SELECT * FROM usuario WHERE email = ?', [email], (error, results) => {
    if (error) {
      console.error('Erro ao buscar o usuário:', error);
      return res.status(500).json({ error: 'Erro ao buscar o usuário.' });
    }
    if (results.length === 0) {
      console.log('Usuário não encontrado!');
      return res.status(401).json({ message: 'Usuário não encontrado!' });
    }
    const user = results[0];

    console.log('Senha armazenada:', user.senha);

    bcrypt.compare(senha, user.senha, (err, isMatch) => {
      if (err) {
        console.error('Erro ao comparar a senha:', err);
        return res.status(500).json({ error: 'Erro ao comparar a senha.' });
      }
      console.log('Senha corresponde:', isMatch);

      if (!isMatch) {
        return res.status(401).json({ message: 'Senha incorreta!' });
      }
      const token = jwt.sign({ id: user.userid }, 'seu_segredo', { expiresIn: '1h' });
      console.log('Login bem-sucedido, token gerado:', token);
      res.json({ token });
    });
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
