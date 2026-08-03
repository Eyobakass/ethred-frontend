# Ethred Frontend Architecture & Feature Documentation

This document provides a comprehensive overview of the Ethred Real Estate platform's frontend ecosystem. Designed for scale, performance, and immersive user experiences, the frontend leverages modern web technologies to deliver a robust bilingual (English/Amharic) application with deeply integrated 3D virtual tours.

## 🏗️ Architectural Overview

The frontend is built as a highly modular, server-side rendered (SSR) application, prioritizing both search engine optimization (SEO) and dynamic client-side interactivity.

### Tech Stack
* **Framework:** Next.js 15 (App Router)
* **Language:** TypeScript (Strict Mode)
* **Styling:** Tailwind CSS v4 (with custom `@theme` configuration for a bespoke Gold palette)
* **State Management:** Zustand (with persist middleware for SSR-safe local storage)
* **3D Engine:** Pannellum (WebGL-based panoramic viewer)
* **Routing Strategy:** Path-based localization (`/[lang]/...`)

### Core Design Principles
1. **Bilingual First:** All UI components, route structures, and API payloads seamlessly support English (`en`) and Amharic (`am`). Language context is derived entirely from the URL path, making pages infinitely linkable and shareable.
2. **SSR Resilience:** Global state (like authentication tokens and UI filters) is carefully decoupled from the initial server render to prevent hydration mismatches and module initialization crashes. 
3. **Immersive 3D Experience:** The property viewer isn't just an iframe; it's a deeply integrated React component that manages WebGL contexts cleanly, avoiding memory leaks when navigating between scenes or properties.

---

## 🗺️ Page Structure & Navigation

The application is organized into distinct domains serving different user roles: Buyers, Sellers, Agencies, and Administrators.

### Public Discovery
* **`/` (Home):** A dynamic landing page featuring a hero search, platform statistics, a curated grid of featured properties, and clear calls-to-action for both buyers and sellers.
* **`/properties` (Search & Filter):** The primary discovery engine. Features a sticky sidebar for complex filtering (location, price, bedrooms, 3D tour availability) and updates results instantly via URL query parameters.
* **`/properties/[id]` (Property Details):** A comprehensive listing page showcasing high-quality media, property specifications, agent details, and a seamless entry point into the virtual tour.
* **`/properties/compare`:** A side-by-side comparison tool allowing users to evaluate up to three properties simultaneously across various metrics.
* **`/agencies`:** A directory of verified real estate agencies operating on the platform.

### Immersive 3D Tours
* **`/properties/[id]/tour`:** The flagship feature. A full-screen immersive experience powered by Pannellum. It includes an interactive floor plan overlay (`FloorPlanOverlay`) and a scene navigation toolbar (`SceneSelectorToolbar`), allowing users to visually walk through a property.

### Authentication Flow
* **`/auth/login`:** Secure entry point supporting role-based redirection.
* **`/auth/register`:** Multi-step onboarding for new users.
* **`/auth/verify-otp`:** A highly polished 6-digit SMS verification interface featuring auto-focus, backspace navigation, and clipboard paste support.

### Buyer Domain
* **`/buyer/favorites`:** A personalized dashboard where users can save, manage, and quickly access properties they are interested in.

### Seller/Agency Domain
* **`/seller/dashboard`:** An analytics and management hub for property owners and agents to track listing performance.
* **`/seller/listings/create`:** A robust, multi-step creation wizard. It handles detailed property metadata, dynamic Ethiopian location hierarchies (Region -> Sub-city -> Woreda), and transitions directly into the media upload phase.
* **`/seller/listings/[id]/tour-editor`:** The Hotspot Authoring tool. Sellers can upload panoramic images, place interactive navigational pins (hotspots), link them to other rooms (scenes), and visually construct a complete 3D scene graph.
* **`/seller/promotions`:** A monetization gateway allowing sellers to purchase visibility boosts (Basic, Premium, Elite) using localized payment methods (Telebirr, CBE Birr, Chapa).

### Admin Domain
* **`/admin/dashboard`:** A centralized control panel for platform administrators to review listings, manage users, and oversee transactions.

---

## ✨ Key Features & Capabilities

### 1. 3D Virtual Tour Integration (The "Pivot" Feature)
The application handles 3D panoramic imagery natively. Rather than relying on expensive third-party embeds (like Matterport), Ethred provides its own authoring and viewing tools.
* **Scene Graph Navigation:** Users navigate between linked rooms seamlessly.
* **Floor Plan Mapping:** 2D floor plans are dynamically overlaid with interactive pins representing available 3D scenes.
* **Optimistic Authoring UI:** When sellers create hotspots, the UI updates instantly while syncing with the backend in the background, ensuring a fluid editing experience.

### 2. Robust State Management
* **SSR-Safe Authentication:** The `useAuthStore` utilizes Zustand's persist middleware, ensuring that token retrieval does not block or crash the Next.js server-side rendering pipeline.
* **Lazy API Interceptors:** The Axios instance accesses the authentication token dynamically at request time, avoiding circular dependency issues during module initialization.

### 3. Dynamic Search & Filtering
* **Hydrated State:** The property search page intelligently hydrates its filter state directly from the URL parameters upon mounting, making specific search queries highly shareable.

### 4. Advanced UI/UX Details
* **Tailwind Custom Theme:** A bespoke "Gold" color palette is injected directly into the Tailwind v4 configuration, ensuring brand consistency across gradients, focus rings, and hover states.
* **Suspense Boundaries:** Complex client-side hooks (`useSearchParams`) are properly wrapped in React `<Suspense>` boundaries to satisfy Next.js static generation requirements.

---

## 📊 Feature Readiness & Ratings

| Feature Category | Description | Status | Rating (1-10) |
| :--- | :--- | :--- | :---: |
| **Authentication** | Login, Registration, OTP Verification, Role-based routing | Production Ready | 9/10 |
| **Localization** | Path-based routing, Dynamic content translation (EN/AM) | Production Ready | 9/10 |
| **Property Discovery** | Search, Advanced Filtering, Pagination, Grid/List views | Production Ready | 8/10 |
| **3D Tour Engine** | WebGL Panorama rendering, Scene linking, Hotspot interactions | Production Ready | 9/10 |
| **Tour Authoring** | Drag-and-drop hotspot creation, Pitch/Yaw capture, Scene graph building | Production Ready | 8/10 |
| **Property Management** | Create listing workflow, Media uploads, Draft/Publish states | Production Ready | 8/10 |
| **Promotions & Payments** | Tier selection, Integration with local gateways | UI Complete (Backend Mocks) | 7/10 |
| **Performance (SSR/SEO)** | Next.js App Router utilization, Image optimization, Suspense boundaries | Highly Optimized | 9/10 |
| **Design System** | Custom theming, Responsive layouts, Micro-interactions | Polished | 9/10 |

## 🛠️ Developer Commands

To work with this frontend architecture locally:

*   **Development Server:** `npm run dev`
*   **Production Build:** `npm run build`
*   **Start Production:** `npm run start`

Ensure that the backend API is running and that the `NEXT_PUBLIC_API_URL` environment variable is correctly set in your `.env.local` file.
