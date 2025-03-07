# Restaurant Management System Prototype

A comprehensive restaurant management prototype that includes features for owners and managers to efficiently run restaurant operations.

## Features

### User Access Management
- Owner and Manager separate login portals
- Role-based access control
- Secure authentication system
- Password recovery functionality

### Dashboard Overview
- **Owner Dashboard**: Financial metrics, multi-location performance, revenue analytics, profit margins, and business growth trends
- **Manager Dashboard**: Daily operations metrics, real-time order status, staff attendance, today's reservations, and inventory alerts

### Order Management
- Real-time order tracking
- Order status updates
- Kitchen display system
- Order history and categorization (Dine-in, Takeout, Delivery)
- Custom order notes and modification capability

### Table Management
- Interactive floor plan
- Table status tracking (Available, Occupied, Reserved)
- Table capacity information
- Reservation management
- Section assignment and custom table layouts

### Menu Management
- Menu item creation/editing
- Category management
- Pricing controls
- Item availability toggle
- Special/seasonal items
- Item details and popularity tracking

### Inventory Management
- Stock level tracking
- Low stock alerts
- Inventory valuation
- Supplier information
- Reorder points

### Staff Management
- Employee profiles
- Shift scheduling
- Time tracking
- Role assignment
- Staff attendance

### Reservation System
- Reservation booking
- Reservation calendar
- Table assignment
- Special requests handling

### Analytics & Reporting
- Sales analytics
- Customer behavior analysis
- Popular items tracking
- Revenue forecasting

## Technical Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Database**: Prisma ORM with SQLite (can be upgraded to PostgreSQL or MySQL for production)
- **Authentication**: NextAuth.js for secure user authentication
- **State Management**: React Hooks
- **UI Components**: Custom components with Tailwind CSS
- **Charts & Visualization**: Chart.js

## Getting Started

### Prerequisites

- Node.js (v14.0 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/restaurant-management.git
   cd restaurant-management
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Set up the database:
   ```
   npx prisma generate
   npx prisma db push
   ```

4. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
restaurant-management/
├── app/                  # Next.js App Router pages
│   ├── dashboard/        # Dashboard pages for owner and manager
│   ├── login/            # Authentication pages
│   ├── tables/           # Table management pages
│   ├── orders/           # Order management pages
│   └── ...
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   ├── lib/              # Utility functions and shared code
│   └── ...
├── package.json
└── README.md
```

## Demo

This is a prototype version with mock data for demonstration purposes. In a production environment, you would connect to real data sources and implement complete business logic.

## License

[MIT](LICENSE) 