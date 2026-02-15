import React from 'react';
import { AppShell, Group, Title, Anchor, Container, Breadcrumbs } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { GAMES_ROUTE_SEGMENT, HIDDEN_BREADCRUMB_SEGMENTS, NOTES_ROUTE_SEGMENT } from '../utils/constants';
import { extractTitleFromPath } from '../utils/pathUtils';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  return (
    <AppShell
      header={{ height: 50 }}
      padding="md"
    >
      <AppShell.Header
        style={{
          borderBottom: '1px solid var(--mantine-color-dark-4)',
          backgroundColor: 'var(--mantine-color-dark-8)',
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Breadcrumbs 
              separator="/"
              separatorMargin="xs"
              style={{ flexWrap: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              <Anchor component={Link} to="/" underline="never" key="home">
                <Title order={4} style={{ fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                  NB Speedrun Notes
                </Title>
              </Anchor>
              
              {location.pathname.split('/').filter(Boolean).map((segment, index, array) => {
                // Skip 'games' segment and hidden intermediate folders
                if (
                  segment.toLowerCase() === GAMES_ROUTE_SEGMENT ||
                  HIDDEN_BREADCRUMB_SEGMENTS.includes(segment.toLowerCase())
                ) {
                  return null;
                }

                const to = `/${array.slice(0, index + 1).join('/')}`;
                
                // Format title using utility
                const title = extractTitleFromPath(segment);

                const isLast = index === array.length - 1;
                
                // Heuristic: 'Notes' folder usually doesn't have an index page
                const isNonNavigable = segment.toLowerCase() === NOTES_ROUTE_SEGMENT;

                if (isLast || isNonNavigable) {
                  return (
                    <Title 
                      key={to} 
                      order={4} 
                      style={{ 
                        fontWeight: isLast ? 700 : 400, 
                        letterSpacing: '-0.02em', 
                        whiteSpace: 'nowrap', 
                        opacity: isLast ? 1 : 0.5,
                        color: isLast ? 'var(--mantine-color-white)' : 'var(--mantine-color-dimmed)'
                      }}
                    >
                      {title}
                    </Title>
                  );
                }

                return (
                  <Anchor component={Link} to={to} underline="never" key={to}>
                    <Title order={4} style={{ fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap', opacity: 0.8 }}>
                      {title}
                    </Title>
                  </Anchor>
                );
              })}
            </Breadcrumbs>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main style={{ backgroundColor: 'var(--mantine-color-dark-7)' }}>
        <Container size="md" py="xl">
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default Layout;
