import { useState } from 'react';
import { Loader, Center, Text, Anchor, Container } from '@mantine/core';

interface PdfPageProps {
  filePath: string;
}

function PdfPage({ filePath }: PdfPageProps) {
  const [loading, setLoading] = useState(true);
  const fullPath = `${import.meta.env.BASE_URL.replace(/\/$/, '')}${filePath}`;

  return (
    <Container size="xl" h="calc(100vh - 100px)" p={0} style={{ display: 'flex', flexDirection: 'column' }}>
      {loading && (
        <Center style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
          <Loader size="xl" />
        </Center>
      )}
      
      <object
        data={fullPath}
        type="application/pdf"
        width="100%"
        height="100%"
        style={{ border: 'none', flex: 1, zIndex: 1, minHeight: '80vh' }}
        onLoad={() => setLoading(false)}
      >
        <Center h="100%">
          <Text>
            Your browser does not support inline PDFs. 
            <Anchor href={fullPath} download ml="xs">
              Click here to download the PDF
            </Anchor>
          </Text>
        </Center>
      </object>
    </Container>
  );
}

export default PdfPage;
