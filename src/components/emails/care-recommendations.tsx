import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';

interface CareRecommendationsProps {
  userName: string;
  grassType: string;
  season: string;
  recommendations: Array<{
    title: string;
    description: string;
    importance: 'essential' | 'recommended' | 'optional';
  }>;
  products?: Array<{
    name: string;
    description: string;
    purpose: string;
  }>;
}

export default function CareRecommendations({
  userName,
  grassType,
  season,
  recommendations,
  products,
}: CareRecommendationsProps) {
  return (
    <Html>
      <Head />
      <Preview>Seasonal lawn care recommendations for your {grassType}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Lawn Care Recommendations</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            Here are your personalized {season} care recommendations for your{' '}
            {grassType} lawn:
          </Text>

          <div style={recommendationsList}>
            {recommendations.map((rec, index) => (
              <div key={index} style={recommendationCard}>
                <Text style={recommendationTitle}>
                  <span style={importanceBadge(rec.importance)}>
                    {rec.importance}
                  </span>
                  {rec.title}
                </Text>
                <Text style={recommendationDescription}>{rec.description}</Text>
              </div>
            ))}
          </div>

          {products && products.length > 0 && (
            <>
              <Heading style={h2}>Recommended Products</Heading>
              <div style={productsList}>
                {products.map((product, index) => (
                  <div key={index} style={productCard}>
                    <Text style={productTitle}>{product.name}</Text>
                    <Text style={productDescription}>{product.description}</Text>
                    <Text style={productPurpose}>
                      <strong>Purpose:</strong> {product.purpose}
                    </Text>
                  </div>
                ))}
              </div>
            </>
          )}

          <Text style={text}>
            Remember to always check the weather forecast before applying any
            treatments or performing maintenance tasks.
          </Text>
          <Text style={footer}>
            Happy lawn care!
            <br />
            Your LawnSync Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.1',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '1.1',
  margin: '32px 0 16px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const recommendationsList = {
  margin: '24px 0',
};

const recommendationCard = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
};

const recommendationTitle = {
  ...text,
  fontWeight: '600',
  margin: '0 0 8px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const recommendationDescription = {
  ...text,
  margin: '8px 0 0',
};

const importanceBadge = (importance: 'essential' | 'recommended' | 'optional') => ({
  backgroundColor:
    importance === 'essential'
      ? '#fee2e2'
      : importance === 'recommended'
      ? '#fef3c7'
      : '#f3f4f6',
  color:
    importance === 'essential'
      ? '#991b1b'
      : importance === 'recommended'
      ? '#92400e'
      : '#374151',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: '500',
  textTransform: 'capitalize' as const,
});

const productsList = {
  margin: '16px 0',
};

const productCard = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
};

const productTitle = {
  ...text,
  fontWeight: '600',
  margin: '0 0 8px',
};

const productDescription = {
  ...text,
  margin: '8px 0',
};

const productPurpose = {
  ...text,
  color: '#6b7280',
  fontSize: '14px',
  margin: '8px 0 0',
};

const footer = {
  ...text,
  color: '#6b7280',
  fontSize: '14px',
  marginTop: '32px',
};