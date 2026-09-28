import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [gallery, setGallery] = useState([]);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef();

  const fetchGallery = async () => {
    try {
      const res = await axios.get('http://localhost:5002/api/upload');
      setGallery(res.data.images || []);
    } catch (err) {
      console.error('Failed to load gallery', err);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file (JPG, PNG, GIF, WEBP)' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File is too large (Maximum 5MB)' });
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMessage(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      setUploading(true);
      setUploadProgress(0);

      const res = await axios.post('http://localhost:5002/api/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      setMessage({ type: 'success', text: 'Image uploaded successfully with Multer!' });
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchGallery();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm('Delete this uploaded image?')) return;
    try {
      await axios.delete(`http://localhost:5002/api/upload/${filename}`);
      setMessage({ type: 'success', text: 'Image deleted from server' });
      fetchGallery();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete image' });
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    alert('Image URL copied to clipboard: ' + url);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>📸 Image Upload & Preview Feature</h1>
        <p>Built with Express, Multer disk storage, and React live preview integration</p>
      </div>

      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: message.type === 'error' ? '#b91c1c' : '#15803d',
          border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`
        }}>
          {message.text}
        </div>
      )}

      <div
        className="dropzone"
        onClick={() => fileInputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
          }
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files[0])}
        />
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📤</div>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>Click or drag & drop image here</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Supports PNG, JPG, JPEG, WEBP, GIF (Max 5MB)</p>
      </div>

      {previewUrl && (
        <div className="preview-container">
          <h4 style={{ marginBottom: '1rem' }}>Client-Side Image Preview</h4>
          <img src={previewUrl} alt="Preview" className="preview-img" />
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <strong>{selectedFile?.name}</strong> ({(selectedFile?.size / 1024).toFixed(1)} KB)
          </div>

          {uploading && (
            <div style={{ width: '100%', maxWidth: '360px', marginTop: '1rem' }}>
              <div style={{ background: '#e2e8f0', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, background: 'var(--primary)', height: '100%', transition: 'width 0.2s' }} />
              </div>
              <p style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
                Uploading: {uploadProgress}%
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
            <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Uploading to Multer...' : '🚀 Upload to Server'}
            </button>
            <button className="btn btn-outline" onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} disabled={uploading}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <h2 style={{ marginTop: '3rem', fontSize: '1.4rem' }}>Uploaded Gallery ({gallery.length})</h2>
      {gallery.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>No images uploaded to the server yet.</p>
      ) : (
        <div className="gallery-grid">
          {gallery.map((img) => (
            <div key={img.filename} className="gallery-card">
              <img src={img.url} alt={img.filename} loading="lazy" />
              <div className="gallery-card-body">
                <div className="gallery-card-title">{img.filename}</div>
                <div className="gallery-card-meta">
                  Size: {(img.size / 1024).toFixed(1)} KB • {new Date(img.createdAt).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => copyUrl(img.url)}>
                    📋 Copy Link
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(img.filename)}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
