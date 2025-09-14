
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
            {
                protocol: 'https',
                hostname: 'media0.giphy.com',
            },
            {
                protocol: 'https',
                hostname: 'api.dicebear.com',
            }
        ],
    },
};

export default nextConfig;
