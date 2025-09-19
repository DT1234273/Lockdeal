import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import PageHeader from '../../components/PageHeader';
import { productAPI } from '../../services/api';

const ProductSchema = Yup.object().shape({
  name: Yup.string().required('Product name is required'),
  price: Yup.number()
    .required('Price is required')
    .positive('Price must be positive')
    .typeError('Price must be a number'),
  unit: Yup.string().required('Unit is required'),
  description: Yup.string(),
});

const UploadProduct = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      // Create FormData object to send file
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('price', values.price);
      formData.append('unit', values.unit);
      formData.append('description', values.description || '');
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await productAPI.createProduct(formData);
      toast.success('Product uploaded successfully!');
      navigate('/seller/dashboard');
    } catch (error) {
      toast.error(error.detail || 'Failed to upload product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <PageHeader
        title="Upload New Product"
        subtitle="Add your product details below"
        showBackButton={true}
        backButtonPath="/seller/dashboard"
      />
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mt-6">
        
        <Formik
          initialValues={{
            name: '',
            price: '',
            unit: 'kg', // Default unit
            description: '',
          }}
          validationSchema={ProductSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, setFieldValue }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="form-label">
                    Product Name*
                  </label>
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Fresh Tomatoes"
                  />
                  <ErrorMessage name="name" component="div" className="form-error" />
                </div>

                <div>
                  <label htmlFor="price" className="form-label">
                    Price (₹)*
                  </label>
                  <Field
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="e.g. 50.00"
                  />
                  <ErrorMessage name="price" component="div" className="form-error" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="unit" className="form-label">
                    Unit*
                  </label>
                  <Field
                    as="select"
                    id="unit"
                    name="unit"
                    className="form-input"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="piece">Piece</option>
                    <option value="dozen">Dozen</option>
                    <option value="liter">Liter</option>
                    <option value="ml">Milliliter (ml)</option>
                    <option value="packet">Packet</option>
                    <option value="box">Box</option>
                  </Field>
                  <ErrorMessage name="unit" component="div" className="form-error" />
                </div>

                <div>
                  <label className="form-label">
                    Product Image
                  </label>
                  <div className="mt-1 flex items-center">
                    <div className="flex-shrink-0">
                      {imagePreview ? (
                        <div className="h-24 w-24 rounded-md overflow-hidden bg-gray-100">
                          <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-24 w-24 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                          <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="relative rounded-md shadow-sm">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                          id="product-image"
                        />
                        <label
                          htmlFor="product-image"
                          className="cursor-pointer py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Choose Image
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="form-label">
                  Description (Optional)
                </label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  rows="4"
                  className="form-input"
                  placeholder="Describe your product..."
                />
                <ErrorMessage name="description" component="div" className="form-error" />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate('/seller/dashboard')}
                    className="btn-secondary"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Uploading...' : 'Upload Product'}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default UploadProduct;