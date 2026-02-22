import React, { useState } from 'react';
import { Stack, UnstyledButton, Group, Text, Box, Image, Collapse } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { 
  IconHome, 
  IconHomeFilled, 
  IconDeviceGamepad2, 
  IconChevronRight, 
  IconChevronDown 
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import classes from './Sidebar.module.css';

interface SidebarProps {
  expanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const GAMES = [
  { name: 'Chrono Cross', path: '/games/Chrono-Cross', icon: '/images/cc.ico' },
  { name: 'Final Fantasy X', path: '/games/Final-Fantasy-X', icon: '/images/ffx.ico' },
  { name: 'Persona 5', path: '/games/Persona-5', icon: '/images/p5r.ico' },
];

export function Sidebar({ expanded, onMouseEnter, onMouseLeave }: SidebarProps) {
  const location = useLocation();
  const [gamesOpened, { toggle: toggleGames, open: openGames }] = useDisclosure(false);

  // Auto-expand games list if a game is active
  const isGameActive = location.pathname.startsWith('/games');

  const handleMouseEnter = () => {
    onMouseEnter();
    if (isGameActive) openGames();
  };

  return (
    <Box 
      component="nav" 
      className={classes.sidebar} 
      data-expanded={expanded || undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Stack h="100%" gap="xs" px={expanded ? 'md' : 0} py="xl">
        <Stack gap="xs" style={{ flex: 1 }} justify="center">
          <SidebarLink
            to="/"
            icon={location.pathname === '/' ? <IconHomeFilled size={26} /> : <IconHome size={26} />}
            label="Home"
            active={location.pathname === '/'}
            expanded={expanded}
          />

          <Box>
            <UnstyledButton 
              className={classes.link} 
              onClick={toggleGames}
              onMouseEnter={openGames}
              data-active={isGameActive || undefined}
            >
              <Group gap="md" wrap="nowrap" style={{ width: '100%', justifyContent: expanded ? 'flex-start' : 'center' }}>
                <IconDeviceGamepad2 size={26} style={{ flexShrink: 0 }} />
                {expanded && (
                  <Group justify="space-between" style={{ flex: 1 }}>
                    <Text size="sm" fw={isGameActive ? 700 : 500}>Games</Text>
                    {gamesOpened ? <IconChevronDown size={14} opacity={0.5} /> : <IconChevronRight size={14} opacity={0.5} />}
                  </Group>
                )}
              </Group>
            </UnstyledButton>

            <Collapse in={expanded && gamesOpened}>
              <Stack gap={4} mt={4} pl={expanded ? 32 : 0}>
                {GAMES.map((game) => (
                  <UnstyledButton
                    key={game.path}
                    component={Link}
                    to={game.path}
                    className={classes.subLink}
                    data-active={location.pathname === game.path || undefined}
                  >
                    <Group gap="sm" wrap="nowrap" style={{ width: '100%', justifyContent: expanded ? 'flex-start' : 'center' }}>
                      <Image src={import.meta.env.BASE_URL + game.icon.slice(1)} w={24} h={24} style={{ flexShrink: 0 }} />
                      {expanded && <Text size="xs" fw={location.pathname === game.path ? 700 : 500}>{game.name}</Text>}
                    </Group>
                  </UnstyledButton>
                ))}
              </Stack>
            </Collapse>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  expanded: boolean;
}

function SidebarLink({ to, icon, label, active, expanded }: SidebarLinkProps) {
  return (
    <UnstyledButton
      component={Link}
      to={to}
      className={classes.link}
      data-active={active || undefined}
    >
      <Group gap="md" wrap="nowrap" style={{ width: '100%', justifyContent: expanded ? 'flex-start' : 'center' }}>
        <Box style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </Box>
        {expanded && <Text size="sm" fw={active ? 700 : 500}>{label}</Text>}
      </Group>
    </UnstyledButton>
  );
}
