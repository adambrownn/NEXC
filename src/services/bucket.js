class CartBucketService {
  addItemToBucket(item) {
    const items = JSON.parse(localStorage.getItem("cart")) || [];
    items.push(item);
    localStorage.setItem("cart", JSON.stringify(items));
    return true;
  }

  updateItems(items) {
    localStorage.setItem("cart", JSON.stringify(items));
    return true;
  }

  getItemsFromBucket() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }

  getItemsCount() {
    const items = localStorage.getItem("cart");
    return items ? JSON.parse(items).length : 0;
  }

  removeItemFromBucket(itemId) {
    const items = JSON.parse(localStorage.getItem("cart")) || [];
    const newItems = items.filter((item) => item._id !== itemId);
    localStorage.setItem("cart", JSON.stringify(newItems));
    return newItems;
  }
}

// Create an instance of the service
const cartBucketService = new CartBucketService();

// Export the instance
export default cartBucketService;