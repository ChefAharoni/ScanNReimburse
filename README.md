# ScanNReimburse

ScanNReimburse is a modern web application that helps users manage and track event expenses by scanning and processing receipts. Built with Next.js and TypeScript, it provides a seamless experience for uploading, processing, and managing receipts for various events.

## Features

- **Event Management**

  - Create and manage multiple events
  - Track event details and total expenses
  - View event-specific receipt collections

- **Receipt Processing**

  - Upload receipts in various formats (PDF, JPG, JPEG, PNG)
  - Automatic receipt data extraction
  - Categorize items as Food or Drinks
  - Manual item entry and editing
  - Download original receipt files

- **Expense Tracking**
  - View total expenses per event
  - Track individual item costs
  - Categorize expenses
  - Download processed receipt data

## Tech Stack

- **Frontend**

  - Next.js 14
  - React
  - TypeScript
  - Tailwind CSS

- **Backend**
  - Next.js API Routes
  - File system storage
  - JSON data persistence

## Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ChefAharoni/ScanNReimburse
   cd ScanNReimburse
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create required directories:
   ```bash
   mkdir -p data uploads
   ```

## Running the Application

1. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Project Structure

```
ScanNReimburse/
├── app/
│   ├── api/              # API routes
│   ├── components/       # React components
│   ├── lib/             # Utility functions
│   └── types/           # TypeScript types
├── data/                # JSON data storage
├── uploads/             # Receipt file storage
└── public/              # Static assets
```

## API Endpoints

- `GET /api/events` - List all events
- `POST /api/events` - Create a new event
- `GET /api/events/[id]` - Get event details
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event
- `GET /api/events/[id]/receipts` - List event receipts
- `POST /api/events/[id]/receipts` - Upload new receipt
- `GET /api/events/[id]/receipts/[receiptId]` - Get receipt details
- `PUT /api/events/[id]/receipts/[receiptId]` - Update receipt
- `DELETE /api/events/[id]/receipts/[receiptId]` - Delete receipt
- `GET /api/events/[id]/receipts/[receiptId]/download` - Download receipt file

## Data Storage

- Event and receipt data is stored in `data/events.json`
- Receipt files are stored in the `uploads` directory
- All data is persisted locally

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for GPT-4 Vision API
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
