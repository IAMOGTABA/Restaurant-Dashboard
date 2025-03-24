'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Row, Col, Card, Button, Badge, Alert, 
  Form, Spinner, Modal, Table, Dropdown, 
  OverlayTrigger, Tooltip
} from 'react-bootstrap';
import { 
  FaPlus, FaEdit, FaTrash, FaSearch, 
  FaLayerGroup, FaUtensils, FaEllipsisV, 
  FaEye, FaFolder
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function MenuPage() {
  // Basic state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modal state
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newItemData, setNewItemData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    isAvailable: true
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const router = useRouter();

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all necessary data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch menu items
      const menuResponse = await axios.get('/api/menu/items');
      if (menuResponse.data.success) {
        setMenuItems(menuResponse.data.items || []);
      }
      
      // Fetch categories
      const categoriesResponse = await axios.get('/api/menu/categories');
      if (categoriesResponse.data.success) {
        setCategories(categoriesResponse.data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load menu data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items based on search and category
  const filteredMenuItems = menuItems.filter(item => {
    // Apply search filter
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply category filter
    const matchesCategory = selectedCategory === 'all' || 
      item.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle toggle item availability
  const handleToggleAvailability = async (itemId, currentStatus) => {
    try {
      const response = await axios.patch(`/api/menu/items/${itemId}`, {
        isAvailable: !currentStatus
      });
      
      if (response.data.success) {
        // Update local state
        setMenuItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, isAvailable: !currentStatus } : item
        ));
        
        toast.success(`Item ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      } else {
        toast.error(response.data.message || 'Failed to update item availability');
      }
    } catch (err) {
      console.error('Error updating item availability:', err);
      toast.error('Failed to update item availability');
    }
  };

  // Open modal to create new menu item
  const handleCreateMenuItem = () => {
    setNewItemData({
      name: '',
      description: '',
      price: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      isAvailable: true
    });
    setShowItemModal(true);
  };

  // Submit new menu item
  const handleSubmitItem = async () => {
    // Validate form data
    if (!newItemData.name.trim() || !newItemData.price.trim()) {
      toast.error('Name and price are required');
      return;
    }
    
    const priceValue = parseFloat(newItemData.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post('/api/menu/items', {
        ...newItemData,
        price: priceValue
      });
      
      if (response.data.success) {
        toast.success('New item created successfully');
        fetchData(); // Refresh the data
        setShowItemModal(false);
      } else {
        toast.error(response.data.message || 'Failed to create new item');
      }
    } catch (err) {
      console.error('Error creating new item:', err);
      toast.error('Failed to create new item');
    } finally {
      setLoading(false);
    }
  };

  // Open modal to create new category
  const handleOpenCategoryModal = () => {
    setNewCategoryName('');
    setShowCategoryModal(true);
  };

  // Submit new category
  const handleSubmitCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post('/api/menu/categories', {
        name: newCategoryName.trim()
      });
      
      if (response.data.success) {
        toast.success('New category created successfully');
        fetchData(); // Refresh the data
        setShowCategoryModal(false);
      } else {
        toast.error(response.data.message || 'Failed to create new category');
      }
    } catch (err) {
      console.error('Error creating new category:', err);
      toast.error('Failed to create new category');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit menu item
  const handleEditMenuItem = (item) => {
    router.push(`/dashboard/manager/menu/items/${item.id}/edit`);
  };

  // Handle view menu item details
  const handleViewMenuItem = (item) => {
    router.push(`/dashboard/manager/menu/items/${item.id}`);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle category filter change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Handle delete menu item
  const handleDeleteMenuItem = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        setLoading(true);
        const response = await axios.delete(`/api/menu/items/${item.id}`);
        
        if (response.status === 204 || response.data?.success) {
          toast.success('Menu item deleted successfully');
          // Remove the item from the local state
          setMenuItems(prev => prev.filter(menuItem => menuItem.id !== item.id));
        } else {
          toast.error(response.data?.message || 'Failed to delete menu item');
        }
      } catch (err) {
        console.error('Error deleting menu item:', err);
        toast.error('Failed to delete menu item');
      } finally {
        setLoading(false);
      }
    }
  };

  // Render page
  return (
    <div className="container-fluid p-4">
      {loading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
             style={{ backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 1050 }}>
          <Spinner animation="border" variant="primary" />
        </div>
      )}
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Menu Management</h1>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={handleCreateMenuItem}>
            <FaPlus className="me-1" /> Add Item
          </Button>
          <Button variant="outline-primary" onClick={handleOpenCategoryModal}>
            <FaFolder className="me-1" /> New Category
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Total Menu Items</h6>
                  <h3>{menuItems.length}</h3>
                </div>
                <FaUtensils className="text-primary" size={30} />
              </div>
              <small className="text-muted">
                {menuItems.filter(item => item.isAvailable).length} currently available
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Categories</h6>
                  <h3>{categories.length}</h3>
                </div>
                <FaLayerGroup className="text-success" size={30} />
              </div>
              <small className="text-muted">
                Organize your menu with categories
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Menu Items Table */}
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Menu Items</h5>
            <div className="d-flex gap-2 align-items-center">
              <Form.Control
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{ width: '200px' }}
              />
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" id="category-filter">
                  {selectedCategory === 'all' ? 'All Categories' : categories.find(c => c.id === selectedCategory)?.name || 'All Categories'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleCategoryChange('all')}>All Categories</Dropdown.Item>
                  <Dropdown.Divider />
                  {categories.map(category => (
                    <Dropdown.Item 
                      key={category.id} 
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      {category.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMenuItems.length > 0 ? (
                filteredMenuItems.map(item => {
                  const category = categories.find(c => c.id === item.categoryId);
                  
                  return (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{category?.name || 'Uncategorized'}</td>
                      <td>${parseFloat(item.price).toFixed(2)}</td>
                      <td>
                        <Form.Check
                          type="switch"
                          id={`status-switch-${item.id}`}
                          label={item.isAvailable ? 'Available' : 'Unavailable'}
                          checked={item.isAvailable}
                          onChange={() => handleToggleAvailability(item.id, item.isAvailable)}
                        />
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="light" size="sm" id={`actions-${item.id}`}>
                            <FaEllipsisV />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleViewMenuItem(item)}>
                              <FaEye className="me-2" /> View
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleEditMenuItem(item)}>
                              <FaEdit className="me-2" /> Edit
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              className="text-danger" 
                              onClick={() => handleDeleteMenuItem(item)}
                            >
                              <FaTrash className="me-2" /> Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    {searchTerm || selectedCategory !== 'all' ? (
                      <div>
                        <FaSearch className="mb-2" size={24} />
                        <p>No items match your search criteria</p>
                      </div>
                    ) : (
                      <div>
                        <FaUtensils className="mb-2" size={24} />
                        <p>No menu items found. Add some items to get started.</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      {/* New Item Modal */}
      <Modal show={showItemModal} onHide={() => setShowItemModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Menu Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter item name"
                name="name"
                value={newItemData.name}
                onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter item description"
                name="description"
                value={newItemData.description}
                onChange={(e) => setNewItemData({...newItemData, description: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                placeholder="Enter price"
                name="price"
                value={newItemData.price}
                onChange={(e) => setNewItemData({...newItemData, price: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="categoryId"
                value={newItemData.categoryId}
                onChange={(e) => setNewItemData({...newItemData, categoryId: e.target.value})}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Item is available"
                name="isAvailable"
                checked={newItemData.isAvailable}
                onChange={(e) => setNewItemData({...newItemData, isAvailable: e.target.checked})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowItemModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitItem}>
            Create Item
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* New Category Modal */}
      <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitCategory}>
            Create Category
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
} 