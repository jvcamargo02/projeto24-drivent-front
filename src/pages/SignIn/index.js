import { useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import GithubButton from 'react-github-login-button';
import axios from 'axios';
import qs from 'query-string';
import dotenv from 'dotenv';
dotenv.config();

import AuthLayout from '../../layouts/Auth';

import Input from '../../components/Form/Input';
import Button from '../../components/Form/Button';
import Link from '../../components/Link';
import { Row, Title, Label } from '../../components/Auth';

import EventInfoContext from '../../contexts/EventInfoContext';
import UserContext from '../../contexts/UserContext';

import useSignIn from '../../hooks/api/useSignIn';

let tokenGlobal = 0;

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { loadingSignIn, signIn } = useSignIn();

  const { eventInfo } = useContext(EventInfoContext);
  const { setUserData } = useContext(UserContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (tokenGlobal != 0) {
      setUserData(localStorage.getItem('token'));
    }
  });

  async function submit(event) {
    event.preventDefault();

    try {
      const userData = await signIn(email, password);
      setUserData(userData);
      localStorage.setItem('token', userData.token);
      toast('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      toast('Não foi possível fazer o login!');
    }
  }

  function redirectToGithub() {
    const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
    const params = {
      response_type: 'code',
      scope: 'user public_repo',
      client_id: 'd97594e864f822a80ab2',
      redirect_uri: 'http://localhost:3000/dashboard/subscription',
      state: 'drivent'
    };

    const queryStrings = qs.stringify(params);
    console.log(queryStrings);
    const authorizationUrl =`${GITHUB_AUTH_URL}?${queryStrings}`;
    window.location.href = authorizationUrl;
  }

  return (
    <AuthLayout background={eventInfo.backgroundImageUrl}>
      <Row>
        <img src={eventInfo.logoImageUrl} alt="Event Logo" width="60px" />
        <Title>{eventInfo.title}</Title>
      </Row>
      <Row>
        <Label>Entrar</Label>
        <form onSubmit={submit}>
          <Input label="E-mail" type="text" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Senha"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" color="primary" fullWidth disabled={loadingSignIn}>
            Entrar
          </Button>
        </form>
      </Row>
      <GithubButton
        onClick={() => {
          redirectToGithub();
        }}
      />
      <Row>
        <Link to="/enroll">Não possui login? Inscreva-se</Link>
      </Row>
    </AuthLayout>
  );
}

window.onload = async() => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (code) {
    try {
      const response = await axios.post('http://localhost:4000/auth/sign-in/github', {
        code
      });
      const token = response.data;
      alert('logged in with GitHub');
      localStorage.setItem('token', token.token);
      tokenGlobal = 1;
      window.location.replace('http://localhost:3000/dashboard/subscription');
    } catch (err) {
      alert('GitHub login failed');
      console.log('err', err);
    }
  }
};

/*preciso setUserData(token), mas não consigo nessa última função. via alternativa - 
  fazer todos os requests autenticados pegarem o token do local storage ao invés do
  userData context. ou simplesmente conseguir setUserData(token) nessa última função,
  aí todo mundo pega do context pra autenticar e boas. */
