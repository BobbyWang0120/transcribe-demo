/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.devtool = 'source-map'
    }
    return config
  },
  api: {
    bodyParser: {
        sizeLimit: '69mb'
    }
  }
}

module.exports = nextConfig 