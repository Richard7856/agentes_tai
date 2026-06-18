/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Salida standalone para una imagen Docker ligera en producción.
  output: "standalone",
};

export default nextConfig;
