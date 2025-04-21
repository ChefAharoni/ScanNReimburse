import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Ensure directories exist
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Initialize storage directories
const initializeStorage = () => {
  const uploadsDir = path.join(process.cwd(), "uploads");
  const dataDir = path.join(process.cwd(), "data");

  ensureDirectoryExists(uploadsDir);
  ensureDirectoryExists(dataDir);

  return { uploadsDir, dataDir };
};

// Save a file to the uploads directory
export const saveFile = async (file: File): Promise<string> => {
  const { uploadsDir } = initializeStorage();

  // Generate a unique filename
  const fileExtension = path.extname(file.name);
  const fileName = `${uuidv4()}${fileExtension}`;
  const filePath = path.join(uploadsDir, fileName);

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Write the file
  await fs.promises.writeFile(filePath, buffer);

  return fileName;
};

// Get the full path to a file
export const getFilePath = (fileName: string): string => {
  const { uploadsDir } = initializeStorage();
  return path.join(uploadsDir, fileName);
};

// Delete a file
export const deleteFile = async (fileName: string): Promise<boolean> => {
  const { uploadsDir } = initializeStorage();
  const filePath = path.join(uploadsDir, fileName);

  try {
    await fs.promises.unlink(filePath);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

// Save data to a JSON file
export const saveData = async <T>(data: T, fileName: string): Promise<void> => {
  const { dataDir } = initializeStorage();
  const filePath = path.join(dataDir, fileName);

  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
};

// Read data from a JSON file
export const readData = async <T>(fileName: string): Promise<T | null> => {
  const { dataDir } = initializeStorage();
  const filePath = path.join(dataDir, fileName);

  try {
    const data = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
};

// Delete a data file
export const deleteData = async (fileName: string): Promise<boolean> => {
  const { dataDir } = initializeStorage();
  const filePath = path.join(dataDir, fileName);

  try {
    await fs.promises.unlink(filePath);
    return true;
  } catch (error) {
    console.error("Error deleting data file:", error);
    return false;
  }
};
