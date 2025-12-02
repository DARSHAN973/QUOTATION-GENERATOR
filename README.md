# Calculation CRM - Pipe Rate Calculator

A comprehensive Next.js web application for calculating pipe rates and generating quotations for MS, GI, and Seamless pipes. This is a frontend-only application that handles both godown stock and direct Jindal supply calculations.

## 🚀 Features

### ✅ Core Functionality Complete

#### 1. **CRM-Style Interface**
- Clean sidebar navigation with Dashboard, New Quotation, Preview & Export, and Settings tabs
- Modern, responsive design built with Tailwind CSS
- Professional user interface with intuitive navigation

#### 2. **Order Settings**
- Supply Type selection (From Godown / Direct From Jindal)
- Godown selection (Wagholi / Gangadham)
- Plant reference selection (Hissar, Star, Nagothane, etc.)
- Configurable GST percentage

#### 3. **Dynamic Line Item Calculator**
- Material selection (MS, GI, Seamless)
- Class/Type configuration (B Class, C Class for MS/GI; SCH options for Seamless)
- Multiple pipe size support (15 NB to 500 NB)
- Flexible quantity input modes:
  - By Pipes (auto-calculates 6m per pipe)
  - By Meters (direct meter input)
  - By Kgs (calculates meters from weight)
- Automatic weight/meter calculation from price list
- Rate basis selection (Per Meter / Per Kg)
- Discount percentage application
- Real-time rate validation with below-cost warnings
- Line amount calculations

#### 4. **Bulk Calculator (Direct Jindal Supply)**
- Dead freight calculation based on vehicle capacity
- Multiple vehicle capacity options (20T, 25T)
- Configurable dead freight rates
- Profit percentage application
- Automatic rate distribution across all items
- Vehicle requirement calculation
- Comprehensive bulk rate breakdown

#### 5. **Smart Description Generation**
- Auto-generates proper item descriptions based on material type
- IS code selection (IS1239 / IS3589) based on size ranges
- Proper SWS/P&E notation for MS/GI pipes
- SCH and MAKE notation for Seamless pipes
- Editable descriptions in preview mode

#### 6. **Preview & Export**
- Excel-format quotation preview
- Editable item descriptions
- Configurable terms and conditions
- Payment term selection
- Valid till date configuration
- Excel export functionality with proper formatting
- Detailed export with calculation summary

#### 7. **Settings Management**
- Default GST percentage configuration
- Profit percentage settings for bulk calculations
- Dead freight rate management
- Vehicle capacity configuration
- Price list import/export functionality
- Local storage persistence

#### 8. **Rate Validation & Warnings**
- Below-cost rate warnings with visual indicators
- Real-time calculation validation
- Input validation throughout the application
- Error handling and user feedback

## 🛠 Technical Stack

- **Frontend**: Next.js 16.0.3, React 19.2.0
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Excel Export**: xlsx, xlsx-style
- **Date Handling**: date-fns
- **Utilities**: clsx for conditional styling
- **Storage**: Browser localStorage for settings persistence

## 🔧 Setup & Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

## 💡 Usage Guide

### 1. Configuration (Settings Tab)
- Set default GST percentage
- Configure profit margins for bulk calculations
- Set dead freight rates and vehicle capacities
- Import/export price lists in JSON format

### 2. Creating a Quotation (New Quotation Tab)
1. **Order Settings**: Choose supply type, godown, and GST
2. **Add Line Items**: 
   - Select material, class, and size
   - Choose quantity input method
   - Review auto-calculated rates and weights
   - Apply discounts as needed
3. **Bulk Calculation** (for Direct Jindal):
   - Configure vehicle capacity and dead freight rates
   - Set base rate from Jindal and profit percentage
   - Apply calculated bulk rate to all items

### 3. Preview & Export
- Review generated quotation in Excel format
- Edit item descriptions if needed
- Configure terms and conditions
- Export to Excel file

## 🎯 Benefits

1. **No Manual Calculations**: Eliminates calculation errors and saves time
2. **No Rate Confusion**: Automatic rate fetching from price lists
3. **No Dead Freight Headaches**: Automatic bulk calculation for direct supply
4. **Professional Quotations**: Excel-formatted output ready for customers
5. **No Dependencies**: Frontend-only application, no server required
6. **Instant Setup**: No installation or backend configuration needed

## 🔒 Data Privacy

- No party data is stored permanently
- All calculations happen in the browser
- Settings and price lists stored locally only
- No internet connection required after initial load

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Status**: Production Ready ✅
