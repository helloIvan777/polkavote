import '../styles/globals.css';

/**
 * PolkaVote App Entry Point
 * Wraps all pages with global styles and providers
 */
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
