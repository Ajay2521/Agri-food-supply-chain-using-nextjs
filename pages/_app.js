import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (

    <body  className='h-screen bg-gradient-to-tl from-blue-500 via-purple-400 to-sky-400'>
    <div>

      <nav className='border-b p-6'>

        <Link href="/">
          <a className='text-4xl font-bold text-gray-200 hover:text-blue-700 hover:text-5xl hover:font-semibold'>Agriculture Food Supply Chain Market</a>
        </Link>

        <br /><br />

        <div className='flex'></div>

        <Link href="/">
          <a className='mr-4 font-semibold text-gray-200 text-xl hover:text-blue-700 hover:text-3xl hover:font-semibold'>Home</a>
        </Link>

        <Link href="/create-product">
          <a className='mr-6 font-semibold text-gray-200 text-xl hover:text-blue-700 hover:text-3xl hover:font-semibold'>Sell Product</a>
        </Link>

        <Link href="/my-assets">
          <a className='mr-6 font-semibold text-gray-200 text-xl hover:text-blue-700 hover:text-3xl hover:font-semibold'>My Assets</a>
        </Link>

        <Link href="/creator-dashboard">
          <a className='mr-6 font-semibold text-gray-200 text-xl hover:text-blue-700 hover:text-3xl hover:font-semibold'>Dashboard</a>
        </Link>
      </nav>

    <Component {...pageProps} />

    </div>
    </body>
  )
}

export default MyApp
