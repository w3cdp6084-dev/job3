import '../styles/globals.css'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      {/* ここに共通のヘッダーやフッターがあれば挿入 */}
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
