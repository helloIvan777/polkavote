import '../styles/globals.css';
import { Web3Provider } from '../context/Web3Context';

/**
 * PolkaVote App Entry Point
 * Wraps all pages with global styles and Web3 provider
 */
export default function App({ Component, pageProps }) {
  return (
    <Web3Provider>
      <Component {...pageProps} />
    </Web3Provider>
  );
}
