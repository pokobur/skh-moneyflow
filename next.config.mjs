/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS || false;
const repo = 'sky-moneyflow';

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || (isGithubActions ? `/${repo}` : ''),
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || (isGithubActions ? `/${repo}/` : ''),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
