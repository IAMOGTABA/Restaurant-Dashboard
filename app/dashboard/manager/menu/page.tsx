"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Add these type definitions
interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  image?: string;
  isAvailable: boolean;
  metadata?: any;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  menuItems: MenuItem[];
}

export default function MenuManagement() {
  // State for menu data
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for modals
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showEditFoodModal, setShowEditFoodModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedEditImage, setSelectedEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  
  // State for new food item
  const [newFoodItem, setNewFoodItem] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "",
    ingredients: "",
    preparationTime: "",
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spicyLevel: "1",
    showDescription: true,
    showIngredients: true,
    showSpicyLevel: true
  });
  
  // State for editing food item
  const [editFoodItem, setEditFoodItem] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "",
    ingredients: "",
    preparationTime: "",
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spicyLevel: "1",
    showDescription: true,
    showIngredients: true,
    showSpicyLevel: true
  });
  
  // State for notifications
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: ""
  });
  
  // Add these new state variables near the existing useState declarations
  const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryDescription, setEditCategoryDescription] = useState('');
  
  // Add these state variables for category deletion handling
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [categoryItemsCount, setCategoryItemsCount] = useState(0);
  const [showReassignItemsModal, setShowReassignItemsModal] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState("");
  
  // Fetch menu data from API
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from API
        const response = await fetch('/api/manager/menu-data');
        if (!response.ok) throw new Error('Failed to fetch menu data');
        const data = await response.json();
        
        // Transform the data structure to match what the component expects
        // The API returns menuItems but the component expects items
        if (data && data.categories) {
          const transformedData = {
            categories: data.categories.map(category => ({
              ...category,
              items: category.menuItems || [] // Map menuItems to items property
            }))
          };
          setMenuData(transformedData);
        } else {
          throw new Error('Invalid data structure received from API');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching menu data:', err);
        setError('Failed to load menu data. Please try again later.');
        
        // Fallback dummy data
        setMenuData({
          categories: [
            {
              id: "1",
              name: "Appetizers",
              items: [
                {
                  id: "1",
                  name: "Mozzarella Sticks",
                  description: "Breaded mozzarella sticks with marinara sauce",
                  price: 8.99,
                  imageUrl: "https://source.unsplash.com/random/300x200/?mozzarella",
                  isAvailable: true,
                  isVegetarian: true,
                  isVegan: false,
                  isGlutenFree: false,
                  spicyLevel: 1,
                  preparationTime: 15
                },
                {
                  id: "2",
                  name: "Nachos",
                  description: "Tortilla chips topped with cheese, jalapeños, and salsa",
                  price: 10.99,
                  imageUrl: "https://source.unsplash.com/random/300x200/?nachos",
                  isAvailable: true,
                  isVegetarian: true,
                  isVegan: false,
                  isGlutenFree: true,
                  spicyLevel: 2,
                  preparationTime: 10
                }
              ]
            },
            {
              id: "2",
              name: "Main Courses",
              items: [
                {
                  id: "3",
                  name: "Grilled Salmon",
                  description: "Fresh salmon fillet grilled to perfection with lemon and herbs",
                  price: 18.99,
                  imageUrl: "https://source.unsplash.com/random/300x200/?salmon",
                  isAvailable: true,
                  isVegetarian: false,
                  isVegan: false,
                  isGlutenFree: true,
                  spicyLevel: 0,
                  preparationTime: 25
                },
                {
                  id: "4",
                  name: "Penne Arrabiata",
                  description: "Spicy tomato sauce with garlic and chili",
                  price: 14.99,
                  imageUrl: "https://source.unsplash.com/random/300x200/?pasta",
                  isAvailable: true,
                  isVegetarian: true,
                  isVegan: true,
                  isGlutenFree: false,
                  spicyLevel: 3,
                  preparationTime: 20
                }
              ]
            },
            {
              id: "3",
              name: "Desserts",
              items: [
                {
                  id: "5",
                  name: "Chocolate Cake",
                  description: "Rich chocolate cake with chocolate ganache",
                  price: 7.99,
                  imageUrl: "https://source.unsplash.com/random/300x200/?chocolate-cake",
                  isAvailable: true,
                  isVegetarian: true,
                  isVegan: false,
                  isGlutenFree: false,
                  spicyLevel: 0,
                  preparationTime: 5
                }
              ]
            }
          ]
        });
        setLoading(false);
      }
    };
    
    fetchMenuData();
  }, []);
  
  // Add this function to fetch menu data outside the useEffect
  const refreshMenuData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/manager/menu-data');
      if (!response.ok) {
        throw new Error('Failed to fetch menu data');
      }
      const data = await response.json();
      
      // Transform the data structure to match what the component expects
      if (data && data.categories) {
        const transformedData = {
          categories: data.categories.map(category => ({
            ...category,
            items: category.menuItems || [] // Map menuItems to items property
          }))
        };
        setMenuData(transformedData);
      } else {
        throw new Error('Invalid data structure received from API');
      }
    } catch (error) {
      console.error('Error fetching menu data:', error);
      toast.error('Failed to fetch menu data');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle adding a new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    try {
      if (!newCategoryName.trim()) {
        setNotification({
          show: true,
          message: "Category name cannot be empty",
          type: "error"
        });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
        return;
      }
      
      // API call to create new category
      const response = await fetch('/api/manager/menu-data/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newCategoryName
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create category');
      }
      
      const newCategory = await response.json();
      
      // Update local state with new category
      setMenuData(prevData => ({
        ...prevData,
        categories: [...prevData.categories, { ...newCategory, items: [] }]
      }));
      
      // Reset form and close modal
      setNewCategoryName("");
      setShowAddCategoryModal(false);
      
      // Show success notification
      setNotification({
        show: true,
        message: "Category created successfully",
        type: "success"
      });
      setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    } catch (err) {
      console.error("Error creating category:", err);
      
      // Show error notification
      setNotification({
        show: true,
        message: err.message || "Failed to create category",
        type: "error"
      });
      setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    }
  };
  
  // Handle image selection for add food form
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      
      // Reset the image URL when a file is selected
      setNewFoodItem({
        ...newFoodItem,
        imageUrl: ""
      });
    }
  };
  
  // Handle image selection for edit food form
  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedEditImage(file);
      setEditImagePreview(URL.createObjectURL(file));
      
      // Reset the image URL when a file is selected
      setEditFoodItem({
        ...editFoodItem,
        imageUrl: ""
      });
    }
  };

  // Upload image to server
  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/manager/upload-image', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const result = await response.json();
      return result.filePath;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };
  
  // Handle adding a new food item
  const handleAddFoodItem = async (e) => {
    e.preventDefault();
    
    try {
      // Validate form
      if (!newFoodItem.name || !newFoodItem.price || !newFoodItem.category) {
        setNotification({
          show: true,
          message: "Name, price, and category are required",
          type: "error"
        });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
        return;
      }
      
      // Show loading notification
      setNotification({
        show: true,
        message: "Adding food item...",
        type: "info"
      });
      
      // Handle image upload if there's a selected file
      let imageUrl = newFoodItem.imageUrl;
      if (selectedImage) {
        try {
          // Upload image to server
          imageUrl = await uploadImage(selectedImage);
        } catch (error) {
          console.error('Error uploading image:', error);
          setNotification({
            show: true,
            message: "Error uploading image. Using placeholder instead.",
            type: "error"
          });
          setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
        }
      }
      
      // API call to create new food item
      const response = await fetch('/api/manager/menu-data/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newFoodItem,
          imageUrl: imageUrl,
          price: parseFloat(newFoodItem.price),
          spicyLevel: parseInt(newFoodItem.spicyLevel),
          preparationTime: parseInt(newFoodItem.preparationTime) || 15
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create food item');
      }
      
      const newItem = await response.json();
      
      // Update local state with new food item
      setMenuData(prevData => {
        if (!prevData || !prevData.categories) return prevData;
        
        const updatedCategories = prevData.categories.map(category => {
          if (category.id === newFoodItem.category) {
            return {
              ...category,
              items: [...(category.items || []), {
                ...newItem,
                imageUrl: newItem.image || imageUrl // Map image to imageUrl to match our component's expectations
              }]
            };
          }
          return category;
        });
        
        return {
          ...prevData,
          categories: updatedCategories
        };
      });
      
      // Reset form and close modal
      setNewFoodItem({
        name: "",
        description: "",
        price: "",
        imageUrl: "",
        category: "",
        ingredients: "",
        preparationTime: "",
        isAvailable: true,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        spicyLevel: "1",
        showDescription: true,
        showIngredients: true,
        showSpicyLevel: true
      });
      setSelectedImage(null);
      setImagePreview(null);
      setShowAddFoodModal(false);
      
      // Show success notification
      setNotification({
        show: true,
        message: "Food item added successfully",
        type: "success"
      });
      setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    } catch (err) {
      console.error("Error adding food item:", err);
      
      // Show error notification
      setNotification({
        show: true,
        message: err.message || "Failed to add food item",
        type: "error"
      });
      setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    }
  };
  
  // Handle input change for food item form
  const handleFoodItemInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setNewFoodItem(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Format price to display
  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };
  
  // Handle editing a food item
  const handleEditFoodItem = async (e) => {
    e.preventDefault();
    
    try {
      // Validate form
      if (!editFoodItem.name || !editFoodItem.price) {
        alert("Name and price are required");
        return;
      }
      
      // Show loading
      setLoading(true);
      
      // Handle image upload if there's a selected file
      let imageUrl = editFoodItem.imageUrl;
      if (selectedEditImage) {
        try {
          // Upload image to server
          imageUrl = await uploadImage(selectedEditImage);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert("Error uploading image. Using previous image instead.");
        }
      }
      
      // Prepare data for the API with all necessary fields
      const itemData = {
        name: editFoodItem.name,
        price: parseFloat(editFoodItem.price),
        description: editFoodItem.description || "",
        category: editFoodItem.category,
        imageUrl: imageUrl,
        isAvailable: editFoodItem.isAvailable,
        isVegetarian: editFoodItem.isVegetarian,
        isVegan: editFoodItem.isVegan,
        isGlutenFree: editFoodItem.isGlutenFree,
        spicyLevel: parseInt(editFoodItem.spicyLevel || "0"),
        ingredients: editFoodItem.ingredients || "",
        preparationTime: parseInt(editFoodItem.preparationTime || "0"),
        showDescription: editFoodItem.showDescription,
        showIngredients: editFoodItem.showIngredients,
        showSpicyLevel: editFoodItem.showSpicyLevel
      };
      
      console.log('Sending update with data:', itemData);
      
      // API call to update food item
      const response = await fetch(`/api/manager/menu-data/items/${editFoodItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      });
      
      if (response.ok) {
        alert('Food item updated successfully');
        
        // Reset form and close modal
        setEditFoodItem({
          id: "",
          name: "",
          description: "",
          price: "",
          imageUrl: "",
          category: "",
          ingredients: "",
          preparationTime: "",
          isAvailable: true,
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          spicyLevel: "1",
          showDescription: true,
          showIngredients: true,
          showSpicyLevel: true
        });
        setSelectedEditImage(null);
        setEditImagePreview(null);
        setShowEditFoodModal(false);
        
        // Refresh menu data to see the updated item
        await refreshMenuData();
      } else {
        alert('Failed to update food item. Please try again.');
      }
    } catch (err) {
      console.error("Error updating food item:", err);
      alert("Error: " + (err.message || "Failed to update food item"));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle deleting a food item
  const handleDeleteFoodItem = async () => {
    try {
      if (!itemToDelete) return;
      
      // API call to delete food item
      const response = await fetch(`/api/manager/menu-data/items/${itemToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete food item');
      }
      
      // Update local state by removing the deleted item
      setMenuData(prevData => {
        if (!prevData || !prevData.categories) return prevData;
        
        const updatedCategories = prevData.categories.map(category => ({
          ...category,
          items: category.items ? category.items.filter(item => item.id !== itemToDelete.id) : []
        }));
        
        return {
          ...prevData,
          categories: updatedCategories
        };
      });
      
      // Reset state and close modal
      setItemToDelete(null);
      setShowDeleteConfirmModal(false);
      
      // Show success notification
      setNotification({
        show: true,
        message: "Food item deleted successfully",
        type: "success"
      });
      setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    } catch (err) {
      console.error("Error deleting food item:", err);
      
      // Show error notification
      setNotification({
        show: true,
        message: err.message || "Failed to delete food item",
        type: "error"
      });
      setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    }
  };
  
  // Handle input change for edit food item form
  const handleEditFoodItemInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setEditFoodItem(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Open edit modal with food item data
  const openEditModal = (item, categoryId) => {
    // Log the item to debug
    console.log("Opening edit modal with item:", item);
    console.log("Category ID:", categoryId);
    
    // Safety check for required item properties
    if (!item || !item.id) {
      console.error("Invalid item data:", item);
      toast.error("Cannot edit this item - invalid data");
      return;
    }
    
    // Extract dietary info from description if present
    const isVegetarian = item.description?.includes('Vegetarian') || false;
    const isVegan = item.description?.includes('Vegan') || false;
    const isGlutenFree = item.description?.includes('Gluten-Free') || false;
    
    // Extract spicy level from description if present
    let spicyLevel = "0";
    const spicyMatch = item.description?.match(/Spicy Level: (\d+)/);
    if (spicyMatch) spicyLevel = spicyMatch[1];
    
    // Extract preparation time from description if present
    let preparationTime = "";
    const prepTimeMatch = item.description?.match(/Preparation Time: (\d+) minutes/);
    if (prepTimeMatch) preparationTime = prepTimeMatch[1];
    
    // Extract ingredients from description if present
    let ingredients = "";
    const ingredientsMatch = item.description?.match(/Ingredients: (.*?)(?=\n\n|$)/);
    if (ingredientsMatch) ingredients = ingredientsMatch[1];
    
    // Extract the clean description (without metadata)
    let cleanDescription = item.description || "";
    
    // Remove metadata sections from the description
    cleanDescription = cleanDescription
      .replace(/\n\nDietary Info:[\s\S]*?((\n\n)|$)/, '')
      .replace(/\n\nIngredients:[\s\S]*?((\n\n)|$)/, '')
      .replace(/\n\nPreparation Time:[\s\S]*?((\n\n)|$)/, '')
      .trim();
    
    // Set image preview if there's an image
    const imageUrl = item.imageUrl || item.image || "";
    if (imageUrl) {
      setEditImagePreview(imageUrl);
    } else {
      setEditImagePreview(null);
    }
    
    // Ensure valid metadata values
    let metadata: { 
      showDescription?: boolean; 
      showIngredients?: boolean; 
      showSpicyLevel?: boolean; 
    } = {};

    try {
      if (typeof item.metadata === 'string') {
        metadata = JSON.parse(item.metadata || '{}');
      } else if (typeof item.metadata === 'object') {
        metadata = item.metadata || {};
      }
    } catch (error) {
      console.error("Error parsing metadata:", error);
      metadata = {};
    }
    
    console.log("Setting editFoodItem with:", {
      id: item.id,
      name: item.name,
      description: cleanDescription,
      price: item.price,
      category: categoryId,
      // additional properties...
    });
    
    setEditFoodItem({
      id: item.id,
      name: item.name || "",
      description: cleanDescription,
      price: item.price ? item.price.toString() : "",
      imageUrl: imageUrl,
      category: categoryId,
      ingredients: ingredients || "",
      preparationTime: preparationTime || "",
      isAvailable: item.isAvailable !== false, // Default to true if undefined
      isVegetarian,
      isVegan,
      isGlutenFree,
      spicyLevel: spicyLevel || "0",
      showDescription: metadata.showDescription !== false, // Default to true
      showIngredients: metadata.showIngredients !== false, // Default to true
      showSpicyLevel: metadata.showSpicyLevel !== false // Default to true
    });
    
    setSelectedEditImage(null);
    setShowEditFoodModal(true);
  };
  
  // Add this function to handle opening the category edit modal
  const openCategoryEditModal = (category: Category) => {
    setCategoryToEdit(category.id);
    setEditCategoryName(category.name);
    setEditCategoryDescription(category.description || '');
  };

  // Add this function to handle updating a category
  const handleUpdateCategory = async () => {
    if (!categoryToEdit) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/manager/menu-data/categories/${categoryToEdit}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editCategoryName,
          description: editCategoryDescription,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Failed to update category:', data.error);
        toast.error(data.error || 'Failed to update category');
        return;
      }
      
      toast.success('Category updated successfully');
      setCategoryToEdit(null);
      
      // Refresh the menu data
      await refreshMenuData();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('An error occurred while updating the category');
    } finally {
      setLoading(false);
    }
  };

  // Update the handleDeleteCategory function to store category info and show reassign modal if needed
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/manager/menu-data/categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Failed to delete category:', data.error);
        if (data.itemsCount) {
          // Store the category info and show reassign modal
          setCategoryToDelete(categoryId);
          setCategoryItemsCount(data.itemsCount);
          setShowReassignItemsModal(true);
          return;
        } else {
          toast.error(data.error || 'Failed to delete category');
        }
        return;
      }
      
      toast.success('Category deleted successfully');
      
      // Refresh the menu data
      await refreshMenuData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('An error occurred while deleting the category');
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle reassigning items before deletion
  const handleReassignAndDelete = async () => {
    if (!categoryToDelete || !targetCategoryId) return;
    
    try {
      setLoading(true);
      
      // First reassign all items to the target category
      const reassignResponse = await fetch(`/api/manager/menu-data/categories/${categoryToDelete}/reassign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetCategoryId
        }),
      });
      
      if (!reassignResponse.ok) {
        const errorData = await reassignResponse.json();
        throw new Error(errorData.error || 'Failed to reassign menu items');
      }
      
      // Then delete the now-empty category
      const deleteResponse = await fetch(`/api/manager/menu-data/categories/${categoryToDelete}`, {
        method: 'DELETE',
      });
      
      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }
      
      toast.success('Category deleted and items reassigned successfully');
      
      // Reset state
      setCategoryToDelete(null);
      setTargetCategoryId("");
      setCategoryItemsCount(0);
      setShowReassignItemsModal(false);
      
      // Refresh the menu data
      await refreshMenuData();
    } catch (error) {
      console.error('Error reassigning and deleting:', error);
      toast.error(error.message || 'An error occurred during the operation');
    } finally {
      setLoading(false);
    }
  };

  // Simple direct function to edit a menu item
  const editMenuItem = async (item, categoryId) => {
    try {
      if (!item || !item.id) {
        alert("Invalid item data");
        return;
      }

      // Set the edit form data directly from the item
      setEditFoodItem({
        id: item.id,
        name: item.name || "",
        description: item.description || "",
        price: typeof item.price === 'number' ? item.price.toString() : (item.price || "0"),
        imageUrl: item.imageUrl || item.image || "",
        category: categoryId,
        ingredients: "",
        preparationTime: "",
        isAvailable: item.isAvailable !== false,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        spicyLevel: "0",
        showDescription: true,
        showIngredients: true,
        showSpicyLevel: true
      });
      
      // Open the modal
      setShowEditFoodModal(true);
    } catch (error) {
      console.error("Error preparing edit form:", error);
      alert("Failed to prepare item for editing");
    }
  };

  // Simple direct function to delete a menu item
  const deleteMenuItem = async (itemId) => {
    try {
      if (!itemId) {
        alert("Invalid item ID");
        return;
      }
      
      if (!confirm("Are you sure you want to delete this item?")) {
        return;
      }
      
      setLoading(true);
      
      const response = await fetch(`/api/manager/menu-data/items/${itemId}`, {
        method: 'DELETE',
      });
      
      if (response.status === 204 || response.ok) {
        alert("Item deleted successfully!");
        await refreshMenuData();
      } else {
        alert("Failed to delete item. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("An error occurred: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Display loading spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-blue-200 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <Link href="/dashboard/manager" className="mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-semibold text-gray-800">Menu Management</h1>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Add Category
              </button>
              <button
                onClick={() => setShowAddFoodModal(true)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Food Item
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Notification */}
        {notification.show && (
          <div className={`mb-4 p-4 rounded-md ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              <div className={`mr-3 ${notification.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {notification.type === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {notification.message}
              </div>
            </div>
          </div>
        )}

        {/* Menu Categories */}
        {menuData?.categories?.map((category) => (
          <div key={category.id} className="mb-8">
            <div className="mt-6 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <div className="flex space-x-2 items-center">
                  <button
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setNewFoodItem(prev => ({ ...prev, category: category.id }));
                      setShowAddFoodModal(true);
                    }}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  >
                    Add Item to {category.name}
                  </button>
                  <button
                    onClick={() => openCategoryEditModal(category)}
                    className="p-1 text-gray-600 hover:text-blue-600"
                    title="Edit category"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1 text-gray-600 hover:text-red-600"
                    title="Delete category"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {category.description && (
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              )}
            </div>
            
            {category.items && category.items.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-5 text-center">
                <p className="text-gray-500">No items in this category yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items && category.items.map((item) => (
                  <div 
                    key={item.id} 
                    className="relative bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
                  >
                    {/* Item Card Header with Controls */}
                    <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-2 bg-gray-100 bg-opacity-80 z-10">
                      <span className="font-medium text-gray-800 truncate max-w-[70%]">
                        {item.name}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            console.log("Edit button clicked for item:", item);
                            editMenuItem(item, category.id);
                          }}
                          className="p-1.5 bg-white rounded-md shadow text-blue-600 hover:bg-blue-50"
                          title="Edit item"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            console.log("Delete button clicked for item:", item);
                            deleteMenuItem(item.id);
                          }}
                          className="p-1.5 bg-white rounded-md shadow text-red-600 hover:bg-red-50"
                          title="Delete item"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Item Image */}
                    <div className="h-40 relative">
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        {item.imageUrl || item.image ? (
                          <img 
                            src={item.imageUrl || item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image';
                            }}
                          />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    {/* Item Details */}
                    <div className="p-4 pt-3">
                      <div className="flex justify-between items-start mt-2">
                        <div className="max-w-[70%]">
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>
                        </div>
                        <p className="text-lg font-bold text-green-600">${parseFloat(item.price).toFixed(2)}</p>
                      </div>
                      
                      {/* Item Tags/Badges */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {item.isVegetarian && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Vegetarian
                          </span>
                        )}
                        {item.isVegan && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Vegan
                          </span>
                        )}
                        {item.isGlutenFree && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            GF
                          </span>
                        )}
                        {item.spicyLevel > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Spicy {Array(parseInt(item.spicyLevel)).fill('🌶️').join('')}
                          </span>
                        )}
                        {!item.isAvailable && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </main>
      
      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Category</h3>
              <button onClick={() => setShowAddCategoryModal(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddCategory}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryName">
                  Category Name
                </label>
                <input
                  type="text"
                  id="categoryName"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Appetizers, Main Courses, Desserts"
                  required
                />
              </div>
              
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="mr-2 bg-white text-gray-700 font-medium py-2 px-4 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Food Item Modal */}
      {showAddFoodModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Food Item</h3>
              <button onClick={() => setShowAddFoodModal(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddFoodItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newFoodItem.name}
                    onChange={handleFoodItemInputChange}
                    placeholder="e.g. Margherita Pizza"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newFoodItem.description}
                    onChange={handleFoodItemInputChange}
                    placeholder="Brief description of the dish"
                    rows={3}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="price"
                    name="price"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newFoodItem.price}
                    onChange={handleFoodItemInputChange}
                    placeholder="e.g. 12.99"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
                    Image URL
                  </label>
                  <input
                    type="text"
                    id="imageUrl"
                    name="imageUrl"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newFoodItem.imageUrl}
                    onChange={handleFoodItemInputChange}
                    placeholder="URL to image (optional)"
                    disabled={selectedImage !== null}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUpload">
                    Or Upload Image
                  </label>
                  <input
                    type="file"
                    id="imageUpload"
                    name="imageUpload"
                    accept="image/*"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="mt-2 relative w-full h-32">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-1 right-1 bg-white rounded-full p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newFoodItem.category}
                    onChange={handleFoodItemInputChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {menuData.categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Right Column */}
              <div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ingredients">
                    Ingredients
                  </label>
                  <textarea
                    id="ingredients"
                    name="ingredients"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newFoodItem.ingredients}
                    onChange={handleFoodItemInputChange}
                    placeholder="List key ingredients"
                    rows={3}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="preparationTime">
                    Preparation Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    id="preparationTime"
                    name="preparationTime"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newFoodItem.preparationTime}
                    onChange={handleFoodItemInputChange}
                    placeholder="e.g. 15"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="spicyLevel">
                    Spicy Level
                  </label>
                  <select
                    id="spicyLevel"
                    name="spicyLevel"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newFoodItem.spicyLevel}
                    onChange={handleFoodItemInputChange}
                  >
                    <option value="0">Not Spicy</option>
                    <option value="1">Mild (🌶️)</option>
                    <option value="2">Medium (🌶️🌶️)</option>
                    <option value="3">Hot (🌶️🌶️🌶️)</option>
                    <option value="4">Very Hot (🌶️🌶️🌶️🌶️)</option>
                  </select>
                </div>
                
                <div className="mb-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Dietary Options
                  </label>
                  <div className="flex flex-col space-y-2">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        name="isVegetarian" 
                        checked={newFoodItem.isVegetarian} 
                        onChange={handleFoodItemInputChange}
                        className="form-checkbox text-blue-600"
                      />
                      <span className="ml-2">Vegetarian</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        name="isVegan" 
                        checked={newFoodItem.isVegan} 
                        onChange={handleFoodItemInputChange}
                        className="form-checkbox text-blue-600"
                      />
                      <span className="ml-2">Vegan</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        name="isGlutenFree" 
                        checked={newFoodItem.isGlutenFree} 
                        onChange={handleFoodItemInputChange}
                        className="form-checkbox text-blue-600"
                      />
                      <span className="ml-2">Gluten-Free</span>
                    </label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="inline-flex items-center">
                    <input 
                      type="checkbox" 
                      name="isAvailable" 
                      checked={newFoodItem.isAvailable} 
                      onChange={handleFoodItemInputChange}
                      className="form-checkbox text-blue-600"
                    />
                    <span className="ml-2 font-medium">Available on Menu</span>
                  </label>
                </div>
              </div>
              
              {/* Footer Buttons - Span both columns */}
              <div className="md:col-span-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddFoodModal(false)}
                  className="mr-2 bg-white text-gray-700 font-medium py-2 px-4 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none"
                >
                  Add Food Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Food Item Modal */}
      {showEditFoodModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Food Item</h3>
              <button onClick={() => setShowEditFoodModal(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditFoodItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-name">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={editFoodItem.name}
                    onChange={handleEditFoodItemInputChange}
                    placeholder="e.g. Margherita Pizza"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-description">
                    Description
                  </label>
                  <textarea
                    id="edit-description"
                    name="description"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={editFoodItem.description}
                    onChange={handleEditFoodItemInputChange}
                    placeholder="Brief description of the dish"
                    rows={3}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-price">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="edit-price"
                    name="price"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={editFoodItem.price}
                    onChange={handleEditFoodItemInputChange}
                    placeholder="e.g. 12.99"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-imageUrl">
                    Image URL
                  </label>
                  <input
                    type="text"
                    id="edit-imageUrl"
                    name="imageUrl"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={editFoodItem.imageUrl}
                    onChange={handleEditFoodItemInputChange}
                    placeholder="URL to image (optional)"
                    disabled={selectedEditImage !== null}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-imageUpload">
                    Or Upload Image
                  </label>
                  <input
                    type="file"
                    id="edit-imageUpload"
                    name="edit-imageUpload"
                    accept="image/*"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={handleEditImageChange}
                  />
                  {editImagePreview && (
                    <div className="mt-2 relative w-full h-32">
                      <img 
                        src={editImagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEditImage(null);
                          setEditImagePreview(null);
                          setEditFoodItem({
                            ...editFoodItem,
                            imageUrl: ""
                          });
                        }}
                        className="absolute top-1 right-1 bg-white rounded-full p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-category">
                    Category *
                  </label>
                  <select
                    id="edit-category"
                    name="category"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={editFoodItem.category}
                    onChange={handleEditFoodItemInputChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {menuData.categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Right Column */}
              <div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-ingredients">
                    Ingredients
                  </label>
                  <textarea
                    id="edit-ingredients"
                    name="ingredients"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={editFoodItem.ingredients}
                    onChange={handleEditFoodItemInputChange}
                    placeholder="List key ingredients"
                    rows={3}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-preparationTime">
                    Preparation Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    id="edit-preparationTime"
                    name="preparationTime"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={editFoodItem.preparationTime}
                    onChange={handleEditFoodItemInputChange}
                    placeholder="e.g. 15"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-spicyLevel">
                    Spicy Level
                  </label>
                  <select
                    id="edit-spicyLevel"
                    name="spicyLevel"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={editFoodItem.spicyLevel}
                    onChange={handleEditFoodItemInputChange}
                  >
                    <option value="0">Not Spicy</option>
                    <option value="1">Mild (🌶️)</option>
                    <option value="2">Medium (🌶️🌶️)</option>
                    <option value="3">Hot (🌶️🌶️🌶️)</option>
                    <option value="4">Very Hot (🌶️🌶️🌶️🌶️)</option>
                  </select>
                </div>
                
                <div className="mb-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Dietary Options
                  </label>
                  <div className="flex flex-col space-y-2">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        name="isVegetarian" 
                        checked={editFoodItem.isVegetarian} 
                        onChange={handleEditFoodItemInputChange}
                        className="form-checkbox text-blue-600"
                      />
                      <span className="ml-2">Vegetarian</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        name="isVegan" 
                        checked={editFoodItem.isVegan} 
                        onChange={handleEditFoodItemInputChange}
                        className="form-checkbox text-blue-600"
                      />
                      <span className="ml-2">Vegan</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        name="isGlutenFree" 
                        checked={editFoodItem.isGlutenFree} 
                        onChange={handleEditFoodItemInputChange}
                        className="form-checkbox text-blue-600"
                      />
                      <span className="ml-2">Gluten-Free</span>
                    </label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="inline-flex items-center">
                    <input 
                      type="checkbox" 
                      name="isAvailable" 
                      checked={editFoodItem.isAvailable} 
                      onChange={handleEditFoodItemInputChange}
                      className="form-checkbox text-blue-600"
                    />
                    <span className="ml-2 font-medium">Available on Menu</span>
                  </label>
                </div>
              </div>
              
              {/* Footer Buttons - Span both columns */}
              <div className="md:col-span-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditFoodModal(false)}
                  className="mr-2 bg-white text-gray-700 font-medium py-2 px-4 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none"
                >
                  Update Food Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
              <button onClick={() => setShowDeleteConfirmModal(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">Are you sure you want to delete <span className="font-bold">{itemToDelete?.name}</span>?</p>
              <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
            </div>
            
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="mr-2 bg-white text-gray-700 font-medium py-2 px-4 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteFoodItem}
                className="bg-red-600 text-white font-medium py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add this modal for editing categories after the existing modals */}
      {categoryToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Edit Category</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Category name"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={editCategoryDescription}
                onChange={(e) => setEditCategoryDescription(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Category description"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setCategoryToEdit(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCategory}
                disabled={!editCategoryName || loading}
                className={`px-4 py-2 rounded text-white ${
                  !editCategoryName || loading
                    ? 'bg-blue-300'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Updating...' : 'Update Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add the reassign modal to the JSX, after the other modals */}
      {showReassignItemsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Reassign Menu Items</h2>
            
            <p className="mb-4 text-gray-700">
              This category has {categoryItemsCount} associated menu items. Please select another category to move these items to before deleting.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Move Items To *
              </label>
              <select
                value={targetCategoryId}
                onChange={(e) => setTargetCategoryId(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {menuData?.categories
                  .filter(c => c.id !== categoryToDelete)
                  .map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowReassignItemsModal(false);
                  setCategoryToDelete(null);
                  setCategoryItemsCount(0);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReassignAndDelete}
                disabled={!targetCategoryId || loading}
                className={`px-4 py-2 rounded text-white ${
                  !targetCategoryId || loading
                    ? 'bg-blue-300'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Processing...' : 'Reassign & Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 