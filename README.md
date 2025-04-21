# ScanNReimburse

A modern web application for scanning, organizing, and managing receipts for reimbursement purposes.

## Features

- 📸 Upload receipts via camera or file upload
- 🤖 AI-powered receipt parsing and categorization
- 📁 Organize receipts into event folders
- 📊 Generate detailed reports and summaries
- 📱 Mobile-friendly responsive design
- 🌙 Dark theme UI

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenAI API (GPT-4 Vision)
- Headless UI
- React Webcam

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/scannreimburse.git
   cd scannreimburse
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_MAX_RECEIPTS_PER_EVENT=40
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
scannreimburse/
├── app/
│   ├── api/           # API routes
│   ├── components/    # React components
│   ├── lib/          # Utility functions
│   ├── types/        # TypeScript types
│   └── utils/        # Helper functions
├── data/             # Local data storage
├── uploads/          # Receipt image storage
└── public/           # Static assets
```

## Features in Detail

### Receipt Processing

- Supports JPG, PNG, and PDF formats
- AI-powered OCR and data extraction
- Automatic item categorization
- Total amount validation

### Event Management

- Create and organize event folders
- Track receipt counts and totals
- Generate CSV and PDF reports
- Edit and manage receipt data

### Security

- Secure file storage
- Environment variable protection
- HTTPS encryption
- GDPR compliance

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for GPT-4 Vision API
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
