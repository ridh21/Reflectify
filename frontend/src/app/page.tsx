'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'

export default function Page() {
  const [mounted, setMounted] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  })

  const handleUpload = async () => {
    if (!file) return
    console.log("This is the file", file)

    setIsLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/get-parsed-data', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setParsedData(data)
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Excel File Upload</h1>
        
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="text-4xl">📄</div>
            {isDragActive ? (
              <p>Drop the Excel file here...</p>
            ) : (
              <p>Drag and drop an Excel file here, or click to select</p>
            )}
          </div>
        </div>

        {file && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-white rounded-lg shadow">
              <p className="font-medium">Selected file:</p>
              <p className="text-gray-600">{file.name}</p>
            </div>

            <button
              onClick={handleUpload}
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-lg text-white font-medium
                ${isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {isLoading ? 'Processing...' : 'Upload and Parse'}
            </button>
          </div>
        )}

        {parsedData && (
          <div className="mt-8 p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Parsed Data:</h2>
            <pre className="bg-gray-50 p-4 rounded overflow-auto">
              {JSON.stringify(parsedData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
