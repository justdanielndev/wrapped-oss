# HC Wrapped 2025

A "Wrapped" style site for Hack Club members to see their year in review!!!!

It grabs data from Slack, Hackatime and the YSWS db to make a cool slideshow summary of your year in Hack Club.

## Features

- **Slack Integration**
- **Waitlist** (to avoid the garbage rate limits Slack has)
- **Data** (wow!)
  - Total messages sent
  - Top channels
  - DM statistics
  - Confessions & meta messages
  - YSWS projects submitted
  - Hackatime stats
- **Shareable Summary** (lets you take a ss at the end)

## Tech Stack

- Next.js
- TypeScript
- Tailwind
- Appwrite
- Slack API, Wakatime API
- Framer Motion

## Getting Started

### Prerequisites

- Node.js (v20 or later recommended)
- pnpm
- A Slack App (and preferrably a bunch more, lol) with appropriate permissions
- An Appwrite project

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd wrapped
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Environment Setup:**

   Add this to a `.env.local` file:

   ```env
   SLACK_CLIENT_ID=your_slack_client_id
   SLACK_CLIENT_SECRET=your_slack_client_secret
   
   APPWRITE_API_KEY=your_appwrite_api_key
   
   # Note: The Appwrite Endpoint, Project ID, Database ID, and Collection ID 
   # are currently hardcoded in src/lib/waitlist.ts together with redirect url (I'm lazy, sue me).
   ```

4. **Run the dev server:**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.