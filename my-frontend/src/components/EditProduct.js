import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const EditProduct = () => {
  const [product, setProduct] = useState(null);
  const { productId } = useParams();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/edit/${productId}`, {
          headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const productData = await response.json();
        setProduct(productData);
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleInputChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setProduct({
      ...product,
      img: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('Product_Name', product.Product_Name);
    formData.append('sku', product.sku);
    formData.append('Brand', product.Brand);
    if (product.img) {
      formData.append('img', product.img);
    }

    try {
      const response = await fetch(`http://localhost:3000/edit/${productId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error updating product details');
      }

      console.log('Product details updated successfully');
    } catch (error) {
      console.error('Error updating product details:', error);
    }
  };

  return (
    <div>
      <h2>Edit Product</h2>
      {product && (
        <form onSubmit={handleSubmit}>
          <label>
            Product Name:
            <input type="text" name="Product_Name" value={product.Product_Name} onChange={handleInputChange} />
          </label>
          <label>
            SKU:
            <input type="text" name="sku" value={product.sku} onChange={handleInputChange} />
          </label>
          <label>
            Brand:
            <input type="text" name="Brand" value={product.Brand} onChange={handleInputChange} />
          </label>
          <label>
            Image:
            <input type="file" name="img" onChange={handleFileChange} />
          </label>
          <button type="submit">Save</button>
        </form>
      )}
    </div>
  );
};

export default EditProduct;
