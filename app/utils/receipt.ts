import { Receipt, ReceiptItem, ItemCategory } from "../types";

// Define a mock receipt processing function since we can't actually call OpenAI API
export async function processReceiptImage(
  file: File
): Promise<Partial<Receipt>> {
  // In a real implementation, this would call the OpenAI API
  // For now, we're returning mock data for testing

  console.log("Processing receipt image:", file.name);

  // Generate some mock data based on the file name
  const vendorName = file.name.includes("restaurant")
    ? "Sample Restaurant"
    : file.name.includes("market")
    ? "Sample Market"
    : "Unknown Vendor";

  const totalAmount = Math.floor(Math.random() * 10000) / 100; // Random amount between 0-100

  // Generate 1-5 random items
  const itemCount = Math.floor(Math.random() * 5) + 1;
  const items: Partial<ReceiptItem>[] = [];

  let itemsTotal = 0;

  for (let i = 0; i < itemCount; i++) {
    const category =
      Object.values(ItemCategory)[
        Math.floor(Math.random() * Object.values(ItemCategory).length)
      ];

    const price = Math.floor(Math.random() * 1000) / 100; // Random price between 0-10
    const quantity = Math.floor(Math.random() * 3) + 1; // Random quantity 1-3
    const amount = price * quantity;
    itemsTotal += amount;

    items.push({
      id: `item-${i}`,
      name: `Item ${i + 1}`,
      price,
      quantity,
      category,
    });
  }

  // Adjust the last item so total matches
  if (items.length > 0) {
    const lastItem = items[items.length - 1];
    if (lastItem.price && lastItem.quantity) {
      const difference = totalAmount - itemsTotal;
      lastItem.price = Math.max(
        0.01,
        (lastItem.price * lastItem.quantity + difference) / lastItem.quantity
      );
    }
  }

  return {
    vendorName,
    date: new Date().toISOString(),
    totalAmount,
    items: items as ReceiptItem[],
    file,
  };
}

export function validateReceipt(receipt: Partial<Receipt>): boolean {
  if (!receipt) return false;

  // Check required fields
  if (!receipt.vendorName) {
    console.error("Missing vendor name");
    return false;
  }

  if (!receipt.date) {
    console.error("Missing date");
    return false;
  }

  try {
    // Verify date is valid
    new Date(receipt.date);
  } catch (e) {
    console.error("Invalid date format", receipt.date);
    return false;
  }

  if (
    typeof receipt.totalAmount !== "number" ||
    isNaN(receipt.totalAmount) ||
    receipt.totalAmount < 0
  ) {
    console.error("Invalid total amount", receipt.totalAmount);
    return false;
  }

  // Check items - not required but validate if present
  if (receipt.items) {
    if (!Array.isArray(receipt.items)) {
      console.error("Items is not an array");
      return false;
    }

    // Validate each item
    for (const item of receipt.items) {
      if (!item.name || typeof item.name !== "string") {
        console.error("Item missing name", item);
        continue; // Allow items with missing names
      }

      if (
        typeof item.price !== "number" ||
        isNaN(item.price) ||
        item.price < 0
      ) {
        console.error("Item has invalid price", item);
        item.price = 0; // Set default price
      }

      if (
        !item.quantity ||
        typeof item.quantity !== "number" ||
        item.quantity <= 0
      ) {
        console.error("Item has invalid quantity", item);
        item.quantity = 1; // Set default quantity
      }

      if (
        !item.category ||
        !Object.values(ItemCategory).includes(item.category)
      ) {
        console.error("Item has invalid category", item);
        item.category = ItemCategory.OTHER; // Set default category
      }
    }
  } else {
    // Create an empty items array if none exists
    receipt.items = [];
  }

  return true;
}
