/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.classistatic.de",
        pathname: "/api/v1/**",
      },
    ],
  },
};

export default nextConfig;
