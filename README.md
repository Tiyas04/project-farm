# Project Farm

An e-commerce platform for farm supplies and agricultural products. Built with Next.js, this application allows users to browse, purchase, and manage farm-related products including fertilizers, pesticides, seeds, and equipment.

## Features

- **Product Catalog**: Browse a wide range of farm supplies with detailed descriptions and images
- **User Authentication**: Secure login and registration system with JWT tokens
- **Shopping Cart**: Add products to cart, manage quantities, and proceed to checkout
- **Product Details**: View comprehensive product information and features
- **Image Management**: Cloudinary integration for product image uploads and storage
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **Database Integration**: MongoDB with Mongoose for data persistence

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT), bcryptjs for password hashing
- **Image Storage**: Cloudinary
- **Development**: ESLint, TypeScript

## Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (version 18 or higher)
- npm, yarn, pnpm, or bun
- MongoDB database (local or cloud instance)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd project-farm
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Usage

- **Home Page**: View featured products and navigate the site
- **Products Page**: Browse all available products
- **Product Details**: Click on any product to view detailed information
- **Cart**: Add products to cart and manage your shopping list
- **Checkout**: Complete your purchase
- **Profile**: Manage your account information
- **Authentication**: Sign up or log in to access additional features

## Project Structure

```
project-farm/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── cart/           # Shopping cart page
│   │   ├── checkout/       # Checkout page
│   │   ├── products/       # Products listing and detail pages
│   │   ├── profile/        # User profile page
│   │   └── globals.css     # Global styles
│   ├── components/         # Reusable React components
│   ├── context/            # React context providers
│   ├── lib/                # Utility functions and configurations
│   └── models/             # MongoDB models
├── public/                 # Static assets
└── package.json            # Project dependencies and scripts
```

## API Routes

The application includes the following API endpoints:

- `/api/auth/login` - User authentication
- `/api/auth/register` - User registration
- `/api/products` - Product management
- `/api/cart` - Shopping cart operations
- `/api/checkout` - Order processing

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Product images sourced from Unsplash
- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
