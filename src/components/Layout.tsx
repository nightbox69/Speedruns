import React from 'react';
import { AppShell, Group, Title, Anchor, Container } from '@mantine/core';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '1rem',
          paddingRight: '1rem',
        }}
      >
        <Group justify="space-between" style={{ width: '100%' }}>
          <Anchor component={Link} to="/" underline="never">
            <Title order={3} style={{ color: 'var(--mantine-color-blue-4)' }}>
              NB Speedrun Notes
            </Title>
          </Anchor>
          <Group gap="md">
            <Anchor component={Link} to="/games/Chrono-Cross" size="sm">
              Chrono Cross
            </Anchor>
            <Anchor component={Link} to="/games/Final-Fantasy-X" size="sm">
              FFX
            </Anchor>
            <Anchor component={Link} to="/games/Persona-5" size="sm">
              Persona 5
            </Anchor>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" py="md">
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default Layout;
