// NewsNoticesDashboard.jsx
import React, { useState, useRef } from 'react';
import { FaRegFilePdf } from "react-icons/fa";
import { 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  Eye, 
  Plus, 
  Edit2,
  Calendar,
  X,
  AlertTriangle
} from 'lucide-react';

const NewsNoticesDashboard = () => {
  const [items, setItems] = useState([
    {
      id: '1',
      title: 'Annual Report 2024',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: 'annual-report-2024.pdf',
      fileSize: '2.4 MB',
      uploadDate: '2024-01-15',
      type: 'news'
    },
    {
      id: '2',
      title: 'Important Notice: System Maintenance',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: 'maintenance-notice.pdf',
      fileSize: '1.1 MB',
      uploadDate: '2024-01-10',
      type: 'notice'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [currentItem, setCurrentItem] = useState({
    id: '',
    title: '',
    type: 'news'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle form operations
  const handleOpenForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setItems(items.filter(item => item.id !== itemToDelete.id));
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        if (!currentItem.title) {
          setCurrentItem(prev => ({
            ...prev,
            title: file.name.replace('.pdf', '').replace(/_/g, ' ')
          }));
        }
      } else {
        alert('Please select a PDF file only');
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async () => {
    if (!currentItem.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!selectedFile && !currentItem.pdfUrl) {
      alert('Please select a PDF file');
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newItem = {
        id: currentItem.id || Date.now().toString(),
        title: currentItem.title,
        pdfUrl: selectedFile ? URL.createObjectURL(selectedFile) : currentItem.pdfUrl,
        fileName: selectedFile ? selectedFile.name : currentItem.fileName,
        fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : currentItem.fileSize,
        uploadDate: new Date().toISOString().split('T')[0],
        type: currentItem.type
      };

      if (currentItem.id) {
        // Update existing item
        setItems(items.map(item => item.id === newItem.id ? newItem : item));
      } else {
        // Add new item
        setItems([newItem, ...items]);
      }

      resetForm();
      setShowForm(false);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Operation failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setCurrentItem({
      id: '',
      title: '',
      type: 'news'
    });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const getTypeColor = (type) => {
    return type === 'news' ? 'bg-blue-500' : 'bg-green-500';
  };

  return (
    <div className='bg-gray-50'>
    <div className="min-h-screen max-w-6xl mx-auto bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between">
        <h1 className="text-3xl font-bold text-gray-800">News & Notices</h1>
        
        <button
          onClick={handleOpenForm}
          className="flex items-center gap-2 px-6 py-3 bg-blue-400/30 text-blue-950 rounded-3xl transition-colors font-medium shadow-md"
        >  Add New
        </button>
      </div>

   

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-200">
            <div className="p-5">
              {/* Header with Type and Actions */}
              <div className="flex justify-between items-start mb-4">
                
                
              </div>

              {/* Title */}
              <h3 className="font-bold flex justify-between text-xl text-gray-800 mb-3">
                {item.title}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-blue-600 bg-blue-200 hover:bg-blue-100 rounded-2xl transition"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="p-2 text-red-600 bg-red-200 hover:bg-red-100 rounded-2xl transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </h3>

              {/* Date */}
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Calendar size={16} className="mr-2" />
                <span>Uploaded: {item.uploadDate}</span>
              </div>

              {/* File Info */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                   <FaRegFilePdf className='text-orange-400 w-6 h-6 mr-2' />
                    <div>
                      <div className="font-medium text-gray-700">
                        {item.fileName}
                      </div>
                     
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <FileText className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No items yet</h3>
          <p className="text-gray-500 mb-6">Click "Add New" to add your first news or notice</p>
        </div>
      )}

      {/* Sidebar Form */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${showForm ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              {currentItem.id ? 'Edit Item' : 'Add New Item'}
            </h2>
            <button
              onClick={closeForm}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              disabled={isUploading}
            >
              <X size={24} />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
             
              {/* Title Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Enter title..."
                  value={currentItem.title || ''}
                  onChange={(e) => setCurrentItem(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  disabled={isUploading}
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PDF File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                  />
                  
                  {selectedFile || currentItem.pdfUrl ? (
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="text-red-500 mr-3" size={24} />
                          <div className="text-left">
                            <div className="font-medium text-gray-800">
                              {selectedFile?.name || currentItem.fileName}
                            </div>
                            {selectedFile && (
                              <div className="text-sm text-gray-500">
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          disabled={isUploading}
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto text-gray-400 mb-3" size={32} />
                      <p className="text-gray-600 mb-2">Select a PDF file</p>
                      <p className="text-sm text-gray-500 mb-4">Maximum size: 10MB</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        disabled={isUploading}
                      >
                        Choose File
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-6 border-t">
            <div className="flex gap-3">
              <button
                onClick={closeForm}
                className="flex-1 px-5 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="flex-1 px-5 py-3 bg-blue-400/30 text-blue-950 rounded-lg  transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : currentItem.id ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for form */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeForm}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                Confirm Delete
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-5 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default NewsNoticesDashboard;