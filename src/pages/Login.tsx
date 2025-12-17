import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useOAuth } from '@clerk/clerk-expo';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const googleOAuth = useOAuth({ strategy: 'oauth_google' });
  const githubOAuth = useOAuth({ strategy: 'oauth_github' });

  const handleOAuth = async (oauth: any) => {
    try {
      const { createdSessionId, setActive } =
        await oauth.startOAuthFlow();

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('Erro no login', err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo / Título */}
      <View style={styles.header}>
        <Ionicons name="cube-outline" size={64} color="#007AFF" />
        <Text style={styles.title}>Paraíso Gás</Text>
        <Text style={styles.subtitle}>
          Controle de estoque, entregas e faturamento
        </Text>
      </View>

      {/* Botões */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.google]}
          onPress={() => handleOAuth(googleOAuth)}
        >
          <Ionicons name="logo-google" size={20} color="#fff" />
          <Text style={styles.buttonText}>Entrar com Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.github]}
          onPress={() => handleOAuth(githubOAuth)}
        >
          <Ionicons name="logo-github" size={20} color="#fff" />
          <Text style={styles.buttonText}>Entrar com GitHub</Text>
        </TouchableOpacity>
      </View>

      {/* Rodapé */}
      <Text style={styles.footer}>
        Acesso restrito a usuários autorizados
      </Text>
    </View>
  );
}

/* ===============================
   Styles
================================ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 12,
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  buttons: {
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 10,
  },
  google: {
    backgroundColor: '#DB4437',
  },
  github: {
    backgroundColor: '#24292E',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 12,
    color: '#8E8E93',
  },
});
