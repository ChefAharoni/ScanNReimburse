"use client";

import { Fragment, useState, useRef, useCallback } from "react";
import { Dialog, Transition, Tab } from "@headlessui/react";
import { XMarkIcon, CameraIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useDropzone } from "react-dropzone";
import Webcam from "react-webcam";
import { processReceiptImage, validateReceipt } from "@/app/utils/receipt";
import { Receipt } from "@/app/types";

interface UploadReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

export default function UploadReceiptModal({
  isOpen,
  onClose,
  eventId,
}: UploadReceiptModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedReceipt, setProcessedReceipt] =
    useState<Partial<Receipt> | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    try {
      setIsProcessing(true);
      setError(null);

      const file = acceptedFiles[0];
      const result = await processReceiptImage(file);

      if (validateReceipt(result)) {
        setProcessedReceipt(result);
      } else {
        setError(
          "Failed to validate receipt data. Please check the image and try again."
        );
      }
    } catch (err) {
      console.error("Error processing receipt:", err);
      setError("Failed to process receipt. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const capturePhoto = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        try {
          setIsProcessing(true);
          setError(null);

          // Convert base64 to blob
          const response = await fetch(imageSrc);
          const blob = await response.blob();
          const file = new File([blob], "receipt.jpg", { type: "image/jpeg" });

          const result = await processReceiptImage(file);

          if (validateReceipt(result)) {
            setProcessedReceipt(result);
          } else {
            setError(
              "Failed to validate receipt data. Please check the image and try again."
            );
          }
        } catch (err) {
          console.error("Error processing receipt:", err);
          setError("Failed to process receipt. Please try again.");
        } finally {
          setIsProcessing(false);
        }
      }
    }
  };

  const handleSave = async () => {
    if (!processedReceipt) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Create FormData to send file and receipt data
      const formData = new FormData();

      // Add the file
      if (processedReceipt.file) {
        formData.append("file", processedReceipt.file);
      }

      // Add the receipt data
      formData.append(
        "data",
        JSON.stringify({
          vendorName: processedReceipt.vendorName,
          date: processedReceipt.date,
          totalAmount: processedReceipt.totalAmount,
          items: processedReceipt.items,
        })
      );

      // Send the request
      const response = await fetch(`/api/events/${eventId}/receipts`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to save receipt");
      }

      // Reset state and close modal
      setProcessedReceipt(null);
      onClose();
    } catch (err) {
      console.error("Error saving receipt:", err);
      setError("Failed to save receipt. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setProcessedReceipt(null);
    setError(null);
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-300"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6"
                    >
                      Upload Receipt
                    </Dialog.Title>

                    {!processedReceipt ? (
                      <div className="mt-4">
                        <Tab.Group
                          selectedIndex={activeTab}
                          onChange={setActiveTab}
                        >
                          <Tab.List className="flex space-x-1 rounded-xl bg-gray-700 p-1">
                            <Tab
                              className={({ selected }) =>
                                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                                ${
                                  selected
                                    ? "bg-primary-600 text-white shadow"
                                    : "text-gray-300 hover:bg-gray-600 hover:text-white"
                                }`
                              }
                            >
                              <div className="flex items-center justify-center">
                                <CameraIcon className="h-5 w-5 mr-2" />
                                Camera
                              </div>
                            </Tab>
                            <Tab
                              className={({ selected }) =>
                                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                                ${
                                  selected
                                    ? "bg-primary-600 text-white shadow"
                                    : "text-gray-300 hover:bg-gray-600 hover:text-white"
                                }`
                              }
                            >
                              <div className="flex items-center justify-center">
                                <PhotoIcon className="h-5 w-5 mr-2" />
                                File Upload
                              </div>
                            </Tab>
                          </Tab.List>
                          <Tab.Panels className="mt-4">
                            <Tab.Panel>
                              <div className="flex flex-col items-center">
                                <div className="w-full max-w-md overflow-hidden rounded-lg">
                                  <Webcam
                                    ref={webcamRef}
                                    audio={false}
                                    screenshotFormat="image/jpeg"
                                    className="w-full"
                                  />
                                </div>
                                <button
                                  onClick={capturePhoto}
                                  disabled={isProcessing}
                                  className="mt-4 btn-primary"
                                >
                                  {isProcessing
                                    ? "Processing..."
                                    : "Capture Photo"}
                                </button>
                              </div>
                            </Tab.Panel>
                            <Tab.Panel>
                              <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                                  ${
                                    isDragActive
                                      ? "border-primary-500 bg-primary-500 bg-opacity-10"
                                      : "border-gray-600"
                                  }`}
                              >
                                <input {...getInputProps()} />
                                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-300">
                                  {isDragActive
                                    ? "Drop the receipt here"
                                    : "Drag and drop a receipt, or click to select"}
                                </p>
                                <p className="mt-1 text-xs text-gray-400">
                                  JPG, PNG, or PDF (max 10MB)
                                </p>
                              </div>
                            </Tab.Panel>
                          </Tab.Panels>
                        </Tab.Group>

                        {error && (
                          <div className="mt-4 p-3 bg-red-900 bg-opacity-50 rounded text-red-200 text-sm">
                            {error}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4">
                        <h4 className="text-md font-medium">Receipt Details</h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Vendor:</span>
                            <span className="font-medium">
                              {processedReceipt.vendorName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Date:</span>
                            <span className="font-medium">
                              {processedReceipt.date}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total:</span>
                            <span className="font-medium">
                              ${processedReceipt.totalAmount?.toFixed(2)}
                            </span>
                          </div>
                          <div className="mt-4">
                            <h5 className="text-sm font-medium mb-2">Items</h5>
                            <div className="space-y-1">
                              {processedReceipt.items?.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between text-sm"
                                >
                                  <span>{item.name}</span>
                                  <span>
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setProcessedReceipt(null)}
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={handleSave}
                            disabled={isProcessing}
                          >
                            {isProcessing ? "Saving..." : "Save Receipt"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
