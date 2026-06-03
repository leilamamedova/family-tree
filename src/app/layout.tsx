import './globals.css';
import ReactFlowProvider from '@/components/providers/ReactFlowProvider';
import ApolloProvider from '@/components/providers/ApolloProvider';

export const metadata = {
  title: 'FamTree',
  description: 'Family Tree Visualizer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ApolloProvider>
          <ReactFlowProvider>{children}</ReactFlowProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}
