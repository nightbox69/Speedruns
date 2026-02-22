import React, { useState } from 'react';
import { AppShell, Container } from '@mantine/core';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  return (
    <AppShell
      navbar={{
        width: 70,
        breakpoint: 'sm',
      }}
      padding="md"
      transitionDuration={200}
      transitionTimingFunction="ease"
    >
      <AppShell.Navbar p={0} style={{ border: 'none' }}>
        <Sidebar 
          expanded={expanded} 
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
        />
      </AppShell.Navbar>

      <AppShell.Main 
        style={{ 
          backgroundColor: 'var(--mantine-color-dark-8)',
          transition: 'padding-left 0.2s ease',
        }}
      >
        <Container size="md" py="xl">
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default Layout;
