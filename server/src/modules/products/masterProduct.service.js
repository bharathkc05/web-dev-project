import { MasterProduct } from '../../shared/models/masterProduct.model.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import { uploadImage, deleteImage } from '../../shared/utils/cloudinary.js';

export const getAllMasterProducts = async () => {
  const products = await MasterProduct.find().sort({ _id: -1 }).lean();
  return products;
};

export const createMasterProduct = async (data, imageFile = null, adminId) => {
  let imageUrl = '';
  if (imageFile) {
    const uploadResult = await uploadImage(imageFile, 'products');
    imageUrl = uploadResult.secure_url;
  }

  const product = await MasterProduct.create({
    ...data,
    imageUrl,
    createdBy: adminId,
  });

  return product.toJSON();
};

export const updateMasterProduct = async (id, data, imageFile = null) => {
  const product = await MasterProduct.findById(id);
  if (!product) {
    throw ApiError.notFound('Master product not found');
  }

  const updateFields = { ...data };

  if (imageFile) {
    if (product.imageUrl) {
      const publicId = product.imageUrl.split('/').pop().split('.')[0];
      await deleteImage(`products/${publicId}`).catch(() => {});
    }
    const uploadResult = await uploadImage(imageFile, 'products');
    updateFields.imageUrl = uploadResult.secure_url;
  }

  const updatedProduct = await MasterProduct.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true }
  ).lean();

  return updatedProduct;
};

export const deleteMasterProduct = async (id) => {
  const product = await MasterProduct.findById(id);
  if (!product) {
    throw ApiError.notFound('Master product not found');
  }

  // Delete image from cloudinary if it exists
  if (product.imageUrl) {
    const publicId = product.imageUrl.split('/').pop().split('.')[0];
    await deleteImage(`products/${publicId}`).catch(() => {});
  }

  await MasterProduct.findByIdAndDelete(id);
  return { message: 'Master product deleted successfully' };
};

export const toggleMasterProductStatus = async (id, adminId) => {
  const product = await MasterProduct.findById(id);
  if (!product) {
    throw ApiError.notFound('Master product not found');
  }

  const updatedProduct = await MasterProduct.findByIdAndUpdate(
    id,
    { $set: { isActive: !product.isActive } },
    { new: true }
  ).lean();

  return updatedProduct;
};
