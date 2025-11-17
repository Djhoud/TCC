// Arquivo: backend/routes/authRoutes.ts
import bcrypt from 'bcryptjs';
import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { db } from '../database';

// Obtenha a chave secreta JWT das variáveis de ambiente.
// É crucial que `process.env.JWT_SECRET` esteja definido.
// Em ambiente de produção, REMOVA o fallback 'fallback_secret_se_nao_encontrar_no_env'.
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_se_nao_encontrar_no_env';

const router = Router();

// Interface para a resposta da API do Google
interface GoogleUserInfo {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email: string;
  email_verified: boolean;
}

// Rota de Login com Google
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      res.status(400).json({ message: 'Token de acesso é obrigatório' });
      return;
    }

    // Verificar token com Google
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!googleResponse.ok) {
      res.status(400).json({ message: 'Falha ao validar token com Google' });
      return;
    }
    
    const googleUser = await googleResponse.json() as GoogleUserInfo;
    
    if (!googleUser.email) {
      res.status(400).json({ message: 'Token do Google inválido' });
      return;
    }
    
    // Verificar se usuário já existe
    const [existingUsers]: any = await db.query(
      'SELECT id, nome, email, documento, preferencias_completas, foto FROM usuarios WHERE email = ?', 
      [googleUser.email]
    );
    
    let userId: number;
    let userData: any;

    if (existingUsers.length === 0) {
      // Criar novo usuário
      const [result]: any = await db.query(
        'INSERT INTO usuarios (nome, email, foto, google_id, preferencias_completas) VALUES (?, ?, ?, ?, ?)',
        [googleUser.name, googleUser.email, googleUser.picture || null, googleUser.sub, false]
      );
      
      userId = result.insertId;
      userData = {
        id: userId,
        nome: googleUser.name,
        email: googleUser.email,
        documento: null,
        foto: googleUser.picture || null,
        preferencias_completas: false
      };
    } else {
      // Usuário já existe
      userId = existingUsers[0].id;
      userData = existingUsers[0];
      
      // Atualizar dados do Google se necessário
      if (!userData.foto && googleUser.picture) {
        await db.query(
          'UPDATE usuarios SET foto = ?, google_id = ? WHERE id = ?',
          [googleUser.picture, googleUser.sub, userId]
        );
        userData.foto = googleUser.picture;
      }
    }

    // Gerar JWT
    const token = jwt.sign({ id: userId }, JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      message: 'Login com Google bem-sucedido',
      token: token,
      userId: userId,
      name: userData.nome,
      email: userData.email,
      cpf: userData.documento,
      photo: userData.foto,
      preferenciasCompletas: userData.preferencias_completas
    });

  } catch (error) {
    console.error('Erro no login com Google:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

// Rota de Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { email, senha } = req.body;
    try {
        // Seleciona também o status de preferencias_completas
        const [rows]: any = await db.query('SELECT id, nome, email, senha, preferencias_completas FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) {
            res.status(401).json({ message: 'Email ou senha incorretos' });
            return;
        }
        const usuario = rows[0];

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            res.status(401).json({ message: 'Email ou senha incorretos' });
            return;
        }

        // Gerar JWT após login bem-sucedido
        const token = jwt.sign({ id: usuario.id }, JWT_SECRET, {
            expiresIn: '1d', // Token expira em 1 dia (você pode ajustar)
        });

        res.status(200).json({
            message: 'Login bem-sucedido',
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            documento: usuario.documento, // Inclua outros campos que você tenha
            preferenciasCompletas: usuario.preferencias_completas, // CORRIGIDO: 'preferencias_completas'
            token: token, // Envie o token JWT
        });

    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
});


// Rota de Registro
router.post('/register', async (req: Request, res: Response) => {
    const { nome, email, senha, documento, id_tipo_documento } = req.body;

    if (!nome || !email || !senha) {
        res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
        return;
    }

    try {
        const [existingUsers]: any = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            res.status(409).json({ message: 'Conta já existente com este email.' });
            return;
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(senha, saltRounds); // CORRIGIDO: 'saltRounds'

        // Certifique-se de que a query INSERT corresponda aos campos que você está enviando.
        // Adicionei 'documento', 'id_tipo_documento' e 'preferencias_completas'
        const [result]: any = await db.query(
            'INSERT INTO usuarios (nome, email, senha, documento, id_tipo_documento, preferencias_completas) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, email, hashedPassword, documento || null, id_tipo_documento || null, false] // Novos usuários sempre iniciam com preferencias_completas = false
        );

        const userId = result.insertId;

        // Gerar JWT após registro bem-sucedido
        const token = jwt.sign({ id: userId }, JWT_SECRET, {
            expiresIn: '1d', // Token expira em 1 dia
        });

        res.status(201).json({
            message: 'Usuário cadastrado com sucesso!',
            userId: userId,
            email: email,
            preferenciasCompletas: false, // Novo usuário sempre terá false inicialmente
            token: token, // Envie o token JWT
        });

    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ message: 'Erro interno no servidor ao cadastrar usuário.' });
    }
});

export default router;