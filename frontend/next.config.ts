import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8080/api/v1/:path*',
        basePath: false,
      }
    ]
  },

  async headers() {
    return [
      {
        // Change the source pattern to match your rewrite rule
        source: '/api/v1/:path*',
        headers: [
          { 
            key: 'Access-Control-Allow-Credentials', 
            value: 'true' 
          },
          { 
            key: 'Access-Control-Allow-Origin', 
            value: 'http://localhost:3000' // Replace with your frontend URL
          },
          { 
            key: 'Access-Control-Allow-Methods', 
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT,HEAD' 
          },
          { 
            key: 'Access-Control-Allow-Headers', 
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400' // 24 hours
          }
        ],
      }
    ]
  },
  
  // Add this to ensure proper handling of CORS
  async redirects() {
    return [];
  },
};

export default nextConfig;