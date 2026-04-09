import { useState, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { FaRegFilePdf } from "react-icons/fa";
import { Trash2 } from "lucide-react";

const Result = () => {
  // Initialize with dummy data of 4 files
  const [pdfFiles, setPdfFiles] = useState([
    {
      id: '1',
      name: 'Semester 1 Results 2024',
      file: new File([new Blob(['Dummy PDF content 1'])], 'semester1_results_2024.pdf', { type: 'application/pdf' }),
      size: '2.45 MB',
      uploadDate: new Date('2024-01-15').toLocaleDateString(),
    },
    {
      id: '2',
      name: 'Semester 2 Results 2024',
      file: new File([new Blob(['Dummy PDF content 2'])], 'semester2_results_2024.pdf', { type: 'application/pdf' }),
      size: '1.78 MB',
      uploadDate: new Date('2024-06-20').toLocaleDateString(),
    },
    {
      id: '3',
      name: 'Midterm Results',
      file: new File([new Blob(['Dummy PDF content 3'])], 'midterm_results.pdf', { type: 'application/pdf' }),
      size: '3.21 MB',
      uploadDate: new Date('2024-03-25').toLocaleDateString(),
    },
    {
      id: '4',
      name: 'Final Exam Results',
      file: new File([new Blob(['Dummy PDF content 4'])], 'final_exam_results.pdf', { type: 'application/pdf' }),
      size: '0.89 MB',
      uploadDate: new Date('2024-12-01').toLocaleDateString(),
    },
  ]);
  
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingDragging, setIsEditingDragging] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null); // Changed to single file

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle file selection for add - SINGLE FILE ONLY
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0]; // Take only the first file
    if (file.type === 'application/pdf') {
      setSelectedFile(file);
    }
  };

  // Handle drag and drop for add - SINGLE FILE ONLY
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    const pdfFilesArray = Array.from(files).filter(file => file.type === 'application/pdf');
    
    if (pdfFilesArray.length > 0) {
      setSelectedFile(pdfFilesArray[0]); // Take only the first PDF file
    }
  };

  // Handle upload button click
  const handleUploadClick = () => {
    if (selectedFile) {
      const newFileObj = {
        id: Math.random().toString(36).substr(2, 9),
        name: fileName || selectedFile.name.replace(/\.pdf$/i, ""), // Remove .pdf extension
        file: selectedFile,
        size: formatFileSize(selectedFile.size),
        uploadDate: new Date().toLocaleDateString(),
      };

      setPdfFiles(prev => [...prev, newFileObj]);
      setSelectedFile(null);
      setFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setShowAddPanel(false);
    } else {
      fileInputRef.current?.click();
    }
  };

  // Handle file selection for edit
  const handleEditFileSelect = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setNewFile(file);
    setNewFileName(file.name.replace(/\.pdf$/i, ""));
    
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  // Handle drag and drop for edit
  const handleEditDragOver = (e) => {
    e.preventDefault();
    setIsEditingDragging(true);
  };

  const handleEditDragLeave = (e) => {
    e.preventDefault();
    setIsEditingDragging(false);
  };

  const handleEditDrop = (e) => {
    e.preventDefault();
    setIsEditingDragging(false);
    
    const files = e.dataTransfer.files;
    const pdfFilesArray = Array.from(files).filter(file => file.type === 'application/pdf');
    
    if (pdfFilesArray.length > 0) {
      const file = pdfFilesArray[0];
      setNewFile(file);
      setNewFileName(file.name.replace(/\.pdf$/i, ""));
    }
  };

  // Remove a PDF file
  const removeFile = (id) => {
    setPdfFiles(prev => prev.filter(file => file.id !== id));
    setDeleteConfirm(null);
  };

  // Show delete confirmation
  const showDeleteConfirmation = (id, name) => {
    setDeleteConfirm({ id, name });
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Start editing a file name in right panel
  const startEditing = (file) => {
    setEditingFile(file);
    setEditValue(file.name);
    setNewFile(null);
    setNewFileName('');
    setShowEditPanel(true);
  };

  // Save edited file name
  const saveEdit = () => {
    if (!editValue.trim() || !editingFile) return;

    const updatedFile = { ...editingFile };
    
    // Update name
    updatedFile.name = editValue.trim();
    
    // Update file if new file is selected
    if (newFile) {
      updatedFile.file = newFile;
      updatedFile.size = formatFileSize(newFile.size);
      updatedFile.uploadDate = new Date().toLocaleDateString();
    }

    setPdfFiles(prev => prev.map(file => 
      file.id === editingFile.id ? updatedFile : file
    ));

    setShowEditPanel(false);
    setEditingFile(null);
    setEditValue('');
    setNewFile(null);
    setNewFileName('');
  };

  // Cancel editing
  const cancelEdit = () => {
    setShowEditPanel(false);
    setEditingFile(null);
    setEditValue('');
    setNewFile(null);
    setNewFileName('');
  };

  // Remove new file from edit panel
  const removeNewFile = () => {
    setNewFile(null);
    setNewFileName('');
  };

  // Remove selected file from add panel
  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reset add panel when closing
  const handleCancelAdd = () => {
    setSelectedFile(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowAddPanel(false);
  };

  // Download a PDF file
  const downloadFile = (file) => {
    const url = URL.createObjectURL(file.file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name + '.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const addPanel = document.getElementById('add-panel');
      const editPanel = document.getElementById('edit-panel');
      const addButton = document.getElementById('add-button');
      
      if (showAddPanel && addPanel && !addPanel.contains(event.target) && addButton && !addButton.contains(event.target)) {
        handleCancelAdd();
      }
      
      if (showEditPanel && editPanel && !editPanel.contains(event.target)) {
        cancelEdit();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAddPanel, showEditPanel]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 relative overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header with Add New button */}
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Result</h1>
          </div>
          <button
            id="add-button"
            onClick={() => setShowAddPanel(true)}
            className="bg-blue-400/30 text-blue-950 font-medium py-2 px-4 rounded-3xl flex items-center transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add File
          </button>
        </header>

        {/* Add New Panel (Slide-in from right) */}
        <div
          id="add-panel"
          className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
            showAddPanel ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Upload Result</h2>
              <button
                onClick={handleCancelAdd}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* File Name Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Name
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g., Semester 4 B.Tech Results 2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Leave empty to use original filename
                </p>
              </div>

              {/* Selected File Display */}
              {selectedFile && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Selected File
                    </label>
                    
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaRegFilePdf className='text-blue-600 w-6 h-6' />
                      </div>
                      <div className="flex-1 overflow-hidden min-w-0">
                        <p className="font-medium text-gray-800 truncate">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <button
                      onClick={removeSelectedFile}
                      className=""
                    >
                      <Trash2 className='w-6 h-6 bg-red-600 text-white p-1 rounded-2xl' />
                    </button>
                    </div>
                    
                  </div>
                </div>
              )}

              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer mb-6
                  ${isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  } ${selectedFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={selectedFile ? undefined : handleDrop}
                onClick={selectedFile ? undefined : () => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      {selectedFile ? 'File selected' : 'Drop your PDF file here'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedFile ? 'Remove current file to select another' : 'or click to browse files'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Supports: .pdf files only (one file at a time)
                    </p>
                    {selectedFile && (
                      <p className="text-xs text-green-600 mt-2">
                        ✓ 1 file selected
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Hidden file input - REMOVED MULTIPLE ATTRIBUTE */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf"
                className="hidden"
              />
            </div>

            {/* Panel Footer with both Cancel and Upload buttons */}
            <div className="border-t border-gray-200 p-6 flex space-x-3">
              <button
                onClick={handleCancelAdd}
                className="flex-1 border border-gray-300 text-gray-700 font-medium  py-3 px-4 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadClick}
                className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center transition-colors font-medium  ${
                  selectedFile
                    ? 'bg-blue-400/30 text-blue-950 hover:bg-blue-400/40' 
                    : 'bg-blue-400/30 text-blue-950 cursor-not-allowed opacity-50'
                }`}
                disabled={!selectedFile}
              >
                Upload
              </button>
            </div>
          </div>
        </div>

        {/* Edit Panel (Slide-in from right) */}
        <div
          id="edit-panel"
          className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
            showEditPanel ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Edit Result</h2>
              <button
                onClick={cancelEdit}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {editingFile && (
                <div className="space-y-6">
                  {/* Current file info */}
                  <div className=" rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                       <FaRegFilePdf className='text-blue-600 w-6 h-6' />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Current file</p>
                        <p className="font-medium text-gray-800 truncate">{editingFile.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                           Uploaded: {editingFile.uploadDate}
                        </p>
                      </div>
                    </div>
                    
                  </div>

                  {/* Edit Form */}
                  <div className="space-y-6">
                    {/* Result Name Edit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Result Name
                      </label>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="Enter result name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        autoFocus
                      />
                    </div>

                    {/* File Upload Section */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Update File
                        </label>
                        {newFile && (
                          <button
                            onClick={removeNewFile}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      {newFile ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                              <FaRegFilePdf className='text-blue-600 w-8 h-8' />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="font-medium  text-gray-800 truncate">{newFile.name}</p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(newFile.size)}
                              </p>
                            </div>
                          </div>
                          
                        </div>
                      ) : (
                        <div
                          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer
                            ${isEditingDragging 
                              ? 'border-blue-500 bg-green-50' 
                              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                            }`}
                          onDragOver={handleEditDragOver}
                          onDragLeave={handleEditDragLeave}
                          onDrop={handleEditDrop}
                          onClick={() => editFileInputRef.current?.click()}
                        >
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Upload className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Drop new PDF file here
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                or click to browse file
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                Upload new file to replace current one
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Hidden file input for edit */}
                      <input
                        type="file"
                        ref={editFileInputRef}
                        onChange={handleEditFileSelect}
                        accept=".pdf"
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="border-t border-gray-200 p-6 flex space-x-3">
              <button
                onClick={cancelEdit}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 px-4 py-3 bg-blue-400/30 text-blue-950 rounded-lg transition-colors font-medium"
                disabled={!editValue.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Overlay when any panel is open */}
        {(showAddPanel || showEditPanel) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"></div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"></div>
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
                  <button
                    onClick={cancelDelete}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-6">
                  <p className="text-gray-600">
                    Are you sure you want to delete <span className="font-semibold text-gray-800">"{deleteConfirm.name}"</span>?
                  </p>
                  
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => removeFile(deleteConfirm.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete 
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Main Content Area - Files List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pdfFiles.map((pdf) => (
            <div
              key={pdf.id}
              className="border-b-4 border-orange-400 rounded-lg p-4 shadow-lg hover:shadow-md transition-shadow bg-white group"
            >
              <div className="flex items-start space-x-4 overflow-hidden">
                {/* Result Icon */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-16 rounded-lg flex items-center justify-center border border-orange-400 transition-colors">
                    <FaRegFilePdf className='text-orange-400 w-8 h-8' />
                  </div>
                </div>

                {/* File Info */}
                <div className="flex-grow">
                  {/* File Name */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800 truncate">{pdf.name}</h3>
                  </div>

                  {/* File Details with Action Buttons */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Uploaded: {pdf.uploadDate}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startEditing(pdf)}
                          className="text-blue-600 bg-blue-200 hover:bg-blue-100 rounded-2xl transition-colors p-1"
                          title="Edit result"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => showDeleteConfirmation(pdf.id, pdf.name)}
                          className="text-red-600 bg-red-200 hover:bg-red-100 rounded-2xl transition-colors p-1"
                          title="Delete result"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Result;