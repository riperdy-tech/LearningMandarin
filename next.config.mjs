/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: isGitHubPages ? "/LearningMandarin" : "",
  assetPrefix: isGitHubPages ? "/LearningMandarin/" : undefined
};

export default nextConfig;
