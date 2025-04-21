import OpenAI from "openai";
import { Receipt, ReceiptItem, ItemCategory } from "../types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ExtractedReceipt {
  vendorName: string;
  date: string;
  totalAmount: number;
  items: {
    name: string;
    price: number;
    quantity: number;
    category: ItemCategory;
  }[];
}

export async function processReceiptImage(
  file: File
): Promise<Partial<Receipt>> {
  try {
    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");

    // Prepare the request to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: 'Extract the following information from this receipt: vendor name, date, total amount, and list of items with their prices, quantities, and categories. Categorize items into: FOOD, DRINKS, SUPPLIES, EQUIPMENT, TRAVEL, or OTHER. Return the data in a JSON format matching this TypeScript type:\n\ntype ExtractedReceipt = {\n  vendorName: string;\n  date: string; // ISO format\n  totalAmount: number;\n  items: Array<{\n    name: string;\n    price: number;\n    quantity: number;\n    category: "FOOD" | "DRINKS" | "SUPPLIES" | "EQUIPMENT" | "TRAVEL" | "OTHER";\n  }>;\n}',
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${file.type};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to process receipt with OpenAI");
    }

    const result = await response.json();
    const extractedData: ExtractedReceipt = JSON.parse(
      result.choices[0].message.content
    );

    return {
      vendorName: extractedData.vendorName,
      date: new Date(extractedData.date).toISOString(),
      totalAmount: extractedData.totalAmount,
      items: extractedData.items,
    };
  } catch (error) {
    console.error("Error processing receipt:", error);
    throw new Error("Failed to process receipt");
  }
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(",")[1]);
    };
    reader.onerror = (error) => reject(error);
  });
}

async function categorizeItems(
  items: { name: string; price: number }[]
): Promise<ReceiptItem[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: `Categorize these items into one of these categories: ${Object.values(
          ItemCategory
        ).join(
          ", "
        )}. Return as JSON array with structure: [{ name: string, price: number, category: string, quantity: number }]. Items: ${JSON.stringify(
          items
        )}`,
      },
    ],
    max_tokens: 500,
  });

  return JSON.parse(response.choices[0].message.content || "[]");
}

export function validateReceipt(receipt: Partial<Receipt>): boolean {
  if (!receipt) return false;

  // Check required fields
  if (!receipt.vendorName || typeof receipt.vendorName !== "string")
    return false;
  if (!receipt.date || isNaN(new Date(receipt.date).getTime())) return false;
  if (typeof receipt.totalAmount !== "number" || receipt.totalAmount <= 0)
    return false;

  // Validate items array
  if (!Array.isArray(receipt.items) || receipt.items.length === 0) return false;

  // Validate each item
  for (const item of receipt.items) {
    if (
      !item.name ||
      typeof item.name !== "string" ||
      typeof item.price !== "number" ||
      item.price <= 0 ||
      typeof item.quantity !== "number" ||
      item.quantity <= 0 ||
      !Object.values(ItemCategory).includes(item.category)
    ) {
      return false;
    }
  }

  return true;
}
