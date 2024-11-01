// components/ImageUploader.js
import { useState } from 'react';
import { describeImage } from '../pages/api/api';

const ImageUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');

  const handleFileChange = (e: any) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleDescribe = async () => {
    if (!selectedFile) return;
    try {
      const desc = await describeImage(selectedFile);
      setDescription(desc);
    } catch (error) {
      setDescription('Error describing image.');
    }
  };

  return (
    <div>
      <h2>Upload an Image to Describe</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleDescribe}>Describe</button>
      {description && <p>{description}</p>}
    </div>
  );
};

export default ImageUploader;
