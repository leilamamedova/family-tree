import './globals.css';
import ReactFlowProvider from '@/components/providers/ReactFlowProvider';
import ApolloProvider from '@/components/providers/ApolloProvider';
import { GlobalLoadingProvider } from '@/components/providers/GlobalLoadingProvider';

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
          <GlobalLoadingProvider>
            <ReactFlowProvider>{children}</ReactFlowProvider>
          </GlobalLoadingProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}
